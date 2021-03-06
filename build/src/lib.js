"use strict";
/// <reference path="../index.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const Path = require("path");
/**
 * Rounds the given number @n using the specified precision.
 * @param {Number|String} n
 * @param {Number} [precision]
 * @param {Number} [fixed] The number of decimal units for fixed precision. For
 *   example `roundToPrecision(2.1, 1, 3)` will produce `"2.100"`, while
 *   `roundToPrecision(2.1, 3)` will produce `2.1`.
 * @returns {Number|String} Returns a number, unless a fixed precision is used
 */
function roundToPrecision(n, precision, fixed) {
    n = parseFloat(n + "");
    if (isNaN(n) || !isFinite(n)) {
        return NaN;
    }
    if (!precision || isNaN(precision) || !isFinite(precision) || precision < 1) {
        n = Math.round(n);
    }
    else {
        const q = Math.pow(10, precision);
        n = Math.round(n * q) / q;
    }
    if (fixed) {
        n = Number(n).toFixed(fixed);
    }
    return n;
}
exports.roundToPrecision = roundToPrecision;
/**
 * Obtains a human-readable file size string (1024 based).
 * @param {Number} bytes The file size in bytes
 * @param {Number} precision (optional) Defaults to 2
 * @return {String}
 */
function readableFileSize(bytes, options) {
    const { precision = 2, fixed = 0, useBinary = false } = options || {};
    let i = 0;
    const base = useBinary ? 1024 : 1000;
    const units = useBinary ?
        ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"] :
        ["Bytes", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    while (bytes >= base && i < units.length - 1) {
        bytes = bytes / base;
        i++;
    }
    let out = Math.max(bytes, 0);
    // if (precision || precision === 0) {
    out = roundToPrecision(out, precision);
    // }
    if (fixed) {
        out = out.toFixed(fixed);
    }
    return out + " " + units[i];
}
exports.readableFileSize = readableFileSize;
/**
 * Returns the int representation of the first argument or the
 * "defaultValue" if the int conversion is not possible.
 * @param {BulkDataTools.Numeric} x - The argument to convert
 * @param {BulkDataTools.Numeric} defaultValue The fall-back return value. This is going to be
 * converted to integer too.
 * @return {Number} The resulting integer.
 */
function intVal(x, defaultValue) {
    let out = parseInt(x + "", 10);
    if (isNaN(out)) {
        out = defaultValue === undefined ? 0 : intVal(defaultValue);
    }
    return out;
}
exports.intVal = intVal;
/**
 * Returns the float representation of the first argument or the
 * "defaultValue" if the int conversion is not possible.
 * @param {number | string} x The argument to convert
 * @param {number | string} [defaultValue] The fall-back return value. This is going to be
 * converted to float too.
 * @return {Number} The resulting floating point number.
 */
function floatVal(x, defaultValue) {
    let out = parseFloat(x + "");
    if (isNaN(out) || !isFinite(out)) {
        out = defaultValue === undefined ? 0 : floatVal(defaultValue);
    }
    return out;
}
exports.floatVal = floatVal;
/**
 * Converts the input argument @x to unsigned (positive) integer. Negative
 * numbers are converted to their absolute value.
 * @param x The value to convert. Should be a number or numeric string.
 * @param defaultValue The default value that is returned in case the conversion
 * is not possible. Note that this will also be converted to unsigned integer.
 * Defaults to 0.
 */
function uInt(x, defaultValue) {
    return Math.max(intVal(x, defaultValue), 0);
}
exports.uInt = uInt;
/**
 * Converts the input argument @x to unsigned (positive) float. Negative
 * numbers are converted to their absolute value.
 * @param x The value to convert. Should be a number or numeric string.
 * @param defaultValue The default value that is returned in case the conversion
 * is not possible. Note that this will also be converted to unsigned float.
 * Defaults to 0.
 */
function uFloat(x, defaultValue) {
    return Math.max(floatVal(x, defaultValue), 0);
}
exports.uFloat = uFloat;
/**
 * Tests if the given argument is an object
 * @param x The value to test
 */
function isObject(x) {
    return !!x && typeof x == "object";
}
exports.isObject = isObject;
/**
 * Returns a function that will return true if called with argument equal to @value.
 * @param value The value to compare with.
 */
function equals(value) {
    return (x) => x === value;
}
exports.equals = equals;
/**
 * Tests if the given argument is a function
 * @param x The value to test
 */
function isFunction(x) {
    return typeof x == "function";
}
exports.isFunction = isFunction;
/**
 * Walks thru an object (ar array) and returns the value found at the
 * provided path. This function is very simple so it intentionally does not
 * support any argument polymorphism, meaning that the path can only be a
 * dot-separated string. If the path is invalid returns undefined.
 * @param {Object} obj The object (or Array) to walk through
 * @param {String} [path=""] The path (eg. "a.b.4.c")
 * @returns {*} Whatever is found in the path or undefined
 */
function getPath(obj, path = "") {
    return path.split(".").reduce((out, key) => out ? out[key] : undefined, obj);
}
exports.getPath = getPath;
/**
 * Finds a path in the given object and sets its value
 * @param {*} obj
 * @param {*} path
 * @param {*} value
 */
function setPath(obj, path, value) {
    const segments = Array.isArray(path) ? path : String(path).split(".");
    if (!segments.length) {
        throw new Error("Path cannot be empty");
    }
    const key = segments.shift();
    if (segments.length) {
        // Create intermediate object or array properties
        if (!obj.hasOwnProperty(key)) {
            if (segments[0].match(/^\d+$/)) {
                obj[key] = [];
            }
            else {
                obj[key] = {};
            }
        }
        // Step in
        return setPath(obj[key], segments, value);
    }
    if (obj.hasOwnProperty(key)) {
        const target = obj[key];
        const sourceIsObject = isObject(value);
        const targetIsObject = isObject(target);
        if (sourceIsObject !== targetIsObject) {
            throw new Error("Unable to merge incompatible objects" +
                " (array or object with scalar value)");
        }
        if (Array.isArray(value) !== Array.isArray(target)) {
            throw new Error("Unable to merge incompatible objects" +
                " (cannot mix arrays with objects)");
        }
    }
    obj[key] = value;
}
exports.setPath = setPath;
/**
 * Adds whitespace to the end of the string until it reaches the specified length
 * @param str The input string
 * @param length The target length of the result string
 */
function strPad(str, length = 0) {
    let strLen = str.length;
    while (strLen < length) {
        str += " ";
        strLen += 1;
    }
    return str;
}
exports.strPad = strPad;
/**
 * Reads a file line by line in a synchronous fashion. This will read the file
 * line by line without having to store more than one line in the memory (so the
 * file size does not really matter). This is much easier than an equivalent
 * readable stream implementation. It is also easier to debug and should produce
 * reliable stack traces in case of error.
 * @todo Add ability to customize the EOL or use a RegExp to match them all.
 * @param filePath The path to the file to read (preferably an absolute path)
 */
function* readLine(filePath) {
    const CHUNK_SIZE = 1024 * 64;
    const fd = fs_1.openSync(filePath, "r");
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
            const bytesRead = fs_1.readSync(fd, chunk, 0, CHUNK_SIZE, null);
            if (!bytesRead) {
                fs_1.closeSync(fd);
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
exports.readLine = readLine;
/**
 * Walk a directory recursively and find files that match the @filter if its a
 * RegExp, or for which @filter returns true if its a function.
 * @param {string} dir Path to directory
 * @param {RegExp|Function} [filter]
 * @returns {IterableIterator<String>}
 */
function* filterFiles(dir, filter) {
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
exports.filterFiles = filterFiles;
/**
 * List all files in a directory recursively in a synchronous fashion.
 * @param {String} dir
 */
function* walkSync(dir) {
    const files = fs_1.readdirSync(dir);
    for (const file of files) {
        const pathToFile = Path.join(dir, file);
        const isDirectory = fs_1.statSync(pathToFile).isDirectory();
        if (isDirectory) {
            yield* walkSync(pathToFile);
        }
        else {
            yield pathToFile;
        }
    }
}
exports.walkSync = walkSync;
/**
 * Walks a directory recursively in a synchronous fashion and yields JSON
 * objects. Only `.json` and `.ndjson` files are parsed. Yields ane JSON object
 * for each line of an NDJSON file and one object for each JSON file. Other
 * files are ignored.
 *
 * @param {String} dir A path to a directory
 */
function* jsonEntries(dir) {
    const files = walkSync(dir);
    for (const file of files) {
        if (file.match(/\.json$/i)) {
            yield JSON.parse(fs_1.readFileSync(file, "utf8"));
        }
        else if (file.match(/\.ndjson$/i)) {
            for (const line of readLine(file)) {
                yield JSON.parse(line);
            }
        }
    }
}
exports.jsonEntries = jsonEntries;
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
function flatObjectKeys(obj, _prefix) {
    let out = [];
    for (const key in obj) {
        const prefix = [_prefix, key].filter(Boolean).join(".");
        const value = obj[key];
        if (isObject(value)) {
            out = out.concat(flatObjectKeys(value, prefix));
        }
        else {
            out.push(prefix);
        }
    }
    return out;
}
exports.flatObjectKeys = flatObjectKeys;
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
function escapeDelimitedValue(value, delimiter = ",") {
    let out = value === undefined ? "" : String(value);
    out = out.replace(/"/g, '""');
    if (out.indexOf(delimiter) > -1 || out.search(/\r|\n|"/) > -1) {
        out = `"${out}"`;
    }
    return out;
}
exports.escapeDelimitedValue = escapeDelimitedValue;
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
function mergeStrict(obj1, obj2) {
    for (const key in obj2) {
        const source = obj2[key];
        const target = obj1[key];
        const sourceIsObject = isObject(source);
        const targetIsObject = isObject(target);
        if (target && sourceIsObject !== targetIsObject) {
            throw new Error("Unable to merge incompatible objects" +
                " (array or object with scalar value)");
        }
        if (sourceIsObject) {
            if (target === undefined) {
                obj1[key] = Array.isArray(source) ? [] : {};
            }
            if (Array.isArray(source) !== Array.isArray(obj1[key])) {
                throw new Error("Unable to merge incompatible objects" +
                    " (mix array and object)");
            }
            obj1[key] = mergeStrict(obj1[key], source);
        }
        else {
            obj1[key] = source;
        }
    }
    return obj1;
}
exports.mergeStrict = mergeStrict;
/**
 * Splits the line into cells using the provided delimiter (or by comma by
 * default) and returns the cells array. supports quoted strings and escape
 * sequences.
 * @param line The line to parse
 * @param delimiter The delimiter to use (defaults to ",")
 * @returns The cells as array of strings
 */
function parseDelimitedLine(line, delimiter = ",") {
    const out = [];
    const len = line.length;
    let idx = 0, char = "", expect = null, buffer = "";
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
exports.parseDelimitedLine = parseDelimitedLine;
/**
 * Loops over an array of objects or arrays (rows) and builds a header that
 * matches the structure of the rows.
 * @param array The array of row objects or arrays
 * @param options
 * @param [options.fast] If true, assumes that all rows have the same
 * structure and only use the first one to build the header.
 * @returns The header as an array of strings
 */
function delimitedHeaderFromArray(array, options = {}) {
    let out = {};
    for (const json of array) {
        if (options.fast) {
            return flatObjectKeys(json);
        }
        out = mergeStrict(out, json);
    }
    return flatObjectKeys(out);
}
exports.delimitedHeaderFromArray = delimitedHeaderFromArray;
