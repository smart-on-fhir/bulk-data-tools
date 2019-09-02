const Lab        = require("lab");
const { expect } = require("code");
const lib        = require("../build/lib");

const lab = exports.lab = Lab.script();
const { describe, it, beforeEach, afterEach } = lab;


describe("lib", () => {

    describe("roundToPrecision", () => {
        const map = [
            [[3         ], 3     ],
            [[3.00      ], 3     ],
            [[3, 2      ], 3     ],
            [[3, 0      ], 3     ],
            [[3.12, 0   ], 3     ],
            [[3.12, 1   ], 3.1   ],
            [[3.12, 2   ], 3.12  ],
            [[3.12, 3   ], 3.12  ],
            [[3.12, 0, 1], "3.0" ],
            [[3.12, 0, 2], "3.00"],
            [[3.12, 3, 1], "3.1" ],
            [[3.12, 3, 4], "3.1200"],
        ];

        map.forEach(([args, result]) => {
            it(
                "expect roundToPrecision(" +
                args.map(JSON.stringify).join(", ") +
                ") to produce " + JSON.stringify(result), () => {
                expect(lib.roundToPrecision(...args)).to.equal(result);
            });
        });

    });

    describe("readableFileSize", () => {
        const map = [
            [[0         ], "0 Bytes" ],
            [[0, { fixed: 2 }], "0.00 Bytes" ],
            [[100       ], "100 Bytes" ],
            [[1000       ], "1 kB" ],
            [[1001       ], "1 kB" ],
            [[1001, { useBinary: true }], "1001 Bytes" ],
            [[1024, { useBinary: true }], "1 KiB" ],
        ];

        map.forEach(([args, result]) => {
            it(
                "expect readableFileSize(" +
                args.map(JSON.stringify).join(", ") +
                ") to produce " + JSON.stringify(result), () => {
                expect(lib.readableFileSize(...args)).to.equal(result);
            });
        });
    });

    describe("intVal", () => {
        const map = [
            [[0         ],  0],
            [[1         ],  1],
            [[-1        ], -1],
            [[""        ],  0],
            [["5.3"     ],  5],
            [[false, 5  ],  5],
        ];

        map.forEach(([args, result]) => {
            it(
                "expect intVal(" +
                args.map(JSON.stringify).join(", ") +
                ") to produce " + JSON.stringify(result), () => {
                expect(lib.intVal(...args)).to.equal(result);
            });
        });
    });

    describe("floatVal", () => {
        const map = [
            [[0         ],  0  ],
            [[1         ],  1  ],
            [[-1.5      ], -1.5],
            [[""        ],  0  ],
            [["5.3"     ],  5.3],
            [[false, 5.2],  5.2],
        ];

        map.forEach(([args, result]) => {
            it(
                "expect floatVal(" +
                args.map(JSON.stringify).join(", ") +
                ") to produce " + JSON.stringify(result), () => {
                expect(lib.floatVal(...args)).to.equal(result);
            });
        });
    });

    describe("uInt", () => {
        const map = [
            [[0         ],  0],
            [[1         ],  1],
            [[-1.5      ],  0],
            [[""        ],  0],
            [["5.3"     ],  5],
            [[false, 5.2],  5],
        ];

        map.forEach(([args, result]) => {
            it(
                "expect uInt(" +
                args.map(JSON.stringify).join(", ") +
                ") to produce " + JSON.stringify(result), () => {
                expect(lib.uInt(...args)).to.equal(result);
            });
        });
    });

    describe("uFloat", () => {
        const map = [
            [[0         ],  0],
            [[1         ],  1],
            [[-1.5      ],  0],
            [[""        ],  0],
            [["5.3"     ],  5.3],
            [[false, 5.2],  5.2],
        ];

        map.forEach(([args, result]) => {
            it(
                "expect uFloat(" +
                args.map(JSON.stringify).join(", ") +
                ") to produce " + JSON.stringify(result), () => {
                expect(lib.uFloat(...args)).to.equal(result);
            });
        });
    });

    describe("isObject", () => {
        const map = [
            [[{}          ], true ],
            [[true        ], false],
            [[false       ], false],
            [[new Object()], true ],
            [[new Date()  ], true ],
            [[[]          ], true ],
            [[null        ], false],
        ];

        map.forEach(([args, result]) => {
            it(
                "expect isObject(" +
                args.map(JSON.stringify).join(", ") +
                ") to produce " + JSON.stringify(result), () => {
                expect(lib.isObject(...args)).to.equal(result);
            });
        });
    });

    describe("getPath", () => {
        const data = { a: 1, b: [ 1, 2, { c: "x" }], d: "3" };
        const map = [
            [["a"         ], data.a],
            [["b"         ], data.b],
            [["d"         ], data.d],
            [["b.0"       ], data.b[0]],
            [["b.1"       ], data.b[1]],
            [["b.2"       ], data.b[2]],
            [["b.3"       ], undefined],
            [["y.0"       ], undefined],
        ];

        map.forEach(([args, result]) => {
            it(
                "expect getPath(" +
                args.map(JSON.stringify).join(", ") +
                ") to produce " + JSON.stringify(result), () => {
                expect(lib.getPath(data, ...args)).to.equal(result);
            });
        });
    });

    describe("setPath", () => {
        it ("works with flat objects", () => {
            const target = { a: 1, b: 2 };
            lib.setPath(target, "b", 3);
            expect(target).to.equal({ a: 1, b: 3 });
        });

        it ("works with flat arrays", () => {
            const target = [ 1, 2 ];
            lib.setPath(target, 1, 3);
            expect(target).to.equal([ 1, 3 ]);
        });

        it ("works with nested objects", () => {
            const target = { a: 1, b: { c: 2 } };
            lib.setPath(target, "b.c", 3);
            expect(target).to.equal({ a: 1, b: { c: 3 }});
        });

        it ("works with nested arrays", () => {
            const target = [ 1, [ 2 ] ];
            lib.setPath(target, "1.0", 3);
            expect(target).to.equal([ 1, [ 3 ] ]);
        });

        it ("works with mixed objects", () => {
            const target = [ 1, [ 2, { a: { b: [3, 3, 3]}} ] ];
            lib.setPath(target, "1.1.a.b.2", 4);
            expect(target).to.equal([ 1, [ 2, { a: { b: [3, 3, 4]}} ] ]);
        });

        it ("creates intermediate paths", () => {
            const target = { a: 1, s: [3, [4 ]] };
            lib.setPath(target, "b.c.d", 2);
            expect(target).to.equal({ a: 1, b: { c: { d: 2 }}, s: [3, [4]]});
            lib.setPath(target, "s.1.2", "x");
            expect(target).to.equal({ a: 1, b: { c: { d: 2 }}, s: [3, [4, undefined, "x"]]});
            lib.setPath(target, "x.0.1", "--");
            expect(target.x).to.equal([[undefined, "--"]]);
        });

        it ("prevents incorrect mutations", () => {
            expect(() => lib.setPath({a: { b: 5       }}, "a.b", { x: "y" })).to.throw();
            expect(() => lib.setPath({a: { b: 5       }}, "a.b", [ "y" ]   )).to.throw();
            expect(() => lib.setPath({a: { b: [5]     }}, "a.b", { x: "y" })).to.throw();
            expect(() => lib.setPath({a: { b: { a: 5 }}}, "a.b", [ "y"]    )).to.throw();
            expect(() => lib.setPath({a: { b: { a: 5 }}}, "a.b", 5         )).to.throw();
        });
    });

    describe("strPad", () => {
        it ("typical usage", () => {
            expect(lib.strPad("x", 3)).to.equal("x  ");
        });

        it ("edge cases", () => {
            expect(lib.strPad(" x "  , 4)).to.equal(" x  " );
            expect(lib.strPad("x  "  , 4)).to.equal("x   " );
            expect(lib.strPad("x    ", 4)).to.equal("x    ");
            expect(lib.strPad("x    ", 0)).to.equal("x    ");
            expect(lib.strPad("x   ", -2)).to.equal("x   " );
        });
    });
});
