/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
    Argument,
    Decorator,
    DocstringParts,
    Exception,
    KeywordArgument,
    Returns,
    Yields,
} from "../docstring_parts";

export class TemplateData {
    public name: string;
    public decorators: Decorator[];
    public args: Argument[];
    public kwargs: KeywordArgument[];
    public exceptions: Exception[];
    public returns: Returns[] | undefined;
    public yields: Yields;

    private includeName: boolean;

    constructor(
        docstringParts: DocstringParts,
        guessTypes: boolean,
        includeName: boolean,
    ) {
        this.name = docstringParts.name;
        this.decorators = docstringParts.decorators;
        this.args = docstringParts.args;
        this.kwargs = this.cleanKwargTypes(docstringParts.kwargs);
        this.exceptions = docstringParts.exceptions;
        this.returns = this.transformReturns(docstringParts.returns);
        this.yields = docstringParts.yields;

        this.includeName = includeName;

        if (!guessTypes) {
            this.removeTypes();
        }

        this.addDefaultTypePlaceholders("_type_");
    }

    public placeholder() {
        return (text: string, render: (_: string) => string): string => {
            return "${@@@:" + render(text) + "}";
        };
    }

    public summaryPlaceholder(): string {
        if (this.includeName) {
            return this.name + " ${@@@:_summary_}";
        }

        return "${@@@:_summary_}";
    }

    public typePlaceholder(): string {
        // Need to ignore rules because this.type only works in
        // the context of mustache applying a template
        // @ts-ignore
        return "${@@@:" + this.type + "}";
    }

    public descriptionPlaceholder(): string {
        return "${@@@:_description_}";
    }

    public argsExist(): boolean {
        return this.args.length > 0;
    }

    public kwargsExist(): boolean {
        return this.kwargs.length > 0;
    }

    public parametersExist(): boolean {
        return this.args.length > 0 || this.kwargs.length > 0;
    }

    public exceptionsExist(): boolean {
        return this.exceptions.length > 0;
    }

    public returnsExist(): boolean {
        return this.returns !== undefined && this.returns.length > 0;
    }

    public yieldsExist(): boolean {
        return this.yields != undefined;
    }

    private cleanKwargTypes(kwargs: KeywordArgument[]): KeywordArgument[] {
        return kwargs.map((kwarg) => {
            if (kwarg.default === "None" && kwarg.type) {
                const cleanedType = kwarg.type.replace(/\s*\|\s*None\s*$/, "");
                return { ...kwarg, type: cleanedType };
            }
            return kwarg;
        });
    }

    private transformReturns(docReturns: Returns[] | undefined): Returns[] | undefined {
        if (docReturns === undefined || docReturns.length === 0) {
            return undefined;
        }

        // If single-item array with Tuple type, split it
        if (docReturns.length === 1) {
            const t = docReturns[0].type;
            if (t === undefined) {
                return docReturns;
            }

            const tupleMatch = t.match(/^\s*(?:Tuple|tuple)\s*\[(.*)\]\s*$/);
            if (!tupleMatch) {
                return docReturns;
            }

            const inner = tupleMatch[1];
            const parts = this.splitTopLevel(inner, ",");

            return parts.map((p) => ({ type: p.trim() }));
        }

        return docReturns;
    }

    private splitTopLevel(text: string, sep: string): string[] {
        const parts: string[] = [];
        let current = "";
        const stack: string[] = [];

        for (let i = 0; i < text.length; i++) {
            const ch = text[i];

            if ((ch === '"' || ch === "'") && stack[stack.length - 1] !== ch) {
                stack.push(ch);
                current += ch;
                continue;
            }

            if ((ch === '"' || ch === "'") && stack[stack.length - 1] === ch) {
                stack.pop();
                current += ch;
                continue;
            }

            if (stack.length > 0) {
                current += ch;
                continue;
            }

            if (ch === "[" || ch === "(" || ch === "{") {
                stack.push(ch);
                current += ch;
                continue;
            }

            if (ch === "]" || ch === ")" || ch === "}") {
                stack.pop();
                current += ch;
                continue;
            }

            if (ch === sep && stack.length === 0) {
                parts.push(current);
                current = "";
                continue;
            }

            current += ch;
        }

        if (current.length > 0) {
            parts.push(current);
        }

        return parts;
    }

    private removeTypes(): void {
        for (const arg of this.args) {
            arg.type = undefined;
        }

        for (const kwarg of this.kwargs) {
            kwarg.type = undefined;
        }

        if (this.yieldsExist()) {
            this.yields.type = undefined;
        }

        if (this.returnsExist()) {
            for (const r of this.returns) {
                r.type = undefined;
            }
        }
    }

    private addDefaultTypePlaceholders(placeholder: string): void {
        for (const arg of this.args) {
            if (arg.type === undefined) {
                arg.type = placeholder;
            }
        }

        for (const kwarg of this.kwargs) {
            if (kwarg.type === undefined) {
                kwarg.type = placeholder;
            }
        }

        const returns = this.returns;
        if (returns !== undefined && returns.length > 0) {
            for (const r of returns) {
                if (r.type === undefined) {
                    r.type = placeholder;
                }
            }
        }

        const yields = this.yields;
        if (yields != undefined && yields.type == undefined) {
            yields.type = placeholder;
        }
    }
}
