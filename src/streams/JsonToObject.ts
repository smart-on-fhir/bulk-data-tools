import { Transform } from "stream";


/**
 * Takes a stream of JSON objects (as strings) and outputs parsed objects.
 */
export default class JsonToObject extends Transform
{
    /**
     * Creates an instance in object mode
     */
    constructor()
    {
        super({ objectMode: true });
    }

    /**
     * Takes a JSON object (as string) and outputs a parsed object.
     * @param json The input JSON string
     * @param _encoding The encoding is ignored
     * @param next The callback (provided internally)
     */
    public _transform(json: string, _encoding: string, next: (e?: Error) => void)
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
