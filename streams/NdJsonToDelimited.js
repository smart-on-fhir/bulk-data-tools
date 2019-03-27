const { Transform } = require("stream");
const {
    csvHeaderFromJson,
    escapeCsvValue,
    getPath,
    flatObjectKeys
} = require("../csv");

class NdJsonToDelimited extends Transform
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


    _transform(json, _encoding, next)
    {
        try {

            if (this.count > 0) {
                this.push(this.options.eol);
            }

            if (this.options.fast && this.count === 0) {
                this.header = flatObjectKeys(csvHeaderFromJson(json));
                this.push(this.header.map(path => escapeCsvValue(path)).join(this.options.delimiter));
                this.push(this.options.eol);
            }

            this.count += 1;

            this.push(
                this.header.map(path => escapeCsvValue(getPath(json, path)))
                    .join(this.options.delimiter)
            );

            next();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = NdJsonToDelimited;