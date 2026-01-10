import { getBody, getDefinitionWithDecorators, getFunctionName, parseParameters, tokenizeDefinition } from ".";
import { DocstringParts } from "../docstring_parts";
import { parseDataclassAttributes } from "./parse_parameters";

export function parse(document: string, positionLine: number): DocstringParts {
    const { definition, decorators } = getDefinitionWithDecorators(document, positionLine);
    const body = getBody(document, positionLine);

    const parameterTokens = tokenizeDefinition(definition);
    const functionName = getFunctionName(definition);

    // Check if this is a class definition
    const isClass = /^\s*class\s+/.test(definition);
    
    // Check if it's a dataclass (has @dataclass decorator)
    const isDataclass = isClass && decorators.some(d => d.includes("dataclass"));

    const docstringParts = parseParameters(parameterTokens, body, functionName, isClass);
    
    // For dataclasses, parse the class body for attributes and add them to args/kwargs
    if (isDataclass) {
        const { args, kwargs } = parseDataclassAttributes(body);
        docstringParts.args = args;
        docstringParts.kwargs = kwargs;
    }

    return docstringParts;
}
