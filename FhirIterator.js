import { walkSync, readLine, getPath } from "./lib"
import { readFileSync } from "fs";

function equals(value) {
    return x => x === value; 
}

function isFunction(x) {
    return typeof x == "function";
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
export function* jsonEntries(dir)
{
    for (let file of walkSync(dir)) {
        if (file.match(/\.json$/i)) {
            yield JSON.parse(readFileSync(file, "utf8"));
        }
        else if (file.match(/\.ndjson$/i)) {
            for (let line of readLine(file)) {
                yield JSON.parse(line);
            }
        }
    }
}

export function* filter(dir, where = {}) {
    for (let json of jsonEntries(dir)) {
        for (let path in where) {
            const check = isFunction(where[path]) ? where[path] : equals(where[path])
            if (check(getPath(json, path))) {
                yield json;
            }
        }
    }
}

export function find(dir, where = {}) {
    for (let json of jsonEntries(dir)) {
        for (let path in where) {
            const check = isFunction(where[path]) ? where[path] : equals(where[path])
            if (check(getPath(json, path))) {
                return json;
            }
        }
    }
}