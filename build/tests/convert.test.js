"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const Lab = require("lab");
const code_1 = require("code");
const Delimited_1 = require("../src/Delimited");
const NDJSON_1 = require("../src/NDJSON");
exports.lab = Lab.script();
const { describe, it } = exports.lab;
describe("Conversions", () => {
    describe("CSV to *", () => {
        // Form CSV string to *
        // ---------------------------------------------------------------------
        it("CSV string to TSV string", () => {
            const csv = Delimited_1.default.fromString("a,b\r\n1,2\r\n3,4", { delimiter: "," });
            const tsv = csv.toString({ delimiter: "\t" });
            code_1.expect(tsv).to.equal("a\tb\r\n1\t2\r\n3\t4");
        });
        it("CSV string to JSON string", () => {
            const csv = Delimited_1.default.fromString("a,b\r\n1,2\r\n3,4", { delimiter: "," });
            const json = JSON.stringify(csv);
            code_1.expect(json).to.equal('[{"a":"1","b":"2"},{"a":"3","b":"4"}]');
        });
        it("CSV string to Array", () => {
            const csv = Delimited_1.default.fromString("a,b\r\n1,2\r\n3,4", { delimiter: "," });
            const arr = csv.toArray();
            code_1.expect(arr).to.equal([{ "a": "1", "b": "2" }, { "a": "3", "b": "4" }]);
        });
        it("CSV string to string Array", () => {
            const csv = Delimited_1.default.fromString("a,b\r\n1,2\r\n3,4", { delimiter: "," });
            const arr = csv.toStringArray();
            code_1.expect(arr).to.equal(["a,b", "1,2", "3,4"]);
        });
        it("CSV string to NDJSON", () => {
            const csv = Delimited_1.default.fromString("a,b\r\n1,2\r\n3,4", { delimiter: "," });
            const out = csv.toNDJSON();
            code_1.expect(out).to.equal('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
        });
        it("CSV string to file", () => {
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            const csv = Delimited_1.default.fromString("a,b\r\n1,2\r\n3,4", { delimiter: "," });
            try {
                csv.toFile(filePath);
                code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal("a,b\r\n1,2\r\n3,4");
            }
            catch (ex) {
                throw ex;
            }
            finally {
                fs_1.unlinkSync(filePath);
            }
        });
        // From CSV file to *
        // ---------------------------------------------------------------------
        it("CSV file to TSV string", () => {
            const csv = Delimited_1.default.fromFile(__dirname + "/mocks/multi-csv/sample.1.csv", { delimiter: "," });
            const tsv = csv.toString({ delimiter: "\t" });
            code_1.expect(tsv).to.equal("a\tb\tc\r\n1\t2\t3\r\n4\t5\t6");
        });
        it("CSV file to JSON string", () => {
            const csv = Delimited_1.default.fromFile(__dirname + "/mocks/multi-csv/sample.1.csv", { delimiter: "," });
            const json = JSON.stringify(csv);
            code_1.expect(json).to.equal('[{"a":"1","b":"2","c":"3"},{"a":"4","b":"5","c":"6"}]');
        });
        it("CSV file to Array", () => {
            const csv = Delimited_1.default.fromFile(__dirname + "/mocks/multi-csv/sample.1.csv", { delimiter: "," });
            const arr = csv.toArray();
            code_1.expect(arr).to.equal([{ "a": "1", "b": "2", "c": "3" }, { "a": "4", "b": "5", "c": "6" }]);
        });
        it("CSV file to string Array", () => {
            const csv = Delimited_1.default.fromFile(__dirname + "/mocks/multi-csv/sample.1.csv", { delimiter: "," });
            const arr = csv.toStringArray();
            code_1.expect(arr).to.equal(["a,b,c", "1,2,3", "4,5,6"]);
        });
        it("CSV file to NDJSON", () => {
            const csv = Delimited_1.default.fromFile(__dirname + "/mocks/multi-csv/sample.1.csv", { delimiter: "," });
            const out = csv.toNDJSON();
            code_1.expect(out).to.equal('{"a":"1","b":"2","c":"3"}\r\n{"a":"4","b":"5","c":"6"}');
        });
        it("CSV file to file", () => {
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            const csv = Delimited_1.default.fromFile(__dirname + "/mocks/multi-csv/sample.1.csv", { delimiter: "," });
            try {
                csv.toFile(filePath);
                code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal("a,b,c\r\n1,2,3\r\n4,5,6");
            }
            catch (ex) {
                throw ex;
            }
            finally {
                fs_1.unlinkSync(filePath);
            }
        });
        // From CSV directory to *
        // ---------------------------------------------------------------------
        it("CSV directory to TSV string", () => {
            const csv = Delimited_1.default.fromDirectory(__dirname + "/mocks/multi-csv", { delimiter: "," });
            const tsv = csv.toString({ delimiter: "\t" });
            code_1.expect(tsv).to.equal("a\tb\tc\r\n1\t2\t3\r\n4\t5\t6\r\n10\t20\t30\r\n40\t50\t60");
        });
        it("CSV directory to JSON string", () => {
            const csv = Delimited_1.default.fromDirectory(__dirname + "/mocks/multi-csv", { delimiter: "," });
            const json = JSON.stringify(csv);
            code_1.expect(json).to.equal('[{"a":"1","b":"2","c":"3"},{"a":"4","b":"5","c":"6"},' +
                '{"a":"10","b":"20","c":"30"},{"a":"40","b":"50","c":"60"}]');
        });
        it("CSV directory to Array", () => {
            const csv = Delimited_1.default.fromDirectory(__dirname + "/mocks/multi-csv", { delimiter: "," });
            const arr = csv.toArray();
            code_1.expect(arr).to.equal([
                { "a": "1", "b": "2", "c": "3" },
                { "a": "4", "b": "5", "c": "6" },
                { "a": "10", "b": "20", "c": "30" },
                { "a": "40", "b": "50", "c": "60" }
            ]);
        });
        it("CSV directory to string Array", () => {
            const csv = Delimited_1.default.fromDirectory(__dirname + "/mocks/multi-csv", { delimiter: "," });
            const arr = csv.toStringArray();
            code_1.expect(arr).to.equal(["a,b,c", "1,2,3", "4,5,6", "10,20,30", "40,50,60"]);
        });
        it("CSV directory to NDJSON", () => {
            const csv = Delimited_1.default.fromDirectory(__dirname + "/mocks/multi-csv", { delimiter: "," });
            const out = csv.toNDJSON();
            code_1.expect(out).to.equal('{"a":"1","b":"2","c":"3"}\r\n{"a":"4","b":"5","c":"6"}\r\n' +
                '{"a":"10","b":"20","c":"30"}\r\n{"a":"40","b":"50","c":"60"}');
        });
        it("CSV directory to file", () => {
            const csv = Delimited_1.default.fromDirectory(__dirname + "/mocks/multi-csv", { delimiter: "," });
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                csv.toFile(filePath);
                code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal("a,b,c\r\n1,2,3\r\n4,5,6\r\n10,20,30\r\n40,50,60");
            }
            catch (ex) {
                throw ex;
            }
            finally {
                fs_1.unlinkSync(filePath);
            }
        });
        // From CSV array to *
        // ---------------------------------------------------------------------
        it("CSV array to TSV string", () => {
            const csv = Delimited_1.default.fromStringArray(["a,b", "1,2", "3,4"], { delimiter: "," });
            const tsv = csv.toString({ delimiter: "\t" });
            code_1.expect(tsv).to.equal("a\tb\r\n1\t2\r\n3\t4");
        });
        it("CSV array to JSON string", () => {
            const csv = Delimited_1.default.fromStringArray(["a,b", "1,2", "3,4"], { delimiter: "," });
            const json = JSON.stringify(csv);
            code_1.expect(json).to.equal('[{"a":"1","b":"2"},{"a":"3","b":"4"}]');
        });
        it("CSV array to Array", () => {
            const csv = Delimited_1.default.fromStringArray(["a,b", "1,2", "3,4"], { delimiter: "," });
            const arr = csv.toArray();
            code_1.expect(arr).to.equal([{ "a": "1", "b": "2" }, { "a": "3", "b": "4" }]);
        });
        it("CSV array to string Array", () => {
            const csv = Delimited_1.default.fromStringArray(["a,b", "1,2", "3,4"], { delimiter: "," });
            const arr = csv.toStringArray();
            code_1.expect(arr).to.equal(["a,b", "1,2", "3,4"]);
        });
        it("CSV array to NDJSON", () => {
            const csv = Delimited_1.default.fromStringArray(["a,b", "1,2", "3,4"], { delimiter: "," });
            const out = csv.toNDJSON();
            code_1.expect(out).to.equal('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
        });
        it("CSV array to file", () => {
            const csv = Delimited_1.default.fromStringArray(["a,b", "1,2", "3,4"], { delimiter: "," });
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                csv.toFile(filePath);
                code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal("a,b\r\n1,2\r\n3,4");
            }
            catch (ex) {
                throw ex;
            }
            finally {
                fs_1.unlinkSync(filePath);
            }
        });
    });
    describe("TSV to *", () => {
        // TSV string to *
        // ---------------------------------------------------------------------
        it("TSV string to CSV string", () => {
            const tsv = Delimited_1.default.fromString("a\tb\r\n1\t2\r\n3\t4", { delimiter: "\t" });
            const csv = tsv.toString({ delimiter: "," });
            code_1.expect(csv).to.equal("a,b\r\n1,2\r\n3,4");
        });
        it("TSV string to JSON string", () => {
            const tsv = Delimited_1.default.fromString("a\tb\r\n1\t2\r\n3\t4", { delimiter: "\t" });
            const json = JSON.stringify(tsv);
            code_1.expect(json).to.equal('[{"a":"1","b":"2"},{"a":"3","b":"4"}]');
        });
        it("TSV string to Array", () => {
            const tsv = Delimited_1.default.fromString("a\tb\r\n1\t2\r\n3\t4", { delimiter: "\t" });
            const arr = tsv.toArray();
            code_1.expect(arr).to.equal([{ "a": "1", "b": "2" }, { "a": "3", "b": "4" }]);
        });
        it("TSV string to string Array", () => {
            const tsv = Delimited_1.default.fromString("a\tb\r\n1\t2\r\n3\t4", { delimiter: "\t" });
            const arr = tsv.toStringArray({ delimiter: "\t" });
            code_1.expect(arr).to.equal(["a\tb", "1\t2", "3\t4"]);
        });
        it("TSV string to NDJSON", () => {
            const tsv = Delimited_1.default.fromString("a\tb\r\n1\t2\r\n3\t4", { delimiter: "\t" });
            const out = tsv.toNDJSON();
            code_1.expect(out).to.equal('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
        });
        it("TSV string to file", () => {
            const csv = Delimited_1.default.fromString("a\tb\n1\t2\r\n3\t4", { delimiter: "\t" });
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                csv.toFile(filePath, { delimiter: "\t" });
                code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal("a\tb\r\n1\t2\r\n3\t4");
            }
            catch (ex) {
                throw ex;
            }
            finally {
                fs_1.unlinkSync(filePath);
            }
        });
        // From TSV file to *
        // ---------------------------------------------------------------------
        it("TSV file to CSV string", () => {
            const tsv = Delimited_1.default.fromFile(__dirname + "/mocks/multi-tsv/sample.1.tsv", { delimiter: "\t" });
            const csv = tsv.toString({ delimiter: "," });
            code_1.expect(csv).to.equal("a,b,c\r\n1,2,3\r\n4,5,6");
        });
        it("TSV file to JSON string", () => {
            const tsv = Delimited_1.default.fromFile(__dirname + "/mocks/multi-tsv/sample.1.tsv", { delimiter: "\t" });
            const json = JSON.stringify(tsv);
            code_1.expect(json).to.equal('[{"a":"1","b":"2","c":"3"},{"a":"4","b":"5","c":"6"}]');
        });
        it("TSV file to Array", () => {
            const tsv = Delimited_1.default.fromFile(__dirname + "/mocks/multi-tsv/sample.1.tsv", { delimiter: "\t" });
            const arr = tsv.toArray();
            code_1.expect(arr).to.equal([{ "a": "1", "b": "2", "c": "3" }, { "a": "4", "b": "5", "c": "6" }]);
        });
        it("TSV file to string Array", () => {
            const tsv = Delimited_1.default.fromFile(__dirname + "/mocks/multi-tsv/sample.1.tsv", { delimiter: "\t" });
            const arr = tsv.toStringArray({ delimiter: "\t" });
            code_1.expect(arr).to.equal(["a\tb\tc", "1\t2\t3", "4\t5\t6"]);
        });
        it("TSV file to NDJSON", () => {
            const tsv = Delimited_1.default.fromFile(__dirname + "/mocks/multi-tsv/sample.1.tsv", { delimiter: "\t" });
            const out = tsv.toNDJSON();
            code_1.expect(out).to.equal('{"a":"1","b":"2","c":"3"}\r\n{"a":"4","b":"5","c":"6"}');
        });
        it("TSV file to file", () => {
            const tsv = Delimited_1.default.fromFile(__dirname + "/mocks/multi-tsv/sample.1.tsv", { delimiter: "\t" });
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                tsv.toFile(filePath, { delimiter: "\t" });
                code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal("a\tb\tc\r\n1\t2\t3\r\n4\t5\t6");
            }
            catch (ex) {
                throw ex;
            }
            finally {
                fs_1.unlinkSync(filePath);
            }
        });
        // From TSV directory to *
        // ---------------------------------------------------------------------
        it("TSV directory to TSV string", () => {
            const tsv = Delimited_1.default.fromDirectory(__dirname + "/mocks/multi-tsv", { delimiter: "\t", extension: "tsv" });
            const str = tsv.toString({ delimiter: "\t" });
            code_1.expect(str).to.equal("a\tb\tc\r\n1\t2\t3\r\n4\t5\t6\r\n10\t20\t30\r\n40\t50\t60");
        });
        it("TSV directory to JSON string", () => {
            const tsv = Delimited_1.default.fromDirectory(__dirname + "/mocks/multi-tsv", { delimiter: "\t", extension: "tsv" });
            const json = JSON.stringify(tsv);
            code_1.expect(json).to.equal('[{"a":"1","b":"2","c":"3"},{"a":"4","b":"5","c":"6"},' +
                '{"a":"10","b":"20","c":"30"},{"a":"40","b":"50","c":"60"}]');
        });
        it("TSV directory to Array", () => {
            const tsv = Delimited_1.default.fromDirectory(__dirname + "/mocks/multi-tsv", { delimiter: "\t", extension: "tsv" });
            const arr = tsv.toArray();
            code_1.expect(arr).to.equal([
                { "a": "1", "b": "2", "c": "3" },
                { "a": "4", "b": "5", "c": "6" },
                { "a": "10", "b": "20", "c": "30" },
                { "a": "40", "b": "50", "c": "60" }
            ]);
        });
        it("TSV directory to string Array", () => {
            const tsv = Delimited_1.default.fromDirectory(__dirname + "/mocks/multi-tsv", { delimiter: "\t", extension: "tsv" });
            const arr = tsv.toStringArray();
            code_1.expect(arr).to.equal(["a,b,c", "1,2,3", "4,5,6", "10,20,30", "40,50,60"]);
        });
        it("TSV directory to NDJSON", () => {
            const tsv = Delimited_1.default.fromDirectory(__dirname + "/mocks/multi-tsv", { delimiter: "\t", extension: "tsv" });
            const out = tsv.toNDJSON();
            code_1.expect(out).to.equal('{"a":"1","b":"2","c":"3"}\r\n{"a":"4","b":"5","c":"6"}\r\n' +
                '{"a":"10","b":"20","c":"30"}\r\n{"a":"40","b":"50","c":"60"}');
        });
        it("TSV directory to file", () => {
            const tsv = Delimited_1.default.fromDirectory(__dirname + "/mocks/multi-tsv", { delimiter: "\t", extension: "tsv" });
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                tsv.toFile(filePath, { delimiter: "\t" });
                code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal("a\tb\tc\r\n1\t2\t3\r\n4\t5\t6\r\n10\t20\t30\r\n40\t50\t60");
            }
            catch (ex) {
                throw ex;
            }
            finally {
                fs_1.unlinkSync(filePath);
            }
        });
        // From TSV array to *
        // ---------------------------------------------------------------------
        it("TSV array to TSV string", () => {
            const tsv = Delimited_1.default.fromStringArray(["a\tb", "1\t2", "3\t4"], { delimiter: "\t" });
            const str = tsv.toString({ delimiter: "\t" });
            code_1.expect(str).to.equal("a\tb\r\n1\t2\r\n3\t4");
        });
        it("TSV array to CSV string", () => {
            const tsv = Delimited_1.default.fromStringArray(["a\tb", "1\t2", "3\t4"], { delimiter: "\t" });
            const str = tsv.toString({ delimiter: "," });
            code_1.expect(str).to.equal("a,b\r\n1,2\r\n3,4");
        });
        it("TSV array to JSON string", () => {
            const tsv = Delimited_1.default.fromStringArray(["a\tb", "1\t2", "3\t4"], { delimiter: "\t" });
            const json = JSON.stringify(tsv);
            code_1.expect(json).to.equal('[{"a":"1","b":"2"},{"a":"3","b":"4"}]');
        });
        it("TSV array to Array", () => {
            const tsv = Delimited_1.default.fromStringArray(["a\tb", "1\t2", "3\t4"], { delimiter: "\t" });
            const arr = tsv.toArray();
            code_1.expect(arr).to.equal([{ "a": "1", "b": "2" }, { "a": "3", "b": "4" }]);
        });
        it("TSV array to string Array", () => {
            const tsv = Delimited_1.default.fromStringArray(["a\tb", "1\t2", "3\t4"], { delimiter: "\t" });
            const arr = tsv.toStringArray({ delimiter: "\t" });
            code_1.expect(arr).to.equal(["a\tb", "1\t2", "3\t4"]);
        });
        it("TSV array to NDJSON", () => {
            const tsv = Delimited_1.default.fromStringArray(["a\tb", "1\t2", "3\t4"], { delimiter: "\t" });
            const out = tsv.toNDJSON();
            code_1.expect(out).to.equal('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
        });
        it("TSV array to file", () => {
            const csv = Delimited_1.default.fromStringArray(["a\tb", "1\t2", "3\t4"], { delimiter: "\t" });
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                csv.toFile(filePath, { delimiter: "\t" });
                code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal("a\tb\r\n1\t2\r\n3\t4");
            }
            catch (ex) {
                throw ex;
            }
            finally {
                fs_1.unlinkSync(filePath);
            }
        });
    });
    describe("NDJSON to *", () => {
        // NDJSON string to *
        // ---------------------------------------------------------------------
        it("NDJSON string to CSV string", () => {
            const ndjson = NDJSON_1.default.fromString('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
            const csv = Delimited_1.default.fromArray(ndjson.toArray());
            const str = csv.toString({ delimiter: "," });
            code_1.expect(str).to.equal("a,b\r\n1,2\r\n3,4");
        });
        it("NDJSON string to JSON string", () => {
            const ndjson = NDJSON_1.default.fromString('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
            const json = JSON.stringify(ndjson);
            code_1.expect(json).to.equal('[{"a":"1","b":"2"},{"a":"3","b":"4"}]');
        });
        it("NDJSON string to Array", () => {
            const ndjson = NDJSON_1.default.fromString('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
            const arr = ndjson.toArray();
            code_1.expect(arr).to.equal([{ "a": "1", "b": "2" }, { "a": "3", "b": "4" }]);
        });
        it("NDJSON string to string Array", () => {
            const ndjson = NDJSON_1.default.fromString('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
            const arr = ndjson.toStringArray();
            code_1.expect(arr).to.equal(['{"a":"1","b":"2"}', '{"a":"3","b":"4"}']);
        });
        it("NDJSON string to NDJSON string", () => {
            const ndjson = NDJSON_1.default.fromString('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
            const out = ndjson.toString();
            code_1.expect(out).to.equal('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
        });
        it("NDJSON string to file", () => {
            const ndjson = NDJSON_1.default.fromString('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                ndjson.toFile(filePath);
                code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
            }
            catch (ex) {
                throw ex;
            }
            finally {
                fs_1.unlinkSync(filePath);
            }
        });
        // From NDJSON file to *
        // ---------------------------------------------------------------------
        it("NDJSON file to CSV string", () => {
            const ndjson = NDJSON_1.default.fromFile(__dirname + "/mocks/multi-ndjson/sample.1.ndjson");
            const csv = Delimited_1.default.fromArray(ndjson.toArray());
            const str = csv.toString({ delimiter: "," });
            code_1.expect(str).to.equal("a,b,c\r\n1,2,3\r\n4,5,6");
        });
        it("NDJSON file to JSON string", () => {
            const ndjson = NDJSON_1.default.fromFile(__dirname + "/mocks/multi-ndjson/sample.1.ndjson");
            const json = JSON.stringify(ndjson);
            code_1.expect(json).to.equal('[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6}]');
        });
        it("NDJSON file to Array", () => {
            const ndjson = NDJSON_1.default.fromFile(__dirname + "/mocks/multi-ndjson/sample.1.ndjson");
            const arr = ndjson.toArray();
            code_1.expect(arr).to.equal([{ "a": 1, "b": 2, "c": 3 }, { "a": 4, "b": 5, "c": 6 }]);
        });
        it("NDJSON file to string Array", () => {
            const ndjson = NDJSON_1.default.fromFile(__dirname + "/mocks/multi-ndjson/sample.1.ndjson");
            const arr = ndjson.toStringArray();
            code_1.expect(arr).to.equal(['{"a":1,"b":2,"c":3}', '{"a":4,"b":5,"c":6}']);
        });
        it("NDJSON file to NDJSON string", () => {
            const ndjson = NDJSON_1.default.fromFile(__dirname + "/mocks/multi-ndjson/sample.1.ndjson");
            const out = ndjson.toString();
            code_1.expect(out).to.equal('{"a":1,"b":2,"c":3}\r\n{"a":4,"b":5,"c":6}');
        });
        it("NDJSON file to file", () => {
            const ndjson = NDJSON_1.default.fromFile(__dirname + "/mocks/multi-ndjson/sample.1.ndjson");
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                ndjson.toFile(filePath);
                code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal('{"a":1,"b":2,"c":3}\r\n{"a":4,"b":5,"c":6}');
            }
            catch (ex) {
                throw ex;
            }
            finally {
                fs_1.unlinkSync(filePath);
            }
        });
        // From NDJSON directory to *
        // ---------------------------------------------------------------------
        it("NDJSON directory to NDJSON string", () => {
            const collection = NDJSON_1.default.fromDirectory(__dirname + "/mocks/multi-ndjson");
            const str = collection.toString();
            code_1.expect(str).to.equal('{"a":1,"b":2,"c":3}\r\n' +
                '{"a":4,"b":5,"c":6}\r\n' +
                '{"a":7,"b":8,"c":9}\r\n' +
                '{"a":10,"b":11,"c":12}');
        });
        it("NDJSON directory to JSON string", () => {
            const collection = NDJSON_1.default.fromDirectory(__dirname + "/mocks/multi-ndjson");
            const json = JSON.stringify(collection);
            code_1.expect(json).to.equal('[{"a":1,"b":2,"c":3},' +
                '{"a":4,"b":5,"c":6},' +
                '{"a":7,"b":8,"c":9},' +
                '{"a":10,"b":11,"c":12}]');
        });
        it("NDJSON directory to Array", () => {
            const collection = NDJSON_1.default.fromDirectory(__dirname + "/mocks/multi-ndjson");
            const arr = collection.toArray();
            code_1.expect(arr).to.equal([
                { "a": 1, "b": 2, "c": 3 },
                { "a": 4, "b": 5, "c": 6 },
                { "a": 7, "b": 8, "c": 9 },
                { "a": 10, "b": 11, "c": 12 }
            ]);
        });
        it("NDJSON directory to string Array", () => {
            const collection = NDJSON_1.default.fromDirectory(__dirname + "/mocks/multi-ndjson");
            const arr = collection.toStringArray();
            code_1.expect(arr).to.equal([
                '{"a":1,"b":2,"c":3}',
                '{"a":4,"b":5,"c":6}',
                '{"a":7,"b":8,"c":9}',
                '{"a":10,"b":11,"c":12}'
            ]);
        });
        it("NDJSON directory to CSV string", () => {
            const collection = NDJSON_1.default.fromDirectory(__dirname + "/mocks/multi-ndjson");
            const csv = Delimited_1.default.fromArray(collection.toArray());
            const str = csv.toString({ delimiter: "," });
            code_1.expect(str).to.equal("a,b,c\r\n1,2,3\r\n4,5,6\r\n7,8,9\r\n10,11,12");
        });
        it("NDJSON directory to file", () => {
            const collection = NDJSON_1.default.fromDirectory(__dirname + "/mocks/multi-ndjson");
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                collection.toFile(filePath);
                code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal('{"a":1,"b":2,"c":3}\r\n' +
                    '{"a":4,"b":5,"c":6}\r\n' +
                    '{"a":7,"b":8,"c":9}\r\n' +
                    '{"a":10,"b":11,"c":12}');
            }
            catch (ex) {
                throw ex;
            }
            finally {
                fs_1.unlinkSync(filePath);
            }
        });
        // From NDJSON array to *
        // ---------------------------------------------------------------------
        it("NDJSON array to NDJSON string", () => {
            const ndjson = NDJSON_1.default.fromStringArray(['{"a":1,"b":2}', '{"a":3,"b":4}']);
            const str = ndjson.toString();
            code_1.expect(str).to.equal('{"a":1,"b":2}\r\n{"a":3,"b":4}');
        });
        it("NDJSON array to CSV string", () => {
            const ndjson = NDJSON_1.default.fromStringArray(['{"a":1,"b":2}', '{"a":3,"b":4}']);
            const csv = Delimited_1.default.fromArray(ndjson.toArray());
            const str = csv.toString({ delimiter: "," });
            code_1.expect(str).to.equal("a,b\r\n1,2\r\n3,4");
        });
        it("NDJSON array to JSON string", () => {
            const ndjson = NDJSON_1.default.fromStringArray(['{"a":1,"b":2}', '{"a":3,"b":4}']);
            const json = JSON.stringify(ndjson);
            code_1.expect(json).to.equal('[{"a":1,"b":2},{"a":3,"b":4}]');
        });
        it("NDJSON array to Array", () => {
            const ndjson = NDJSON_1.default.fromStringArray(['{"a":1,"b":2}', '{"a":3,"b":4}']);
            const arr = ndjson.toArray();
            code_1.expect(arr).to.equal([{ "a": 1, "b": 2 }, { "a": 3, "b": 4 }]);
        });
        it("NDJSON array to string Array", () => {
            const ndjson = NDJSON_1.default.fromStringArray(['{"a":1,"b":2}', '{"a":3,"b":4}']);
            const arr = ndjson.toStringArray();
            code_1.expect(arr).to.equal(['{"a":1,"b":2}', '{"a":3,"b":4}']);
        });
        it("NDJSON array to TSV", () => {
            const ndjson = NDJSON_1.default.fromStringArray(['{"a":1,"b":2}', '{"a":3,"b":4}']);
            const tsv = Delimited_1.default.fromArray(ndjson.toArray());
            const out = tsv.toString({ delimiter: "\t" });
            code_1.expect(out).to.equal("a\tb\r\n1\t2\r\n3\t4");
        });
        it("NDJSON array to file", () => {
            const ndjson = NDJSON_1.default.fromStringArray(['{"a":1,"b":2}', '{"a":3,"b":4}']);
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                ndjson.toFile(filePath);
                code_1.expect(fs_1.readFileSync(filePath, "utf8")).to.equal('{"a":1,"b":2}\r\n{"a":3,"b":4}');
            }
            catch (ex) {
                throw ex;
            }
            finally {
                fs_1.unlinkSync(filePath);
            }
        });
    });
});
