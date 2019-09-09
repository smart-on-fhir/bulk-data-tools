"use strict";
/// <reference path="../index.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const Collection_1 = require("./Collection");
const lib_1 = require("./lib");
/**
 * This class represents a collection of JSON objects. An instance can be
 * created from different kinds of input using the static methods starting with
 * `from` and converted to other kinds of output using the instance methods
 * starting with `to`. This class is designed to handle large directories by
 * using iterators and reading one file at a time.
 */
class JSONCollection extends Collection_1.default {
    /**
     * If we have the entire json as a string, we can create an instance
     * of JSONCollection which will provide the `lines` and `entries` iterators
     * like so:
     * ```js
     * const json = JSONCollection.fromString("[{},{}]");
     * json.lines();   // Lines iterator
     * json.entries(); // JSON iterator
     * ```
     * @param input The input string that can be parsed as JSON
     */
    static fromString(input) {
        const out = new JSONCollection();
        let arr = JSON.parse(input);
        if (!Array.isArray(arr)) {
            arr = [arr];
        }
        out.setLines(() => arr.map(o => JSON.stringify(o)).values());
        out.setEntries(() => arr.values());
        return out;
    }
    /**
     * If we happen to have the entire json as array of objects, we can create a
     * JSONCollection instance like so:
     * ```js
     * const json = JSONCollection.fromArray([ {}, {} ]);
     * json.lines();   // Lines iterator
     * json.entries(); // JSON iterator
     * ```
     * @param arr An array of objects that can be serialized as JSON
     */
    static fromArray(arr) {
        const out = new JSONCollection();
        const lines = arr.map(l => JSON.stringify(l));
        out.setLines(() => lines.values());
        out.setEntries(() => arr.values());
        return out;
    }
    /**
     * If we have the entire json as array of strings, we can create an instance
     * like so:
     * ```js
     * const json = JSONCollection.fromStringArray(["{}", "{}" ]);
     * json.lines();   // Lines iterator
     * json.entries(); // JSON iterator
     * ```
     * @param arr An array of strings that can be parsed as JSON
     */
    static fromStringArray(arr) {
        const out = new JSONCollection();
        const entries = arr.map(l => JSON.parse(l));
        out.setLines(() => entries.map(o => JSON.stringify(o)).values());
        out.setEntries(() => entries.values());
        return out;
    }
    /**
     * Creates and returns a JSONCollection instance from directory path. This
     * will walk (recursively) through the directory and collect all the files
     * having a `.json` extension. The `lines` and `entries` iterators will
     * yield results from all those files combined. Example:
     * ```js
     * const json = JSONCollection.fromDirectory("/path/to/directory/containing/json/files");
     * json.lines();   // Lines iterator
     * json.entries(); // JSON iterator
     * ```
     * @param path Absolute path to directory
     */
    static fromDirectory(path) {
        const out = new JSONCollection();
        function* lines() {
            for (const filePath of lib_1.filterFiles(path, /\.json$/i)) {
                try {
                    const json = JSONCollection.fromFile(filePath);
                    const _lines = json.lines();
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
            for (const filePath of lib_1.filterFiles(path, /\.json$/i)) {
                try {
                    const ndjson = JSONCollection.fromFile(filePath);
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
     * Creates and returns an JSON collection instance from a file path. Example:
     * ```js
     * const json = JSONCollection.fromFile("/path/to/file.json");
     * json.lines();   // Lines iterator
     * json.entries(); // JSON iterator
     * ```
     * @param path Absolute path to NDJSON file
     */
    static fromFile(path) {
        return JSONCollection.fromString(fs_1.readFileSync(path, "utf8"));
    }
    // =========================================================================
    // Output Methods
    // =========================================================================
    /**
     * Returns a string representation of the NDJSON object.
     * **NOTE:** The string takes memory. Don't use this for big JSON
     * (that represent a big file or directory). Use the `lines` or `entries`
     * iterators instead to handle one entry at a time.
     */
    toString() {
        return "[" + [...this._lines()].join(",") + "]";
    }
    /**
     * Returns an array of JSON strings representing of the JSON collection.
     * **NOTE:** The array takes memory. Don't use this for big JSON objects
     * (that represent a big file or directory). Use the `lines` or `entries`
     * iterators instead to handle one entry at a time.
     */
    toStringArray() {
        return [...this._lines()];
    }
    /**
     * Returns an array of JSON objects representing of the JSON collection.
     * **NOTE:** The array takes memory. Don't use this for big JSON collections
     * (that represent a big file or directory). Use the `lines` or `entries`
     * iterators instead to handle one entry at a time.
     */
    toArray() {
        return [...this.entries()];
    }
    /**
     * Writes the JSON collection to file. The file can be (re)created or appended
     * to. Example:
     * ```js
     * const ndjson = JSONCollection.fromStringArray(["{}", "{}" ]);
     *
     * // Create or overwrite the file with default settings
     * ndjson.toFile("/my/output.ndjson");
     *
     * // Or use custom settings:
     * ndjson.toFile("/my/output.ndjson", {
     *     eol: "\r\n",
     *     append: true
     * });
     * ```
     */
    toFile(path, options = {}) {
        if (!options.append) {
            fs_1.writeFileSync(path, "");
        }
        fs_1.writeFileSync(path, "[", { encoding: "utf8", flag: "a" });
        let count = 0;
        for (const line of this.lines()) {
            fs_1.writeFileSync(path, `${++count > 1 ? "," : ""}${line}`, {
                encoding: "utf8",
                flag: "a"
            });
        }
        fs_1.writeFileSync(path, "]", { encoding: "utf8", flag: "a" });
        return this;
    }
    /**
     * Converts the instance to NDJSON string.
     *
     * **NOTE:** Don't use this for big objects/directories because the output
     * string is built into memory and then returned. For big collections
     * iterate over the entries instead and serialize one line at a time:
     * ```js
     * for (const entry of collection.entries()) {
     *     const line = JSON.stringify(entry);
     * }
     * ```
     * @param eol The new line character to use. Defaults to `\r\n`.
     */
    toNDJSON(eol = "\r\n") {
        let out = "", len = 0;
        for (const item of this.entries()) {
            if (++len > 1) {
                out += eol;
            }
            out += JSON.stringify(item);
        }
        return out;
    }
}
exports.default = JSONCollection;
