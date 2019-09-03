import {
    isObject,
    flatObjectKeys,
    getPath
} from "./lib";



/**
 * Escapes a value as CSV value
 * - If it contains a double quote, new line or separator (typically a comma),
 *   the value is quoted
 * - any contained quotes are escaped with another quote
 * - undefined is converted to empty string
 * - everything else is converted to string (but is not quoted)
 * @param value The value to escape
 * @param [separator=","] A separator character like `,` or `;`
 * @returns The escaped value
 */
export function escapeCsvValue(value: any, separator: string = ","): string
{
    let out = value === undefined ? "" : String(value);
    out = out.replace(/"/g, '""');
    if (out.indexOf(separator) > -1 || out.search(/\r|\n|"/) > -1) {
        out = `"${out}"`;
    }
    return out;
}

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
export function mergeStrict(obj1: BulkDataTools.IAnyObject, obj2: BulkDataTools.IAnyObject): BulkDataTools.IAnyObject
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
        return header.map(path => escapeCsvValue(getPath(json, path))).join(separator);
    });
    return header.map(h => escapeCsvValue(h)).join(separator) +
        eol + body.join(eol);
}

export function jsonArrayToTsv(array: BulkDataTools.IAnyObject[], { fast = false, separator = "\t", eol = "\r\n" } = {})
{
    return jsonArrayToCsv(array, { fast, separator, eol });
}

export function jsonToCsv(json: BulkDataTools.IAnyObject, { separator = ",", eol = "\r\n" } = {})
{
    const header = flatObjectKeys(csvHeaderFromJson(json));
    const body   = header.map(path => escapeCsvValue(getPath(json, path)));
    return header.map(h => escapeCsvValue(h)).join(separator) +
        eol + body.join(separator);
}

export function jsonToTsv(json: BulkDataTools.IAnyObject, { separator = "\t", eol = "\r\n" } = {})
{
    return jsonToCsv(json, { separator, eol });
}

/**
 * Splits the line into cells using the provided delimiter (or by comma by
 * default) and returns the cells array. supports quoted strings and escape
 * sequences.
 * @param line The line to parse
 * @param delimiter The delimiter to use (defaults to ",")
 * @returns The cells as array of strings
 */
export function parseDelimitedLine(line: string, delimiter: string = ","): string[]
{
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


