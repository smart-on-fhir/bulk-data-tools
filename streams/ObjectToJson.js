const { Transform } = require("stream");

class ObjectToJson extends Transform
{
    constructor(options = {})
    {
        super({
            objectMode: true,
            // writableObjectMode: false,
            // readableObjectMode: true
        });
    }

    _transform(obj, _encoding, next)
    {
        // console.log(obj)
        try {
            // this.push(obj);
            const json = JSON.stringify(obj);
            this.push(json);
            next();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ObjectToJson;

