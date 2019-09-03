import { Transform } from "stream";
import { getPath, escapeDelimitedValue } from "../lib";
import {
    csvHeaderFromArray
} from "../csv";

interface IArrayToDelimitedOptions {

    /**
     * If true (default), only the first line in the NDJSON input will be used
     * to compute what the output header should look like. In other words, if
     * this is true we assume that every NDJSON line has the same shape.
     */
    fast?: boolean;

    /**
     * The character(s) used to delimit different cells. E.g. ",".
     */
    delimiter?: string;

    /**
     * The character(s) used to delimit lines. E.g. "\n".
     */
    eol?: string;
}

export class ArrayToDelimited extends Transform
{
    /**
     * The options that the instance is using
     */
    protected options: IArrayToDelimitedOptions;

    /**
     * Internal zero-based counter for the number of processed NDJSON lines
     */
    protected count: number = 0;

    /**
     * The headers of the delimited output
     */
    protected header: BulkDataTools.IAnyObject;

    /**
     * Creates and initializes an instance
     * @param options The options to use (if any)
     */
    constructor(options?: IArrayToDelimitedOptions)
    {
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
     * @param array The current line as JSON object
     * @param _encoding The encoding (ignored)
     * @param next The callback function
     */
    public _transform(array: BulkDataTools.IAnyObject[], _encoding: string, next: (e?: Error) => void)
    {
        try {
            const separator = this.options.delimiter;
            const eol       = this.options.eol;
            const header    = csvHeaderFromArray(array);
            const body      = array.map(json => {
                return header.map(path => escapeDelimitedValue(getPath(json, path)))
                    .join(separator);
            });

            this.push(header.map(h => escapeDelimitedValue(h)).join(separator));
            this.push(eol + body.join(eol));

            next();
        } catch (error) {
            next(error);
        }
    }
}
