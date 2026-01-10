import { blankLine, preprocessLines } from "./utilities";

export interface DefinitionResult {
    definition: string;
    decorators: string[];
}

export function getDefinition(document: string, linePosition: number): string {
    const result = getDefinitionWithDecorators(document, linePosition);
    return result.definition;
}

export function getDefinitionWithDecorators(document: string, linePosition: number): DefinitionResult {
    const precedingLines = getPrecedingLines(document, linePosition);
    const precedingText = precedingLines.join(" ");

    // Don't parse if the preceding line is blank
    const precedingLine = precedingLines[precedingLines.length - 1];
    if (precedingLine == undefined || blankLine(precedingLine)) {
        return { definition: "", decorators: [] };
    }

    const pattern = /\b(((async\s+)?\s*def)|\s*class)\b/g;

    // Get starting index of last def match in the preceding text
    let index: number;
    while (pattern.test(precedingText)) {
        index = pattern.lastIndex - RegExp.lastMatch.length;
    }

    if (index == undefined) {
        return { definition: "", decorators: [] };
    }

    const lastFunctionDef = precedingText.slice(index);
    const definition = lastFunctionDef.trim();

    // Extract decorators from preceding lines (for class definitions)
    const decorators = extractDecorators(precedingLines, definition);

    return { definition, decorators };
}

function extractDecorators(precedingLines: string[], definition: string): string[] {
    const decorators: string[] = [];
    const isClassDef = /^\s*class\s+/.test(definition);
    
    if (!isClassDef) {
        return decorators;
    }

    // Find the line index where the class definition starts
    // Walk backwards through the lines to find decorators
    const joinedLines = precedingLines.join(" ");
    const classIndex = joinedLines.lastIndexOf(definition.split("(")[0].split(":")[0]);
    
    // Count how many lines are before the class definition
    let charCount = 0;
    let lineIndex = 0;
    for (let i = 0; i < precedingLines.length; i++) {
        charCount += precedingLines[i].length + 1; // +1 for the space we joined with
        if (charCount > classIndex) {
            lineIndex = i;
            break;
        }
    }

    // Walk backwards from the class definition to find decorators
    for (let i = lineIndex - 1; i >= 0; i--) {
        const line = precedingLines[i].trim();
        if (line.startsWith("@")) {
            decorators.unshift(line);
        } else if (line !== "" && !line.startsWith("@")) {
            // Stop if we hit a non-decorator, non-empty line
            break;
        }
    }

    return decorators;
}

function getPrecedingLines(document: string, linePosition: number): string[] {
    const lines = document.split("\n");
    const rawPrecedingLines = lines.slice(0, linePosition);

    const precedingLines = preprocessLines(rawPrecedingLines);

    return precedingLines;
}
