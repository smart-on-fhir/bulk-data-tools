import { Transform } from "stream";

/**
 * Just a generic NodeJS callback with optional Error argument
 */
type ErrorBack = (e?: Error) => void;


/**
 * Transforms stream of bytes to stream of lines as strings. Sometimes the input
 * chunk might contain several lines and sometimes it may only contain a part of
 * a line. This will do the necessary buffering so that the output is always a
 * single line.
 */
export class BytesToLines extends Transform
{
    /**
     * How many lines to skip before starting to emit them
     */
    protected skipLines: number = 0;

    /**
     * The internal string buffer
     */
    protected _buffer: string = "";

    /**
     * The internal counter of the detected lines. This is needed in order to
     * support the `skipLines` option.
     */
    protected _counter: number = 0;

    constructor(skipLines: number = 0)
    {
        super({
            writableObjectMode: true,
            readableObjectMode: false
        });

        this.skipLines = skipLines;
    }

    /**
     * Buffers the chunks until a new line is reached.
     * @param {String} chunk The chunk of text to add
     * @param {String} _encoding Ignored because the output is in object mode
     * @param {Function} next The callback to be called when done
     */
    public _transform(chunk: string, _encoding: string, next: ErrorBack)
    {
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
        } catch (error) {
            next(error);
        }
    }

    /**
     * Typically (unless the last line ends with EOL), when the stream reads the
     * entire input the last line will still be in the buffer. Make sure we
     * output it too!
     * @param next The callback function
     */
    public _flush(next: ErrorBack)
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

