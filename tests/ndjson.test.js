const Lab            = require("lab");
const { expect }     = require("code");
const { LineStream } = require("../ndjson");

const lab = exports.lab = Lab.script();
const { describe, it } = lab;


describe("ndjson.js", () => {

    describe("LineStream", () => {
        it ("handles multiple new lines per chunk");
        it ("handles one new line per multiple chunks", () => {
            const stream = new LineStream();
        });
    });

    describe("NdJsonStream", () => {
        it ("TODO");
    });

    describe("forEachLine", () => {
        it ("TODO", () => {
            // "mocks/"
            // forEachLine(filePath, callback, onFinish)
        });
    });

});