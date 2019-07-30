"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
/**
 * Takes a stream of JSON objects and outputs them as an (stringified) array.
 */
class ObjectToJsonArray extends stream_1.Transform {
    /**
     * Creates new ObjectToJsonArray stream in object mode
     */
    constructor() {
        super({ objectMode: true });
        /**
         * Internal zero-based counter for the number of processed JSON objects
         */
        this.counter = 0;
    }
    /**
     * Takes object chunks and puts them in an (stringified) array
     * @param obj The chunk should be an object
     * @param _encoding The enconding is ignored because this stream works in
     *  object mode
     * @param next The callback function (provided internally)
     */
    _transform(obj, _encoding, next) {
        try {
            if (++this.counter === 1) {
                this.push("[");
            }
            else {
                this.push(",");
            }
            const json = JSON.stringify(obj);
            this.push(json);
            next();
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * After the last object is added to the array make sure close the array by
     * adding a "]" to the output stream.
     * @param next The callback (provided internally)
     */
    _flush(next) {
        this.push("]");
        next();
    }
}
exports.default = ObjectToJsonArray;
