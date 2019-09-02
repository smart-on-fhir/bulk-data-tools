import { Transform } from "stream";
import {
    csvHeaderFromArray,
    escapeCsvValue
} from "../csv";

interface IJsonArrayToDelimitedHeaderOptions
{
    /**
     * The cell delimiter for the output.
     * @default ","
     */
    delimiter?: string;

    /**
     * The line delimiter for the output.
     * @default "\\r\\n"
     * **`XXX: Do we need this?!?!`**
     */
    eol?: string;
}

/**
 * Takes a JS Array and turns it into a delimited header that can be used as a
 * header line in CSV ot TSV files.
 * - **NOTE:** This is not a real stream, meaning that it expects to receive
 *   just one array as input chunk. It only exists for compatibility reasons,
 *   because that way, it can become part of stream pipelines.
 */
export default class JsonArrayToDelimitedHeader extends Transform
{
    /**
     * The options that the instance is currently using
     */
    protected options: IJsonArrayToDelimitedHeaderOptions;

    /**
     * The array that we have received as input is temporarily stored here
     */
    protected array: BulkDataTools.IAnyObject[];

    /**
     * Creates an instance
     * @param options Any option to override the default ones
     */
    constructor(options?: IJsonArrayToDelimitedHeaderOptions)
    {
        super({ objectMode: true });

        this.options = {
            delimiter: ",",
            eol: "\r\n",
            ...options
        };

        this.array = [];
    }

    /**
     * Takes a JS Array and saves it for later, when the `_flush` method will
     * turn it into a header.
     * **Note** this is expected to only be called once. In case it called multiple
     * times, the array passed to the last call will be the only one used to
     * construct the output header!
     * @param array The input array
     * @param _encoding The encoding is ignored (we are in object mode)
     * @param next The callback function (provided internally)
     */
    public _transform(array: BulkDataTools.IAnyObject[], _encoding: string, next: (e?: Error) => void)
    {
        this.array = array;
        next();
    }

    public _flush(next: (e?: Error) => void)
    {
        try {
            const header = csvHeaderFromArray(this.array);
            this.push(
                header.map(path => escapeCsvValue(path)).join(this.options.delimiter)
            );
            this.push(this.options.eol);
            next();
        } catch (error) {
            next(error);
        }
    }
}
