const { Transform } = require("stream");
const {
    csvHeaderFromJson,
    escapeCsvValue,
    mergeStrict,
    flatObjectKeys
} = require("../csv");

class NdJsonToDelimitedHeader extends Transform
{
    constructor(options = {})
    {
        super({
            writableObjectMode: true,
            readableObjectMode: true
        });

        this.options = {
            delimiter: ",",
            eol: "\r\n",
            ...options
        };
        
        this.header = {};
    }

    _transform(json, _encoding, next)
    {
        try {
            mergeStrict(this.header, csvHeaderFromJson(json));
            next();
        } catch (error) {
            next(error);
        }
    }

    _flush(next)
    {
        try {
            const header = flatObjectKeys(this.header);
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

module.exports = NdJsonToDelimitedHeader;