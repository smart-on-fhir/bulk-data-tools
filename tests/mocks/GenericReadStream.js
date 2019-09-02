const { Readable } = require("stream");


module.exports = class GenericReadStream extends Readable
{
    constructor(generator)
    {
        super({ objectMode: true });
        this._generator = generator;
    }

    _read()
    {
        const result = this._generator.next();
        if (result.done) {
            this.push(null);
        } else {
            this.push(result.value);
        }
    }
};
