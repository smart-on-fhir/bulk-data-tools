import * as Lab   from "lab";
import { expect } from "code";
import { readFileSync, unlinkSync } from "fs";
import JSONCollection from "../src/JSONCollection";

export const lab = Lab.script();
const { describe, it } = lab;


function expectJson(
    obj: JSONCollection,
    expectedEntries: BulkDataTools.IAnyObject[],
    expectedLines: string[]
) {
    expect([...obj.entries()]).to.equal(expectedEntries);
    expect([...obj.lines()  ]).to.equal(expectedLines);
}

describe("JSONCollection", () => {

    it("entries", () => {
        const obj = JSONCollection.fromArray([{ a: 1, b: [{ c: 2 }] }]);
        expectJson(obj, [{ a: 1, b: [{ c: 2 }] }], ['{"a":1,"b":[{"c":2}]}']);
    });

    it("toArray", () => {
        const obj = JSONCollection.fromArray([{ a: 1, b: [{ c: 2 }] }]);
        expect(obj.toArray()).to.equal([{ a: 1, b: [{ c: 2 }] }]);
    });

    it("toString", () => {
        const obj = JSONCollection.fromArray([{ a: 1, b: [{ c: 2 }] }]);
        expect(obj.toString()).to.equal('[{"a":1,"b":[{"c":2}]}]');
        expect(obj + "").to.equal('[{"a":1,"b":[{"c":2}]}]');
    });

    it("toNDJSON", () => {
        const obj = JSONCollection.fromArray([{ a: 1 }, { a: 2 }]);
        expect(obj.toNDJSON()).to.equal('{"a":1}\r\n{"a":2}');
        expect(obj.toNDJSON("\n")).to.equal('{"a":1}\n{"a":2}');
    });

    it("toStringArray", () => {
        const obj = JSONCollection.fromArray([{ a: 1, b: [{ c: 2 }] }]);
        expect(obj.toStringArray()).to.equal(['{"a":1,"b":[{"c":2}]}']);
    });

    it("toFile", () => {
        const filePath = __dirname + "/" + Date.now() + ".tmp";
        const obj = JSONCollection.fromArray([{ a: 1 }, { a: 2 }]);
        try {
            obj.toFile(filePath);
            expect(readFileSync(filePath, "utf8")).to.equal('[{"a":1},{"a":2}]');
        }
        catch (ex) {
            throw ex;
        }
        finally {
            unlinkSync(filePath);
        }

        try {
            // First time - create the file
            obj.toFile(filePath);
            expect(readFileSync(filePath, "utf8")).to.equal('[{"a":1},{"a":2}]');

            // Second time - append
            obj.toFile(filePath, { append: true });
            expect(readFileSync(filePath, "utf8")).to.equal(
                '[{"a":1},{"a":2}][{"a":1},{"a":2}]'
            );

            // Third time - no append means overwrite
            obj.toFile(filePath);
            expect(readFileSync(filePath, "utf8")).to.equal('[{"a":1},{"a":2}]');
        }
        catch (ex) {
            throw ex;
        }
        finally {
            unlinkSync(filePath);
        }
    });

    it("fromArray", () => {
        const obj = JSONCollection.fromArray([{ a: 1, b: [{ c: 2 }] }]);
        expectJson(obj, [{ a: 1, b: [{ c: 2 }] }], ['{"a":1,"b":[{"c":2}]}']);
    });

    it("fromFile", () => {
        const obj = JSONCollection.fromFile(__dirname + "/mocks/multi-json/sample.1.json");
        expectJson(obj, [{ a: 1, b: 2, c: 3 }], ['{"a":1,"b":2,"c":3}']);
    });

    it("fromString", () => {
        const obj = JSONCollection.fromString('[{"a":1},{"a":2},{"a":3}]');
        expectJson(obj, [{a: 1}, {a: 2}, {a: 3}], ['{"a":1}', '{"a":2}', '{"a":3}']);
    });

    it("fromStringArray", () => {
        const obj = JSONCollection.fromStringArray(['{ "a": 1 }']);
        expectJson(obj, [{ a: 1 }], ['{"a":1}']);
    });

    it("fromDirectory", () => {
        const obj = JSONCollection.fromDirectory(__dirname + "/mocks/multi-json");
        expectJson(
            obj,
            [
                { a: 1 , b: 2 , c: 3  },
                { a: 4 , b: 5 , c: 6  },
                { a: 7 , b: 8 , c: 9  },
                { a: 10, b: 11, c: 12 },
            ],
            [
                '{"a":1,"b":2,"c":3}',
                '{"a":4,"b":5,"c":6}',
                '{"a":7,"b":8,"c":9}',
                '{"a":10,"b":11,"c":12}'
            ]
        );

        const obj2 = JSONCollection.fromDirectory(__dirname + "/mocks/bad-json");
        expect(() => [...obj2.entries()]).to.throw();
        expect(() => [...obj2.lines()]).to.throw();
    });
});
