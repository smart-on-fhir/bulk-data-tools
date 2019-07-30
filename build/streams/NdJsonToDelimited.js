"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const lib_1 = require("../lib");
const csv_1 = require("../csv");
class NdJsonToDelimited extends stream_1.Transform {
    /**
     * Creates and initializes an instance
     * @param options The options (if any) to use
     */
    constructor(options) {
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
    /**
     * Transforms json objects (from ndjson lines) to delimited format lines
     * @param json The current line as JSON object
     * @param _encoding The encoding (ignored)
     * @param next The callback function
     */
    _transform(json, _encoding, next) {
        try {
            if (this.count > 0) {
                this.push(this.options.eol);
            }
            if (this.options.fast && this.count === 0) {
                this.header = csv_1.flatObjectKeys(csv_1.csvHeaderFromJson(json));
                this.push(this.header.map((path) => csv_1.escapeCsvValue(path)).join(this.options.delimiter));
                this.push(this.options.eol);
            }
            this.count += 1;
            this.push(this.header.map((path) => csv_1.escapeCsvValue(lib_1.getPath(json, path)))
                .join(this.options.delimiter));
            next();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = NdJsonToDelimited;
