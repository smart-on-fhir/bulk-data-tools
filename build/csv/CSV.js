"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Collection_1 = __importDefault(require("../Collection"));
const lib_1 = require("../lib");
/**
 * This class represents a collection in delimited format.
 * - An instance can be created from different kinds of input using the static
 * methods starting with `from` and converted to other kinds of output using the
 * instance methods starting with `to`.
 * - This class is designed to handle large files or directories by using
 * iterators and reading files one line at a time.
 * - The `entries` iterator will yield json objects for each line.
 */
class CSV extends Collection_1.default {
    constructor() {
        super(...arguments);
        /**
         * The value delimiter to use while parsing and serializing.
         */
        this._delimiter = ",";
        /**
         * The line separator to use while converting to string.
         */
        this._eol = "\r\n";
    }
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
     * Serializes the contents of the collection to a string. The subclasses
     * must implement this depending on the output format they represent.
     */
    toString() {
        return "";
    }
    /**
     * Converts the contents of the collection to an array of strings. The
     * subclasses must implement this depending on the output format they
     * represent.
     */
    toStringArray() {
        return [];
    }
    /**
     * Writes the collection to a file. The subclasses must implement this
     * depending on the output format they represent.
     */
    toFile(path, options) {
        return this;
    }
    // =========================================================================
    // Input Methods
    // =========================================================================
    /**
     * If we have the entire csv as a string, we can create an instance
     * of CSV which will provide the `lines` and `entries` iterators like so:
     * ```js
     * const csv = CSV.fromString("a,b\n1,2\r\n3,4");
     * csv.lines();   // Lines iterator -> "1,2", "3,4"
     * csv.entries(); // JSON iterator  -> { a: "1", b: "2" }, { a: "3", b: "4" }
     * ```
     * @param input The input string that can be parsed as CSV or TSV
     */
    static fromString(input, delimiter = ",") {
        const lines = input.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        return CSV.fromStringArray(lines);
    }
    /**
     * If we have the entire collection as an array of string lines, we can
     * create an instance like so:
     * ```js
     * const csv = CSV.fromStringArray(["a,b", "1,2", "3,4"]);
     * csv.lines();   // Lines iterator -> "1,2", "3,4"
     * csv.entries(); // JSON iterator  -> { a: "1", b: "2" }, { a: "3", b: "4" }
     * ```
     * The fist line is used as header!
     * @param arr An array of strings that can be parsed as CSV or TSV
     */
    static fromStringArray(arr) {
        // Create the output instance
        const out = new CSV();
        // Split into lines
        const lines = arr.map(l => l.trim()).filter(Boolean);
        if (lines.length > 0) {
            // Use the first line as header
            const header = lib_1.parseDelimitedLine(lines.shift());
            // lines will exclude the first line (assumed to be the header)
            out.setLines(() => lines.values());
            // Entries are the json objects representing each line
            out.setEntries(function* () {
                for (const l of lines) {
                    const entry = {};
                    const line = lib_1.parseDelimitedLine(l);
                    header.forEach((key, index) => {
                        entry[key] = line[index];
                    });
                    yield entry;
                }
            });
        }
        return out;
    }
    /**
     * If we happen to have the entire csv as array of objects, we can create an
     * instance like so:
     * ```js
     * const csv = CSV.fromArray([{ a: "1", b: "2" }, { a: "3", b: "4" }]);
     * csv.lines();   // Lines iterator -> "1,2", "3,4"
     * csv.entries(); // JSON iterator  -> { a: "1", b: "2" }, { a: "3", b: "4" }
     * ```
     * In this case we already have entries and we only need to handle their
     * serialization in the `lines` iterator.
     * @param arr An array of objects that can be serialized as JSON
     */
    static fromArray(arr, strict = false) {
        const out = new CSV();
        out.setEntries(() => arr.values());
        const header = lib_1.delimitedHeaderFromArray(arr, { fast: !strict });
        out.setLines(function* () {
            for (const entry of arr) {
                yield header
                    .map(key => lib_1.escapeDelimitedValue(entry[key]))
                    .join(",");
            }
        });
        return out;
    }
    /**
     * Creates and returns an NDJSON instance from directory path. This will
     * walk (recursively) through the directory and collect all the files having
     * a `.ndjson` extension. The `lines` and `entries` iterators will yield
     * results from all those files combined. Example:
     * ```js
     * const ndjson = CSV.fromDirectory("/path/to/directory/containing/ndjson/files");
     * ndjson.lines();   // Lines iterator
     * ndjson.entries(); // JSON iterator
     * ```
     * @param path Absolute path to directory
     */
    static fromDirectory(path) {
        const files = lib_1.filterFiles(path, /\.ndjson$/i);
        const out = new CSV();
        function* lines() {
            for (const filePath of files) {
                try {
                    const ndjson = CSV.fromFile(filePath);
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
                    const ndjson = CSV.fromFile(filePath);
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
     * Creates and returns an instance from a file path. The `lines` and
     * `entries` iterators will read the file one line at a time. Example:
     * ```js
     * const csv = CSV.fromFile("/path/to/file.csv");
     * csv.lines();   // Lines iterator
     * csv.entries(); // Entries iterator
     * ```
     * @param path Absolute path to CSV or TSV file
     */
    static fromFile(path) {
        function* lines() {
            const _lines = lib_1.readLine(path);
            let headerSkip;
            for (let line of _lines) {
                if (!headerSkip) {
                    headerSkip = 1;
                    continue;
                }
                line = line.trim();
                if (line) {
                    yield line;
                }
            }
        }
        function* entries(delimiter = ",") {
            let header;
            for (const line of lib_1.readLine(path)) {
                const arr = lib_1.parseDelimitedLine(line.trim());
                if (!header) {
                    header = arr;
                }
                else {
                    const entry = {};
                    header.forEach((key, index) => {
                        entry[key] = arr[index];
                    });
                    yield entry;
                }
            }
        }
        const out = new CSV();
        out.setLines(lines);
        out.setEntries(entries);
        return out;
    }
}
exports.default = CSV;
