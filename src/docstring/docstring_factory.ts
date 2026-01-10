import { render } from "mustache";
import { DocstringParts } from "../docstring_parts";
import { TemplateData } from "./template_data";
import { dedent } from "ts-dedent";
import Mustache = require("mustache");

// Disable HTML-escaping behavior globally
Mustache.escape = (text: string) => text;

export class DocstringFactory {
    private template: string;
    private quoteStyle: string;

    private startOnNewLine: boolean;
    private includeName: boolean;
    private guessTypes: boolean;

    constructor(
        template: string,
        quoteStyle = '"""',
        startOnNewLine = false,
        includeName = false,
        guessTypes = true,
    ) {
        this.quoteStyle = quoteStyle;

        this.startOnNewLine = startOnNewLine;
        this.guessTypes = guessTypes;
        this.includeName = includeName;

        this.template = template;
    }

    public generateDocstring(docstringParts: DocstringParts, indentation = ""): string {
        const templateData = new TemplateData(
            docstringParts,
            this.guessTypes,
            this.includeName,
        );

        let docstring = render(this.template, templateData);

        docstring = this.addSnippetPlaceholders(docstring);
        docstring = this.condenseNewLines(docstring);
        docstring = this.condenseTrailingNewLines(docstring);
        docstring = this.commentText(docstring);
        docstring = this.indentDocstring(docstring, indentation);

        return docstring;
    }

    public toString(): string {
        return dedent`
        DocstringFactory Configuration
        quoteStyle:
            ${this.quoteStyle}
        startOnNewLine:
            ${this.startOnNewLine}
        guessTypes:
            ${this.guessTypes}
        includeName:
            ${this.includeName}
        template:
        ${this.template}
        `;
    }

    private addSnippetPlaceholders(snippetString: string): string {
        let placeholderNumber = 0;
        snippetString = snippetString.replace(/@@@/g, () => {
            return (++placeholderNumber).toString();
        });

        return snippetString;
    }

    private condenseNewLines(snippet: string): string {
        // Normalize multiple blank lines (which may contain whitespace) to exactly one blank line
        // Matches a newline followed by one or more (optional whitespace + newline)
        snippet = snippet.replace(/\n(\s*\n)+/g, "\n\n");
        return snippet;
    }

    private condenseTrailingNewLines(snippet: string): string {
        return snippet.replace(/\n+$/g, "\n");
    }

    private commentText(snippet: string): string {
        if (this.startOnNewLine) {
            snippet = "\n" + snippet;
        }

        return this.quoteStyle + snippet + this.quoteStyle;
    }

    private indentDocstring(snippet: string, indentation: string): string {
        const snippetLines = snippet.split("\n");

        snippetLines.forEach((line, index) => {
            if (line !== "") {
                snippetLines[index] = indentation + line;
            }
        });

        return snippetLines.join("\n");
    }
}
