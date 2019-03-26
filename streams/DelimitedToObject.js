const { Transform } = require("stream");
const { setPath } = require("../lib");
const { parseDelimitedLine } = require("../csv");

/**
 * This is designed to piped to LineStream
 */
class DelimitedToObject extends Transform
{
    constructor(options = {})
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

    _transform(line, _encoding, next)
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

module.exports = DelimitedToObject;

