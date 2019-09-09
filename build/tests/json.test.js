"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lab = require("lab");
const code_1 = require("code");
const fs_1 = require("fs");
const JSONCollection_1 = require("../src/JSONCollection");
exports.lab = Lab.script();
const { describe, it } = exports.lab;
function expectJson(obj, expectedEntries, expectedLines) {
    code_1.expect([...obj.entries()]).to.equal(expectedEntries);
    code_1.expect([...obj.lines()]).to.equal(expectedLines);
}
describe("JSONCollection", () => {
    it("entries", () => {
        const obj = JSONCollection_1.default.fromArray([{ a: 1, b: [{ c: 2 }] }]);
        expectJson(obj, [{ a: 1, b: [{ c: 2 }] }], ['{"a":1,"b":[{"c":2}]}']);
    });
    it("toArray", () => {
        const obj = JSONCollection_1.default.fromArray([{ a: 1, b: [{ c: 2 }] }]);
        code_1.expect(obj.toArray()).to.equal([{ a: 1, b: [{ c: 2 }] }]);
    });
    it("toString", () => {
        const obj = JSONCollection_1.default.fromArray([{ a: 1, b: [{ c: 2 }] }]);
        code_1.expect(obj.toString()).to.equal('[{"a":1,"b":[{"c":2}]}]');
        code_1.expect(obj + "").to.equal('[{"a":1,"b":[{"c":2}]}]');
    });
    it("toNDJSON", () => {
        const obj = JSONCollection_1.default.fromArray([{ a: 1 }, { a: 2 }]);
        code_1.expect(obj.toNDJSON()).to.equal('{"a":1}\r\n{"a":2}');
        code_1.expect(obj.toNDJSON("\n")).to.equal('{"a":1}\n{"a":2}');
    });
    it("toStringArray", () => {
        const obj = JSONCollection_1.default.fromArray([{ a: 1, b: [{ c: 2 }] }]);
        code_1.expect(obj.toStringArray()).to.equal(['{"a":1,"b":[{"c":2}]}']);
    });
    it("toFile", () => {
        const filePath = __dirname + "/" + Date.now() + ".tmp";
        const obj = JSONCollection_1.default.fromArray([{ a: 1 }, { a: 2 }]);
        try {
            obj.toFile(filePath);
            code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal('[{"a":1},{"a":2}]');
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
            code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal('[{"a":1},{"a":2}]');
            // Second time - append
            obj.toFile(filePath, { append: true });
            code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal('[{"a":1},{"a":2}][{"a":1},{"a":2}]');
            // Third time - no append means overwrite
            obj.toFile(filePath);
            code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal('[{"a":1},{"a":2}]');
        }
        catch (ex) {
            throw ex;
        }
        finally {
            fs_1.unlinkSync(filePath);
        }
    });
    it("fromArray", () => {
        const obj = JSONCollection_1.default.fromArray([{ a: 1, b: [{ c: 2 }] }]);
        expectJson(obj, [{ a: 1, b: [{ c: 2 }] }], ['{"a":1,"b":[{"c":2}]}']);
    });
    it("fromFile", () => {
        const obj = JSONCollection_1.default.fromFile(__dirname + "/mocks/multi-json/sample.1.json");
        expectJson(obj, [{ a: 1, b: 2, c: 3 }], ['{"a":1,"b":2,"c":3}']);
    });
    it("fromString", () => {
        const obj = JSONCollection_1.default.fromString('[{"a":1},{"a":2},{"a":3}]');
        expectJson(obj, [{ a: 1 }, { a: 2 }, { a: 3 }], ['{"a":1}', '{"a":2}', '{"a":3}']);
    });
    it("fromStringArray", () => {
        const obj = JSONCollection_1.default.fromStringArray(['{ "a": 1 }']);
        expectJson(obj, [{ a: 1 }], ['{"a":1}']);
    });
    it("fromDirectory", () => {
        const obj = JSONCollection_1.default.fromDirectory(__dirname + "/mocks/multi-json");
        expectJson(obj, [
            { a: 1, b: 2, c: 3 },
            { a: 4, b: 5, c: 6 },
            { a: 7, b: 8, c: 9 },
            { a: 10, b: 11, c: 12 },
        ], [
            '{"a":1,"b":2,"c":3}',
            '{"a":4,"b":5,"c":6}',
            '{"a":7,"b":8,"c":9}',
            '{"a":10,"b":11,"c":12}'
        ]);
        const obj2 = JSONCollection_1.default.fromDirectory(__dirname + "/mocks/bad-json");
        code_1.expect(() => [...obj2.entries()]).to.throw();
        code_1.expect(() => [...obj2.lines()]).to.throw();
    });
});
