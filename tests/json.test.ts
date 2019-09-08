import * as Lab   from "lab";
import { expect } from "code";
import JSONCollection     from "../src/JSONCollection";

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

    it("toStringArray", () => {
        const obj = JSONCollection.fromArray([{ a: 1, b: [{ c: 2 }] }]);
        expect(obj.toStringArray()).to.equal(['{"a":1,"b":[{"c":2}]}']);
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
    });
});
