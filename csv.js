const { forEachLine } = require("./ndjson");
const { isObject } = require("./lib");

function strPad(str, length = 0) {
    let strLen = str.length;
    while (strLen < length) {
        str += " ";
        strLen += 1;
    }
    return str;
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
function getPath(obj, path = "")
{
    return path.split(".").reduce((out, key) => out ? out[key] : undefined, obj);
}

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
function escapeCsvValue(value, separator = ",")
{
    let out = value === undefined ? "" : String(value);
    out = out.replace(/"/g, '""');
    if (out.indexOf(separator) > -1 || out.search(/\r|\n|"/) > -1) {
        out = `"${out}"`;
    }
    return out;
}

/**
 * Returns a flattened array of the structure of an object or array.
 * For example:
 * ```js
 * {a:1, b:{c:2,d:3}, e:4} -> ["a", "b.c", "b.d", "e"]
 * {a:1, b:[ 2, 3 ], e: 4} -> ["a", "b.0", "b.1", "e"]
 * [1, {a: 3, b: 4}, 2, 3] -> ["0", "1.a", "1.b", "2", "3"]
 * ```
 * @param {Object|Array} obj The object to inspect
 * @param {String} _prefix Path prefix that if provided, will be prepended to
 * each key. Please do not use this argument. The function will pass it to
 * itself on recursive calls.
 * @returns {String[]}
 */
function flatObjectKeys(obj, _prefix)
{
    let out = [];

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
 * Merges the second argument into the first one but also throws if an object
 * property is about to be overridden with scalar (or the opposite).
 * @param {Object} obj1 
 * @param {Object} obj2 
 * @throws {Error} If a path in one object points to scalar value and the same
 * path in the other object points to an object (or the opposite).
 * @returns {Object} Returns the extended first argument
 */
function mergeStrict(obj1, obj2)
{
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

function csvHeaderFromJson(json)
{
    function loop(data) {
        let out = {};

        for (const key in data) {
            const value = data[key];
            if (isObject(value)) {
                out[key] = loop(value);
            } else {
                out[key] = 1;
            }
        }

        return out;
    }

    return loop(json);
}

/**
 * Loops over an array of objects or arrays (rows) and builds a header that
 * matches the structure of the rows.
 * @param {Object[]|Array[]} array The array of row objects or arrays
 * @param {Object} options
 * @param {Boolean} options.fast If true, assumes that all rows have the same
 * structure and only use the first one to build the header.
 * @returns {String[]} The header as an array of strings
 */
function csvHeaderFromArray(array, options = {})
{
    if (options.fast) {
        return flatObjectKeys(csvHeaderFromJson(array[0]));
    }

    let out = {};
    array.forEach(json => {
        out = mergeStrict(out, csvHeaderFromJson(json));
    });
    return flatObjectKeys(out);
}

function jsonArrayToCsv(array, { fast = false, separator = ",", eol = "\r\n" } = {})
{
    const header = csvHeaderFromArray(array, { fast });
    const body   = array.map(json => {
        return header.map(path => escapeCsvValue(getPath(json, path))).join(separator);
    });
    return header.map(h => escapeCsvValue(h)).join(separator) +
        eol + body.join(eol);
}

function jsonArrayToTsv(array, { fast = false, separator = "\t", eol = "\r\n" } = {})
{
    return jsonArrayToCsv(array, { fast, separator, eol });
}

function jsonToCsv(json, { separator = ",", eol = "\r\n" } = {})
{
    const header = flatObjectKeys(csvHeaderFromJson(json));
    const body   = header.map(path => escapeCsvValue(getPath(json, path)));
    return header.map(h => escapeCsvValue(h)).join(separator) +
        eol + body.join(separator);
}

function jsonToTsv(json, { separator = "\t", eol = "\r\n" } = {})
{
    return jsonToCsv(json, { separator, eol });
}

/**
 * Splits the line into cells using the provided delimiter (or by comma by
 * default) and returns the cells array. supports quoted strings and escape
 * sequences.
 * @param {String} line The line to parse
 * @param {String} delimiter The delimiter to use (defaults to ",")
 * @returns {String[]} The cells as array of strings
 */
function parseDelimitedLine(line, delimiter = ",")
{
    let out        = [],
        idx        = 0,
        len        = line.length,
        char       = "",
        expect     = null,
        buffer     = "";

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
            idx++
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

    return out.map(o => o.trim());
}

module.exports = {
    csvHeaderFromJson,
    csvHeaderFromArray,
    flatObjectKeys,
    jsonToCsv,
    jsonToTsv,
    jsonArrayToCsv,
    jsonArrayToTsv,
    getPath,
    escapeCsvValue,
    mergeStrict,
    parseDelimitedLine
};

