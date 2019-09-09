"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Lab = require("lab");
const code_1 = require("code");
const lib = require("../src/lib");
exports.lab = Lab.script();
const { describe, it } = exports.lab;
describe("lib", () => {
    describe("roundToPrecision", () => {
        const map = [
            [[3], 3],
            [[3.00], 3],
            [[3, 2], 3],
            [[3, 0], 3],
            [[3.12, 0], 3],
            [[3.12, 1], 3.1],
            [[3.12, 2], 3.12],
            [[3.12, 3], 3.12],
            [[3.12, 0, 1], "3.0"],
            [[3.12, 0, 2], "3.00"],
            [[3.12, 3, 1], "3.1"],
            [[3.12, 3, 4], "3.1200"],
            [[Infinity], NaN],
            [[-Infinity], NaN],
            [["whatever"], NaN],
            [[3.43, "x"], 3],
            [[3.43, Infinity], 3],
            [[3.43, -2], 3],
        ];
        map.forEach(([args, result]) => {
            it("expect roundToPrecision(" +
                args.map(x => JSON.stringify(x)).join(", ") +
                ") to produce " + JSON.stringify(result), () => {
                code_1.expect(lib.roundToPrecision(args[0], args[1], args[2])).to.equal(result);
            });
        });
    });
    describe("readableFileSize", () => {
        const map = [
            [[0], "0 Bytes"],
            [[0, { fixed: 2 }], "0.00 Bytes"],
            [[100], "100 Bytes"],
            [[1000], "1 kB"],
            [[1001], "1 kB"],
            [[1001, { useBinary: true }], "1001 Bytes"],
            [[1024, { useBinary: true }], "1 KiB"],
            [[1124, { precision: 0 }], "1 kB"],
            [[1124, { precision: 1 }], "1.1 kB"],
        ];
        map.forEach(([args, result]) => {
            it("expect readableFileSize(" +
                args.map((x) => JSON.stringify(x)).join(", ") +
                ") to produce " + JSON.stringify(result), () => {
                code_1.expect(lib.readableFileSize(args[0], args[1])).to.equal(result);
            });
        });
    });
    describe("intVal", () => {
        const map = [
            [[0], 0],
            [[1], 1],
            [[-1], -1],
            [[""], 0],
            [["5.3"], 5],
            [[false, 5], 5],
            [[Infinity, 5], 5],
        ];
        map.forEach(([args, result]) => {
            it("expect intVal(" +
                args.map(x => JSON.stringify(x)).join(", ") +
                ") to produce " + JSON.stringify(result), () => {
                code_1.expect(lib.intVal(args[0], args[1])).to.equal(result);
            });
        });
    });
    describe("floatVal", () => {
        const map = [
            [[0], 0],
            [[1], 1],
            [[-1.5], -1.5],
            [[""], 0],
            [["5.3"], 5.3],
            [[false, 5.2], 5.2],
            [[Infinity, 5.2], 5.2],
        ];
        map.forEach(([args, result]) => {
            it("expect floatVal(" +
                args.map(x => JSON.stringify(x)).join(", ") +
                ") to produce " + JSON.stringify(result), () => {
                code_1.expect(lib.floatVal(args[0], args[1])).to.equal(result);
            });
        });
    });
    describe("uInt", () => {
        const map = [
            [[0], 0],
            [[1], 1],
            [[-1.5], 0],
            [[""], 0],
            [["5.3"], 5],
            [[false, 5.2], 5],
        ];
        map.forEach(([args, result]) => {
            it("expect uInt(" +
                args.map(x => JSON.stringify(x)).join(", ") +
                ") to produce " + JSON.stringify(result), () => {
                code_1.expect(lib.uInt(args[0], args[1])).to.equal(result);
            });
        });
    });
    describe("uFloat", () => {
        const map = [
            [[0], 0],
            [[1], 1],
            [[-1.5], 0],
            [[""], 0],
            [["5.3"], 5.3],
            [[false, 5.2], 5.2],
        ];
        map.forEach(([args, result]) => {
            it("expect uFloat(" +
                args.map(x => JSON.stringify(x)).join(", ") +
                ") to produce " + JSON.stringify(result), () => {
                code_1.expect(lib.uFloat(args[0], args[1])).to.equal(result);
            });
        });
    });
    describe("isObject", () => {
        const map = [
            [{}, true],
            [true, false],
            [false, false],
            [new Object(), true],
            [new Date(), true],
            [[], true],
            [null, false],
        ];
        map.forEach(([input, result]) => {
            it("expect isObject(" + JSON.stringify(input) +
                ") to produce " + JSON.stringify(result), () => {
                code_1.expect(lib.isObject(input)).to.equal(result);
            });
        });
    });
    describe("getPath", () => {
        const data = { a: 1, b: [1, 2, { c: "x" }], d: "3" };
        const map = [
            ["a", data.a],
            ["b", data.b],
            ["d", data.d],
            ["b.0", data.b[0]],
            ["b.1", data.b[1]],
            ["b.2", data.b[2]],
            ["b.3", undefined],
            ["y.0", undefined],
        ];
        map.forEach(([path, result]) => {
            it("expect getPath(" + path + ") to produce " + JSON.stringify(result), () => {
                code_1.expect(lib.getPath(data, path)).to.equal(result);
            });
        });
    });
    describe("setPath", () => {
        it("works with flat objects", () => {
            const target = { a: 1, b: 2 };
            lib.setPath(target, "b", 3);
            code_1.expect(target).to.equal({ a: 1, b: 3 });
        });
        it("works with flat arrays", () => {
            const target = [1, 2];
            lib.setPath(target, 1, 3);
            code_1.expect(target).to.equal([1, 3]);
        });
        it("works with nested objects", () => {
            const target = { a: 1, b: { c: 2 } };
            lib.setPath(target, "b.c", 3);
            code_1.expect(target).to.equal({ a: 1, b: { c: 3 } });
        });
        it("works with nested arrays", () => {
            const target = [1, [2]];
            lib.setPath(target, "1.0", 3);
            code_1.expect(target).to.equal([1, [3]]);
        });
        it("works with mixed objects", () => {
            const target = [1, [2, { a: { b: [3, 3, 3] } }]];
            lib.setPath(target, "1.1.a.b.2", 4);
            code_1.expect(target).to.equal([1, [2, { a: { b: [3, 3, 4] } }]]);
        });
        it("creates intermediate paths", () => {
            const target = { a: 1, s: [3, [4]] };
            lib.setPath(target, "b.c.d", 2);
            code_1.expect(target).to.equal({ a: 1, b: { c: { d: 2 } }, s: [3, [4]] });
            lib.setPath(target, "s.1.2", "x");
            code_1.expect(target).to.equal({ a: 1, b: { c: { d: 2 } }, s: [3, [4, undefined, "x"]] });
            lib.setPath(target, "x.0.1", "--");
            code_1.expect(target.x).to.equal([[undefined, "--"]]);
        });
        it("prevents incorrect mutations", () => {
            code_1.expect(() => lib.setPath({ a: { b: 5 } }, "a.b", { x: "y" })).to.throw();
            code_1.expect(() => lib.setPath({ a: { b: 5 } }, "a.b", ["y"])).to.throw();
            code_1.expect(() => lib.setPath({ a: { b: [5] } }, "a.b", { x: "y" })).to.throw();
            code_1.expect(() => lib.setPath({ a: { b: { a: 5 } } }, "a.b", ["y"])).to.throw();
            code_1.expect(() => lib.setPath({ a: { b: { a: 5 } } }, "a.b", 5)).to.throw();
        });
        it("throws with no path", () => {
            code_1.expect(() => lib.setPath({}, [], "")).to.throw();
        });
    });
    describe("strPad", () => {
        it("typical usage", () => {
            code_1.expect(lib.strPad("x", 3)).to.equal("x  ");
        });
        it("edge cases", () => {
            code_1.expect(lib.strPad(" x ", 4)).to.equal(" x  ");
            code_1.expect(lib.strPad("x  ", 4)).to.equal("x   ");
            code_1.expect(lib.strPad("x    ", 4)).to.equal("x    ");
            code_1.expect(lib.strPad("x    ", 0)).to.equal("x    ");
            code_1.expect(lib.strPad("x   ", -2)).to.equal("x   ");
        });
    });
    describe("delimitedHeaderFromArray", () => {
        it("from similar objects", () => {
            code_1.expect(lib.delimitedHeaderFromArray([
                { a: 1, b: 2 },
                { a: 1, b: 2 }
            ])).to.equal(["a", "b"]);
        });
        it("from similar objects fast", () => {
            code_1.expect(lib.delimitedHeaderFromArray([
                { a: 1, b: 2 },
                { a: 1, b: 2 }
            ], { fast: true })).to.equal(["a", "b"]);
        });
        it("from different objects", () => {
            code_1.expect(lib.delimitedHeaderFromArray([
                { a: 1, b: 2 },
                { a: 1, b: 2, c: { d: 5 } },
                { b: 2 }
            ])).to.equal(["a", "b", "c.d"]);
        });
        it("from different objects fast", () => {
            code_1.expect(lib.delimitedHeaderFromArray([
                { a: 1, b: 2 },
                { a: 1, b: 2, c: { d: 5 } }
            ], { fast: true })).to.equal(["a", "b"]);
        });
        it("from similar arrays", () => {
            code_1.expect(lib.delimitedHeaderFromArray([
                [1, 2],
                [1, 2]
            ])).to.equal(["0", "1"]);
        });
        it("from similar arrays fast", () => {
            code_1.expect(lib.delimitedHeaderFromArray([
                [1, 2],
                [1, 2]
            ], { fast: true })).to.equal(["0", "1"]);
        });
        it("from different arrays", () => {
            code_1.expect(lib.delimitedHeaderFromArray([
                [1, 2],
                [1, 2, 3],
                [5]
            ])).to.equal(["0", "1", "2"]);
        });
        it("from different arrays fast", () => {
            code_1.expect(lib.delimitedHeaderFromArray([
                [1, 2],
                [1, 2, 3],
                [5]
            ], { fast: true })).to.equal(["0", "1"]);
        });
        it("throws on incompatible rows", () => {
            code_1.expect(() => lib.delimitedHeaderFromArray([
                { a: 1, b: 2, c: 3 },
                { a: 1, b: 2, c: { d: 5 } }
            ])).to.throw();
            code_1.expect(() => lib.delimitedHeaderFromArray([
                { a: 1, b: 2, c: 3 },
                { a: 1, b: 2, c: [5] }
            ])).to.throw();
        });
    });
    describe("filterFiles", () => {
        it("works with RegEx filter", () => {
            code_1.expect([...lib.filterFiles(__dirname + "/mocks/multi-csv", /\.csv$/i)]).to.equal([
                __dirname + "/mocks/multi-csv/sample.1.csv",
                __dirname + "/mocks/multi-csv/sample.2.csv"
            ]);
        });
        it("works with function filter", () => {
            code_1.expect([...lib.filterFiles(__dirname + "/mocks/multi-csv", f => f.endsWith(".csv"))]).to.equal([
                __dirname + "/mocks/multi-csv/sample.1.csv",
                __dirname + "/mocks/multi-csv/sample.2.csv"
            ]);
        });
    });
    describe("jsonEntries", () => {
        code_1.expect([...lib.jsonEntries(__dirname + "/mocks/multi-json")]).to.equal([
            { "a": 1, "b": 2, "c": 3 },
            { "a": 4, "b": 5, "c": 6 },
            { "a": 7, "b": 8, "c": 9 },
            { "a": 10, "b": 11, "c": 12 }
        ]);
        code_1.expect([...lib.jsonEntries(__dirname + "/mocks/multi-ndjson")]).to.equal([
            { "a": 1, "b": 2, "c": 3 },
            { "a": 4, "b": 5, "c": 6 },
            { "a": 7, "b": 8, "c": 9 },
            { "a": 10, "b": 11, "c": 12 }
        ]);
    });
    describe("parseDelimitedLine", () => {
        code_1.expect(lib.parseDelimitedLine("a,b,c", ",")).to.equal(["a", "b", "c"]);
        code_1.expect(lib.parseDelimitedLine("a;b;c", ";")).to.equal(["a", "b", "c"]);
        code_1.expect(lib.parseDelimitedLine('"a,b",c', ",")).to.equal(["a,b", "c"]);
        code_1.expect(lib.parseDelimitedLine('"a""b""c"')).to.equal(['a"b"c']);
    });
    describe("mergeStrict", () => {
        it("throws on incompatible objects", () => {
            // don't override scalar with object
            code_1.expect(() => lib.mergeStrict({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: { d: 5 } }), "Override scalar value with object").to.throw();
            // don't override object with scalar
            code_1.expect(() => lib.mergeStrict({ a: 1, b: 2, c: { d: 5 } }, { a: 1, b: 2, c: 3 }), "Override object with scalar value").to.throw();
            // don't override scalar with array
            code_1.expect(() => lib.mergeStrict({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: [5] }), "Override scalar value with array").to.throw();
            // don't override array with scalar
            code_1.expect(() => lib.mergeStrict({ a: 1, b: 2, c: [5] }, { a: 1, b: 2, c: 3 }), "Override array with scalar value").to.throw();
            // don't override array with object
            code_1.expect(() => lib.mergeStrict({ a: 1, b: 2, c: [5] }, { a: 1, b: 2, c: { d: 5 } }), "Override array with object").to.throw();
            // don't override object with array
            code_1.expect(() => lib.mergeStrict({ a: 1, b: 2, c: { d: 5 } }, { a: 1, b: 2, c: [5] }), "Override object with array").to.throw();
            code_1.expect(lib.mergeStrict({ a: 1, c: 5 }, { a: 1, b: [2], c: 6 })).to.equal({ a: 1, b: [2], c: 6 });
        });
    });
    describe("equals", () => {
        const map = [
            [0, 0, true],
            [0, null, false],
            [0, false, false],
            [0, undefined, false]
        ];
        map.forEach(([a, b, result]) => {
            it("expect equals(" + a + ")(" + b + ") to return " + result, () => {
                code_1.expect(lib.equals(a)(b)).to.equal(result);
            });
        });
    });
    describe("isFunction", () => {
        const map = [
            [() => { }, true],
            [function () { }, true],
            [Date, true],
            [5, false]
        ];
        map.forEach(([a, result]) => {
            it("expect isFunction(" + a + ") to return " + result, () => {
                code_1.expect(lib.isFunction(a)).to.equal(result);
            });
        });
    });
    describe("walkSync", () => {
        code_1.expect([...lib.walkSync(__dirname + "/mocks/multi-csv")]).to.equal([
            __dirname + "/mocks/multi-csv/nested/other.txt",
            __dirname + "/mocks/multi-csv/other.txt",
            __dirname + "/mocks/multi-csv/sample.1.csv",
            __dirname + "/mocks/multi-csv/sample.2.csv"
        ]);
    });
});
