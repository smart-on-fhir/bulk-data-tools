const { Transform } = require("stream");

class ObjectToNdJson extends Transform
{
    constructor(options = { prependEol: false })
    {
        super({
            objectMode: true,
            // writableObjectMode: false,
            // readableObjectMode: true
        });

        this.counter = 0;
        this.options = options;
    }

    _transform(obj, _encoding, next)
    {
        // console.log(obj)
        try {
            if (this.options.prependEol || ++this.counter > 1) {
                this.push("\r\n");
            }
            // this.push(obj);
            const json = JSON.stringify(obj);
            this.push(json);
            next();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ObjectToNdJson;

