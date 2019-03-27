const { Transform } = require("stream");
const {
    csvHeaderFromJson,
    csvHeaderFromArray,
    escapeCsvValue,
    getPath,
    flatObjectKeys
} = require("../csv");

class ArrayToDelimited extends Transform
{
    constructor(options = {})
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


    _transform(array, _encoding, next)
    {
        try {
            const separator = this.options.delimiter;
            const eol       = this.options.eol;
            const header    = csvHeaderFromArray(array);
            const body      = array.map(json => {
                return header.map(path => escapeCsvValue(getPath(json, path)))
                    .join(separator);
            });

            this.push(header.map(h => escapeCsvValue(h)).join(separator));
            this.push(eol + body.join(eol));

            next();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ArrayToDelimited;