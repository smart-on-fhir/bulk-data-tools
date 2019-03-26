const Lab        = require("lab");
const { expect } = require("code");
const { exec }   = require("child_process");
const lib        = require("../lib");

const lab = exports.lab = Lab.script();
const { describe, it, beforeEach, afterEach } = lab;


describe("bin", () => {

    describe("bulk-data", () => {

        it ("csv to csv", (cb) => {
            return new Promise((resolve, reject) => {
                exec(
                    `node ./bin/bulk_data --input-type delimited --output-type ` +
                    `delimited --input tests/mocks/sample.1.csv`,
                    (error, stdout, stderr) => {
                        if (error) {
                            return reject(error);
                        }
                        if (stderr) {
                            return reject(new Error(stderr));
                        }
                        try {
                            expect(stdout).to.equal(`a,b,c\r\n1,2,3\r\n4,5,6`);
                            resolve();
                        } catch (ex) {
                            reject(ex);
                        }
                    }
                );
            });
        });
        // it ("csv to tsv", () => {
        //     const cmd = `bulk-data --input-type delimited --output-type delimited --delimiter TAB`;
        // });
        // it ("csv to json", () => {
        //     const cmd = `bulk-data --input-type delimited --output-type json`;
        // });
        it ("csv to ndjson", () => {
            return new Promise((resolve, reject) => {
                exec(
                    `node ./bin/bulk_data --input-type delimited --output-type ` +
                    `ndjson --input tests/mocks/sample.1.csv`,
                    (error, stdout, stderr) => {
                        if (error) {
                            return reject(error);
                        }
                        if (stderr) {
                            return reject(new Error(stderr));
                        }
                        try {
                            expect(stdout).to.equal(
                                `{"a":1,"b":2,"c":3}\r\n` +
                                `{"a":4,"b":5,"c":6}`
                            );
                            resolve();
                        } catch (ex) {
                            reject(ex);
                        }
                    }
                );
            });
        });

        it ("tsv to csv", () => {
            return new Promise((resolve, reject) => {
                exec(
                    `node ./bin/bulk_data --input-type delimited --output-type ` +
                    `delimited --input tests/mocks/sample.1.tsv delimiter TAB`,
                    (error, stdout, stderr) => {
                        if (error) {
                            return reject(error);
                        }
                        if (stderr) {
                            return reject(new Error(stderr));
                        }
                        try {
                            expect(stdout).to.equal(`a\tb\tc\r\n1\t2\t3\r\n4\t5\t6`);
                            resolve();
                        } catch (ex) {
                            reject(ex);
                        }
                    }
                );
            });
        });
        // it ("tsv to tsv", () => {
        //     const cmd = `bulk-data --input-type delimited --output-type delimited`;
        // });
        // it ("tsv to json", () => {
        //     const cmd = `bulk-data --input-type delimited --output-type delimited`;
        // });
        it ("tsv to ndjson", () => {
            return new Promise((resolve, reject) => {
                exec(
                    `node ./bin/bulk_data --input-type delimited --output-type ` +
                    `ndjson --input tests/mocks/sample.1.tsv --delimiter TAB`,
                    (error, stdout, stderr) => {
                        if (error) {
                            return reject(error);
                        }
                        if (stderr) {
                            return reject(new Error(stderr));
                        }
                        try {
                            expect(stdout).to.equal(
                                `{"a":1,"b":2,"c":3}\r\n` +
                                `{"a":4,"b":5,"c":6}`
                            );
                            resolve();
                        } catch (ex) {
                            reject(ex);
                        }
                    }
                );
            });
        });

        // it ("json to csv", () => {
        //     const cmd = `bulk-data --input-type delimited --output-type delimited`;
        // });
        // it ("json to tsv", () => {
        //     const cmd = `bulk-data --input-type delimited --output-type delimited`;
        // });
        // it ("json to json", () => {
        //     const cmd = `bulk-data --input-type delimited --output-type delimited`;
        // });
        // it ("json to ndjson", () => {
        //     const cmd = `bulk-data --input-type delimited --output-type delimited`;
        // });

        // it ("ndjson to csv", () => {
        //     const cmd = `bulk-data --input-type delimited --output-type delimited`;
        // });
        // it ("ndjson to tsv", () => {
        //     const cmd = `bulk-data --input-type delimited --output-type delimited`;
        // });
        // it ("ndjson to json", () => {
        //     const cmd = `bulk-data --input-type delimited --output-type delimited`;
        // });
        // it ("ndjson to ndjson", () => {
        //     const cmd = `bulk-data --input-type delimited --output-type delimited`;
        // });
    });

});