const Lab        = require("lab");
const { expect } = require("code");
const csv        = require("../csv");

const lab = exports.lab = Lab.script();
const { describe, it, beforeEach, afterEach } = lab;


describe("csv.js", () => {
    // console.log(csv.parseDelimitedLine('"a""b""c"'))
    // return;

    describe("mergeStrict", () => {
        it ("throws on incompatible objects", () => {

            // don't override scalar with object
            expect(() => csv.mergeStrict(
                { a: 1, b: 2, c: 3        },
                { a: 1, b: 2, c: { d: 5 } }
            ), "Override scalar value with object").to.throw();

            // don't override object with scalar
            expect(() => csv.mergeStrict(
                { a: 1, b: 2, c: { d: 5 } },
                { a: 1, b: 2, c: 3        }
            ), "Override object with scalar value").to.throw();
            
            // don't override scalar with array
            expect(() => csv.mergeStrict(
                { a: 1, b: 2, c: 3     },
                { a: 1, b: 2, c: [ 5 ] }
            ), "Override scalar value with array").to.throw();

            // don't override array with scalar
            expect(() => csv.mergeStrict(
                { a: 1, b: 2, c: [ 5 ] },
                { a: 1, b: 2, c: 3     }
            ), "Override array with scalar value").to.throw();

            // don't override array with object
            expect(() => csv.mergeStrict(
                { a: 1, b: 2, c: [ 5 ]    },
                { a: 1, b: 2, c: { d: 5 } }
            ), "Override array with object").to.throw();

            // don't override object with array
            expect(() => csv.mergeStrict(
                { a: 1, b: 2, c: { d: 5 } },
                { a: 1, b: 2, c: [ 5 ]    }
            ), "Override object with array").to.throw();
        });
    })

    describe("csvHeaderFromJson", () => {
        it ("from flat object", () => {
            expect(
                csv.flatObjectKeys(csv.csvHeaderFromJson({ a: 1, b: 2 }))
            ).to.equal(["a", "b"]);
        });

        it ("from flat array", () => {
            expect(
                csv.flatObjectKeys(csv.csvHeaderFromJson([ 1, 2 ]))
            ).to.equal(["0", "1"]);
        });

        it ("from nested object", () => {
            expect(
                csv.flatObjectKeys(csv.csvHeaderFromJson({
                    a: 1,
                    b: { b1: 2.1, b2: 2.2 },
                    c: 3
                }))
            ).to.equal(["a", "b.b1", "b.b2", "c"]);
        });

        it ("from nested array", () => {
            expect(
                csv.flatObjectKeys(csv.csvHeaderFromJson([
                    1,
                    [1, 2, 3],
                    3
                ]))
            ).to.equal(["0", "1.0", "1.1", "1.2", "2"]);
        });
    });

    describe("csvHeaderFromArray", () => {

        it ("from similar objects", () => {
            expect(csv.csvHeaderFromArray([
                { a: 1, b: 2 },
                { a: 1, b: 2 }
            ])).to.equal(["a", "b"]);
        });

        it ("from similar objects fast", () => {
            expect(csv.csvHeaderFromArray([
                { a: 1, b: 2 },
                { a: 1, b: 2 }
            ], { fast: true })).to.equal(["a", "b"]);
        });

        it ("from different objects", () => {
            expect(csv.csvHeaderFromArray([
                { a: 1, b: 2              },
                { a: 1, b: 2, c: { d: 5 } },
                {       b: 2              }
            ])).to.equal(["a", "b", "c.d"]);
        });

        it ("from different objects fast", () => {
            expect(csv.csvHeaderFromArray([
                { a: 1, b: 2 },
                { a: 1, b: 2, c: { d: 5 } }
            ], { fast: true })).to.equal(["a", "b"]);
        });

        it ("from similar arrays", () => {
            expect(csv.csvHeaderFromArray([
                [ 1, 2 ],
                [ 1, 2 ]
            ])).to.equal(["0", "1"]);
        });

        it ("from similar arrays fast", () => {
            expect(csv.csvHeaderFromArray([
                [ 1, 2 ],
                [ 1, 2 ]
            ], { fast: true })).to.equal(["0", "1"]);
        });

        it ("from different arrays", () => {
            expect(csv.csvHeaderFromArray([
                [ 1, 2 ],
                [ 1, 2, 3 ],
                [ 5 ]
            ])).to.equal(["0", "1", "2"]);
        });

        it ("from different arrays fast", () => {
            expect(csv.csvHeaderFromArray([
                [ 1, 2 ],
                [ 1, 2, 3 ],
                [ 5 ]
            ], { fast: true })).to.equal(["0", "1"]);
        });

        it ("throws on incompatible rows", () => {
            expect(() => csv.csvHeaderFromArray([
                { a: 1, b: 2, c: 3        },
                { a: 1, b: 2, c: { d: 5 } }
            ])).to.throw();
            
            expect(() => csv.csvHeaderFromArray([
                { a: 1, b: 2, c: 3     },
                { a: 1, b: 2, c: [ 5 ] }
            ])).to.throw();
        });
    });

    describe("jsonToCsv", () => {
        it ("escapes values", () => {
            expect(csv.jsonToCsv({'a-"1"': 5})).to.equal('"a-""1"""\r\n5');
            expect(csv.jsonToCsv({a: 'x"y"z'})).to.equal('a\r\n"x""y""z"');
            expect(csv.jsonToCsv({a: 'x,y,z'})).to.equal('a\r\n"x,y,z"');
            expect(csv.jsonToCsv({a: 'x\r\nyz'})).to.equal('a\r\n"x\r\nyz"');
            expect(csv.jsonToCsv({a: 'x\nyz'})).to.equal('a\r\n"x\nyz"');
            expect(csv.jsonToCsv({a: 'x\ryz'})).to.equal('a\r\n"x\ryz"');
        });
        it ("from flat object", () => {
            expect(csv.jsonToCsv({ a:1, b:2, c:3 })).to.equal(
                'a,b,c\r\n1,2,3'
            );
        });
        it ("from flat array", () => {
            expect(csv.jsonToCsv([ "a", "b", "c" ])).to.equal(
                '0,1,2\r\na,b,c'
            );
        });
        it ("from nested object", () => {
            expect(csv.jsonToCsv({ a:1, b:{ b1:2 }, c:3 })).to.equal(
                'a,b.b1,c\r\n1,2,3'
            );
        });
        it ("from nested array", () => {
            expect(csv.jsonToCsv([ "a", [ "b" ], "c" ])).to.equal(
                '0,1.0,2\r\na,b,c'
            );
        });
        it ("from mixed object", () => {
            expect(csv.jsonToCsv([ "a", [ { a: "b" }, 5 ], "c" ])).to.equal(
                '0,1.0.a,1.1,2\r\na,b,5,c'
            );
        });
    });

    describe("jsonToTsv", () => {
        it ("from flat object", () => {
            expect(csv.jsonToTsv({ a:1, b:2, c:3 })).to.equal(
                'a\tb\tc\r\n1\t2\t3'
            );
        });
        it ("from flat array", () => {
            expect(csv.jsonToTsv([ "a", "b", "c" ])).to.equal(
                '0\t1\t2\r\na\tb\tc'
            );
        });
        it ("from nested object", () => {
            expect(csv.jsonToTsv({ a:1, b:{ b1:2 }, c:3 })).to.equal(
                'a\tb.b1\tc\r\n1\t2\t3'
            );
        });
        it ("from nested array", () => {
            expect(csv.jsonToTsv([ "a", [ "b" ], "c" ])).to.equal(
                '0\t1.0\t2\r\na\tb\tc'
            );
        });
        it ("from mixed object", () => {
            expect(csv.jsonToTsv([ "a", [ { a: "b" }, 5 ], "c" ])).to.equal(
                '0\t1.0.a\t1.1\t2\r\na\tb\t5\tc'
            );
        });
    });
    
    describe("jsonArrayToCsv", () => {
        it ("from flat objects", () => {
            expect(csv.jsonArrayToCsv([
                { a:1, b:2, c:3 },
                { a:2, b:3, c:4 }
            ])).to.equal(
                'a,b,c\r\n1,2,3\r\n2,3,4'
            );
        });
        it ("from flat arrays", () => {
            expect(csv.jsonArrayToCsv([
                [1, 2, 3],
                [2, 3, 4]
            ])).to.equal(
                '0,1,2\r\n1,2,3\r\n2,3,4'
            );
        });
        it ("from nested objects", () => {
            expect(csv.jsonArrayToCsv([
                { a:1, b:2, c:3 },
                { a:2, b:3, c:4, d: { e: 6 } }
            ])).to.equal(
                'a,b,c,d.e\r\n1,2,3,\r\n2,3,4,6'
            );
        });
        it ("from nested arrays", () => {
            expect(csv.jsonArrayToCsv([
                [1, 2, 3],
                [2, 3, 4, [3,3,3]],
                [3, 4, 5],
            ])).to.equal(
                '0,1,2,3.0,3.1,3.2\r\n' +
                '1,2,3,,,\r\n' +
                '2,3,4,3,3,3\r\n' +
                '3,4,5,,,'
            );
        });
        it ("from mixed object", () => {
            expect(csv.jsonArrayToCsv([
                [1, 2, 3],
                [2, 3, 4, [3,{ a: 5 },3]],
                [3, 4, 5],
            ])).to.equal(
                '0,1,2,3.0,3.1.a,3.2\r\n' +
                '1,2,3,,,\r\n' +
                '2,3,4,3,5,3\r\n' +
                '3,4,5,,,'
            );
        });
    });

    describe("jsonArrayToTsv", () => {
        it ("from flat objects", () => {
            expect(csv.jsonArrayToTsv([
                { a:1, b:2, c:3 },
                { a:2, b:3, c:4 }
            ])).to.equal(
                'a\tb\tc\r\n1\t2\t3\r\n2\t3\t4'
            );
        });
        it ("from flat arrays", () => {
            expect(csv.jsonArrayToTsv([
                [1, 2, 3],
                [2, 3, 4]
            ])).to.equal(
                '0\t1\t2\r\n1\t2\t3\r\n2\t3\t4'
            );
        });
        it ("from nested objects", () => {
            expect(csv.jsonArrayToTsv([
                { a:1, b:2, c:3 },
                { a:2, b:3, c:4, d: { e: 6 } }
            ])).to.equal(
                'a\tb\tc\td.e\r\n1\t2\t3\t\r\n2\t3\t4\t6'
            );
        });
        it ("from nested arrays", () => {
            expect(csv.jsonArrayToTsv([
                [1, 2, 3],
                [2, 3, 4, [3,3,3]],
                [3, 4, 5],
            ])).to.equal(
                '0\t1\t2\t3.0\t3.1\t3.2\r\n' +
                '1\t2\t3\t\t\t\r\n' +
                '2\t3\t4\t3\t3\t3\r\n' +
                '3\t4\t5\t\t\t'
            );
        });
        it ("from mixed object", () => {
            expect(csv.jsonArrayToTsv([
                [1, 2, 3],
                [2, 3, 4, [3,{ a: 5 },3]],
                [3, 4, 5],
            ])).to.equal(
                '0\t1\t2\t3.0\t3.1.a\t3.2\r\n' +
                '1\t2\t3\t\t\t\r\n' +
                '2\t3\t4\t3\t5\t3\r\n' +
                '3\t4\t5\t\t\t'
            );
        });
    });

    describe("parseDelimitedLine", () => {
        expect(csv.parseDelimitedLine("a,b,c", ",")).to.equal(["a", "b", "c"]);
        expect(csv.parseDelimitedLine("a;b;c", ";")).to.equal(["a", "b", "c"]);
        expect(csv.parseDelimitedLine('"a,b",c', ",")).to.equal(["a,b", "c"]);
        expect(csv.parseDelimitedLine('"a""b""c"')).to.equal(['a"b"c']);        
    });
});