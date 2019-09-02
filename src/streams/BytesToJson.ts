import { Transform } from "stream";


/**
 * Transforms stream of bytes to single json string
 */
export default class BytesToJson extends Transform
{
    /**
     * The internal string buffer
     */
    protected _buffer: string = "";

    /**
     * Creates an instance
     */
    constructor()
    {
        super({
            writableObjectMode: true,
            readableObjectMode: false
        });
    }

    /**
     * Just pushes any chunk tot he internal buffer
     * @param chunk The input chunk as string
     * @param _encoding The encoding (ignored, utf8 assumed)
     * @param next The callback (provided internally)
     */
    public _transform(chunk: string, _encoding: string, next: (e?: Error) => void)
    {
        this._buffer += chunk;
        next();
    }

    /**
     * Once we consume all the input chunks we output the result
     * @param next The callback (provided internally)
     */
    public _flush(next: (e?: Error) => void)
    {
        try {
            this.push(this._buffer);
            next();
        } catch (error) {
            next(error);
        }
    }
}
