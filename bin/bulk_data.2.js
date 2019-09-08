#!/usr/bin/env node

const app       = require("commander");
const FS        = require("fs");
const Delimited = require("../build/src/Delimited").default;
const NDJSON    = require("../build/src/NDJSON").default;
const JSONCollection = require("../build/src/JSONCollection").default;

app
    .version("0.1.0")
    .option("--input [path]"      , "Path to input directory or file")
    .option("--output [path]"     , "Path to output directory or file")
    .option("--input-type [type]" , "The type of input (json, ndjson, delimited, auto)" , "auto")
    .option("--output-type [type]", "The type of output (json, ndjson, delimited, auto)", "auto")
    .option("--eol [value]"       , "The line separator (CRLF, LF)", "CRLF")

    .option(
        "--output-delimiter [value]",
        'The delimiter (e.g. ",", "TAB", ";"...) to use when generating the ' +
        'output. Ignored if --output-type is not "delimited".',
        ","
    )

    .option(
        "--input-delimiter [value]",
        'The delimiter (e.g. ",", "TAB", ";"...) to use when parsing the ' +
        'input. Ignored if --input-type is not "delimited".'
    )

    .option("--fast", "Only use the first line in ndjson to compute the header")

    .parse(process.argv);

// =============================================================================

function getInputType() {
    if (app.inputType == "auto") {
        const match = String(app.input).match(/\.(csv|tsv|json|ndjson)$/i);
        if (match && match[1]) {
            return match[1].toLocaleLowerCase();
        }
    }
    return app.inputType || "ndjson";
}

function getOutputType() {
    if (app.outputType == "auto") {
        const match = String(app.output).match(/\.(csv|tsv|json|ndjson)$/i);
        if (match && match[1]) {
            return match[1].toLocaleLowerCase();
        }
    }
    return app.outputType || "ndjson";
}

function getOptionsForDelimitedInput() {
    let delimiter = app.inputDelimiter;
    let extension = getInputType() == "tsv" ? "tsv" : "csv";

    if (!delimiter) {
        switch (getInputType()) {
            case "tsv":
                delimiter = "TAB";
                break;
            case "csv":
                delimiter = ",";
                break;
            default:
                delimiter = ",";
                break;
        }
    }

    return {
        eol      : app.eol.replace(/CR/i, "\r").replace(/LF/i, "\n"),
        delimiter: delimiter.replace(/TAB/i, "\t"),
        extension
    };
}

function isDirectory(path) {
    path = String(path);
    if (!path || path == "stdin") {
        return false;
    }
    const stat = FS.statSync(path);
    return stat.isDirectory();
}

function createInputCollection() {
    const inputType = getInputType();

    if (isDirectory(app.input)) {
        if (inputType == "ndjson") {
            return NDJSON.fromDirectory(app.input);
        }
        if (inputType == "json") {
            return JSONCollection.fromDirectory(app.input);
        }
        return Delimited.fromDirectory(app.input, getOptionsForDelimitedInput());
    }

    if (inputType == "ndjson") {
        return NDJSON.fromFile(app.input);
    }
    if (inputType == "json") {
        return JSONCollection.fromFile(app.input);
    }
    return Delimited.fromFile(app.input, getOptionsForDelimitedInput());
}

// =============================================================================

function main() {

    if (!app.input) {
        return app.outputHelp();
    }

    const inputType = getInputType();

    // const delimitedOptions = getOptionsForDelimitedInput();

    // const delimitedOutputOptions = {
    //     eol      : app.eol.replace(/CR/i, "\r").replace(/LF/i, "\n"),
    //     delimiter: app.outputDelimiter.replace(/TAB/i, "\t")
    // };



    // const outputStream = app.output ?
    //     FS.createWriteStream(app.output, "utf8") :
    //     process.stdout;

    let descriptor = `${getInputType()}-to-${getOutputType()}`;
    if (isDirectory(app.input)) {
        descriptor = "multiple-" + descriptor;
    }

    // console.log(descriptor);

    switch (getOutputType()) {

        // CSV to * ------------------------------------------------------------
        // node bin/bulk_data.2.js --input tests/mocks/sample.1.csv --input-type csv --output-type csv
        // node bin/bulk_data.2.js --input tests/mocks/sample.1.csv --input-type csv --output-type tsv
        // node bin/bulk_data.2.js --input tests/mocks/sample.1.csv --input-type csv --output-type json
        // node bin/bulk_data.2.js --input tests/mocks/sample.1.csv --input-type csv --output-type ndjson

        // TSV to * ------------------------------------------------------------
        // node bin/bulk_data.2.js --input tests/mocks/sample.1.tsv --input-type tsv --output-type csv
        // node bin/bulk_data.2.js --input tests/mocks/sample.1.tsv --input-type tsv --output-type tsv
        // node bin/bulk_data.2.js --input tests/mocks/sample.1.tsv --input-type tsv --output-type json
        // node bin/bulk_data.2.js --input tests/mocks/sample.1.tsv --input-type tsv --output-type ndjson

        // JSON to * ------------------------------------------------------------
        // node bin/bulk_data.2.js --input tests/mocks/sample.1.json --input-type json --output-type csv
        // node bin/bulk_data.2.js --input tests/mocks/sample.1.json --input-type json --output-type tsv
        // node bin/bulk_data.2.js --input tests/mocks/sample.1.json --input-type json --output-type json
        // node bin/bulk_data.2.js --input tests/mocks/sample.1.json --input-type json --output-type ndjson

        // NDJSON to * ---------------------------------------------------------
        // node bin/bulk_data.2.js --input tests/mocks/sample.1.ndjson --input-type ndjson --output-type csv
        // node bin/bulk_data.2.js --input tests/mocks/sample.1.ndjson --input-type ndjson --output-type tsv
        // node bin/bulk_data.2.js --input tests/mocks/sample.1.ndjson --input-type ndjson --output-type json
        // node bin/bulk_data.2.js --input tests/mocks/sample.1.ndjson --input-type ndjson --output-type ndjson


        case "csv": {
            const input = createInputCollection();
            if (inputType == "ndjson" || inputType == "json") {
                process.stdout.write(
                    Delimited.fromArray(input.toArray()).toString({ delimiter: "," })
                );
            } else {
                process.stdout.write(input.toString({ delimiter: "," }));
            }
            break;
        }

        case "tsv": {
            const input = createInputCollection();
            if (inputType == "ndjson" || inputType == "json") {
                process.stdout.write(
                    Delimited.fromArray(input.toArray()).toString({ delimiter: "\t" })
                );
            }
            else {
                process.stdout.write(input.toString({ delimiter: "\t" }));
            }
            break;
        }

        case "json": {
            const input  = createInputCollection();
            process.stdout.write(JSON.stringify(input.toJSON()));
            break;
        }

        case "ndjson": {
            const input  = createInputCollection();
            if (inputType == "ndjson") {
                process.stdout.write(input.toString());
            } else {
                process.stdout.write(input.toNDJSON());
            }
            break;
        }


        default:
            throw new Error(
                `Conversion of type ${descriptor} is not implemented.\n` +
                `Please use the --input-type and --output-type options to specify ` +
                `what type of conversion you need.\n`
            );
    }
}

main();
