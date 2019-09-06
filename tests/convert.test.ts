import {readFileSync, unlinkSync} from "fs";
import * as Lab   from "lab";
import { expect } from "code";
import Delimited  from "../src/Delimited";
import NDJSON     from "../src/NDJSON";

export const lab = Lab.script();
const { describe, it } = lab;


describe("Conversions", () => {

    describe("CSV to *", () => {
        // Form CSV string to *
        // ---------------------------------------------------------------------
        it("CSV string to TSV string", () => {
            const csv = Delimited.fromString("a,b\r\n1,2\r\n3,4", { delimiter: "," });
            const tsv = csv.toString({ delimiter: "\t" });
            expect(tsv).to.equal("a\tb\r\n1\t2\r\n3\t4");
        });

        it("CSV string to JSON string", () => {
            const csv = Delimited.fromString("a,b\r\n1,2\r\n3,4", { delimiter: "," });
            const json = JSON.stringify(csv);
            expect(json).to.equal('[{"a":"1","b":"2"},{"a":"3","b":"4"}]');
        });

        it("CSV string to Array", () => {
            const csv = Delimited.fromString("a,b\r\n1,2\r\n3,4", { delimiter: "," });
            const arr = csv.toArray();
            expect(arr).to.equal([{"a": "1", "b": "2"}, {"a": "3", "b": "4"}]);
        });

        it("CSV string to string Array", () => {
            const csv = Delimited.fromString("a,b\r\n1,2\r\n3,4", { delimiter: "," });
            const arr = csv.toStringArray();
            expect(arr).to.equal(["a,b", "1,2", "3,4"]);
        });

        it("CSV string to NDJSON", () => {
            const csv = Delimited.fromString("a,b\r\n1,2\r\n3,4", { delimiter: "," });
            const out = csv.toNDJSON();
            expect(out).to.equal('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
        });

        it("CSV string to file", () => {
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            const csv = Delimited.fromString("a,b\r\n1,2\r\n3,4", { delimiter: "," });
            try {
                csv.toFile(filePath);
                expect(readFileSync(filePath, "utf8")).to.equal("a,b\r\n1,2\r\n3,4");
            }
            catch (ex) {
                throw ex;
            }
            finally {
                unlinkSync(filePath);
            }
        });

        // From CSV file to *
        // ---------------------------------------------------------------------
        it("CSV file to TSV string", () => {
            const csv = Delimited.fromFile(__dirname + "/mocks/multi-csv/sample.1.csv", { delimiter: "," });
            const tsv = csv.toString({ delimiter: "\t" });
            expect(tsv).to.equal("a\tb\tc\r\n1\t2\t3\r\n4\t5\t6");
        });

        it("CSV file to JSON string", () => {
            const csv = Delimited.fromFile(__dirname + "/mocks/multi-csv/sample.1.csv", { delimiter: "," });
            const json = JSON.stringify(csv);
            expect(json).to.equal('[{"a":"1","b":"2","c":"3"},{"a":"4","b":"5","c":"6"}]');
        });

        it("CSV file to Array", () => {
            const csv = Delimited.fromFile(__dirname + "/mocks/multi-csv/sample.1.csv", { delimiter: "," });
            const arr = csv.toArray();
            expect(arr).to.equal([{"a": "1", "b": "2", "c": "3"}, {"a": "4", "b": "5", "c": "6"}]);
        });

        it("CSV file to string Array", () => {
            const csv = Delimited.fromFile(__dirname + "/mocks/multi-csv/sample.1.csv", { delimiter: "," });
            const arr = csv.toStringArray();
            expect(arr).to.equal(["a,b,c", "1,2,3", "4,5,6"]);
        });

        it("CSV file to NDJSON", () => {
            const csv = Delimited.fromFile(__dirname + "/mocks/multi-csv/sample.1.csv", { delimiter: "," });
            const out = csv.toNDJSON();
            expect(out).to.equal('{"a":"1","b":"2","c":"3"}\r\n{"a":"4","b":"5","c":"6"}');
        });

        it("CSV file to file", () => {
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            const csv = Delimited.fromFile(__dirname + "/mocks/multi-csv/sample.1.csv", { delimiter: "," });
            try {
                csv.toFile(filePath);
                expect(readFileSync(filePath, "utf8")).to.equal("a,b,c\r\n1,2,3\r\n4,5,6");
            }
            catch (ex) {
                throw ex;
            }
            finally {
                unlinkSync(filePath);
            }
        });

        // From CSV directory to *
        // ---------------------------------------------------------------------
        it("CSV directory to TSV string", () => {
            const csv = Delimited.fromDirectory(__dirname + "/mocks/multi-csv", { delimiter: "," });
            const tsv = csv.toString({ delimiter: "\t" });
            expect(tsv).to.equal("a\tb\tc\r\n1\t2\t3\r\n4\t5\t6\r\n10\t20\t30\r\n40\t50\t60");
        });

        it("CSV directory to JSON string", () => {
            const csv = Delimited.fromDirectory(__dirname + "/mocks/multi-csv", { delimiter: "," });
            const json = JSON.stringify(csv);
            expect(json).to.equal(
                '[{"a":"1","b":"2","c":"3"},{"a":"4","b":"5","c":"6"},' +
                '{"a":"10","b":"20","c":"30"},{"a":"40","b":"50","c":"60"}]'
            );
        });

        it("CSV directory to Array", () => {
            const csv = Delimited.fromDirectory(__dirname + "/mocks/multi-csv", { delimiter: "," });
            const arr = csv.toArray();
            expect(arr).to.equal([
                {"a": "1" , "b": "2" , "c": "3" },
                {"a": "4" , "b": "5" , "c": "6" },
                {"a": "10", "b": "20", "c": "30"},
                {"a": "40", "b": "50", "c": "60"}
            ]);
        });

        it("CSV directory to string Array", () => {
            const csv = Delimited.fromDirectory(__dirname + "/mocks/multi-csv", { delimiter: "," });
            const arr = csv.toStringArray();
            expect(arr).to.equal(["a,b,c", "1,2,3", "4,5,6", "10,20,30", "40,50,60"]);
        });

        it("CSV directory to NDJSON", () => {
            const csv = Delimited.fromDirectory(__dirname + "/mocks/multi-csv", { delimiter: "," });
            const out = csv.toNDJSON();
            expect(out).to.equal(
                '{"a":"1","b":"2","c":"3"}\r\n{"a":"4","b":"5","c":"6"}\r\n' +
                '{"a":"10","b":"20","c":"30"}\r\n{"a":"40","b":"50","c":"60"}'
            );
        });

        it("CSV directory to file", () => {
            const csv = Delimited.fromDirectory(__dirname + "/mocks/multi-csv", { delimiter: "," });
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                csv.toFile(filePath);
                expect(readFileSync(filePath, "utf8")).to.equal("a,b,c\r\n1,2,3\r\n4,5,6\r\n10,20,30\r\n40,50,60");
            }
            catch (ex) {
                throw ex;
            }
            finally {
                unlinkSync(filePath);
            }
        });

        // From CSV array to *
        // ---------------------------------------------------------------------
        it("CSV array to TSV string", () => {
            const csv = Delimited.fromStringArray(["a,b", "1,2", "3,4"], { delimiter: "," });
            const tsv = csv.toString({ delimiter: "\t" });
            expect(tsv).to.equal("a\tb\r\n1\t2\r\n3\t4");
        });

        it("CSV array to JSON string", () => {
            const csv = Delimited.fromStringArray(["a,b", "1,2", "3,4"], { delimiter: "," });
            const json = JSON.stringify(csv);
            expect(json).to.equal('[{"a":"1","b":"2"},{"a":"3","b":"4"}]');
        });

        it("CSV array to Array", () => {
            const csv = Delimited.fromStringArray(["a,b", "1,2", "3,4"], { delimiter: "," });
            const arr = csv.toArray();
            expect(arr).to.equal([{"a": "1", "b": "2"}, {"a": "3", "b": "4"}]);
        });

        it("CSV array to string Array", () => {
            const csv = Delimited.fromStringArray(["a,b", "1,2", "3,4"], { delimiter: "," });
            const arr = csv.toStringArray();
            expect(arr).to.equal(["a,b", "1,2", "3,4"]);
        });

        it("CSV array to NDJSON", () => {
            const csv = Delimited.fromStringArray(["a,b", "1,2", "3,4"], { delimiter: "," });
            const out = csv.toNDJSON();
            expect(out).to.equal('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
        });

        it("CSV array to file", () => {
            const csv = Delimited.fromStringArray(["a,b", "1,2", "3,4"], { delimiter: "," });
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                csv.toFile(filePath);
                expect(readFileSync(filePath, "utf8")).to.equal("a,b\r\n1,2\r\n3,4");
            }
            catch (ex) {
                throw ex;
            }
            finally {
                unlinkSync(filePath);
            }
        });
    });

    describe("TSV to *", () => {
        // TSV string to *
        // ---------------------------------------------------------------------
        it("TSV string to CSV string", () => {
            const tsv = Delimited.fromString("a\tb\r\n1\t2\r\n3\t4", { delimiter: "\t" });
            const csv = tsv.toString({ delimiter: "," });
            expect(csv).to.equal("a,b\r\n1,2\r\n3,4");
        });

        it("TSV string to JSON string", () => {
            const tsv = Delimited.fromString("a\tb\r\n1\t2\r\n3\t4", { delimiter: "\t" });
            const json = JSON.stringify(tsv);
            expect(json).to.equal('[{"a":"1","b":"2"},{"a":"3","b":"4"}]');
        });

        it("TSV string to Array", () => {
            const tsv = Delimited.fromString("a\tb\r\n1\t2\r\n3\t4", { delimiter: "\t" });
            const arr = tsv.toArray();
            expect(arr).to.equal([{"a": "1", "b": "2"}, {"a": "3", "b": "4"}]);
        });

        it("TSV string to string Array", () => {
            const tsv = Delimited.fromString("a\tb\r\n1\t2\r\n3\t4", { delimiter: "\t" });
            const arr = tsv.toStringArray({ delimiter: "\t" });
            expect(arr).to.equal(["a\tb", "1\t2", "3\t4"]);
        });

        it("TSV string to NDJSON", () => {
            const tsv = Delimited.fromString("a\tb\r\n1\t2\r\n3\t4", { delimiter: "\t" });
            const out = tsv.toNDJSON();
            expect(out).to.equal('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
        });

        it("TSV string to file", () => {
            const csv = Delimited.fromString("a\tb\n1\t2\r\n3\t4", { delimiter: "\t" });
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                csv.toFile(filePath, { delimiter: "\t" });
                expect(readFileSync(filePath, "utf8")).to.equal("a\tb\r\n1\t2\r\n3\t4");
            }
            catch (ex) {
                throw ex;
            }
            finally {
                unlinkSync(filePath);
            }
        });

        // From TSV file to *
        // ---------------------------------------------------------------------
        it("TSV file to CSV string", () => {
            const tsv = Delimited.fromFile(__dirname + "/mocks/multi-tsv/sample.1.tsv", { delimiter: "\t" });
            const csv = tsv.toString({ delimiter: "," });
            expect(csv).to.equal("a,b,c\r\n1,2,3\r\n4,5,6");
        });

        it("TSV file to JSON string", () => {
            const tsv = Delimited.fromFile(__dirname + "/mocks/multi-tsv/sample.1.tsv", { delimiter: "\t" });
            const json = JSON.stringify(tsv);
            expect(json).to.equal('[{"a":"1","b":"2","c":"3"},{"a":"4","b":"5","c":"6"}]');
        });

        it("TSV file to Array", () => {
            const tsv = Delimited.fromFile(__dirname + "/mocks/multi-tsv/sample.1.tsv", { delimiter: "\t" });
            const arr = tsv.toArray();
            expect(arr).to.equal([{"a": "1", "b": "2", "c": "3"}, {"a": "4", "b": "5", "c": "6"}]);
        });

        it("TSV file to string Array", () => {
            const tsv = Delimited.fromFile(__dirname + "/mocks/multi-tsv/sample.1.tsv", { delimiter: "\t" });
            const arr = tsv.toStringArray({ delimiter: "\t" });
            expect(arr).to.equal(["a\tb\tc", "1\t2\t3", "4\t5\t6"]);
        });

        it("TSV file to NDJSON", () => {
            const tsv = Delimited.fromFile(__dirname + "/mocks/multi-tsv/sample.1.tsv", { delimiter: "\t" });
            const out = tsv.toNDJSON();
            expect(out).to.equal('{"a":"1","b":"2","c":"3"}\r\n{"a":"4","b":"5","c":"6"}');
        });

        it("TSV file to file", () => {
            const tsv = Delimited.fromFile(__dirname + "/mocks/multi-tsv/sample.1.tsv", { delimiter: "\t" });
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                tsv.toFile(filePath, { delimiter: "\t" });
                expect(readFileSync(filePath, "utf8")).to.equal("a\tb\tc\r\n1\t2\t3\r\n4\t5\t6");
            }
            catch (ex) {
                throw ex;
            }
            finally {
                unlinkSync(filePath);
            }
        });

        // From TSV directory to *
        // ---------------------------------------------------------------------
        it("TSV directory to TSV string", () => {
            const tsv = Delimited.fromDirectory(__dirname + "/mocks/multi-tsv", { delimiter: "\t", extension: "tsv" });
            const str = tsv.toString({ delimiter: "\t" });
            expect(str).to.equal("a\tb\tc\r\n1\t2\t3\r\n4\t5\t6\r\n10\t20\t30\r\n40\t50\t60");
        });

        it("TSV directory to JSON string", () => {
            const tsv = Delimited.fromDirectory(__dirname + "/mocks/multi-tsv", { delimiter: "\t", extension: "tsv" });
            const json = JSON.stringify(tsv);
            expect(json).to.equal(
                '[{"a":"1","b":"2","c":"3"},{"a":"4","b":"5","c":"6"},' +
                '{"a":"10","b":"20","c":"30"},{"a":"40","b":"50","c":"60"}]'
            );
        });

        it("TSV directory to Array", () => {
            const tsv = Delimited.fromDirectory(__dirname + "/mocks/multi-tsv", { delimiter: "\t", extension: "tsv" });
            const arr = tsv.toArray();
            expect(arr).to.equal([
                {"a": "1" , "b": "2" , "c": "3" },
                {"a": "4" , "b": "5" , "c": "6" },
                {"a": "10", "b": "20", "c": "30"},
                {"a": "40", "b": "50", "c": "60"}
            ]);
        });

        it("TSV directory to string Array", () => {
            const tsv = Delimited.fromDirectory(__dirname + "/mocks/multi-tsv", { delimiter: "\t", extension: "tsv" });
            const arr = tsv.toStringArray();
            expect(arr).to.equal(["a,b,c", "1,2,3", "4,5,6", "10,20,30", "40,50,60"]);
        });

        it("TSV directory to NDJSON", () => {
            const tsv = Delimited.fromDirectory(__dirname + "/mocks/multi-tsv", { delimiter: "\t", extension: "tsv" });
            const out = tsv.toNDJSON();
            expect(out).to.equal(
                '{"a":"1","b":"2","c":"3"}\r\n{"a":"4","b":"5","c":"6"}\r\n' +
                '{"a":"10","b":"20","c":"30"}\r\n{"a":"40","b":"50","c":"60"}'
            );
        });

        it("TSV directory to file", () => {
            const tsv = Delimited.fromDirectory(__dirname + "/mocks/multi-tsv", { delimiter: "\t", extension: "tsv" });
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                tsv.toFile(filePath, { delimiter: "\t" });
                expect(readFileSync(filePath, "utf8")).to.equal(
                    "a\tb\tc\r\n1\t2\t3\r\n4\t5\t6\r\n10\t20\t30\r\n40\t50\t60"
                );
            }
            catch (ex) {
                throw ex;
            }
            finally {
                unlinkSync(filePath);
            }
        });

        // From TSV array to *
        // ---------------------------------------------------------------------
        it("TSV array to TSV string", () => {
            const tsv = Delimited.fromStringArray(["a\tb", "1\t2", "3\t4"], { delimiter: "\t" });
            const str = tsv.toString({ delimiter: "\t" });
            expect(str).to.equal("a\tb\r\n1\t2\r\n3\t4");
        });

        it("TSV array to CSV string", () => {
            const tsv = Delimited.fromStringArray(["a\tb", "1\t2", "3\t4"], { delimiter: "\t" });
            const str = tsv.toString({ delimiter: "," });
            expect(str).to.equal("a,b\r\n1,2\r\n3,4");
        });

        it("TSV array to JSON string", () => {
            const tsv = Delimited.fromStringArray(["a\tb", "1\t2", "3\t4"], { delimiter: "\t" });
            const json = JSON.stringify(tsv);
            expect(json).to.equal('[{"a":"1","b":"2"},{"a":"3","b":"4"}]');
        });

        it("TSV array to Array", () => {
            const tsv = Delimited.fromStringArray(["a\tb", "1\t2", "3\t4"], { delimiter: "\t" });
            const arr = tsv.toArray();
            expect(arr).to.equal([{"a": "1", "b": "2"}, {"a": "3", "b": "4"}]);
        });

        it("TSV array to string Array", () => {
            const tsv = Delimited.fromStringArray(["a\tb", "1\t2", "3\t4"], { delimiter: "\t" });
            const arr = tsv.toStringArray({ delimiter: "\t" });
            expect(arr).to.equal(["a\tb", "1\t2", "3\t4"]);
        });

        it("TSV array to NDJSON", () => {
            const tsv = Delimited.fromStringArray(["a\tb", "1\t2", "3\t4"], { delimiter: "\t" });
            const out = tsv.toNDJSON();
            expect(out).to.equal('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
        });

        it("TSV array to file", () => {
            const csv = Delimited.fromStringArray(["a\tb", "1\t2", "3\t4"], { delimiter: "\t" });
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                csv.toFile(filePath, { delimiter: "\t" });
                expect(readFileSync(filePath, "utf8")).to.equal("a\tb\r\n1\t2\r\n3\t4");
            }
            catch (ex) {
                throw ex;
            }
            finally {
                unlinkSync(filePath);
            }
        });
    });

    describe("NDJSON to *", () => {
        // NDJSON string to *
        // ---------------------------------------------------------------------
        it("NDJSON string to CSV string", () => {
            const ndjson = NDJSON.fromString('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
            const csv = Delimited.fromArray(ndjson.toArray());
            const str = csv.toString({ delimiter: "," });
            expect(str).to.equal("a,b\r\n1,2\r\n3,4");
        });

        it("NDJSON string to JSON string", () => {
            const ndjson = NDJSON.fromString('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
            const json = JSON.stringify(ndjson);
            expect(json).to.equal('[{"a":"1","b":"2"},{"a":"3","b":"4"}]');
        });

        it("NDJSON string to Array", () => {
            const ndjson = NDJSON.fromString('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
            const arr = ndjson.toArray();
            expect(arr).to.equal([{"a": "1", "b": "2"}, {"a": "3", "b": "4"}]);
        });

        it("NDJSON string to string Array", () => {
            const ndjson = NDJSON.fromString('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
            const arr = ndjson.toStringArray();
            expect(arr).to.equal(['{"a":"1","b":"2"}', '{"a":"3","b":"4"}']);
        });

        it("NDJSON string to NDJSON string", () => {
            const ndjson = NDJSON.fromString('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
            const out = ndjson.toString();
            expect(out).to.equal('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
        });

        it("NDJSON string to file", () => {
            const ndjson = NDJSON.fromString('{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}');
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                ndjson.toFile(filePath);
                expect(readFileSync(filePath, "utf8")).to.equal(
                    '{"a":"1","b":"2"}\r\n{"a":"3","b":"4"}'
                );
            }
            catch (ex) {
                throw ex;
            }
            finally {
                unlinkSync(filePath);
            }
        });

        // From NDJSON file to *
        // ---------------------------------------------------------------------
        it("NDJSON file to CSV string", () => {
            const ndjson = NDJSON.fromFile(__dirname + "/mocks/multi-ndjson/sample.1.ndjson");
            const csv = Delimited.fromArray(ndjson.toArray());
            const str = csv.toString({ delimiter: "," });
            expect(str).to.equal("a,b,c\r\n1,2,3\r\n4,5,6");
        });

        it("NDJSON file to JSON string", () => {
            const ndjson = NDJSON.fromFile(__dirname + "/mocks/multi-ndjson/sample.1.ndjson");
            const json = JSON.stringify(ndjson);
            expect(json).to.equal('[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6}]');
        });

        it("NDJSON file to Array", () => {
            const ndjson = NDJSON.fromFile(__dirname + "/mocks/multi-ndjson/sample.1.ndjson");
            const arr = ndjson.toArray();
            expect(arr).to.equal([{"a": 1, "b": 2, "c": 3}, {"a": 4, "b": 5, "c": 6}]);
        });

        it("NDJSON file to string Array", () => {
            const ndjson = NDJSON.fromFile(__dirname + "/mocks/multi-ndjson/sample.1.ndjson");
            const arr = ndjson.toStringArray();
            expect(arr).to.equal(['{"a":1,"b":2,"c":3}', '{"a":4,"b":5,"c":6}']);
        });

        it("NDJSON file to NDJSON string", () => {
            const ndjson = NDJSON.fromFile(__dirname + "/mocks/multi-ndjson/sample.1.ndjson");
            const out = ndjson.toString();
            expect(out).to.equal('{"a":1,"b":2,"c":3}\r\n{"a":4,"b":5,"c":6}');
        });

        it("NDJSON file to file", () => {
            const ndjson = NDJSON.fromFile(__dirname + "/mocks/multi-ndjson/sample.1.ndjson");
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                ndjson.toFile(filePath);
                expect(readFileSync(filePath, "utf8")).to.equal(
                    '{"a":1,"b":2,"c":3}\r\n{"a":4,"b":5,"c":6}'
                );
            }
            catch (ex) {
                throw ex;
            }
            finally {
                unlinkSync(filePath);
            }
        });

        // From NDJSON directory to *
        // ---------------------------------------------------------------------
        it("NDJSON directory to NDJSON string", () => {
            const collection = NDJSON.fromDirectory(__dirname + "/mocks/multi-ndjson");
            const str = collection.toString();
            expect(str).to.equal(
                '{"a":1,"b":2,"c":3}\r\n' +
                '{"a":4,"b":5,"c":6}\r\n' +
                '{"a":7,"b":8,"c":9}\r\n' +
                '{"a":10,"b":11,"c":12}'
            );
        });

        it("NDJSON directory to JSON string", () => {
            const collection = NDJSON.fromDirectory(__dirname + "/mocks/multi-ndjson");
            const json = JSON.stringify(collection);
            expect(json).to.equal(
                '[{"a":1,"b":2,"c":3},' +
                '{"a":4,"b":5,"c":6},' +
                '{"a":7,"b":8,"c":9},' +
                '{"a":10,"b":11,"c":12}]'
            );
        });

        it("NDJSON directory to Array", () => {
            const collection = NDJSON.fromDirectory(__dirname + "/mocks/multi-ndjson");
            const arr = collection.toArray();
            expect(arr).to.equal([
                {"a": 1 , "b": 2 , "c": 3 },
                {"a": 4 , "b": 5 , "c": 6 },
                {"a": 7 , "b": 8 , "c": 9 },
                {"a": 10, "b": 11, "c": 12}
            ]);
        });

        it("NDJSON directory to string Array", () => {
            const collection = NDJSON.fromDirectory(__dirname + "/mocks/multi-ndjson");
            const arr = collection.toStringArray();
            expect(arr).to.equal([
                '{"a":1,"b":2,"c":3}',
                '{"a":4,"b":5,"c":6}',
                '{"a":7,"b":8,"c":9}',
                '{"a":10,"b":11,"c":12}'
            ]);
        });

        it("NDJSON directory to CSV string", () => {
            const collection = NDJSON.fromDirectory(__dirname + "/mocks/multi-ndjson");
            const csv = Delimited.fromArray(collection.toArray());
            const str = csv.toString({ delimiter: "," });
            expect(str).to.equal("a,b,c\r\n1,2,3\r\n4,5,6\r\n7,8,9\r\n10,11,12");
        });

        it("NDJSON directory to file", () => {
            const collection = NDJSON.fromDirectory(__dirname + "/mocks/multi-ndjson");
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                collection.toFile(filePath);
                expect(readFileSync(filePath, "utf8")).to.equal(
                    '{"a":1,"b":2,"c":3}\r\n' +
                    '{"a":4,"b":5,"c":6}\r\n' +
                    '{"a":7,"b":8,"c":9}\r\n' +
                    '{"a":10,"b":11,"c":12}'
                );
            }
            catch (ex) {
                throw ex;
            }
            finally {
                unlinkSync(filePath);
            }
        });

        // From NDJSON array to *
        // ---------------------------------------------------------------------
        it("NDJSON array to NDJSON string", () => {
            const ndjson = NDJSON.fromStringArray(['{"a":1,"b":2}', '{"a":3,"b":4}']);
            const str = ndjson.toString();
            expect(str).to.equal('{"a":1,"b":2}\r\n{"a":3,"b":4}');
        });

        it("NDJSON array to CSV string", () => {
            const ndjson = NDJSON.fromStringArray(['{"a":1,"b":2}', '{"a":3,"b":4}']);
            const csv = Delimited.fromArray(ndjson.toArray());
            const str = csv.toString({ delimiter: "," });
            expect(str).to.equal("a,b\r\n1,2\r\n3,4");
        });

        it("NDJSON array to JSON string", () => {
            const ndjson = NDJSON.fromStringArray(['{"a":1,"b":2}', '{"a":3,"b":4}']);
            const json = JSON.stringify(ndjson);
            expect(json).to.equal('[{"a":1,"b":2},{"a":3,"b":4}]');
        });

        it("NDJSON array to Array", () => {
            const ndjson = NDJSON.fromStringArray(['{"a":1,"b":2}', '{"a":3,"b":4}']);
            const arr = ndjson.toArray();
            expect(arr).to.equal([{"a": 1, "b": 2}, {"a": 3, "b": 4}]);
        });

        it("NDJSON array to string Array", () => {
            const ndjson = NDJSON.fromStringArray(['{"a":1,"b":2}', '{"a":3,"b":4}']);
            const arr = ndjson.toStringArray();
            expect(arr).to.equal(['{"a":1,"b":2}', '{"a":3,"b":4}']);
        });

        it("NDJSON array to TSV", () => {
            const ndjson = NDJSON.fromStringArray(['{"a":1,"b":2}', '{"a":3,"b":4}']);
            const tsv = Delimited.fromArray(ndjson.toArray());
            const out = tsv.toString({ delimiter: "\t" });
            expect(out).to.equal("a\tb\r\n1\t2\r\n3\t4");
        });

        it("NDJSON array to file", () => {
            const ndjson = NDJSON.fromStringArray(['{"a":1,"b":2}', '{"a":3,"b":4}']);
            const filePath = __dirname + "/" + Date.now() + ".tmp";
            try {
                ndjson.toFile(filePath);
                expect(readFileSync(filePath, "utf8")).to.equal(
                    '{"a":1,"b":2}\r\n{"a":3,"b":4}'
                );
            }
            catch (ex) {
                throw ex;
            }
            finally {
                unlinkSync(filePath);
            }
        });
    });
});
