#!/usr/bin/env node

const app       = require("commander");
const FS        = require("fs");
const Delimited = require("../build/src/Delimited").default;
const NDJSON    = require("../build/src/NDJSON").default;
// const { Transform, PassThrough } = require("stream");
// const DelimitedToObject          = require("../src/streams/DelimitedToObject");
// const ObjectToJson               = require("../src/streams/ObjectToJson");
// const JsonToObject               = require("../src/streams/JsonToObject")
// const ObjectToNdJson             = require("../src/streams/ObjectToNdJson");
// const BytesToLines               = require("../src/streams/BytesToLines");
// const BytesToJson                = require("../src/streams/BytesToJson");
// const ObjectToJsonArray          = require("../src/streams/ObjectToJsonArray");
// const NdJsonToDelimitedHeader    = require("../src/streams/NdJsonToDelimitedHeader");
// const JsonArrayToDelimitedHeader = require("../src/streams/JsonArrayToDelimitedHeader");
// const NdJsonToDelimited          = require("../src/streams/NdJsonToDelimited");
// const ArrayToDelimited           = require("../src/streams/ArrayToDelimited");

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
        return Delimited.fromDirectory(app.input, getOptionsForDelimitedInput());
    }

    if (inputType == "ndjson") {
        return NDJSON.fromFile(app.input);
    }
    return Delimited.fromFile(app.input, getOptionsForDelimitedInput());
}

// =============================================================================

if (!app.input) {
    app.outputHelp();
    process.exit();
}

const delimitedOptions = getOptionsForDelimitedInput();

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

    // CSV to * ----------------------------------------------------------------

//     case "csv-to-csv": {
//         const inputStream = createInputStream();
//         const headerStream = new NdJsonToDelimitedHeader();

//         headerStream.once("finish", function() {
//             createInputStream()
//                 .pipe(new BytesToLines({ skipLines: 1 }))
//                 .pipe(new DelimitedToObject({}))
//                 .pipe(new NdJsonToDelimited())
//                 .pipe(outputStream);
//         });

//         return (inputStream
//             .pipe(new BytesToLines())
//             .pipe(new DelimitedToObject())
//             .pipe(headerStream)
//             .pipe(outputStream, { end: false }));
//     }

//     case "csv-to-tsv": {
//         const inputStream = createInputStream();
//         const headerStream = new NdJsonToDelimitedHeader({ delimiter: "\t" });

//         headerStream.once("finish", function() {
//             createInputStream()
//                 .pipe(new BytesToLines({ skipLines: 1 }))
//                 .pipe(new DelimitedToObject({}))
//                 .pipe(new NdJsonToDelimited({ delimiter: "\t" }))
//                 .pipe(outputStream);
//         });

//         return inputStream
//             .pipe(new BytesToLines())
//             .pipe(new DelimitedToObject())
//             .pipe(headerStream)
//             .pipe(outputStream, { end: false });
//     }

//     case "csv-to-ndjson": {
//         return createInputStream()
//             .pipe(new BytesToLines())
//             .pipe(new DelimitedToObject())
//             .pipe(new ObjectToNdJson())
//             .pipe(outputStream);
//     }

    case "json": {
        const input  = createInputCollection();
        const output = JSON.stringify(input.toJSON());
        if (!app.output) { return console.log(output); }
        return FS.writeFileSync(app.output, output, "utf8");
    }

    // TSV to * ----------------------------------------------------------------

//     case "tsv-to-csv": {
//         const inputStream = createInputStream();
//         const headerStream = new NdJsonToDelimitedHeader();

//         headerStream.once("finish", function() {
//             createInputStream()
//                 .pipe(new BytesToLines({ skipLines: 1 }))
//                 .pipe(new DelimitedToObject({ delimiter: "\t" }))
//                 .pipe(new NdJsonToDelimited())
//                 .pipe(outputStream);
//         });

//         return inputStream
//             .pipe(new BytesToLines())
//             .pipe(new DelimitedToObject({ delimiter: "\t" }))
//             .pipe(headerStream)
//             .pipe(outputStream, { end: false });
//     }

//     case "tsv-to-tsv": {
//         const inputStream = createInputStream();
//         const headerStream = new NdJsonToDelimitedHeader({ delimiter: "\t" });

//         headerStream.once("finish", function() {
//             createInputStream()
//                 .pipe(new BytesToLines({ skipLines: 1 }))
//                 .pipe(new DelimitedToObject({ delimiter: "\t" }))
//                 .pipe(new NdJsonToDelimited({ delimiter: "\t" }))
//                 .pipe(outputStream);
//         });

//         return inputStream
//             .pipe(new BytesToLines())
//             .pipe(new DelimitedToObject({ delimiter: "\t" }))
//             .pipe(headerStream)
//             .pipe(outputStream, { end: false });
//     }

//     case "tsv-to-json": {
//         return createInputStream()
//             .pipe(new BytesToLines())
//             .pipe(new DelimitedToObject({ delimiter: "\t" }))
//             .pipe(new ObjectToJsonArray())
//             .pipe(outputStream);
//     }

//     case "tsv-to-ndjson": {
//         return createInputStream()
//             .pipe(new BytesToLines())
//             .pipe(new DelimitedToObject({ delimiter: "\t" }))
//             .pipe(new ObjectToNdJson())
//             .pipe(outputStream);
//     }

//     // NDJSON to * -------------------------------------------------------------

//     case "ndjson-to-csv": {
//         return createInputStream()
//             .pipe(new BytesToLines())
//             .pipe(new JsonToObject())
//             .pipe(new NdJsonToDelimited())
//             .pipe(outputStream);
//     }

//     case "ndjson-to-tsv": {
//         return createInputStream()
//             .pipe(new BytesToLines())
//             .pipe(new JsonToObject())
//             .pipe(new NdJsonToDelimited({ delimiter: "\t" }))
//             .pipe(outputStream);
//     }

//     case "ndjson-to-ndjson": {
//         return createInputStream()
//             .pipe(new BytesToLines())
//             .pipe(new JsonToObject())
//             .pipe(new ObjectToNdJson())
//             .pipe(outputStream);
//     }

//     case "ndjson-to-json": {
//         return createInputStream()
//             .pipe(new BytesToLines())
//             .pipe(new JsonToObject())
//             .pipe(new ObjectToJsonArray())
//             .pipe(outputStream);
//     }

//     // JSON to * ---------------------------------------------------------------

//     case "json-to-csv": {
//         return createInputStream()
//             .pipe(new BytesToJson())
//             .pipe(new JsonToObject())
//             .pipe(new ArrayToDelimited())
//             .pipe(outputStream);
//     }

//     case "json-to-tsv": {
//         return createInputStream()
//             .pipe(new BytesToJson())
//             .pipe(new JsonToObject())
//             .pipe(new ArrayToDelimited({ delimiter: "\t" }))
//             .pipe(outputStream);
//     }

//     case "json-to-ndjson": {
//         return createInputStream()
//             .pipe(new BytesToJson())
//             .pipe(new JsonToObject())
//             .pipe(new ArrayToNdJson())
//             .pipe(outputStream);
//     }

//     case "json-to-json": {
//         return createInputStream()
//             .pipe(new BytesToJson())
//             // .pipe(new JsonToObject())
//             // .pipe(new ObjectToJson())
//             .pipe(outputStream);
//     }

//     // Multiple JSON to * ------------------------------------------------------

//     case "multiple-json-to-json": {
//         let counter = 0;
//         return new JsonFileStream(app.input)
//         .pipe(new Stream.Transform({
//             objectMode: true,
//             transform(json, _enc, next) {
//                 if (++counter === 1) {
//                     this.push("[");
//                 } else {
//                     this.push(",");
//                 }
//                 this.push(json);
//                 next();
//             },
//             flush(next) {
//                 this.push("]");
//                 next();
//             }
//         }))
//         .pipe(outputStream);
//     }

//     case "multiple-json-to-ndjson": {
//         let counter = 0;
//         return new JsonFileStream(app.input)
//         .pipe(new Stream.Transform({
//             objectMode: true,
//             transform(json, _enc, next) {
//                 if (++counter > 1) {
//                     this.push("\r\n");
//                 }
//                 this.push(json);
//                 next();
//             }
//         }))
//         .pipe(outputStream);
//     }

//     // Multiple CSV to * -------------------------------------------------------

//     // Multiple TSV to * -------------------------------------------------------

//     // Multiple NDJSON to * ----------------------------------------------------

//     // case "multiple-ndjson-to-csv": {
//     //     return forEachFileOfType(app.input, "ndjson", path => {
//     //         let count = 0;
//     //         return new Promise((resolve, reject) => {
//     //             const pipeline = FS.createReadStream(path, "utf8")
//     //                 .pipe(new BytesToLines())
//     //                 .pipe(new JsonToObject())
//     //                 .pipe(new NdJsonToDelimited());

//     //             pipeline.once("finish", () => resolve());
//     //             pipeline.pipe(outputStream, { end: false });
//     //         });
//     //     });
//     // }

//     case "multiple-ndjson-to-ndjson": {
//         let count = 0;
//         return forEachFileOfType(app.input, "ndjson", path => {
//             return new Promise((resolve, reject) => {
//                 const pipeline = FS.createReadStream(path, "utf8")
//                     .pipe(new BytesToLines())
//                     .pipe(new JsonToObject())
//                     .pipe(new ObjectToNdJson({ prependEol: ++count > 1 }));
//                 pipeline.once("finish", () => resolve());
//                 pipeline.pipe(outputStream, { end: false });
//             });
//         });
//     }

//     // case "multiple-ndjson-to-json": {
//     //     let count = 0;
//     //     return forEachFileOfType(app.input, "ndjson", path => {
//     //         return new Promise((resolve, reject) => {
//     //             const pipeline = FS.createReadStream(path, "utf8")
//     //                 .pipe(new BytesToLines())
//     //                 .pipe(new JsonToObject())
//     //                 .pipe(new ObjectToNdJson({ prependEol: ++count > 1 }));
//     //             pipeline.once("finish", () => resolve());
//     //             pipeline.pipe(outputStream, { end: false });
//     //         });
//     //     });
//     // }

    default:
        throw new Error(
            `Conversion of type ${descriptor} is not implemented.\n` +
            `Please use the --input-type and --output-type options to specify ` +
            `what type of conversion you need.\n`
        );
}


