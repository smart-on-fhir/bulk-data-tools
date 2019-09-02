"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const fs_1 = __importDefault(require("fs"));
const csv_1 = require("./csv");
/**
 * Transforms stream of bytes to stream of lines as strings
 */
class LineStream extends stream_1.Transform {
    constructor() {
        super({
            writableObjectMode: true,
            readableObjectMode: false,
            encoding: "utf8"
        });
        this._buffer = "";
    }
    /**
     * Buffers the chunks until a new line is reached.
     * @param {String} chunk The chunk of text to add
     * @param {String} _encoding Ignored because the output is in object mode
     * @param {Function} next The callback to be called when done
     */
    _transform(chunk, _encoding, next) {
        try {
            this._buffer += chunk;
            let match;
            // tslint:disable-next-line:no-conditional-assignment
            while ((match = /(\r\n|\n)+/.exec(this._buffer)) !== null) {
                const line = this._buffer.substr(0, match.index);
                this.push(line, "utf8");
                this._buffer = this._buffer.substr(match.index + match[1].length);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.LineStream = LineStream;
/**
 * Transforms stream of JSON strings to stream of JSON objects
 */
class NdJsonStream extends stream_1.Transform {
    constructor() {
        super({
            objectMode: true,
            writableObjectMode: true,
            readableObjectMode: true
        });
    }
    _transform(chunk, _encoding, next) {
        try {
            const json = JSON.parse(chunk);
            this.push(json);
            next();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NdJsonStream = NdJsonStream;
class NdJsonToDelimitedHeader extends stream_1.Transform {
    constructor(options = {}) {
        super({
            writableObjectMode: true,
            readableObjectMode: true
        });
        this.options = {
            delimiter: ",",
            eol: "\r\n",
            ...options
        };
        this.header = {};
    }
    _transform(json, _encoding, next) {
        try {
            csv_1.mergeStrict(this.header, csv_1.csvHeaderFromJson(json));
            next();
        }
        catch (error) {
            next(error);
        }
    }
    _flush(next) {
        try {
            const header = csv_1.flatObjectKeys(this.header);
            this.push(header.map(path => csv_1.escapeCsvValue(path)).join(this.options.delimiter));
            this.push(this.options.eol);
            next();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NdJsonToDelimitedHeader = NdJsonToDelimitedHeader;
class NdJsonToDelimited extends stream_1.Transform {
    constructor(options = {}) {
        super({
            writableObjectMode: true,
            readableObjectMode: true
        });
        this.options = {
            fast: true,
            delimiter: ",",
            eol: "\r\n",
            ...options
        };
        this.count = 0;
        this.header = {};
    }
    _transform(json, _encoding, next) {
        try {
            if (this.count > 0) {
                this.push(this.options.eol);
            }
            if (this.options.fast && this.count === 0) {
                this.header = csv_1.flatObjectKeys(csv_1.csvHeaderFromJson(json));
                this.push(this.header.map(path => csv_1.escapeCsvValue(path)).join(this.options.delimiter));
                this.push(this.options.eol);
            }
            this.count += 1;
            this.push(this.header.map(path => csv_1.escapeCsvValue(csv_1.getPath(json, path)))
                .join(this.options.delimiter));
            next();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NdJsonToDelimited = NdJsonToDelimited;
exports.LineStream = LineStream;
exports.NdJsonStream = NdJsonStream;
exports.NdJsonToDelimited = NdJsonToDelimited;
exports.NdJsonToDelimitedHeader = NdJsonToDelimitedHeader;
/**
 * Given a file path reads it as stream and calls the callback for each line
 * @param {String} filePath Path to ndjson file
 * @param {Function} [callback] The callback function
 * @param {Function} [onFinish] Optional onFinish callback
 */
exports.forEachLine = function forEachLine(filePath, callback, onFinish) {
    const lineStream = fs_1.default.createReadStream(filePath, {
        encoding: "utf8",
        highWaterMark: 10
    }).pipe(new LineStream()); // .pipe(new NdJsonStream());
    let index = 0;
    if (onFinish) {
        lineStream.once("finish", () => onFinish(index));
    }
    if (callback) {
        lineStream.on('data', async (data) => {
            await callback(data, index++);
        });
    }
    return lineStream;
};
// forEachLine(
//     Path.join(__dirname, "../sample-apps-stu3/fhir-downloader/downloads/2.Immunization.ndjson"),
//     (line, index) => {
//         console.log("line: " + index);
//     },
//     count => console.log("count: " + count)
// );
