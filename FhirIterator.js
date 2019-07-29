import { walkSync, readLine, getPath } from "./lib"
import { readFileSync } from "fs";

function equals(value) {
    return x => x === value; 
}

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
            const check = typeof where[path] == "function" ? where[path] : equals(where[path])
            if (check(getPath(json, path))) {
                yield json;
            }
        }
    }
}

export function find(dir, where = {}) {
    for (let json of jsonEntries(dir)) {
        for (let path in where) {
            const check = typeof where[path] == "function" ? where[path] : equals(where[path])
            if (check(getPath(json, path))) {
                return json;
            }
        }
    }
}