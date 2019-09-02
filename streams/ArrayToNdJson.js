const { Transform } = require("stream");

class ArrayToNdJson extends Transform
{
    constructor()
    {
        super({ objectMode: true });
    }


    _transform(array, _encoding, next)
    {
        try {
            if (!Array.isArray(array)) {
                array = [ array ];
            }
            this.push(array.map(o => JSON.stringify(o)).join("\r\n"));
            next();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ArrayToNdJson;