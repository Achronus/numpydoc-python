import { expect } from "chai";
import "mocha";

import { getDefaultTemplate } from "../../docstring/get_template";

describe("getDefaultTemplate()", () => {
    context("when called", () => {
        it("should return the numpydoc mustache template", () => {
            const result = getDefaultTemplate();

            expect(result).to.contain("Parameters");
            expect(result).to.contain("Returns");
        });
    });
});

