import { execSync } from "child_process";
import * as Lab     from "lab";
import { expect }   from "code";

export const lab = Lab.script();
const { describe, it } = lab;



function testCommand(cmd: string, expectedOutput: string)
{
    expect(execSync(`node ${cmd}`) + "").to.equal(expectedOutput);
}


describe("CLI", () => {

    describe("CSV to *", () => {

        it("CSV file to TSV", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/sample.1.csv --input-type csv --output-type tsv",
                "a\tb\tc\r\n1\t2\t3\r\n4\t5\t6"
            );
        });

        it("CSV file to CSV", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/sample.1.csv --input-type csv --output-type csv",
                "a,b,c\r\n1,2,3\r\n4,5,6"
            );
        });

        it("CSV file to JSON", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/sample.1.csv --input-type csv --output-type json",
                '[{"a":"1","b":"2","c":"3"},{"a":"4","b":"5","c":"6"}]'
            );
        });

        it("CSV file to NDJSON", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/sample.1.csv --input-type csv --output-type ndjson",
                '{"a":"1","b":"2","c":"3"}\r\n{"a":"4","b":"5","c":"6"}'
            );
        });

        it("CSV directory to TSV", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/multi-csv --input-type csv --output-type tsv",
                "a\tb\tc\r\n1\t2\t3\r\n4\t5\t6\r\n10\t20\t30\r\n40\t50\t60"
            );
        });

        it("CSV directory to CSV", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/multi-csv --input-type csv --output-type csv",
                "a,b,c\r\n1,2,3\r\n4,5,6\r\n10,20,30\r\n40,50,60"
            );
        });

        it("CSV directory to JSON", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/multi-csv --input-type csv --output-type json",
                '[{"a":"1","b":"2","c":"3"},{"a":"4","b":"5","c":"6"},' +
                '{"a":"10","b":"20","c":"30"},{"a":"40","b":"50","c":"60"}]'
            );
        });

        it("CSV directory to NDJSON", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/multi-csv --input-type csv --output-type ndjson",
                '{"a":"1","b":"2","c":"3"}\r\n{"a":"4","b":"5","c":"6"}\r\n' +
                '{"a":"10","b":"20","c":"30"}\r\n{"a":"40","b":"50","c":"60"}'
            );
        });
    });

    describe("TSV to *", () => {

        it("TSV file to TSV", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/sample.1.tsv --input-type tsv --output-type tsv",
                "a\tb\tc\r\n1\t2\t3\r\n4\t5\t6"
            );
        });

        it("TSV file to CSV", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/sample.1.tsv --input-type tsv --output-type csv",
                "a,b,c\r\n1,2,3\r\n4,5,6"
            );
        });

        it("TSV file to JSON", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/sample.1.tsv --input-type tsv --output-type json",
                '[{"a":"1","b":"2","c":"3"},{"a":"4","b":"5","c":"6"}]'
            );
        });

        it("TSV file to NDJSON", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/sample.1.tsv --input-type tsv --output-type ndjson",
                '{"a":"1","b":"2","c":"3"}\r\n{"a":"4","b":"5","c":"6"}'
            );
        });

        it("TSV directory to TSV", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/multi-tsv --input-type tsv --output-type tsv",
                "a\tb\tc\r\n1\t2\t3\r\n4\t5\t6\r\n10\t20\t30\r\n40\t50\t60"
            );
        });

        it("TSV directory to CSV", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/multi-tsv --input-type tsv --output-type csv",
                "a,b,c\r\n1,2,3\r\n4,5,6\r\n10,20,30\r\n40,50,60"
            );
        });

        it("TSV directory to JSON", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/multi-tsv --input-type tsv --output-type json",
                '[{"a":"1","b":"2","c":"3"},{"a":"4","b":"5","c":"6"},' +
                '{"a":"10","b":"20","c":"30"},{"a":"40","b":"50","c":"60"}]'
            );
        });

        it("TSV directory to NDJSON", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/multi-tsv --input-type tsv --output-type ndjson",
                '{"a":"1","b":"2","c":"3"}\r\n{"a":"4","b":"5","c":"6"}\r\n' +
                '{"a":"10","b":"20","c":"30"}\r\n{"a":"40","b":"50","c":"60"}'
            );
        });
    });

    describe("NDJSON to *", () => {

        it("NDJSON file to TSV", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/sample.1.ndjson --input-type ndjson --output-type tsv",
                "a\tb\tc\r\n1\t2\t3\r\n4\t5\t6"
            );
        });

        it("NDJSON file to CSV", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/sample.1.ndjson --input-type ndjson --output-type csv",
                "a,b,c\r\n1,2,3\r\n4,5,6"
            );
        });

        it("NDJSON file to JSON", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/sample.1.ndjson --input-type ndjson --output-type json",
                '[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6}]'
            );
        });

        it("NDJSON file to NDJSON", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/sample.1.ndjson --input-type ndjson --output-type ndjson",
                '{"a":1,"b":2,"c":3}\r\n{"a":4,"b":5,"c":6}'
            );
        });

        it("NDJSON directory to TSV", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/multi-ndjson --input-type ndjson --output-type tsv",
                "a\tb\tc\r\n1\t2\t3\r\n4\t5\t6\r\n7\t8\t9\r\n10\t11\t12"
            );
        });

        it("NDJSON directory to CSV", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/multi-ndjson --input-type ndjson --output-type csv",
                "a,b,c\r\n1,2,3\r\n4,5,6\r\n7,8,9\r\n10,11,12"
            );
        });

        it("NDJSON directory to JSON", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/multi-ndjson --input-type ndjson --output-type json",
                '[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6},' +
                '{"a":7,"b":8,"c":9},{"a":10,"b":11,"c":12}]'
            );
        });

        it("NDJSON directory to NDJSON", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/multi-ndjson --input-type ndjson --output-type ndjson",
                '{"a":1,"b":2,"c":3}\r\n{"a":4,"b":5,"c":6}\r\n' +
                '{"a":7,"b":8,"c":9}\r\n{"a":10,"b":11,"c":12}'
            );
        });
    });

    describe("JSON to *", () => {

        it("JSON file to TSV", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/sample.1.json --input-type json --output-type tsv",
                "a\tb\tc\r\n1\t2\t3\r\n4\t5\t6"
            );
        });

        it("JSON file to CSV", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/sample.1.json --input-type json --output-type csv",
                "a,b,c\r\n1,2,3\r\n4,5,6"
            );
        });

        it("JSON file to JSON", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/sample.1.json --input-type json --output-type json",
                '[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6}]'
            );
        });

        it("JSON file to NDJSON", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/sample.1.json --input-type json --output-type ndjson",
                '{"a":1,"b":2,"c":3}\r\n{"a":4,"b":5,"c":6}'
            );
        });

        it("JSON directory to TSV", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/multi-json --input-type json --output-type tsv",
                "a\tb\tc\r\n1\t2\t3\r\n4\t5\t6\r\n7\t8\t9\r\n10\t11\t12"
            );
        });

        it("JSON directory to CSV", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/multi-json --input-type json --output-type csv",
                "a,b,c\r\n1,2,3\r\n4,5,6\r\n7,8,9\r\n10,11,12"
            );
        });

        it("JSON directory to JSON", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/multi-json --input-type json --output-type json",
                '[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6},' +
                '{"a":7,"b":8,"c":9},{"a":10,"b":11,"c":12}]'
            );
        });

        it("JSON directory to NDJSON", () => {
            testCommand(
                "./bin/bulk_data.2.js --input tests/mocks/multi-json --input-type json --output-type ndjson",
                '{"a":1,"b":2,"c":3}\r\n{"a":4,"b":5,"c":6}\r\n' +
                '{"a":7,"b":8,"c":9}\r\n{"a":10,"b":11,"c":12}'
            );
        });
    });
});
