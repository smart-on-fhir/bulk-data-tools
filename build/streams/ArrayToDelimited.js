"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const lib_1 = require("../lib");
const csv_1 = require("../csv");
class ArrayToDelimited extends stream_1.Transform {
    /**
     * Creates and initializes an instance
     * @param options The options to use (if any)
     */
    constructor(options) {
        super({
            writableObjectMode: true,
            readableObjectMode: true
        });
        /**
         * Internal zero-based counter for the number of processed NDJSON lines
         */
        this.count = 0;
        this.options = {
            fast: true,
            delimiter: ",",
            eol: "\r\n",
            ...options
        };
        this.count = 0;
        this.header = {};
    }
    /**
     * Transforms json objects (from ndjson lines) to delimited format lines
     * @param array The current line as JSON object
     * @param _encoding The encoding (ignored)
     * @param next The callback function
     */
    _transform(array, _encoding, next) {
        try {
            const separator = this.options.delimiter;
            const eol = this.options.eol;
            const header = csv_1.csvHeaderFromArray(array);
            const body = array.map(json => {
                return header.map(path => lib_1.escapeDelimitedValue(lib_1.getPath(json, path)))
                    .join(separator);
            });
            this.push(header.map(h => lib_1.escapeDelimitedValue(h)).join(separator));
            this.push(eol + body.join(eol));
            next();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ArrayToDelimited = ArrayToDelimited;
