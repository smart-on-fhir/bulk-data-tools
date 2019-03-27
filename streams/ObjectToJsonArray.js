const { Transform } = require("stream");

class ObjectToJsonArray extends Transform
{
    constructor(options = {})
    {
        super({
            objectMode: true,
            // writableObjectMode: false,
            // readableObjectMode: true
        });

        this.counter = 0;
    }

    _transform(obj, _encoding, next)
    {
        // console.log(obj)
        try {
            if (++this.counter === 1) {
                this.push("[");
            } else {
                this.push(",");
            }
            const json = JSON.stringify(obj);
            this.push(json);
            next();
        } catch (error) {
            next(error);
        }
    }

    _flush(next)
    {
        this.push("]");
        next();
    }
}

module.exports = ObjectToJsonArray;

