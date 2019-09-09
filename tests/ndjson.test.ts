import * as Lab   from "lab";
import { expect } from "code";
import { readFileSync, unlinkSync } from "fs";
import NDJSONCollection     from "../src/NDJSONCollection";

export const lab = Lab.script();
const { describe, it } = lab;


function expectNdJson(obj: NDJSONCollection, expectedEntries: BulkDataTools.IAnyObject[], expectedLines: string[]) {
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

describe("NDJSON", () => {

    it("entries", () => {
        const obj = NDJSONCollection.fromArray([{ a: 1 }]);
        expectNdJson(obj, [{ a: 1 }], ['{"a":1}']);
    });

    it("toArray", () => {
        const obj = NDJSONCollection.fromArray([{ a: 1 }]);
        expect(obj.toArray()).to.equal([{ a: 1 }]);
    });

    it("toString", () => {
        const obj = NDJSONCollection.fromArray([{ a: 1 }]);
        expect(obj.toString()).to.equal('{"a":1}');
        expect(obj + "").to.equal('{"a":1}');
    });

    it("toStringArray", () => {
        const obj = NDJSONCollection.fromArray([{ a: 1 }]);
        expect(obj.toStringArray()).to.equal(['{"a":1}']);
    });

    it("toFile", () => {
        const filePath = __dirname + "/" + Date.now() + ".tmp";
        const obj = NDJSONCollection.fromArray([{ a: 1 }, { a: 2 }]);
        try {
            obj.toFile(filePath);
            expect(readFileSync(filePath, "utf8")).to.equal('{"a":1}\r\n{"a":2}');
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
            expect(readFileSync(filePath, "utf8")).to.equal('{"a":1}\r\n{"a":2}');

            // Second time - append
            obj.toFile(filePath, { append: true });
            expect(readFileSync(filePath, "utf8")).to.equal(
                '{"a":1}\r\n{"a":2}{"a":1}\r\n{"a":2}'
            );

            // Third time - no append means overwrite
            obj.toFile(filePath);
            expect(readFileSync(filePath, "utf8")).to.equal('{"a":1}\r\n{"a":2}');
        }
        catch (ex) {
            throw ex;
        }
        finally {
            unlinkSync(filePath);
        }
    });

    it("fromArray", () => {
        const obj = NDJSONCollection.fromArray([{ a: 1 }]);
        expectNdJson(obj, [{ a: 1 }], ['{"a":1}']);
    });

    it("fromDirectory", () => {
        const obj = NDJSONCollection.fromDirectory(__dirname + "/mocks/multi-ndjson");
        expect([...obj.entries()]).to.equal([
            { "a": 1 , "b": 2 , "c": 3  },
            { "a": 4 , "b": 5 , "c": 6  },
            { "a": 7 , "b": 8 , "c": 9  },
            { "a": 10, "b": 11, "c": 12 }
        ]);

        const obj2 = NDJSONCollection.fromDirectory(__dirname + "/mocks/bad-ndjson");
        expect(() => [...obj2.lines()]).to.throw();
        expect(() => [...obj2.entries()]).to.throw();
    });

    it("fromFile", () => {
        const obj = NDJSONCollection.fromFile(__dirname + "/mocks/two-lines.ndjson");
        expectNdJson(
            obj,
            [
                {"a": 1, "b": 2, "c": "3"},
                {"a": 1, "b": 2, "c": "3"}
            ],
            [
                '{"a":1,"b":2,"c":"3"}',
                '{"a":1,"b":2,"c":"3"}'
            ]
        );
    });

    it("fromString", () => {
        const obj = NDJSONCollection.fromString('{"a":1}\n{"a":2}\r\n{"a":3}');
        expectNdJson(
            obj,
            [{a: 1}, {a: 2}, {a: 3}],
            ['{"a":1}', '{"a":2}', '{"a":3}']
        );
    });

    it("fromStringArray", () => {
        const obj = NDJSONCollection.fromStringArray(['{ "a": 1 }']);
        expectNdJson(obj, [{ a: 1 }], ['{"a":1}']);
    });
});
