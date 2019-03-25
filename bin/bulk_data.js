#!/usr/bin/env node

const app = require("commander");
const FS  = require("fs");
const { Transform } = require("stream");
const {
    NdJsonStream,
    LineStream,
    NdJsonToDelimited,
    NdJsonToDelimitedHeader
} = require("../ndjson");
 
app
    .version('0.1.0')
    .usage('[options] <file ...>')
    .option('--input-type [type]' , "The type of input (json, ndjson, delimited)", "ndjson")
    .option('--output-type [type]', "The type of output (json, ndjson, delimited)", "ndjson")
    .option('--eol [value]', "The line separator (CRLF, LF)", "CRLF")
    .option('--delimiter [value]', 'The delimiter (e.g. ",", "TAB", ";"...)', ",")
    .option('--input [path]', 'Path to input directory or file')
    .option('--output [path]', 'Path to output directory or file')
    .option('--fast', 'Only use the first line in ndjson to compute the header')
    .parse(process.argv);

function createInputStream() {
    return app.input ? FS.createReadStream(app.input, "utf8") : process.stdin;
}

// Create the output stream
const outputStream = app.output ? FS.createWriteStream(app.output, "utf8") : process.stdout;

// inputType
// outputType

const jsonStream   = new NdJsonStream();
const headerStream = new NdJsonToDelimitedHeader();
const bodyStream   = new NdJsonToDelimited({
    eol      : app.eol.replace(/CR/i, "\r").replace(/LF/i, "\n"),
    delimiter: app.delimiter.replace(/TAB/i, "\t")
});

jsonStream.on("finish", function() {
    console.log("jsonStream ENDED");
});

headerStream.on("finish", function() {
    console.log("headerStream ENDED");
});

bodyStream.on("finish", function() {
    console.log("bodyStream ENDED");
});

outputStream.on("finish", function() {
    console.log("outputStream ENDED");
});

// Header Pipeline -------------------------------------------------------------
const headerPipeline = createInputStream()
    .pipe(new LineStream())
    .pipe(jsonStream)
    .pipe(headerStream)
    .pipe(outputStream, {end: false});

    headerPipeline.once("finish", function() {
        console.log("headerPipeline ENDED");
    });

    

    headerStream.once("finish", function() {
        createInputStream()
            .pipe(new LineStream())
            .pipe(new NdJsonStream())
            .pipe(bodyStream)
            .pipe(outputStream);
    });

    
// -----------------------------------------------------------------------------

// createInputStream()
//     .pipe(new LineStream())
//     .pipe(new NdJsonStream())
//     .pipe(new NdJsonToDelimited({
//         fast     : app.fast,
//         eol      : app.eol.replace(/CR/i, "\r").replace(/LF/i, "\n"),
//         delimiter: app.delimiter.replace(/TAB/i, "\t")
//     }))
//     .pipe(outputStream);

// inputStream.pipe(outputStream);
// console.log(app);

// if (!process.argv.slice(2).length) {
//     app.help();
// }
