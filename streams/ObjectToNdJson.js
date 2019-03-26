const { Transform } = require("stream");

class ObjectToNdJson extends Transform
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
            if (++this.counter > 1) {
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

