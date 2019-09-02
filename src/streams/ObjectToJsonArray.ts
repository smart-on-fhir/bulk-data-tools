import { Transform } from "stream";

/**
 * Takes a stream of JSON objects and outputs them as an (stringified) array.
 */
export default class ObjectToJsonArray extends Transform
{
    /**
     * Internal zero-based counter for the number of processed JSON objects
     */
    protected counter: number = 0;

    /**
     * Creates new ObjectToJsonArray stream in object mode
     */
    constructor()
    {
        super({ objectMode: true });
    }

    /**
     * Takes object chunks and puts them in an (stringified) array
     * @param obj The chunk should be an object
     * @param _encoding The enconding is ignored because this stream works in
     *  object mode
     * @param next The callback function (provided internally)
     */
    public _transform(obj: BulkDataTools.IAnyObject, _encoding: string, next: (e?: Error) => void)
    {
        try {
            if (++this.counter === 1) {
                this.push("[");
            } else {
                this.push(",");
            }
            const json = JSON.stringify(obj);
            this.push(json);
            next();
        } catch (error) {
            next(error);
        }
    }

    /**
     * After the last object is added to the array make sure close the array by
     * adding a "]" to the output stream.
     * @param next The callback (provided internally)
     */
    public _flush(next: (e?: Error) => void)
    {
        this.push("]");
        next();
    }
}
