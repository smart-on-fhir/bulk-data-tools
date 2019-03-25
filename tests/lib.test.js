const Lab        = require("lab");
const { expect } = require("code");
const lib        = require("../lib");

const lab = exports.lab = Lab.script();
const { describe, it, beforeEach, afterEach } = lab;


describe("csv.js", () => {

    describe("setPath", () => {
        it ("works with flat objects", () => {
            const target = { a:1, b:2 };
            lib.setPath(target, "b", 3);
            expect(target).to.equal({ a:1, b:3 })
        });

        it ("works with flat arrays", () => {
            const target = [ 1, 2 ];
            lib.setPath(target, 1, 3);
            expect(target).to.equal([ 1, 3 ])
        });

        it ("works with nested objects", () => {
            const target = { a: 1, b: { c: 2 } };
            lib.setPath(target, "b.c", 3);
            expect(target).to.equal({ a:1, b: { c: 3 }})
        });

        it ("works with nested arrays", () => {
            const target = [ 1, [ 2 ] ];
            lib.setPath(target, "1.0", 3);
            expect(target).to.equal([ 1, [ 3 ] ])
        });

        it ("works with mixed objects", () => {
            const target = [ 1, [ 2, { a: { b: [3,3,3]}} ] ];
            lib.setPath(target, "1.1.a.b.2", 4);
            expect(target).to.equal([ 1, [ 2, { a: { b: [3,3,4]}} ] ])
        });

        it ("creates intermediate paths", () => {
            const target = { a:1, s: [3, [4 ]] };
            lib.setPath(target, "b.c.d", 2);
            expect(target).to.equal({ a:1, b: { c: { d: 2 }}, s: [3, [4]]});
            lib.setPath(target, "s.1.2", "x");
            expect(target).to.equal({ a:1, b: { c: { d: 2 }}, s: [3, [4, undefined, "x"]]});
            lib.setPath(target, "x.0.1", "--");
            expect(target.x).to.equal([[undefined, "--"]]);
        });

        it ("prevents incorrect mutations", () => {
            expect(() => lib.setPath({a:{b:5    }}, "a.b", { x: "y"})).to.throw();
            expect(() => lib.setPath({a:{b:5    }}, "a.b", ["y"]    )).to.throw();
            expect(() => lib.setPath({a:{b:[5]  }}, "a.b", {x: "y"} )).to.throw();
            expect(() => lib.setPath({a:{b:{a:5}}}, "a.b", ["y"]    )).to.throw();
            expect(() => lib.setPath({a:{b:{a:5}}}, "a.b", 5        )).to.throw();
        });
    });

});