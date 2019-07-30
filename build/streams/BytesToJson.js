"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
/**
 * Transforms stream of bytes to single json string
 */
class BytesToJson extends stream_1.Transform {
    /**
     * Creates an instance
     */
    constructor() {
        super({
            writableObjectMode: true,
            readableObjectMode: false
        });
        /**
         * The internal string buffer
         */
        this._buffer = "";
    }
    /**
     * Just pushes any chunk tot he internal buffer
     * @param chunk The input chunk as string
     * @param _encoding The encoding (ignored, utf8 assumed)
     * @param next The callback (provided internally)
     */
    _transform(chunk, _encoding, next) {
        this._buffer += chunk;
        next();
    }
    /**
     * Once we consume all the input chunks we output the result
     * @param next The callback (provided internally)
     */
    _flush(next) {
        try {
            this.push(this._buffer);
            next();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = BytesToJson;
