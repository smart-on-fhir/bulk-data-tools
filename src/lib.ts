import FS, { readFileSync } from "fs";
import Path                 from "path";

/**
 * Rounds the given number @n using the specified precision.
 * @param {Number|String} n
 * @param {Number} [precision]
 * @param {Number} [fixed] The number of decimal units for fixed precision. For
 *   example `roundToPrecision(2.1, 1, 3)` will produce `"2.100"`, while
 *   `roundToPrecision(2.1, 3)` will produce `2.1`.
 * @returns {Number|String} Returns a number, unless a fixed precision is used
 */
export function roundToPrecision(n: BulkDataTools.Numeric, precision?: number, fixed?: number): BulkDataTools.Numeric {
    n = parseFloat(n + "");

    if ( isNaN(n) || !isFinite(n) ) {
        return NaN;
    }

    if ( !precision || isNaN(precision) || !isFinite(precision) || precision < 1 ) {
        n = Math.round( n );
    }
    else {
        const q = Math.pow(10, precision);
        n = Math.round( n * q ) / q;
    }

    if (fixed) {
        n = Number(n).toFixed(fixed);
    }

    return n;
}

/**
 * Obtains a human-readable file size string (1024 based).
 * @param {Number} bytes The file size in bytes
 * @param {Number} precision (optional) Defaults to 2
 * @return {String}
 */
export function readableFileSize(bytes: number, options?: BulkDataTools.IReadableFileSizeOptions): string {
    const {
        precision = 2,
        fixed     = 0,
        useBinary = false
    } = options || {};
    let i = 0;
    const base = useBinary ? 1024 : 1000;
    const units = useBinary ?
        ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"] :
        ["Bytes", "kB" , "MB" , "GB" ,  "TB", "PB" , "EB" , "ZB" , "YB" ];

    while (bytes >= base && i < units.length - 1) {
        bytes = bytes / base;
        i++;
    }

    let out: string | number = Math.max(bytes, 0);

    if (precision || precision === 0) {
        out = roundToPrecision(out, precision) as number;
    }

    if (fixed) {
        out = out.toFixed(fixed);
    }

    return out + " " + units[i];
}

/**
 * Returns the int representation of the first argument or the
 * "defaultValue" if the int conversion is not possible.
 * @param {BulkDataTools.Numeric} x - The argument to convert
 * @param {BulkDataTools.Numeric} defaultValue The fall-back return value. This is going to be
 * converted to integer too.
 * @return {Number} The resulting integer.
 */
export function intVal(x: BulkDataTools.Numeric, defaultValue?: BulkDataTools.Numeric): number {
    let out = parseInt(x + "", 10);
    if ( isNaN(out) || !isFinite(out) ) {
        out = defaultValue === undefined ? 0 : intVal(defaultValue);
    }
    return out;
}

/**
 * Returns the float representation of the first argument or the
 * "defaultValue" if the int conversion is not possible.
 * @param {number | string} x The argument to convert
 * @param {number | string} [defaultValue] The fall-back return value. This is going to be
 * converted to float too.
 * @return {Number} The resulting floating point number.
 */
export function floatVal(x: BulkDataTools.Numeric, defaultValue?: BulkDataTools.Numeric): number {
    let out = parseFloat(x + "");
    if ( isNaN(out) || !isFinite(out) ) {
        out = defaultValue === undefined ? 0 : floatVal(defaultValue);
    }
    return out;
}

export function uInt(x: BulkDataTools.Numeric, defaultValue?: BulkDataTools.Numeric): number {
    return Math.max(intVal( x, defaultValue ), 0);
}

export function uFloat(x: BulkDataTools.Numeric, defaultValue?: BulkDataTools.Numeric): number {
    return Math.max(floatVal( x, defaultValue ), 0);
}

/**
 * Tests if the given argument is an object
 * @param x The value to test
 */
export function isObject(x: any): boolean
{
    return !!x && typeof x == "object";
}

export function equals(value: any) {
    return (x: any) => x === value;
}

export function isFunction(x: any) {
    return typeof x == "function";
}

/**
 * Walks thru an object (ar array) and returns the value found at the
 * provided path. This function is very simple so it intentionally does not
 * support any argument polymorphism, meaning that the path can only be a
 * dot-separated string. If the path is invalid returns undefined.
 * @param {Object} obj The object (or Array) to walk through
 * @param {String} [path=""] The path (eg. "a.b.4.c")
 * @returns {*} Whatever is found in the path or undefined
 */
export function getPath(obj: BulkDataTools.IAnyObject, path: string = "")
{
    return path.split(".").reduce((out, key) => out ? out[key] : undefined, obj);
}

/**
 * Finds a path in the given object and sets its value
 * @param {*} obj
 * @param {*} path
 * @param {*} value
 */
export function setPath(obj: BulkDataTools.IAnyObject, path: string | string[], value: any): void
{
    const segments = Array.isArray(path) ? path : String(path).split(".");

    if (!segments.length) {
        throw new Error("Path cannot be empty");
    }

    const key = segments.shift() as string;

    if (segments.length) {

        // Create intermediate object or array properties
        if (!obj.hasOwnProperty(key)) {
            if (segments[0].match(/^\d+$/)) {
                obj[key] = [];
            } else {
                obj[key] = {};
            }
        }

        // Step in
        return setPath(obj[key], segments, value);
    }

    if (obj.hasOwnProperty(key)) {
        const target         = obj[key];
        const sourceIsObject = isObject(value);
        const targetIsObject = isObject(target);

        if (sourceIsObject !== targetIsObject) {
            throw new Error(
                "Unable to merge incompatible objects" +
                " (array or object with scalar value)"
            );
        }

        if (Array.isArray(value) !== Array.isArray(target)) {
            throw new Error(
                "Unable to merge incompatible objects" +
                " (cannot mix arrays with objects)"
            );
        }
    }

    obj[key] = value;
}

/**
 * Adds whitespace to the end of the string until it reaches the specified length
 * @param str The input string
 * @param length The target length of the result string
 */
export function strPad(str: string, length: number = 0) {
    let strLen = str.length;
    while (strLen < length) {
        str += " ";
        strLen += 1;
    }
    return str;
}

/**
 * Reads a file line by line in a synchronous fashion. This will read the file
 * line by line without having to store more than one line in the memory (so the
 * file size does not really matter). This is much easier than an equivalent
 * readable stream implementation. It is also easier to debug and should produce
 * reliable stack traces in case of error.
 * @todo Add ability to customize the EOL or use a RegExp to match them all.
 * @param filePath The path to the file to read (preferably an absolute path)
 */
export function* readLine(filePath: string): IterableIterator<string> {
    const CHUNK_SIZE = 1024 * 64;
    const fd = FS.openSync(filePath, "r");
    const chunk = Buffer.alloc(CHUNK_SIZE, "", "utf8");

    let eolPos;
    let blob = "";

    while (true) {
        eolPos = blob.indexOf("\n");

        // buffered line
        if (eolPos > -1) {
            yield blob.substring(0, eolPos);
            blob = blob.substring(eolPos + 1);
        }

        else {
            // Read next chunk
            const bytesRead = FS.readSync(fd, chunk, 0, CHUNK_SIZE, null);
            if (!bytesRead) {
                FS.closeSync(fd);
                break;
            }
            blob += chunk.slice(0, bytesRead);
        }
    }

    // Last line
    if (blob) {
        yield blob;
    }
}

type FileFilter = RegExp | ((file: string) => boolean);

/**
 * Walk a directory recursively and find files that match the @filter if its a
 * RegExp, or for which @filter returns true if its a function.
 * @param {string} dir Path to directory
 * @param {RegExp|Function} [filter]
 * @returns {IterableIterator<String>}
 */
export function* filterFiles(dir: string, filter?: FileFilter): IterableIterator<string> {
    const files = walkSync(dir);
    for (const file of files) {
        if (filter instanceof RegExp && !filter.test(file)) {
            continue;
        }
        if (typeof filter == "function" && !filter(file)) {
            continue;
        }
        yield file;
    }
}

/**
 * List all files in a directory recursively in a synchronous fashion.
 * @param {String} dir
 */
export function* walkSync(dir: string): IterableIterator<string> {
    const files = FS.readdirSync(dir);

    for (const file of files) {
        const pathToFile = Path.join(dir, file);
        const isDirectory = FS.statSync(pathToFile).isDirectory();
        if (isDirectory) {
            yield *walkSync(pathToFile);
        } else {
            yield pathToFile;
        }
    }
}

/**
 * Walks a directory recursively in a synchronous fashion and yields JSON
 * objects. Only `.json` and `.ndjson` files are parsed. Yields ane JSON object
 * for each line of an NDJSON file and one object for each JSON file. Other
 * files are ignored.
 *
 * @param {String} dir A path to a directory
 * @returns {IterableIterator<JSON>}
 */
export function* jsonEntries(dir: string)
{
    const files = walkSync(dir);

    for (const file of files) {
        if (file.match(/\.json$/i)) {
            yield JSON.parse(readFileSync(file, "utf8"));
        }
        else if (file.match(/\.ndjson$/i)) {
            for (const line of readLine(file)) {
                yield JSON.parse(line);
            }
        }
    }
}

/**
 * Returns a flattened array of the structure of an object or array.
 * For example:
 * ```js
 * {a:1, b:{c:2,d:3}, e:4} -> ["a", "b.c", "b.d", "e"]
 * {a:1, b:[ 2, 3 ], e: 4} -> ["a", "b.0", "b.1", "e"]
 * [1, {a: 3, b: 4}, 2, 3] -> ["0", "1.a", "1.b", "2", "3"]
 * ```
 * @param obj The object to inspect
 * @param [_prefix] A path prefix that if provided, will be prepended
 * to each key. Please do not use this argument. The function will pass it to
 * itself on recursive calls.
 */
export function flatObjectKeys(obj: BulkDataTools.IAnyObject, _prefix?: string): string[]
{
    let out: string[] = [];

    for (const key in obj) {
        const prefix = [_prefix, key].filter(Boolean).join(".");
        const value = obj[key];
        if (isObject(value)) {
            out = out.concat(flatObjectKeys(value, prefix));
        } else {
            out.push(prefix);
        }
    }

    return out;
}
