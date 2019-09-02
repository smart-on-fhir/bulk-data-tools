import { Transform } from "stream";

interface IObjectToNdJsonOptions {

    /**
     * The character(s) used to delimit lines. E.g. "\n".
     */
    eol?: string;
}


export default class ObjectToNdJson extends Transform
{
    /**
     * Internal zero-based counter for the number of processed JSON objects
     */
    protected counter: number = 0;

    /**
     * The options that the instance is using
     */
    protected options: IObjectToNdJsonOptions;

    /**
     * Creates new ObjectToNdJson stream in object mode
     */
    constructor(options?: IObjectToNdJsonOptions)
    {
        super({ objectMode: true });
        this.options = { eol: "\r\n", ...options };
    }

    /**
     * Takes an object chunk and outputs a JSON stringified version of it.
     * Prepends an EOL if needed.
     * @param obj The object to stringify
     * @param _encoding The encoding (**ignored**)
     * @param next The callback (provided internally)
     */
    public _transform(obj: BulkDataTools.IAnyObject, _encoding: string, next: (e?: Error) => void)
    {
        try {
            if (++this.counter > 1) {
                this.push(this.options.eol);
            }
            const json = JSON.stringify(obj);
            this.push(json);
            next();
        } catch (error) {
            next(error);
        }
    }
}
