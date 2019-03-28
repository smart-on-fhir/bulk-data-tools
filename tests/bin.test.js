const Lab          = require("lab");
const { expect }   = require("code");
const { execSync } = require("child_process");
const FS           = require("fs");
const Util         = require("util");
const lib          = require("../lib");

const lab = exports.lab = Lab.script();
const { describe, it, beforeEach, afterEach } = lab;
const unlink         = Util.promisify(FS.unlink);
const writeFile      = Util.promisify(FS.writeFile);
const readFile       = Util.promisify(FS.readFile);
const outputFilePath = __dirname + "/test-output";


async function testCommand(cmd, expectedOutput)
{
    await writeFile(outputFilePath, "", "utf8");
    const out = execSync(`node ${cmd} --output '${outputFilePath}'`) + "";
    if (out) console.log(out);
    const result = await readFile(outputFilePath, "utf8");
    try {
        expect(result).to.equal(expectedOutput);
    } catch (ex) {
        throw ex;
    } finally {
        await unlink(outputFilePath)
    }
}

describe("bin", () => {

    describe("bulk-data", () => {

        // CSV to * ------------------------------------------------------------
        it ("csv to csv", () => testCommand(
            "./bin/bulk_data --output-type csv --input tests/mocks/sample.1.csv",
            `a,b,c\r\n1,2,3\r\n4,5,6`
        ));

        it ("csv to tsv", () => testCommand(
            "./bin/bulk_data --output-type tsv --input tests/mocks/sample.1.csv",
            `a\tb\tc\r\n1\t2\t3\r\n4\t5\t6`
        ));

        it ("csv to json", () => testCommand(
            "./bin/bulk_data --output-type json --input tests/mocks/sample.1.csv",
            `[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6}]`
        ));

        it ("csv to ndjson", () => testCommand(
            "./bin/bulk_data --output-type ndjson --input tests/mocks/sample.1.csv",
            `{"a":1,"b":2,"c":3}\r\n{"a":4,"b":5,"c":6}`
        ));

        // TSV to * ------------------------------------------------------------

        it ("tsv to csv", () => testCommand(
            "./bin/bulk_data --output-type csv --input tests/mocks/sample.1.tsv",
            `a,b,c\r\n1,2,3\r\n4,5,6`
        ));

        it ("tsv to tsv", () => testCommand(
            "./bin/bulk_data --output-type tsv --input tests/mocks/sample.1.tsv",
            `a\tb\tc\r\n1\t2\t3\r\n4\t5\t6`
        ));

        it ("tsv to json", () => testCommand(
            "./bin/bulk_data --output-type json --input tests/mocks/sample.1.tsv",
            `[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6}]`
        ));

        it ("tsv to ndjson", () => testCommand(
            "./bin/bulk_data --output-type ndjson --input tests/mocks/sample.1.tsv",
            `{"a":1,"b":2,"c":3}\r\n{"a":4,"b":5,"c":6}`
        ));

        // JSON to * -----------------------------------------------------------

        it ("json to csv", () => testCommand(
            "./bin/bulk_data --output-type csv --input tests/mocks/sample.1.json",
            `a,b,c\r\n1,2,3\r\n4,5,6`
        ));

        it ("json to tsv", () => testCommand(
            "./bin/bulk_data --output-type tsv --input tests/mocks/sample.1.json",
            `a\tb\tc\r\n1\t2\t3\r\n4\t5\t6`
        ));

        it ("json to json", () => testCommand(
            "./bin/bulk_data --output-type json --input tests/mocks/sample.1.json",
            `[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6}]`
        ));

        it ("json to ndjson", () => testCommand(
            "./bin/bulk_data --output-type ndjson --input tests/mocks/sample.1.json",
            `{"a":1,"b":2,"c":3}\r\n{"a":4,"b":5,"c":6}`
        ));

        // NDJSON to * ---------------------------------------------------------

        it ("ndjson to csv", () => testCommand(
            "./bin/bulk_data --output-type csv --input tests/mocks/sample.1.ndjson",
            `a,b,c\r\n1,2,3\r\n4,5,6`
        ));

        it ("ndjson to tsv", () => testCommand(
            "./bin/bulk_data --output-type tsv --input tests/mocks/sample.1.ndjson",
            `a\tb\tc\r\n1\t2\t3\r\n4\t5\t6`
        ));

        it ("ndjson to json", () => testCommand(
            "./bin/bulk_data --output-type json --input tests/mocks/sample.1.ndjson",
            `[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6}]`
        ));

        it ("ndjson to ndjson", () => testCommand(
            "./bin/bulk_data --output-type ndjson --input tests/mocks/sample.1.ndjson",
            `{"a":1,"b":2,"c":3}\r\n{"a":4,"b":5,"c":6}`
        ));

        // Multiple JSON to * --------------------------------------------------

        it ("multiple json to json", () => testCommand(
            "./bin/bulk_data --output-type json --input-type json --input tests/mocks/multi-json",
            `[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6},{"a":7,"b":8,"c":9},{"a":10,"b":11,"c":12}]`
        ));

        it ("multiple json to ndjson", () => testCommand(
            "./bin/bulk_data --output-type ndjson --input-type json --input tests/mocks/multi-json",
            `{"a":1,"b":2,"c":3}\r\n{"a":4,"b":5,"c":6}\r\n{"a":7,"b":8,"c":9}\r\n{"a":10,"b":11,"c":12}`
        ));

        // Multiple NDJSON to * ------------------------------------------------
        // it ("multiple ndjson to csv", () => {
        //     return new Promise((resolve, reject) => {
        //         exec(`node ./bin/bulk_data --output-type csv --input-type ndjson --input tests/mocks/multi-ndjson`,
        //             (error, stdout, stderr) => {
        //                 if (error) {
        //                     return reject(error);
        //                 }
        //                 if (stderr) {
        //                     return reject(new Error(stderr));
        //                 }
        //                 try {
        //                     expect(stdout).to.equal([
        //                         `a,b,c`,
        //                         `1,2,3`,
        //                         `4,5,6`,
        //                         `7,8,9`,
        //                         `10,11,12`
        //                     ].join("\r\n"));
        //                     resolve();
        //                 } catch (ex) {
        //                     reject(ex);
        //                 }
        //             }
        //         );
        //     });
        // });

        it ("multiple ndjson to ndjson", () => testCommand(
            "./bin/bulk_data --output-type ndjson --input-type ndjson --input tests/mocks/multi-ndjson",
            `{"a":1,"b":2,"c":3}\r\n{"a":4,"b":5,"c":6}\r\n{"a":7,"b":8,"c":9}\r\n{"a":10,"b":11,"c":12}`
        ));

        // it ("multiple ndjson to json", () => {
        //     return new Promise((resolve, reject) => {
        //         exec(`node ./bin/bulk_data --output-type json --input-type ndjson --input tests/mocks/multi-ndjson`,
        //             (error, stdout, stderr) => {
        //                 if (error) {
        //                     return reject(error);
        //                 }
        //                 if (stderr) {
        //                     return reject(new Error(stderr));
        //                 }
        //                 try {
        //                     expect(stdout).to.equal([
        //                         `[{"a":1,"b":2,"c":3},`,
        //                         `{"a":4,"b":5,"c":6},`,
        //                         `{"a":7,"b":8,"c":9},`,
        //                         `{"a":10,"b":11,"c":12}]`
        //                     ].join(""));
        //                     resolve();
        //                 } catch (ex) {
        //                     reject(ex);
        //                 }
        //             }
        //         );
        //     });
        // });
    });

});