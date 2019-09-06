"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lab = require("lab");
const code_1 = require("code");
const NDJSON_1 = require("../src/NDJSON");
exports.lab = Lab.script();
const { describe, it } = exports.lab;
function expectNdJson(obj, expectedEntries, expectedLines) {
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
    code_1.expect(outEntries).to.equal(expectedEntries);
    code_1.expect(outLines).to.equal(expectedLines);
}
describe("NDJSON", () => {
    it("entries", () => {
        const obj = NDJSON_1.default.fromArray([{ a: 1 }]);
        expectNdJson(obj, [{ a: 1 }], ['{"a":1}']);
    });
    // describe("lines", () => {
    //     it("works as expected", () => {
    //     });
    // });
    // describe("setEntries", () => {
    //     it("works as expected", () => {
    //     });
    // });
    // describe("setLines", () => {
    //     it("works as expected", () => {
    //     });
    // });
    it("toArray", () => {
        const obj = NDJSON_1.default.fromArray([{ a: 1 }]);
        code_1.expect(obj.toArray()).to.equal([{ a: 1 }]);
    });
    it("toString", () => {
        const obj = NDJSON_1.default.fromArray([{ a: 1 }]);
        code_1.expect(obj.toString()).to.equal('{"a":1}');
        code_1.expect(obj + "").to.equal('{"a":1}');
    });
    it("toStringArray", () => {
        const obj = NDJSON_1.default.fromArray([{ a: 1 }]);
        code_1.expect(obj.toStringArray()).to.equal(['{"a":1}']);
    });
    it("fromArray", () => {
        const obj = NDJSON_1.default.fromArray([{ a: 1 }]);
        expectNdJson(obj, [{ a: 1 }], ['{"a":1}']);
    });
    it("fromDirectory", () => {
        const obj = NDJSON_1.default.fromDirectory(__dirname + "/mocks");
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
        code_1.expect(outEntries.slice(0, 5)).to.equal([
            { "a": 1, "b": 2, "c": "3" },
            { "a": 1, "b": 2, "c": "3" },
            { "a": 1, "b": 2, "c": "3" },
            { "a": 1, "b": 2, "c": "3" },
            {
                "resourceType": "Immunization",
                "id": "71cd78d2-30ba-4d59-93fe-779c9dfa2fe6",
                "status": "completed",
                "notGiven": false,
                "vaccineCode": {
                    "coding": [
                        {
                            "system": "http://hl7.org/fhir/sid/cvx",
                            "code": "140",
                            "display": "Influenza, seasonal, injectable, preservative free"
                        }
                    ],
                    "text": "Influenza, seasonal, injectable, preservative free"
                },
                "patient": {
                    "reference": "Patient/895cd302-bee7-4933-a8f1-674344a87035"
                },
                "encounter": {
                    "reference": "Encounter/5d35659f-1f6b-4dc6-9f93-89b3099def65"
                },
                "date": "2015-09-09T14:32:40+00:00",
                "primarySource": true
            }
        ]);
    });
    it("fromFile", () => {
        const obj = NDJSON_1.default.fromFile(__dirname + "/mocks/two-lines.ndjson");
        expectNdJson(obj, [
            { "a": 1, "b": 2, "c": "3" },
            { "a": 1, "b": 2, "c": "3" }
        ], [
            '{"a":1,"b":2,"c":"3"}',
            '{"a":1,"b":2,"c":"3"}'
        ]);
    });
    it("fromString", () => {
        const obj = NDJSON_1.default.fromString('{"a":1}\n{"a":2}\r\n{"a":3}');
        expectNdJson(obj, [{ a: 1 }, { a: 2 }, { a: 3 }], ['{"a":1}', '{"a":2}', '{"a":3}']);
    });
    it("fromStringArray", () => {
        const obj = NDJSON_1.default.fromStringArray(['{ "a": 1 }']);
        expectNdJson(obj, [{ a: 1 }], ['{"a":1}']);
    });
});
