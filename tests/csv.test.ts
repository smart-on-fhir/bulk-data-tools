import { unlinkSync, readFileSync } from "fs";
import * as Lab   from "lab";
import { expect } from "code";
import Delimited  from "../src/Delimited";

export const lab = Lab.script();
const { describe, it } = lab;


/**
 * Given a collection at @src asserts that its `entries` and `lines` iterators
 * yield the expected values
 * @param {Object} obj The CSV collection instance
 * @param {Object[]} expectedEntries The expected entries as an array of
 *                                     arrays of strings
 * @param {string[]} expectedLines  The expected entries as an array of strings
 */
function expectDelimited(
    obj: Delimited,
    expectedEntries: BulkDataTools.IAnyObject[],
    expectedLines: string[]
) {
    expect([...obj.entries()]).to.equal(expectedEntries);
    expect([...obj.lines()  ]).to.equal(expectedLines);
}

describe("Delimited", () => {

    it("entries", () => {
        const obj = Delimited.fromString("a,b\r\n1,2\r\n3,4");
        expectDelimited(
            obj,
            [
                { a: "1", b: "2" },
                { a: "3", b: "4" }
            ],
            [
                "1,2",
                "3,4"
            ]
        );
    });

    it("toFile", () => {
        const filePath = __dirname + "/" + Date.now() + ".tmp";
        const obj = Delimited.fromString("a,b\r\n1,2\r\n3,4");
        try {
            obj.toFile(filePath);
            expect(readFileSync(filePath, "utf8")).to.equal("a,b\r\n1,2\r\n3,4");
        }
        catch (ex) {
            throw ex;
        }
        finally {
            unlinkSync(filePath);
        }
    });

    it("toArray", () => {
        let obj = Delimited.fromString("a,b\r\n1,2\r\n3,4");
        expect(obj.toArray()).to.equal([
            { a: "1", b: "2" },
            { a: "3", b: "4" }
        ]);

        obj = Delimited.fromString('"a,a",b\r\n1,2'); // [ { 'a,a': '1', b: '2' } ]
        expect(obj.toArray()).to.equal([
            { "a,a": "1", b: "2" }
        ]);
    });

    it("toString", () => {
        let obj = Delimited.fromString("a,b\r\n1,2\r\n3,4");
        expect(obj.toString()).to.equal("a,b\r\n1,2\r\n3,4");
        expect(obj.toString({
            delimiter: "\t"
        })).to.equal("a\tb\r\n1\t2\r\n3\t4");
        expect(obj.toString({
            delimiter: ";",
            eol: "\n"
        })).to.equal("a;b\n1;2\n3;4");

        obj = Delimited.fromString('"a,a",b\r\n1,2'); // [ { 'a,a': '1', b: '2' } ]
        expect(obj.toString()).to.equal('"a,a",b\r\n1,2');
    });

    it("toStringArray", () => {
        let obj = Delimited.fromString("a,b\r\n1,2\r\n3,4");
        expect(obj.toStringArray()).to.equal(["a,b", "1,2", "3,4"]);

        expect(obj.toStringArray({
            delimiter: "\t"
        })).to.equal(["a\tb", "1\t2", "3\t4"]);

        obj = Delimited.fromString('"a,a",b\r\n1,2'); // [ { 'a,a': '1', b: '2' } ]
        expect(obj.toStringArray()).to.equal(['"a,a",b', "1,2"]);
    });

    it("fromArray", () => {
        const csv = Delimited.fromArray([
            { a: 1, b: 2, c: { d: null }},
            { a: 3, b: 4, c: { d: 4    }}
        ]);
        expectDelimited(
            csv,
            [
                { a: 1, b: 2, "c.d": null },
                { a: 3, b: 4, "c.d": 4    }
            ],
            ["1,2,null", "3,4,4"]
        );

        const tsv = Delimited.fromArray(
            [
                { a: 1, b: 2, c: { d: null }},
                { a: 3, b: 4, c: { d: 4    }}
            ],
            { delimiter: "\t" }
        );
        expectDelimited(
            tsv,
            [
                { a: 1, b: 2, "c.d": null },
                { a: 3, b: 4, "c.d": 4    }
            ],
            ["1\t2\tnull", "3\t4\t4"]
        );

        const dirty = Delimited.fromArray([{ a: "1", "b\"c": '2"3' }]);
        expectDelimited(
            dirty,
            [{ a: "1", 'b"c': '2"3' }],
            ['1,"2""3"']
        );
    });

    it("fromDirectory", () => {
        const csv = Delimited.fromDirectory(__dirname + "/mocks/multi-csv");
        expectDelimited(
            csv,
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

        const tsv = Delimited.fromDirectory(__dirname + "/mocks/multi-tsv", {
            extension: "tsv",
            delimiter: "\t"
        });
        expectDelimited(
            tsv,
            [
                { a: "1" , b: "2" , c: "3"  },
                { a: "4" , b: "5" , c: "6"  },
                { a: "10", b: "20", c: "30" },
                { a: "40", b: "50", c: "60" }
            ],
            [
                "1\t2\t3",
                "4\t5\t6",
                "10\t20\t30",
                "40\t50\t60"
            ]
        );
    });

    it("fromFile", () => {
        const csv = Delimited.fromFile(__dirname + "/mocks/sample.1.csv");
        expectDelimited(
            csv,
            [
                { "a": "1", "b": "2", "c": "3" },
                { "a": "4", "b": "5", "c": "6" }
            ],
            [
                "1,2,3",
                "4,5,6"
            ]
        );

        const tsv = Delimited.fromFile(__dirname + "/mocks/sample.1.tsv", { delimiter: "\t" });
        expectDelimited(
            tsv,
            [
                { "a": "1", "b": "2", "c": "3" },
                { "a": "4", "b": "5", "c": "6" }
            ],
            [
                "1\t2\t3",
                "4\t5\t6"
            ]
        );
    });

    it("fromString", () => {
        const csv = Delimited.fromString("a, b\n1,2\r\n3 ,4");
        expectDelimited(
            csv,
            [{ a: "1", b: "2" }, { a: "3", b: "4" }],
            ["1,2", "3,4"]
        );

        const tsv = Delimited.fromString("a\t b\n1\t2\r\n3 \t4", { delimiter: "\t" });
        expectDelimited(
            tsv,
            [{ a: "1", b: "2" }, { a: "3", b: "4" }],
            ["1\t2", "3\t4"]
        );
    });

    it("fromStringArray", () => {
        const csv = Delimited.fromStringArray(["a,b", "1,2", "3,4"]);
        expectDelimited(
            csv,
            [{ a: "1", b: "2" }, { a: "3", b: "4" }],
            ["1,2", "3,4"]
        );

        const tsv = Delimited.fromString("a\t b\n1\t2\r\n3 \t4", { delimiter: "\t" });
        expectDelimited(
            tsv,
            [{ a: "1", b: "2" }, { a: "3", b: "4" }],
            ["1\t2", "3\t4"]
        );
    });

});
