#!/usr/bin/env node

const app = require("commander");
const FS  = require("fs");
const { Transform, PassThrough } = require("stream");
const DelimitedToObject = require("../streams/DelimitedToObject");
const ObjectToJson      = require("../streams/ObjectToJson");
const JsonToObject      = require("../streams/JsonToObject")
const ObjectToNdJson    = require("../streams/ObjectToNdJson");
const BytesToLines      = require("../streams/BytesToLines");
const BytesToJson       = require("../streams/BytesToJson");
const ObjectToJsonArray = require("../streams/ObjectToJsonArray");
const { NdJsonToDelimited, NdJsonToDelimitedHeader } = require("../ndjson");

app
    .version('0.1.0')
    .option('--input [path]'      , "Path to input directory or file"                        )
    .option('--output [path]'     , "Path to output directory or file"                       )
    .option('--input-type [type]' , "The type of input (json, ndjson, delimited, auto)" , "auto")
    .option('--output-type [type]', "The type of output (json, ndjson, delimited, auto)", "auto")
    .option('--eol [value]'       , "The line separator (CRLF, LF)"               , "CRLF"   )

    .option(
        "--output-delimiter [value]",
        'The delimiter (e.g. ",", "TAB", ";"...) to use when generating the ' +
        'output. Ignored if --output-type is not "delimited".',
        ","
    )

    .option(
        "--input-delimiter [value]",
        'The delimiter (e.g. ",", "TAB", ";"...) to use when parsing the ' +
        'input. Ignored if --input-type is not "delimited".',
        ","
    )

    .option('--fast', 'Only use the first line in ndjson to compute the header')

    .parse(process.argv);


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
        delimiter: delimiter.replace(/TAB/i, "\t")
    };
}

const delimitedOptions = getOptionsForDelimitedInput();

const delimitedOutputOptions = {
    eol      : app.eol.replace(/CR/i, "\r").replace(/LF/i, "\n"),
    delimiter: app.outputDelimiter.replace(/TAB/i, "\t")
};


// console.log(delimitedOptions)

function createInputStream({ skipLines } = {}) {
    const stream = app.input ? FS.createReadStream(app.input, "utf8") : process.stdin;
    const inputType = getInputType();
    switch (inputType) {
        case "csv":
        case "tsv":
        case "delimited":
            return stream
                .pipe(new BytesToLines({ skipLines }))       // outputs line strings
                .pipe(new DelimitedToObject(delimitedOptions)); // outputs json objects
        case "json":
            return stream
                .pipe(new BytesToJson())        // outputs single json string
                .pipe(new JsonToObject());      // outputs single json object
        case "ndjson":
            return stream
                .pipe(new BytesToLines({ skipLines }))       // outputs line strings
                .pipe(new JsonToObject());      // outputs json objects
        default:
            throw new Error(`Unknown input-type parameter "${inputType}"`);
    }
}

const outputStream = app.output ?
    FS.createWriteStream(app.output, "utf8") :
    process.stdout;


switch (app.outputType) {
    case "delimited": {
        const headerStream = new NdJsonToDelimitedHeader(delimitedOutputOptions);

        headerStream.once("finish", function() {
            createInputStream({ skipLines: 1 })
                .pipe(new NdJsonToDelimited(delimitedOutputOptions))
                .pipe(outputStream);
        });

        createInputStream().pipe(headerStream).pipe(outputStream, { end: false });
    }
    break;
    case "json":
        if (getInputType() === "json") {
            createInputStream().pipe(new ObjectToJson()).pipe(outputStream);
        } else {
            createInputStream().pipe(new ObjectToJsonArray()).pipe(outputStream);
        }
    break;
    case "ndjson":
        createInputStream().pipe(new ObjectToNdJson()).pipe(outputStream);
    break;
    default:
        throw new Error(`Unknown output-type parameter "${app.outputType}"`);
    break;
}

