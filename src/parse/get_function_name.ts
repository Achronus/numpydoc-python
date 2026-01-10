export function getFunctionName(functionDefinition: string): string {
    // Handle both "class Name:" and "class Name(...):" and "def name(...):"
    const pattern = /(?:def|class)\s+(\w+)\s*[:(]/;

    const match = pattern.exec(functionDefinition);

    if (match == undefined || match[1] == undefined) {
        return "";
    }

    return match[1];
}
