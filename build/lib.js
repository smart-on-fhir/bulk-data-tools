"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    if (precision || precision === 0) {
        out = roundToPrecision(out, precision);
    }
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
    if (isNaN(out) || !isFinite(out)) {
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
function uInt(x, defaultValue) {
    return Math.max(intVal(x, defaultValue), 0);
}
exports.uInt = uInt;
function uFloat(x, defaultValue) {
    return Math.max(floatVal(x, defaultValue), 0);
}
exports.uFloat = uFloat;
/**
 * Tests if the given argument is an object
 * @param {*} x The value to test
 * @returns {Boolean}
 */
function isObject(x) {
    return !!x && typeof x == "object";
}
exports.isObject = isObject;
function equals(value) {
    return (x) => x === value;
}
exports.equals = equals;
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
