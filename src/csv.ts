import {
    isObject,
    flatObjectKeys,
    escapeDelimitedValue,
    mergeStrict,
    getPath
} from "./lib";




export function csvHeaderFromJson(json: BulkDataTools.IAnyObject): BulkDataTools.IAnyObject
{
    function loop(data: BulkDataTools.IAnyObject) {
        const out: BulkDataTools.IAnyObject = {};

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
 * @param array The array of row objects or arrays
 * @param options
 * @param [options.fast] If true, assumes that all rows have the same
 * structure and only use the first one to build the header.
 * @returns The header as an array of strings
 */
export function csvHeaderFromArray(
    array: BulkDataTools.IAnyObject[],
    options: { fast?: boolean } = {}
): string[] {
    if (options.fast) {
        return flatObjectKeys(csvHeaderFromJson(array[0]));
    }

    let out = {};
    array.forEach(json => {
        out = mergeStrict(out, csvHeaderFromJson(json));
    });
    return flatObjectKeys(out);
}

export function jsonArrayToCsv(array: BulkDataTools.IAnyObject[], { fast = false, separator = ",", eol = "\r\n" } = {})
{
    const header = csvHeaderFromArray(array, { fast });
    const body   = array.map(json => {
        return header.map(path => escapeDelimitedValue(getPath(json, path))).join(separator);
    });
    return header.map(h => escapeDelimitedValue(h)).join(separator) +
        eol + body.join(eol);
}

export function jsonArrayToTsv(array: BulkDataTools.IAnyObject[], { fast = false, separator = "\t", eol = "\r\n" } = {})
{
    return jsonArrayToCsv(array, { fast, separator, eol });
}

export function jsonToCsv(json: BulkDataTools.IAnyObject, { separator = ",", eol = "\r\n" } = {})
{
    const header = flatObjectKeys(csvHeaderFromJson(json));
    const body   = header.map(path => escapeDelimitedValue(getPath(json, path)));
    return header.map(h => escapeDelimitedValue(h)).join(separator) +
        eol + body.join(separator);
}

export function jsonToTsv(json: BulkDataTools.IAnyObject, { separator = "\t", eol = "\r\n" } = {})
{
    return jsonToCsv(json, { separator, eol });
}



