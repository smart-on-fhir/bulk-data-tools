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
const { NdJsonToDelimited, NdJsonToDelimitedHeader } = require("../ndjson");
 
app
    .version('0.1.0')
    // .usage('[options] <file ...>'                                                            )
    .option('--input [path]'      , 'Path to input directory or file'                        )
    .option('--output [path]'     , 'Path to output directory or file'                       )
    .option('--input-type [type]' , "The type of input (json, ndjson, delimited)" , "ndjson" )
    .option('--output-type [type]', "The type of output (json, ndjson, delimited)", "ndjson" )
    .option('--eol [value]'       , "The line separator (CRLF, LF)"               , "CRLF"   )
    .option('--delimiter [value]' , 'The delimiter (e.g. ",", "TAB", ";"...)'     , ","      )
    .option('--fast'              , 'Only use the first line in ndjson to compute the header')
    .parse(process.argv);

const delimitedOptions = {
    eol      : app.eol.replace(/CR/i, "\r").replace(/LF/i, "\n"),
    delimiter: app.delimiter.replace(/TAB/i, "\t")
};

// console.log(delimitedOptions)

function createInputStream({ skipLines } = {}) {
    const stream = app.input ? FS.createReadStream(app.input, "utf8") : process.stdin;
    switch (app.inputType) {
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
            throw new Error(`Unknown input-type parameter "${app.inputType}"`);
    }
}

const outputStream = app.output ?
    FS.createWriteStream(app.output, "utf8") :
    process.stdout;


switch (app.outputType) {
    case "delimited": {
        const headerStream = new NdJsonToDelimitedHeader(delimitedOptions);

        headerStream.once("finish", function() {
            createInputStream({ skipLines: 1 })
                .pipe(new NdJsonToDelimited(delimitedOptions))
                .pipe(outputStream);
        });

        createInputStream().pipe(headerStream).pipe(outputStream, { end: false });
    }
    break;
    case "json":
        createInputStream().pipe(new ObjectToJson()).pipe(outputStream);
    break;
    case "ndjson":
        createInputStream().pipe(new ObjectToNdJson()).pipe(outputStream);
    break;
    default:
        throw new Error(`Unknown output-type parameter "${app.outputType}"`);
    break;
}

