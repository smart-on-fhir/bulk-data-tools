const { Transform } = require("stream");
const FS            = require("fs");
const Path          = require("path");

/**
 * Transforms stream of bytes to stream of lines as strings
 */
class LineStream extends Transform
{
    constructor()
    {
        super({
            writableObjectMode: true,
            readableObjectMode: false,
            encoding: "utf8"
        });

        this._buffer = "";
    }


    _transform(chunk, _encoding, next)
    {
        try {
            this._buffer += chunk;
            const index = this._buffer.search(/\n/);
            if (index > 0) {
                const line = this._buffer.substr(0, index);
                this.push(line);
                this._buffer = this._buffer.substr(index + 1);
            }
            next();
        } catch (error) {
            next(error);
        }
    }
}

/**
 * Transforms stream of JSON strings to stream of JSON objects
 */
class NdJsonStream extends Transform
{
    constructor()
    {
        super({
            writableObjectMode: true,
            readableObjectMode: true
        });
    }


    _transform(chunk, _encoding, next)
    {
        try {
            const json = JSON.parse(chunk);
            this.push(json);
            next();
        } catch (error) {
            next(error);
        }
    }
}

/**
 * Given a file path reads it as stream and calls the callback for each line
 * @param {String} filePath Path to ndjson file
 * @param {Function} callback The callback function
 * @param {Function} onFinish Optional onFinish callback
 */
exports.forEachLine = function forEachLine(filePath, callback, onFinish)
{
    const lineStream = FS.createReadStream(filePath, {
        encoding: "utf8",
        highWaterMark: 10
    }).pipe(new LineStream()); // .pipe(new NdJsonStream());

    let index = 0;

    if (onFinish) {
        lineStream.once("finish", () => onFinish(index));
    }

    lineStream.on('data', data => {
        callback(data, index++)
    });
}



// forEachLine(
//     Path.join(__dirname, "../sample-apps-stu3/fhir-downloader/downloads/2.Immunization.ndjson"),
//     (line, index) => {
//         console.log("line: " + index);
//     },
//     count => console.log("count: " + count)
// );

