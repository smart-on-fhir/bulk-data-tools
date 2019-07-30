"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
class ObjectToNdJson extends stream_1.Transform {
    /**
     * Creates new ObjectToNdJson stream in object mode
     */
    constructor(options) {
        super({ objectMode: true });
        /**
         * Internal zero-based counter for the number of processed JSON objects
         */
        this.counter = 0;
        this.options = { eol: "\r\n", ...options };
    }
    /**
     * Takes an object chunk and outputs a JSON stringified version of it.
     * Prepends an EOL if needed.
     * @param obj The object to stringify
     * @param _encoding The encoding (**ignored**)
     * @param next The callback (provided internally)
     */
    _transform(obj, _encoding, next) {
        try {
            if (++this.counter > 1) {
                this.push(this.options.eol);
            }
            const json = JSON.stringify(obj);
            this.push(json);
            next();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = ObjectToNdJson;
