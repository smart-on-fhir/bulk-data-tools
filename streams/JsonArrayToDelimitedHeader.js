const { Transform } = require("stream");
const {
    csvHeaderFromArray,
    escapeCsvValue,
    mergeStrict,
    flatObjectKeys
} = require("../csv");

class JsonArrayToDelimitedHeader extends Transform
{
    constructor(options = {})
    {
        super({ objectMode: true });

        this.options = {
            delimiter: ",",
            eol: "\r\n",
            ...options
        };
        
        this.header = {};
        this.array = [];
    }

    _transform(json, _encoding, next)
    {
        try {
            this.array = json;
            // mergeStrict(this.header, csvHeaderFromArray(json));
            next();
        } catch (error) {
            next(error);
        }
    }

    _flush(next)
    {
        try {
            // const header = flatObjectKeys(this.header);
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

module.exports = JsonArrayToDelimitedHeader;