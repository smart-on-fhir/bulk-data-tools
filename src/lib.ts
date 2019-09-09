/// <reference path="../index.d.ts" />

import { openSync, readSync, readdirSync, statSync, readFileSync, closeSync } from "fs";
import * as Path from "path";

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

    // if (precision || precision === 0) {
    out = roundToPrecision(out, precision) as number;
    // }

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
    if (isNaN(out)) {
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

/**
 * Converts the input argument @x to unsigned (positive) integer. Negative
 * numbers are converted to their absolute value.
 * @param x The value to convert. Should be a number or numeric string.
 * @param defaultValue The default value that is returned in case the conversion
 * is not possible. Note that this will also be converted to unsigned integer.
 * Defaults to 0.
 */
export function uInt(x: BulkDataTools.Numeric, defaultValue?: BulkDataTools.Numeric): number {
    return Math.max(intVal( x, defaultValue ), 0);
}

/**
 * Converts the input argument @x to unsigned (positive) float. Negative
 * numbers are converted to their absolute value.
 * @param x The value to convert. Should be a number or numeric string.
 * @param defaultValue The default value that is returned in case the conversion
 * is not possible. Note that this will also be converted to unsigned float.
 * Defaults to 0.
 */
export function uFloat(x: BulkDataTools.Numeric, defaultValue?: BulkDataTools.Numeric): number {
    return Math.max(floatVal( x, defaultValue ), 0);
}

/**
 * Tests if the given argument is an object
 * @param x The value to test
 */
export function isObject(x: any): boolean {
    return !!x && typeof x == "object";
}

/**
 * Returns a function that will return true if called with argument equal to @value.
 * @param value The value to compare with.
 */
export function equals(value: any): (x: any) => boolean {
    return (x: any) => x === value;
}

/**
 * Tests if the given argument is a function
 * @param x The value to test
 */
export function isFunction(x: any): boolean {
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
export function getPath(obj: BulkDataTools.IAnyObject, path: string = ""): any {
    return path.split(".").reduce((out, key) => out ? out[key] : undefined, obj);
}

/**
 * Finds a path in the given object and sets its value
 * @param {*} obj
 * @param {*} path
 * @param {*} value
 */
export function setPath(obj: BulkDataTools.IAnyObject, path: string | string[] | number, value: any): void {
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
export function strPad(str: string, length: number = 0): string {
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
    const fd = openSync(filePath, "r");
    const chunk = Buffer.alloc(CHUNK_SIZE, "", "utf8");

    let eolPos;
    let blob = "";

    // $lab:coverage:off$
    while (true) {
    // $lab:coverage:on$
        eolPos = blob.indexOf("\n");

        // buffered line
        if (eolPos > -1) {
            yield blob.substring(0, eolPos);
            blob = blob.substring(eolPos + 1);
        }

        else {
            // Read next chunk
            const bytesRead = readSync(fd, chunk, 0, CHUNK_SIZE, null);
            if (!bytesRead) {
                closeSync(fd);
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

/**
 * Walk a directory recursively and find files that match the @filter if its a
 * RegExp, or for which @filter returns true if its a function.
 * @param {string} dir Path to directory
 * @param {RegExp|Function} [filter]
 * @returns {IterableIterator<String>}
 */
export function* filterFiles(dir: string, filter?: BulkDataTools.FileFilter): IterableIterator<string> {
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
    const files = readdirSync(dir);

    for (const file of files) {
        const pathToFile = Path.join(dir, file);
        const isDirectory = statSync(pathToFile).isDirectory();
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
 */
export function* jsonEntries(dir: string): IterableIterator<BulkDataTools.IAnyObject> {
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
export function flatObjectKeys(obj: BulkDataTools.IAnyObject, _prefix?: string): string[] {
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

/**
 * Escapes a value a value for use in delimited formats like CSV or TSV
 * - If it contains a double quote, new line or delimiter (typically a comma),
 *   the value is quoted.
 * - any contained quotes are escaped with another quote
 * - undefined is converted to empty string.
 * - everything else is converted to string (but is not quoted)
 * @param value The value to escape
 * @param [delimiter=","] A delimiter character like `,` or `;`
 * @returns The escaped value
 */
export function escapeDelimitedValue(value: any, delimiter: string = ","): string
{
    let out = value === undefined ? "" : String(value);
    out = out.replace(/"/g, '""');
    if (out.indexOf(delimiter) > -1 || out.search(/\r|\n|"/) > -1) {
        out = `"${out}"`;
    }
    return out;
}

/**
 * Merges the second argument into the first one but also throws if an object
 * property is about to be overridden with scalar (or the opposite).
 * @param obj1 The object which should be extended
 * @param obj2 The object which should be merged into
 * the other one
 * @throws {Error} If a path in one object points to scalar value and the same
 * path in the other object points to an object (or the opposite).
 * @returns Returns the extended first argument
 */
export function mergeStrict(obj1: BulkDataTools.IAnyObject, obj2: BulkDataTools.IAnyObject): BulkDataTools.IAnyObject {
    for (const key in obj2) {
        const source         = obj2[key];
        const target         = obj1[key];
        const sourceIsObject = isObject(source);
        const targetIsObject = isObject(target);

        if (target && sourceIsObject !== targetIsObject) {
            throw new Error(
                "Unable to merge incompatible objects" +
                " (array or object with scalar value)"
            );
        }

        if (sourceIsObject) {
            if (target === undefined) {
                obj1[key] = Array.isArray(source) ? [] : {};
            }

            if (Array.isArray(source) !== Array.isArray(obj1[key])) {
                throw new Error(
                    "Unable to merge incompatible objects" +
                    " (mix array and object)"
                );
            }

            obj1[key] = mergeStrict(obj1[key], source);
        }
        else {
            obj1[key] = source;
        }
    }

    return obj1;
}

/**
 * Splits the line into cells using the provided delimiter (or by comma by
 * default) and returns the cells array. supports quoted strings and escape
 * sequences.
 * @param line The line to parse
 * @param delimiter The delimiter to use (defaults to ",")
 * @returns The cells as array of strings
 */
export function parseDelimitedLine(line: string, delimiter: string = ","): string[] {
    const out: string[] = [];
    const len: number   = line.length;

    let idx    = 0,
        char   = "",
        expect = null,
        buffer = "";

    while (idx < len) {
        char = line[idx++];
        switch (char) {

        // String
        case '"':

            // begin string
            if (!expect) {
                expect = char;
                break;
            }

            // Escaped quote - continue string
            if (line[idx] === char) {
                buffer += char;
                idx++;
                break;
            }

            // Close string
            expect = null;
            out.push(buffer);
            buffer = "";
            idx++;
            break;

        // delimiter
        case delimiter:
            if (!expect) {
                out.push(buffer);
                buffer = "";
            }
            else {
                buffer += char;
            }
            break;

        default:
            buffer += char;
            break;
        }
    }

    if (buffer) {
        out.push(buffer);
        buffer = "";
    }

    if (expect) {
        throw new SyntaxError(`Syntax error - unterminated string. Expecting '"'`);
    }

    return out.map(s => s.trim());
}

/**
 * Loops over an array of objects or arrays (rows) and builds a header that
 * matches the structure of the rows.
 * @param array The array of row objects or arrays
 * @param options
 * @param [options.fast] If true, assumes that all rows have the same
 * structure and only use the first one to build the header.
 * @returns The header as an array of strings
 */
export function delimitedHeaderFromArray(
    array: BulkDataTools.IAnyObject[] | IterableIterator<BulkDataTools.IAnyObject>,
    options: { fast?: boolean } = {}
): string[] {
    let out = {};
    for (const json of array) {
        if (options.fast) {
            return flatObjectKeys(json);
        }
        out = mergeStrict(out, json);
    }
    return flatObjectKeys(out);
}
