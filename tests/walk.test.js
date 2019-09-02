const Lab        = require("lab");
const { expect } = require("code");
const walk       = require("../build/walk");

const lab = exports.lab = Lab.script();
const { describe, it, beforeEach, afterEach } = lab;


describe("walk.js", () => {

    describe("readLine", () => {
        it("works as expected", () => {
            const fileContents = [
                "a,b,c",
                "1,2,3",
                "4,5,6"
            ];
            const outputLines = [];
            const inputLines  = walk.readLine(__dirname + "/mocks/sample.1.csv");
            for (const line of inputLines) {
                outputLines.push(line);
            }
            expect(outputLines).to.equal(fileContents);
        });
    });

    // describe("forEachFile", () => {
    //     it ("requires 'callback' argument");
    //     it ("rejects invalid 'dir' option");
    //     it ("rejects invalid 'filter' option");
    //     it ("can follow links");
    //     it ("calls the callback for each matched file");
    // });

});
