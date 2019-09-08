import { writeFileSync } from "fs";
import Collection from "./Collection";
import { filterFiles, readLine } from "./lib";

/**
 * This class represents an NDJSON object. An instance can be created from
 * different kinds of input using the static methods starting with `from` and
 * converted to other kinds of output using the instance methods starting with
 * `to`. This class is designed to handle large files or directories by using
 * iterators and reading files one line at a time.
 */
export default class NDJSON extends Collection
{
    /**
     * If we have the entire ndjson as a string, we can create an instance
     * of NDJSON which will provide the `lines` and `entries` iterators like so:
     * ```js
     * const ndjson = NDJSON.fromString("{}\n{}");
     * ndjson.lines();   // Lines iterator
     * ndjson.entries(); // JSON iterator
     * ```
     * @param input The input string that can be parsed as JSON
     */
    public static fromString(input: string): NDJSON
    {
        const lines = input.split(/\r?\n/);
        const out = new NDJSON();
        const entries = lines.map(l => JSON.parse(l));
        out.setLines(() => entries.map(o => JSON.stringify(o)).values());
        out.setEntries(() => entries.values());
        return out;
    }

    /**
     * If we happen to have the entire ndjson as array, we can create an NDJSON
     * instance like so:
     * ```js
     * const ndjson = NDJSON.fromArray([ {}, {} ]);
     * ndjson.lines();   // Lines iterator
     * ndjson.entries(); // JSON iterator
     * ```
     * @param arr An array of objects that can be serialized as JSON
     */
    public static fromArray(arr: BulkDataTools.IAnyObject[]): NDJSON
    {
        const out = new NDJSON();
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
    public static fromStringArray(arr: string[]): NDJSON
    {
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
    public static fromDirectory(path: string): NDJSON
    {
        const files = filterFiles(path, /\.ndjson$/i);
        const out = new NDJSON();

        function *lines(): IterableIterator<string>
        {
            for (const filePath of files) {
                try {
                    const ndjson = NDJSON.fromFile(filePath);
                    const _lines = ndjson.lines();
                    for (const line of _lines) {
                        yield line;
                    }
                } catch (e) {
                    throw new Error(`File: ${filePath} - ${e}`);
                }
             }
        }

        function *entries(): IterableIterator<BulkDataTools.IAnyObject>
        {
            for (const filePath of files) {
                try {
                    const ndjson = NDJSON.fromFile(filePath);
                    const _entries = ndjson.entries();
                    for (const entry of _entries) {
                        yield entry;
                    }
                } catch (e) {
                    throw new Error(`File: ${filePath} - ${e}`);
                }
            }
        }

        out.setLines(lines);
        out.setEntries(entries);
        return out;
    }

    /**
     * Creates and returns an NDJSON instance from a file path. Example:
     * ```js
     * const ndjson = NDJSON.fromFile("/path/to/file.ndjson");
     * ndjson.lines();   // Lines iterator
     * ndjson.entries(); // JSON iterator
     * ```
     * @param path Absolute path to NDJSON file
     */
    public static fromFile(path: string): NDJSON
    {
        function *lines(): IterableIterator<string>
        {
            const _lines = readLine(path);
            for (let line of _lines) {
                line = line.trim();
                if (line) {
                    yield line;
                }
            }
        }

        function *entries(): IterableIterator<BulkDataTools.IAnyObject>
        {
            for (const line of lines()) {
                yield JSON.parse(line);
            }
        }

        const out = new NDJSON();
        out.setLines(lines);
        out.setEntries(entries);
        return out;
    }

    // =========================================================================
    // Output Methods
    // =========================================================================

    /**
     * Returns a string representation of the NDJSON object.
     * **NOTE:** The string takes memory. Don't use this for big NDJSON objects.
     * Use the `lines` or `entries` iterators instead to handle one entry at a time.
     */
    public toString(): string
    {
        let out = "";
        for (const line of this._lines()) {
            out += (out ? "\r\n" : "") + line;
        }
        return out;
    }

    /**
     * Returns an array of JSON strings representing of the NDJSON object.
     * **NOTE:** The array takes memory. Don't use this for big NDJSON objects.
     * Use the `lines` or `entries` iterators instead to handle one entry at a time.
     */
    public toStringArray(): string[]
    {
        const out = [];
        for (const line of this._lines()) {
            out.push(line);
        }
        return out;
    }

    /**
     * Returns an array of JSON objects representing of the NDJSON object.
     * **NOTE:** The array takes memory. Don't use this for big NDJSON objects.
     * Use the `lines` or `entries` iterators instead to handle one entry at a time.
     */
    public toArray(): BulkDataTools.IAnyObject[]
    {
        return [...this.entries()];
    }

    /**
     * Writes the NDJSON object to file. The file can be (re)created or appended
     * to. Example:
     * ```js
     * const ndjson = NDJSON.fromStringArray(["{}", "{}" ]);
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
    public toFile(path: string, options: any = {}): NDJSON
    {
        if (!options.append) {
            writeFileSync(path, "");
        }

        let count = 0;
        for (const line of this.lines()) {
            writeFileSync(
                path,
                `${++count > 1 ? "\r\n" : ""}${line}`,
                {
                    encoding: "utf8",
                    flag: "a"
                }
            );
        }

        return this;
    }

}

