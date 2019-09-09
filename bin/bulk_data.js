#!/usr/bin/env node

const app                 = require("commander");
const FS                  = require("fs");
const DelimitedCollection = require("../build/src/DelimitedCollection").default;
const NDJSONCollection    = require("../build/src/NDJSONCollection").default;
const JSONCollection      = require("../build/src/JSONCollection").default;

app
    .version("0.1.0")

    // Path to input directory or file
    .option("--input [path]", "Path to input directory or file")

    // The type of input (`json`, `ndjson`, `csv`, `tsv`, `auto`).
    // Defaults to `auto` which means the input type can be omitted and will be
    // detected based in the file extension of the file passed as `--input`. If
    // the `--input` is a directory, then `--input-type` is required and cannot
    // be `auto`.
    .option("--input-type [type]", "The type of input (json, ndjson, csv, tsv, auto)" , "auto")

    // The type of output (`json`, `ndjson`, `csv`, `tsv`). Required.
    .option("--output-type [type]", "The type of output (json, ndjson, csv, tsv)")

    // If the `output-type` is delimited (csv or tsv), use this to specify what
    // should be used as line separator. Defaults to `CRLF` (`\r\n`).
    .option("--eol [value]", "The line separator (CRLF, LF)", "CRLF")

    // If set, loop through every entry to compute the complete csv/tsv header.
    // Otherwise assume that all entries have the same structure and only use the
    // first entry. Only applicable when the `output-type` is csv or tsv.
    .option("--strict", "Only use the first line in ndjson or json arrays to compute the delimited header")

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

function getOptionsForDelimitedInput() {
    let delimiter;
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
            return NDJSONCollection.fromDirectory(app.input);
        }
        if (inputType == "json") {
            return JSONCollection.fromDirectory(app.input);
        }
        return DelimitedCollection.fromDirectory(app.input, getOptionsForDelimitedInput());
    }

    if (inputType == "ndjson") {
        return NDJSONCollection.fromFile(app.input);
    }
    if (inputType == "json") {
        return JSONCollection.fromFile(app.input);
    }
    return DelimitedCollection.fromFile(app.input, getOptionsForDelimitedInput());
}

// =============================================================================

function main() {

    if (!app.input || !app.outputType) {
        return app.outputHelp();
    }

    const inputType = getInputType();
    const eol = app.eol.replace(/CR/i, "\r").replace(/LF/i, "\n");

    switch (app.outputType) {

        // Anything to CSV -----------------------------------------------------
        case "csv": {
            const input = createInputCollection();
            if (inputType == "ndjson" || inputType == "json") {
                process.stdout.write(
                    DelimitedCollection.fromArray(input.toArray()).toString({
                        delimiter: ",",
                        strictHeader: app.strict,
                        eol
                    })
                );
            } else {
                process.stdout.write(input.toString({
                    delimiter: ",",
                    strictHeader: app.strict,
                    eol
                }));
            }
            break;
        }

        // Anything to TSV -----------------------------------------------------
        case "tsv": {
            const input = createInputCollection();
            if (inputType == "ndjson" || inputType == "json") {
                process.stdout.write(
                    DelimitedCollection.fromArray(input.toArray()).toString({
                        delimiter: "\t",
                        strictHeader: app.strict,
                        eol
                    })
                );
            }
            else {
                process.stdout.write(input.toString({
                    delimiter: "\t",
                    strictHeader: app.strict,
                    eol
                }));
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


        default: {
            let descriptor = `"${getInputType()} to ${app.outputType}""`;
            if (isDirectory(app.input)) {
                descriptor = "multiple " + descriptor;
            }
            throw new Error(
                `Conversion of type ${descriptor} is not implemented.\n` +
                `Please use the --input-type and --output-type options to specify ` +
                `what type of conversion you need.\n`
            );
        }
    }
}

main();
