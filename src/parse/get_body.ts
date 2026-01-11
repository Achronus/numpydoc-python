import { blankLine, indentationOf, preprocessLines } from "./utilities";

export function getBody(document: string, linePosition: number): string[] {
    const lines = document.split("\n");
    const body: string[] = [];

    let currentLineNum = linePosition;
    const originalIndentation = getBodyBaseIndentation(lines, linePosition);

    while (currentLineNum < lines.length) {
        const line = lines[currentLineNum];

        if (blankLine(line)) {
            // Check if the next non-blank line indicates we've left the body
            // (e.g., a new class/function definition at a lower indentation level)
            if (shouldStopAtBlankLine(lines, currentLineNum, originalIndentation)) {
                break;
            }
            currentLineNum++;
            continue;
        }

        if (indentationOf(line) < originalIndentation) {
            break;
        }

        body.push(line);
        currentLineNum++;
    }

    return preprocessLines(body);
}

/**
 * Determines if we should stop parsing the body when we encounter a blank line.
 * This prevents reading into subsequent class/function definitions that are
 * separated by blank lines.
 */
function shouldStopAtBlankLine(lines: string[], blankLinePos: number, bodyIndentation: number): boolean {
    // Look for the next non-blank line
    for (let i = blankLinePos + 1; i < lines.length; i++) {
        const line = lines[i];
        if (!blankLine(line)) {
            // If the next non-blank line is at a lower indentation level
            // and starts a new definition (class, def, or decorator), stop
            const lineIndent = indentationOf(line);
            if (lineIndent < bodyIndentation) {
                const trimmed = line.trim();
                if (trimmed.startsWith("class ") || 
                    trimmed.startsWith("def ") || 
                    trimmed.startsWith("async def ") ||
                    trimmed.startsWith("@")) {
                    return true;
                }
            }
            break;
        }
    }
    return false;
}

function getBodyBaseIndentation(lines: string[], linePosition: number): number {
    let currentLineNum = linePosition;
    // Match function definitions, class definitions, or decorators - these indicate
    // we've left the current body and entered a new definition
    const bodyEndRegex = /^\s*(def \w+|class \w+|@\w+)/;

    while (currentLineNum < lines.length) {
        const line = lines[currentLineNum];

        if (blankLine(line)) {
            currentLineNum++;
            continue;
        }

        if (bodyEndRegex.test(line)) {
            break;
        }

        return indentationOf(line);
    }

    return 10000;
}
