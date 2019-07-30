"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
/**
 * Transforms stream of bytes to stream of lines as strings. Sometimes the input
 * chunk might contain several lines and sometimes it may only contain a part of
 * a line. This will do the necessary buffering so that the output is always a
 * single line.
 */
class BytesToLines extends stream_1.Transform {
    constructor(skipLines = 0) {
        super({
            writableObjectMode: true,
            readableObjectMode: false
        });
        /**
         * How many lines to skip before starting to emit them
         */
        this.skipLines = 0;
        /**
         * The internal string buffer
         */
        this._buffer = "";
        /**
         * The internal counter of the detected lines. This is needed in order to
         * support the `skipLines` option.
         */
        this._counter = 0;
        this.skipLines = skipLines;
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
                if (++this._counter > this.skipLines) {
                    this.push(line, "utf8");
                }
                this._buffer = this._buffer.substr(match.index + match[1].length);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Typically (unless the last line ends with EOL), when the stream reads the
     * entire input the last line will still be in the buffer. Make sure we
     * output it too!
     * @param next The callback function
     */
    _flush(next) {
        try {
            if (this._buffer) {
                this.push(this._buffer);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.BytesToLines = BytesToLines;
module.exports = BytesToLines;
