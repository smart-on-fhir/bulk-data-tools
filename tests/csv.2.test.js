const Lab        = require("lab");
const { expect } = require("code");
const CSV        = require("../build/csv/CSV").default;

const lab = exports.lab = Lab.script();
const { describe, it } = lab;

/**
 * Given a collection at @src asserts that its `entries` and `lines` iterators
 * yield the expected values
 * @param {Object} obj The CSV collection instance
 * @param {Object[]} expectedEntries The expected entries as an array of
 *                                     arrays of strings
 * @param {string[]} expectedLines  The expected entries as an array of strings
 */
function expectCSV(obj, expectedEntries, expectedLines) {
    const outEntries = [];
    const outLines = [];
    const entries = obj.entries();
    const lines = obj.lines();
    for (const entry of entries) {
        outEntries.push(entry);
    }
    for (const line of lines) {
        outLines.push(line);
    }
    expect(outEntries).to.equal(expectedEntries);
    expect(outLines).to.equal(expectedLines);
}

describe("CSV", () => {

    it("entries", () => {
        const obj = CSV.fromString("a,b\r\n1,2\r\n3,4");
        expectCSV(
            obj,
            [
                // ["a", "b"],
                { a: "1", b: "2" },
                { a: "3", b: "4" }
            ],
            [
                // "a,b",
                "1,2",
                "3,4"
            ]
        );
    });

    // // describe("lines", () => {
    // //     it("works as expected", () => {
    // //     });
    // // });

    // // describe("setEntries", () => {
    // //     it("works as expected", () => {
    // //     });
    // // });

    // // describe("setLines", () => {
    // //     it("works as expected", () => {
    // //     });
    // // });

    // it("toArray", () => {
    //     const obj = NDJSON.fromArray([{ a: 1 }]);
    //     expect(obj.toArray()).to.equal([{ a: 1 }]);
    // });

    // it("toString", () => {
    //     const obj = NDJSON.fromArray([{ a: 1 }]);
    //     expect(obj.toString()).to.equal('{"a":1}');
    //     expect(obj + "").to.equal('{"a":1}');
    // });

    // it("toStringArray", () => {
    //     const obj = NDJSON.fromArray([{ a: 1 }]);
    //     expect(obj.toStringArray()).to.equal(['{"a":1}']);
    // });

    it("fromArray", () => {
        const obj = CSV.fromArray([{ a: "1", b: "2" }, { a: "3", b: "4" }]);
        expectCSV(
            obj,
            [{ a: "1", b: "2" }, { a: "3", b: "4" }],
            ["1,2", "3,4"]
        );
    });

    it("fromDirectory", () => {
        const obj = CSV.fromDirectory(__dirname + "/mocks/multi-csv");
        expectCSV(
            obj,
            [
                { "a": "1" , "b": "2" , "c": "3"  },
                { "a": "4" , "b": "5" , "c": "6"  },
                { "a": "10", "b": "20", "c": "30" },
                { "a": "40", "b": "50", "c": "60" }
            ],
            [
                "1,2,3",
                "4,5,6",
                "10,20,30",
                "40,50,60"
            ]
        );
    });

    it("fromFile", () => {
        const obj = CSV.fromFile(__dirname + "/mocks/sample.1.csv");
        expectCSV(
            obj,
            [
                { "a": "1", "b": "2", "c": "3" },
                { "a": "4", "b": "5", "c": "6" }
            ],
            [
                "1,2,3",
                "4,5,6"
            ]
        );
    });

    it("fromString", () => {
        const obj = CSV.fromString("a, b\n1,2\r\n3 ,4");
        expectCSV(
            obj,
            [{ a: "1", b: "2" }, { a: "3", b: "4" }],
            ["1,2", "3,4"]
        );
    });

    it("fromStringArray", () => {
        const obj = CSV.fromStringArray(["a,b", "1,2", "3,4"]);
        expectCSV(
            obj,
            [{ a: "1", b: "2" }, { a: "3", b: "4" }],
            ["1,2", "3,4"]
        );
    });

    // // describe("LineStream", () => {
    // //     it ("handles multiple new lines per chunk");
    // //     it ("handles one new line per multiple chunks", () => {
    // //         const stream = new LineStream();
    // //     });
    // // });

    // // describe("NdJsonStream", () => {
    // //     it ("TODO");
    // // });

    // // describe("forEachLine", () => {
    // //     it ("TODO", () => {
    // //         // "mocks/"
    // //         // forEachLine(filePath, callback, onFinish)
    // //     });
    // // });

});
