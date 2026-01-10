import { guessType } from ".";
import {
    Argument,
    Decorator,
    DocstringParts,
    Exception,
    KeywordArgument,
    Returns,
    Yields,
} from "../docstring_parts";

export function parseParameters(
    parameterTokens: string[],
    body: string[],
    functionName: string,
    isClass: boolean = false,
): DocstringParts {
    return {
        name: functionName,
        decorators: parseDecorators(parameterTokens),
        args: parseArguments(parameterTokens),
        kwargs: parseKeywordArguments(parameterTokens),
        returns: isClass ? [] : parseReturn(parameterTokens, body),
        yields: isClass ? undefined : parseYields(parameterTokens, body),
        exceptions: isClass ? [] : parseExceptions(body),
    };
}

export interface DataclassAttributeResult {
    args: Argument[];
    kwargs: KeywordArgument[];
}

/**
 * Parse dataclass attributes from the class body.
 * Dataclass attributes are type-annotated class variables like:
 *   field_name: type           -> becomes an arg (required)
 *   field_name: type = default -> becomes a kwarg (optional)
 */
export function parseDataclassAttributes(body: string[]): DataclassAttributeResult {
    const args: Argument[] = [];
    const kwargs: KeywordArgument[] = [];
    // Match patterns like:
    // name: str
    // name: int = 0
    // name: Optional[str] = None
    // name: List[int] = field(default_factory=list)
    const attributePattern = /^(\w+)\s*:\s*([^=]+?)(?:\s*=\s*(.+))?$/;

    for (const line of body) {
        const trimmedLine = line.trim();

        // Skip method definitions, decorators, and non-attribute lines
        if (trimmedLine.startsWith("def ") || 
            trimmedLine.startsWith("@") || 
            trimmedLine.startsWith("class ") ||
            trimmedLine.startsWith("#")) {
            continue;
        }

        const match = trimmedLine.match(attributePattern);

        if (match == null) {
            continue;
        }

        const varName = match[1];
        const varType = match[2].trim();
        const defaultValue = match[3]?.trim();

        // Skip private/internal attributes and ClassVar
        if (varName.startsWith("_") || varType.startsWith("ClassVar")) {
            continue;
        }

        if (defaultValue !== undefined) {
            // Has default value -> kwarg
            kwargs.push({
                var: varName,
                type: varType,
                default: defaultValue,
            });
        } else {
            // No default value -> arg
            args.push({
                var: varName,
                type: varType,
            });
        }
    }

    return { args, kwargs };
}

function parseDecorators(parameters: string[]): Decorator[] {
    const decorators: Decorator[] = [];
    const pattern = /^@(\w+)/;

    for (const param of parameters) {
        const match = param.trim().match(pattern);

        if (match == null) {
            continue;
        }

        decorators.push({
            name: match[1],
        });
    }

    return decorators;
}

function parseArguments(parameters: string[]): Argument[] {
    const args: Argument[] = [];
    const excludedArgs = ["self", "cls"];
    const pattern = /^(\w+)/;

    for (const param of parameters) {
        const match = param.trim().match(pattern);

        if (match == null || param.includes("=") || inArray(param, excludedArgs)) {
            continue;
        }

        args.push({
            var: match[1],
            type: guessType(param),
        });
    }

    return args;
}

function parseKeywordArguments(parameters: string[]): KeywordArgument[] {
    const kwargs: KeywordArgument[] = [];
    const pattern = /^(\w+)(?:\s*:[^=]+)?\s*=\s*(.+)/;

    for (const param of parameters) {
        const match = param.trim().match(pattern);

        if (match == null) {
            continue;
        }

        kwargs.push({
            var: match[1],
            default: match[2],
            type: guessType(param),
        });
    }

    return kwargs;
}

function parseReturn(parameters: string[], body: string[]): Returns[] {
    const returnType = parseReturnFromDefinition(parameters);

    if (returnType == null || isIterator(returnType.type)) {
        const bodyReturn = parseFromBody(body, /return /);
        return bodyReturn ? [bodyReturn] : [];
    }

    return [returnType];
}

function parseYields(parameters: string[], body: string[]): Yields {
    const returnType = parseReturnFromDefinition(parameters);

    if (returnType != null && isIterator(returnType.type)) {
        return returnType as Yields;
    }

    // To account for functions that yield but don't have a yield signature
    const yieldType = returnType ? returnType.type : undefined;
    const yieldInBody = parseFromBody(body, /yield /);

    if (yieldInBody != null && yieldType != undefined) {
        yieldInBody.type = `Iterator[${yieldType}]`;
    }

    return yieldInBody;
}

function parseReturnFromDefinition(parameters: string[]): Returns | null {
    const pattern = /^->\s*(["']?)(['"\w\[\], |\.]*)\1/;

    for (const param of parameters) {
        const match = param.trim().match(pattern);

        if (match == null) {
            continue;
        }

        // Skip "-> None" annotations
        return match[2] === "None" ? null : { type: match[2] };
    }

    return null;
}

function parseExceptions(body: string[]): Exception[] {
    const exceptions: Exception[] = [];
    const pattern = /(?<!#.*)raise\s+([\w.]+)/;

    for (const line of body) {
        const match = line.match(pattern);

        if (match == null) {
            continue;
        }

        exceptions.push({ type: match[1] });
    }

    return exceptions;
}

export function inArray<type>(item: type, array: type[]) {
    return array.some((x) => item === x);
}

function parseFromBody(body: string[], pattern: RegExp): Returns | undefined {
    for (const line of body) {
        const match = line.match(pattern);

        if (match == null) {
            continue;
        }

        return { type: undefined };
    }

    return undefined;
}

function isIterator(type: string): boolean {
    return type.startsWith("Generator") || type.startsWith("Iterator");
}
