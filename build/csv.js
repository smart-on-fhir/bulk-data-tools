"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("./lib");
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
 * @param array The array of row objects or arrays
 * @param options
 * @param [options.fast] If true, assumes that all rows have the same
 * structure and only use the first one to build the header.
 * @returns The header as an array of strings
 */
function csvHeaderFromArray(array, options = {}) {
    if (options.fast) {
        return lib_1.flatObjectKeys(csvHeaderFromJson(array[0]));
    }
    let out = {};
    array.forEach(json => {
        out = lib_1.mergeStrict(out, csvHeaderFromJson(json));
    });
    return lib_1.flatObjectKeys(out);
}
exports.csvHeaderFromArray = csvHeaderFromArray;
function jsonArrayToCsv(array, { fast = false, separator = ",", eol = "\r\n" } = {}) {
    const header = csvHeaderFromArray(array, { fast });
    const body = array.map(json => {
        return header.map(path => lib_1.escapeDelimitedValue(lib_1.getPath(json, path))).join(separator);
    });
    return header.map(h => lib_1.escapeDelimitedValue(h)).join(separator) +
        eol + body.join(eol);
}
exports.jsonArrayToCsv = jsonArrayToCsv;
function jsonArrayToTsv(array, { fast = false, separator = "\t", eol = "\r\n" } = {}) {
    return jsonArrayToCsv(array, { fast, separator, eol });
}
exports.jsonArrayToTsv = jsonArrayToTsv;
function jsonToCsv(json, { separator = ",", eol = "\r\n" } = {}) {
    const header = lib_1.flatObjectKeys(csvHeaderFromJson(json));
    const body = header.map(path => lib_1.escapeDelimitedValue(lib_1.getPath(json, path)));
    return header.map(h => lib_1.escapeDelimitedValue(h)).join(separator) +
        eol + body.join(separator);
}
exports.jsonToCsv = jsonToCsv;
function jsonToTsv(json, { separator = "\t", eol = "\r\n" } = {}) {
    return jsonToCsv(json, { separator, eol });
}
exports.jsonToTsv = jsonToTsv;
