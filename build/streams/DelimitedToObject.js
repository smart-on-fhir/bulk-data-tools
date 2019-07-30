"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const lib_1 = require("../lib");
const csv_1 = require("../csv");
/**
 * This is designed to piped to LineStream
 */
class DelimitedToObject extends stream_1.Transform {
    constructor(options) {
        super({
            writableObjectMode: true,
            readableObjectMode: true
        });
        this.options = {
            delimiter: ",",
            ...options
        };
        // console.log("0000" + JSON.stringify(options))
        this.header = null;
    }
    /**
     * Takes a line as string and outputs a JSON object
     * @param line The input CSV or TSV line as string
     * @param _encoding The encoding is ignored (utf8 is assumed)
     * @param next The callback that is provided internally
     */
    _transform(line, _encoding, next) {
        if (!this.header) {
            this.header = csv_1.parseDelimitedLine(line + "", this.options.delimiter);
            return next();
        }
        try {
            const json = {};
            const values = csv_1.parseDelimitedLine(line + "", this.options.delimiter);
            // console.log(this.options.delimiter, "===> ", values)
            this.header.forEach((path, i) => {
                let value = values[i];
                try {
                    value = JSON.parse(value);
                }
                catch (ex) {
                    value = String(value);
                }
                lib_1.setPath(json, path, value);
            });
            this.push(json);
            next();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = DelimitedToObject;
