const Lab        = require("lab");
const { expect } = require("code");
const { exec }   = require("child_process");
const lib        = require("../lib");

const lab = exports.lab = Lab.script();
const { describe, it, beforeEach, afterEach } = lab;


describe("bin", () => {

    describe("bulk-data", () => {

        // CSV to * ------------------------------------------------------------
        it ("csv to csv", (cb) => {
            return new Promise((resolve, reject) => {
                exec(
                    `node ./bin/bulk_data --output-type csv --input tests/mocks/sample.1.csv`,
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

        it ("csv to tsv", () => {
            return new Promise((resolve, reject) => {
                exec(`node ./bin/bulk_data --output-type tsv --input tests/mocks/sample.1.csv`,
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

        it ("csv to json", () => {
            return new Promise((resolve, reject) => {
                exec(
                    `node ./bin/bulk_data --output-type json --input tests/mocks/sample.1.csv`,
                    (error, stdout, stderr) => {
                        if (error) {
                            return reject(error);
                        }
                        if (stderr) {
                            return reject(new Error(stderr));
                        }
                        try {
                            expect(stdout).to.equal(`[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6}]`);
                            resolve();
                        } catch (ex) {
                            reject(ex);
                        }
                    }
                );
            });
        });

        it ("csv to ndjson", () => {
            return new Promise((resolve, reject) => {
                exec(`node ./bin/bulk_data --output-type ndjson --input tests/mocks/sample.1.csv`,
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

        // TSV to * ------------------------------------------------------------

        it ("tsv to csv", () => {
            return new Promise((resolve, reject) => {
                exec(
                    `node ./bin/bulk_data --output-type csv --input tests/mocks/sample.1.tsv`,
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

        it ("tsv to tsv", () => {
            return new Promise((resolve, reject) => {
                exec(`node ./bin/bulk_data --output-type tsv --input tests/mocks/sample.1.tsv`,
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

        it ("tsv to json", () => {
            return new Promise((resolve, reject) => {
                exec(
                    `node ./bin/bulk_data --output-type json --input tests/mocks/sample.1.tsv`,
                    (error, stdout, stderr) => {
                        if (error) {
                            return reject(error);
                        }
                        if (stderr) {
                            return reject(new Error(stderr));
                        }
                        try {
                            expect(stdout).to.equal(`[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6}]`);
                            resolve();
                        } catch (ex) {
                            reject(ex);
                        }
                    }
                );
            });
        });

        it ("tsv to ndjson", () => {
            return new Promise((resolve, reject) => {
                exec(`node ./bin/bulk_data --output-type ndjson --input tests/mocks/sample.1.tsv`,
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

        // JSON to * -----------------------------------------------------------

        it ("json to csv", () => {
            return new Promise((resolve, reject) => {
                exec(
                    `node ./bin/bulk_data --output-type csv --input tests/mocks/sample.1.json`,
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
        // // it ("json to tsv", () => {
        // //     const cmd = `bulk-data --input-type delimited --output-type delimited`;
        // // });
        // // it ("json to json", () => {
        // //     const cmd = `bulk-data --input-type delimited --output-type delimited`;
        // // });
        // // it ("json to ndjson", () => {
        // //     const cmd = `bulk-data --input-type delimited --output-type delimited`;
        // // });

        // NDJSON to * ---------------------------------------------------------

        it ("ndjson to csv", () => {
            return new Promise((resolve, reject) => {
                exec(`node ./bin/bulk_data --output-type csv --input tests/mocks/sample.1.ndjson`,
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

        it ("ndjson to tsv", () => {
            return new Promise((resolve, reject) => {
                exec(`node ./bin/bulk_data --output-type tsv --input tests/mocks/sample.1.ndjson`,
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

        it ("ndjson to json", () => {
            return new Promise((resolve, reject) => {
                exec(`node ./bin/bulk_data --output-type json --input tests/mocks/sample.1.ndjson`,
                    (error, stdout, stderr) => {
                        if (error) {
                            return reject(error);
                        }
                        if (stderr) {
                            return reject(new Error(stderr));
                        }
                        try {
                            expect(stdout).to.equal(`[{"a":1,"b":2,"c":3},{"a":4,"b":5,"c":6}]`);
                            resolve();
                        } catch (ex) {
                            reject(ex);
                        }
                    }
                );
            });
        });

        it ("ndjson to ndjson", () => {
            return new Promise((resolve, reject) => {
                exec(`node ./bin/bulk_data --output-type ndjson --input tests/mocks/sample.1.ndjson`,
                    (error, stdout, stderr) => {
                        if (error) {
                            return reject(error);
                        }
                        if (stderr) {
                            return reject(new Error(stderr));
                        }
                        try {
                            expect(stdout).to.equal(`{"a":1,"b":2,"c":3}\r\n{"a":4,"b":5,"c":6}`);
                            resolve();
                        } catch (ex) {
                            reject(ex);
                        }
                    }
                );
            });
        });
    });

});
