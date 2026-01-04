import { expect } from "chai";
import "mocha";

import { getCustomTemplate } from "../../docstring/get_template";

describe("getCustomTemplate()", () => {
    context("when given a path for a template file", () => {
        it("should return the string in the file", () => {
            const result = getCustomTemplate(__dirname + "/custom_template_test.mustache");

            expect(result).to.contain("Custom Docstring Template");
        });
    });
});
