"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
/**
 * Takes a stream of JSON objects (as strings) and outputs parsed objects.
 */
class JsonToObject extends stream_1.Transform {
    /**
     * Creates an instance in object mode
     */
    constructor() {
        super({ objectMode: true });
    }
    /**
     * Takes a JSON object (as string) and outputs a parsed object.
     * @param json The input JSON string
     * @param _encoding The encoding is ignored
     * @param next The callback (provided internally)
     */
    _transform(json, _encoding, next) {
        try {
            const obj = JSON.parse(json);
            this.push(obj);
            next();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = JsonToObject;
