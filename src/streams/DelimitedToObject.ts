import { Transform }          from "stream";
import { setPath }            from "../lib";
import { parseDelimitedLine } from "../csv";


interface IDelimitedToObjectOptions
{
    /**
     * What should be used to delimit cell values
     */
    delimiter: string;
}

/**
 * This is designed to piped to LineStream
 */
export default class DelimitedToObject extends Transform
{
    /**
     * The options that this instance uses
     */
    protected options: IDelimitedToObjectOptions;

    protected header: string[] | null;

    constructor(options?: IDelimitedToObjectOptions)
    {
        super({
            writableObjectMode: true,
            readableObjectMode: true
        });

        this.options = {
            delimiter: ",",
            ...options
        };

        // console.log("0000" + JSON.stringify(options))
        this.header = null;
    }

    /**
     * Takes a line as string and outputs a JSON object
     * @param line The input CSV or TSV line as string
     * @param _encoding The encoding is ignored (utf8 is assumed)
     * @param next The callback that is provided internally
     */
    public _transform(line: string, _encoding: string, next: (e?: Error) => void)
    {
        if (!this.header) {
            this.header = parseDelimitedLine(line + "", this.options.delimiter);
            return next();
        }

        try {
            const json = {};
            const values = parseDelimitedLine(line + "", this.options.delimiter);
            // console.log(this.options.delimiter, "===> ", values)
            this.header.forEach((path, i) => {
                let value = values[i];
                try {
                    value = JSON.parse(value);
                } catch (ex) {
                    value = String(value);
                }
                setPath(json, path, value);
            });
            this.push(json);
            next();
        } catch (error) {
            next(error);
        }
    }
}
