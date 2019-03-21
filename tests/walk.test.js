const Lab        = require("lab");
const { expect } = require("code");

const lab = exports.lab = Lab.script();
const { describe, it, beforeEach, afterEach } = lab;


describe("walk.js", () => {

    describe("forEachFile", () => {
        it ("requires 'callback' argument");
        it ("rejects invalid 'dir' option");
        it ("rejects invalid 'filter' option");
        it ("can follow links");
        it ("calls the callback for each matched file");
    });

});