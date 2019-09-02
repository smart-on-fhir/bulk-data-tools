import { Transform } from "stream";
import { getPath }   from "../lib";
import {
    csvHeaderFromJson,
    escapeCsvValue,
    flatObjectKeys
} from "../csv";


interface INdJsonToDelimitedOptions {

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

export default class NdJsonToDelimited extends Transform
{
    /**
     * The options that the instance is using
     */
    protected options: INdJsonToDelimitedOptions;

    /**
     * Internal zero-based counter for the number of processed NDJSON lines
     */
    protected count: number;

    /**
     * The headers of the delimited output
     */
    protected header: BulkDataTools.IAnyObject;

    /**
     * Creates and initializes an instance
     * @param options The options (if any) to use
     */
    constructor(options?: INdJsonToDelimitedOptions)
    {
        super({
            writableObjectMode: true,
            readableObjectMode: true
        });

        this.options = {
            fast     : true,
            delimiter: ",",
            eol      : "\r\n",
            ...options
        };
        this.count = 0;
        this.header = {};
    }

    /**
     * Transforms json objects (from ndjson lines) to delimited format lines
     * @param json The current line as JSON object
     * @param _encoding The encoding (ignored)
     * @param next The callback function
     */
    public _transform(json: BulkDataTools.IAnyObject, _encoding: string, next: (e?: Error) => void)
    {
        try {

            if (this.count > 0) {
                this.push(this.options.eol);
            }

            if (this.options.fast && this.count === 0) {
                this.header = flatObjectKeys(csvHeaderFromJson(json));
                this.push(this.header.map((path: string) => escapeCsvValue(path)).join(this.options.delimiter));
                this.push(this.options.eol);
            }

            this.count += 1;

            this.push(
                this.header.map((path: string) => escapeCsvValue(getPath(json, path)))
                    .join(this.options.delimiter)
            );

            next();
        } catch (error) {
            next(error);
        }
    }
}
