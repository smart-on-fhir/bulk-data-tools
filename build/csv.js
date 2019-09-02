"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
/**
 * Escapes a value as CSV value
 * - If it contains a double quote, new line or separator (typically a comma),
 *   the value is quoted
 * - any contained quotes are escaped with another quote
 * - undefined is converted to empty string
 * - everything else is converted to string (but is not quoted)
 * @param {*} value The value to escape
 * @param {String} [separator=","] A separator character like `,` or `;`
 * @returns {String} The escaped value
 */
function escapeCsvValue(value, separator = ",") {
    let out = value === undefined ? "" : String(value);
    out = out.replace(/"/g, '""');
    if (out.indexOf(separator) > -1 || out.search(/\r|\n|"/) > -1) {
        out = `"${out}"`;
    }
    return out;
}
exports.escapeCsvValue = escapeCsvValue;
/**
 * Returns a flattened array of the structure of an object or array.
 * For example:
 * ```js
 * {a:1, b:{c:2,d:3}, e:4} -> ["a", "b.c", "b.d", "e"]
 * {a:1, b:[ 2, 3 ], e: 4} -> ["a", "b.0", "b.1", "e"]
 * [1, {a: 3, b: 4}, 2, 3] -> ["0", "1.a", "1.b", "2", "3"]
 * ```
 * @param {Object|Array} obj The object to inspect
 * @param {String} [_prefix] A path prefix that if provided, will be prepended
 * to each key. Please do not use this argument. The function will pass it to
 * itself on recursive calls.
 * @returns {String[]}
 */
function flatObjectKeys(obj, _prefix) {
    let out = [];
    for (const key in obj) {
        const prefix = [_prefix, key].filter(Boolean).join(".");
        const value = obj[key];
        if (lib_1.isObject(value)) {
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
 * Merges the second argument into the first one but also throws if an object
 * property is about to be overridden with scalar (or the opposite).
 * @param {BulkDataTools.IAnyObject} obj1 The object which should be extended
 * @param {BulkDataTools.IAnyObject} obj2 The object which should be merged into
 * the other one
 * @throws {Error} If a path in one object points to scalar value and the same
 * path in the other object points to an object (or the opposite).
 * @returns {BulkDataTools.IAnyObject} Returns the extended first argument
 */
function mergeStrict(obj1, obj2) {
    for (const key in obj2) {
        const source = obj2[key];
        const target = obj1[key];
        const sourceIsObject = lib_1.isObject(source);
        const targetIsObject = lib_1.isObject(target);
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
function csvHeaderFromJson(json) {
    function loop(data) {
        const out = {};
        for (const key in data) {
            const value = data[key];
            if (lib_1.isObject(value)) {
                out[key] = loop(value);
            }
            else {
                out[key] = 1;
            }
        }
        return out;
    }
    return loop(json);
}
exports.csvHeaderFromJson = csvHeaderFromJson;
/**
 * Loops over an array of objects or arrays (rows) and builds a header that
 * matches the structure of the rows.
 * @param {Object[]|Array[]} array The array of row objects or arrays
 * @param {Object} options
 * @param {Boolean} options.fast If true, assumes that all rows have the same
 * structure and only use the first one to build the header.
 * @returns {String[]} The header as an array of strings
 */
function csvHeaderFromArray(array, options = {}) {
    if (options.fast) {
        return flatObjectKeys(csvHeaderFromJson(array[0]));
    }
    let out = {};
    array.forEach(json => {
        out = mergeStrict(out, csvHeaderFromJson(json));
    });
    return flatObjectKeys(out);
}
exports.csvHeaderFromArray = csvHeaderFromArray;
function jsonArrayToCsv(array, { fast = false, separator = ",", eol = "\r\n" } = {}) {
    const header = csvHeaderFromArray(array, { fast });
    const body = array.map(json => {
        return header.map(path => escapeCsvValue(lib_1.getPath(json, path))).join(separator);
    });
    return header.map(h => escapeCsvValue(h)).join(separator) +
        eol + body.join(eol);
}
exports.jsonArrayToCsv = jsonArrayToCsv;
function jsonArrayToTsv(array, { fast = false, separator = "\t", eol = "\r\n" } = {}) {
    return jsonArrayToCsv(array, { fast, separator, eol });
}
exports.jsonArrayToTsv = jsonArrayToTsv;
function jsonToCsv(json, { separator = ",", eol = "\r\n" } = {}) {
    const header = flatObjectKeys(csvHeaderFromJson(json));
    const body = header.map(path => escapeCsvValue(lib_1.getPath(json, path)));
    return header.map(h => escapeCsvValue(h)).join(separator) +
        eol + body.join(separator);
}
exports.jsonToCsv = jsonToCsv;
function jsonToTsv(json, { separator = "\t", eol = "\r\n" } = {}) {
    return jsonToCsv(json, { separator, eol });
}
exports.jsonToTsv = jsonToTsv;
/**
 * Splits the line into cells using the provided delimiter (or by comma by
 * default) and returns the cells array. supports quoted strings and escape
 * sequences.
 * @param {String} line The line to parse
 * @param {String} delimiter The delimiter to use (defaults to ",")
 * @returns {String[]} The cells as array of strings
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
                if (expect === char && line[idx] === char) {
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
    return out;
}
exports.parseDelimitedLine = parseDelimitedLine;