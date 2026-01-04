import { readFileSync, existsSync } from "fs";
import * as path from "path";
import { extensionRoot } from "../constants";

export function getDefaultTemplate(): string {
    // Always use numpy template as default
    // Use extensionRoot.path if set (runtime), otherwise use __dirname (tests)
    const baseDir = extensionRoot.path || __dirname;
    const filePath = extensionRoot.path
        ? path.join(baseDir, "out/docstring/templates/numpydoc.mustache")
        : path.join(baseDir, "templates/numpydoc.mustache");

    if (!existsSync(filePath)) {
        throw new Error("Default numpy template not found at " + filePath);
    }

    return readFileSync(filePath, "utf8");
}

// TODO: handle error case
export function getCustomTemplate(templateFilePath: string): string {
    return readFileSync(templateFilePath, "utf8");
}
