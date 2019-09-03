"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lib_1 = require("../lib");
const Collection_1 = __importDefault(require("../Collection"));
/**
 * This class represents a CSV object. An instance can be created from
 * different kinds of input using the static methods starting with `from` and
 * converted to other kinds of output using the instance methods starting with
 * `to`. This class is designed to handle large files or directories by using
 * iterators and reading files one line at a time.
 */
class CSV extends Collection_1.default {
    /**
     * Converts the contents of the collection to array of "values". The
     * subclasses must implement this depending on the output format they
     * represent.
     */
    toArray() {
        const out = [];
        for (const entry of this._entries()) {
            out.push(entry);
        }
        return out;
    }
    /**
     * Splits the line into cells using the provided delimiter (or by comma by
     * default) and returns the cells array. supports quoted strings and escape
     * sequences.
     * @param line The line to parse
     * @param delimiter The delimiter to use (defaults to ",")
     * @returns The cells as array of strings
     */
    static parseLine(line, delimiter = ",") {
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
    // =========================================================================
    // Input Methods
    // =========================================================================
    /**
     * If we have the entire csv as a string, we can create an instance
     * of CSV which will provide the `lines` and `entries` iterators like so:
     * ```js
     * const csv = CSV.fromString("a,b\n1,2");
     * csv.lines();   // Lines iterator
     * csv.entries(); // JSON iterator
     * ```
     * @param input The input string that can be parsed as CSV
     */
    static fromString(input, delimiter = ",") {
        const lines = input.split(/\r?\n/);
        const out = new CSV();
        const entries = lines.map(l => CSV.parseLine(l, delimiter));
        out.setLines(() => lines.values());
        out.setEntries(() => entries.values());
        return out;
    }
    /**
     * If we happen to have the entire csv as array, we can create a CSV
     * instance like so:
     * ```js
     * const csv = CSV.fromArray([ {}, {} ]);
     * csv.lines();   // Lines iterator
     * csv.entries(); // JSON iterator
     * ```
     * @param arr An array of objects that can be serialized as JSON
     */
    static fromArray(arr) {
        const out = new CSV();
        const lines = arr.map(l => JSON.stringify(l));
        out.setLines(() => lines.values());
        out.setEntries(() => arr.values());
        return out;
    }
    /**
     * If we have the entire ndjson as array of strings, we can create an NDJSON
     * instance like so:
     * ```js
     * const ndjson = NDJSON.fromStringArray(["{}", "{}" ]);
     * ndjson.lines();   // Lines iterator
     * ndjson.entries(); // JSON iterator
     * ```
     * @param arr An array of strings that can be parsed as JSON
     */
    static fromStringArray(arr) {
        const out = new NDJSON();
        const entries = arr.map(l => JSON.parse(l));
        out.setLines(() => entries.map(o => JSON.stringify(o)).values());
        out.setEntries(() => entries.values());
        return out;
    }
    /**
     * Creates and returns an NDJSON instance from directory path. This will
     * walk (recursively) through the directory and collect all the files having
     * a `.ndjson` extension. The `lines` and `entries` iterators will yield
     * results from all those files combined. Example:
     * ```js
     * const ndjson = NDJSON.fromDirectory("/path/to/directory/containing/ndjson/files");
     * ndjson.lines();   // Lines iterator
     * ndjson.entries(); // JSON iterator
     * ```
     * @param path Absolute path to directory
     */
    static fromDirectory(path) {
        const files = lib_1.filterFiles(path, /\.ndjson$/i);
        const out = new NDJSON();
        function* lines() {
            for (const filePath of files) {
                try {
                    const ndjson = NDJSON.fromFile(filePath);
                    const _lines = ndjson.lines();
                    for (const line of _lines) {
                        yield line;
                    }
                }
                catch (e) {
                    throw new Error(`File: ${filePath} - ${e}`);
                }
            }
        }
        function* entries() {
            for (const filePath of files) {
                try {
                    const ndjson = NDJSON.fromFile(filePath);
                    const _entries = ndjson.entries();
                    for (const entry of _entries) {
                        yield entry;
                    }
                }
                catch (e) {
                    throw new Error(`File: ${filePath} - ${e}`);
                }
            }
        }
        out.setLines(lines);
        out.setEntries(entries);
        return out;
    }
    /**
     * Creates and returns a CSV instance from a file path. Example:
     * ```js
     * const csv = CSV.fromFile("/path/to/file.csv");
     * csv.lines();   // Lines iterator
     * csv.entries(); // Entries iterator
     * ```
     * @param path Absolute path to CSV file
     */
    static fromFile(path) {
        function* lines() {
            const _lines = lib_1.readLine(path);
            for (let line of _lines) {
                line = line.trim();
                if (line) {
                    yield line;
                }
            }
        }
        function* entries(delimiter = ",") {
            for (const line of lines()) {
                yield CSV.parseLine(line);
            }
        }
        const out = new CSV();
        out.setLines(lines);
        out.setEntries(entries);
        return out;
    }
}
exports.default = CSV;
