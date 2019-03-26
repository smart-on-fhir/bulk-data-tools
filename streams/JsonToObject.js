const { Transform } = require("stream");

class JsonToObject extends Transform
{
    constructor(options = {})
    {
        super({
            objectMode: true,
            // writableObjectMode: false,
            // readableObjectMode: true
        });
    }

    _transform(json, _encoding, next)
    {
        try {
            const obj = JSON.parse(json);
            this.push(obj);
            next();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = JsonToObject;

