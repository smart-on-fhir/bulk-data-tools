const { Transform } = require("stream");


/**
 * Transforms stream of bytes to stream of lines as strings
 */
class BytesToLines extends Transform
{
    constructor({ skipLines = 0 } = {})
    {
        super({
            writableObjectMode: true,
            readableObjectMode: false
        });

        this.skipLines = skipLines;
        this._buffer   = "";
        this._counter  = 0;
    }

    /**
     * Buffers the chunks until a new line is reached.
     * @param {String} chunk The chunk of text to add
     * @param {String} _encoding Ignored because the output is in object mode
     * @param {Function} next The callback to be called when done
     */
    _transform(chunk, _encoding, next)
    {
        try {
            this._buffer += chunk + "";
            
            let match;
            while ((match = /(\r\n|\n)+/.exec(this._buffer)) !== null) {
                const line = this._buffer.substr(0, match.index);
                if (++this._counter > this.skipLines) {
                    this.push(line, "utf8");
                }
                this._buffer = this._buffer.substr(match.index + match[1].length);
            }
            next();
        } catch (error) {
            next(error);
        }
    }

    _flush(next)
    {
        try {
            if (this._buffer) {
                this.push(this._buffer);
            }
            next();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BytesToLines;

