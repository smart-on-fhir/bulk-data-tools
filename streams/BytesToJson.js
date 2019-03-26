const { Transform } = require("stream");


/**
 * Transforms stream of bytes to single json string
 */
class BytesToJson extends Transform
{
    constructor()
    {
        super({
            writableObjectMode: true,
            readableObjectMode: false
        });

        this._buffer = "";
    }

    _transform(chunk, _encoding, next)
    {
        this._buffer += chunk;
        next();
    }

    _flush(next)
    {
        try {
            this.push(this._buffer);
            next();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BytesToJson;

