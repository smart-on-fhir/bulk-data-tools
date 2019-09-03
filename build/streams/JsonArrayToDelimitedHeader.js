"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const csv_1 = require("../csv");
const lib_1 = require("../lib");
/**
 * Takes a JS Array and turns it into a delimited header that can be used as a
 * header line in CSV ot TSV files.
 * - **NOTE:** This is not a real stream, meaning that it expects to receive
 *   just one array as input chunk. It only exists for compatibility reasons,
 *   because that way, it can become part of stream pipelines.
 */
class JsonArrayToDelimitedHeader extends stream_1.Transform {
    /**
     * Creates an instance
     * @param options Any option to override the default ones
     */
    constructor(options) {
        super({ objectMode: true });
        this.options = {
            delimiter: ",",
            eol: "\r\n",
            ...options
        };
        this.array = [];
    }
    /**
     * Takes a JS Array and saves it for later, when the `_flush` method will
     * turn it into a header.
     * **Note** this is expected to only be called once. In case it called multiple
     * times, the array passed to the last call will be the only one used to
     * construct the output header!
     * @param array The input array
     * @param _encoding The encoding is ignored (we are in object mode)
     * @param next The callback function (provided internally)
     */
    _transform(array, _encoding, next) {
        this.array = array;
        next();
    }
    _flush(next) {
        try {
            const header = csv_1.csvHeaderFromArray(this.array);
            this.push(header.map(path => lib_1.escapeDelimitedValue(path)).join(this.options.delimiter));
            this.push(this.options.eol);
            next();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = JsonArrayToDelimitedHeader;
