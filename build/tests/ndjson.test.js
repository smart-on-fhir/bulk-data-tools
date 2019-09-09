"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lab = require("lab");
const code_1 = require("code");
const fs_1 = require("fs");
const NDJSONCollection_1 = require("../src/NDJSONCollection");
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
        const obj = NDJSONCollection_1.default.fromArray([{ a: 1 }]);
        expectNdJson(obj, [{ a: 1 }], ['{"a":1}']);
    });
    it("toArray", () => {
        const obj = NDJSONCollection_1.default.fromArray([{ a: 1 }]);
        code_1.expect(obj.toArray()).to.equal([{ a: 1 }]);
    });
    it("toString", () => {
        const obj = NDJSONCollection_1.default.fromArray([{ a: 1 }]);
        code_1.expect(obj.toString()).to.equal('{"a":1}');
        code_1.expect(obj + "").to.equal('{"a":1}');
    });
    it("toStringArray", () => {
        const obj = NDJSONCollection_1.default.fromArray([{ a: 1 }]);
        code_1.expect(obj.toStringArray()).to.equal(['{"a":1}']);
    });
    it("toFile", () => {
        const filePath = __dirname + "/" + Date.now() + ".tmp";
        const obj = NDJSONCollection_1.default.fromArray([{ a: 1 }, { a: 2 }]);
        try {
            obj.toFile(filePath);
            code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal('{"a":1}\r\n{"a":2}');
        }
        catch (ex) {
            throw ex;
        }
        finally {
            fs_1.unlinkSync(filePath);
        }
        try {
            // First time - create the file
            obj.toFile(filePath);
            code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal('{"a":1}\r\n{"a":2}');
            // Second time - append
            obj.toFile(filePath, { append: true });
            code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal('{"a":1}\r\n{"a":2}{"a":1}\r\n{"a":2}');
            // Third time - no append means overwrite
            obj.toFile(filePath);
            code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal('{"a":1}\r\n{"a":2}');
        }
        catch (ex) {
            throw ex;
        }
        finally {
            fs_1.unlinkSync(filePath);
        }
    });
    it("fromArray", () => {
        const obj = NDJSONCollection_1.default.fromArray([{ a: 1 }]);
        expectNdJson(obj, [{ a: 1 }], ['{"a":1}']);
    });
    it("fromDirectory", () => {
        const obj = NDJSONCollection_1.default.fromDirectory(__dirname + "/mocks/multi-ndjson");
        code_1.expect([...obj.entries()]).to.equal([
            { "a": 1, "b": 2, "c": 3 },
            { "a": 4, "b": 5, "c": 6 },
            { "a": 7, "b": 8, "c": 9 },
            { "a": 10, "b": 11, "c": 12 }
        ]);
        const obj2 = NDJSONCollection_1.default.fromDirectory(__dirname + "/mocks/bad-ndjson");
        code_1.expect(() => [...obj2.lines()]).to.throw();
        code_1.expect(() => [...obj2.entries()]).to.throw();
    });
    it("fromFile", () => {
        const obj = NDJSONCollection_1.default.fromFile(__dirname + "/mocks/two-lines.ndjson");
        expectNdJson(obj, [
            { "a": 1, "b": 2, "c": "3" },
            { "a": 1, "b": 2, "c": "3" }
        ], [
            '{"a":1,"b":2,"c":"3"}',
            '{"a":1,"b":2,"c":"3"}'
        ]);
    });
    it("fromString", () => {
        const obj = NDJSONCollection_1.default.fromString('{"a":1}\n{"a":2}\r\n{"a":3}');
        expectNdJson(obj, [{ a: 1 }, { a: 2 }, { a: 3 }], ['{"a":1}', '{"a":2}', '{"a":3}']);
    });
    it("fromStringArray", () => {
        const obj = NDJSONCollection_1.default.fromStringArray(['{ "a": 1 }']);
        expectNdJson(obj, [{ a: 1 }], ['{"a":1}']);
    });
});
