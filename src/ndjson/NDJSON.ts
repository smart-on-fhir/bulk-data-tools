import fs from "fs";
import Collection from "../Collection";
import { filterFiles, readLine } from "../lib";

/**
 * This class represents an NDJSON object. An instance can be created from
 * different kinds of input using the static methods starting with `from` and
 * converted to other kinds of output using the instance methods starting with
 * `to`. This class is designed to handle large files or directories by using
 * iterators and reading files one line at a time.
 */
export class NDJSON extends Collection
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
            out += (out ? "\n" : "") + line;
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
        const out = [];
        for (const entry of this._entries()) {
            out.push(entry);
        }
        return out;
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
            fs.writeFileSync(path, "");
        }

        for (const line of this.lines()) {
            fs.writeFileSync(path, line, {
                encoding: "utf8",
                flag: "a"
            });
        }

        return this;
    }

}

interface IDirectoryIteratorOptions {
    filter?: RegExp | ((file: string) => boolean);
}

function createDirectoryIterator(dir: string, options: IDirectoryIteratorOptions = {})
{
    return filterFiles(dir, options.filter);
}

function createNdjsonDirectoryIterator(dir: string)
{
    return filterFiles(dir, /\.ndjson$/i);
}

// function createNdjsonEntryIterator() {}
// function createNdjsonLineIterator() {}

// -----------------------------------------------------------------------------

/**
 * Any instance of NDJSONFile points to some file path (should be an .ndjson
 * file). Once an instance is created, it will expose useful methods for
 * iterating over the lines (as string) or over the entries (as JSON objects)
 *
 * Example:
 * ```js
 * const ndjson = new NDJSONFile("/path/to/file");
 * ndjson.lines();   // Lines iterator
 * ndjson.entries(); // JSON iterator
 * ```
 */
export class NDJSONFile
{
    /**
     * The file path
     */
    protected path: string;

    /**
     * Creates an instance
     * @param path The path to the ndjson file
     */
    public constructor(path: string)
    {
        this.path = path;
    }

    /**
     * Returns a line iterator
     */
    public lines(): IterableIterator<string>
    {
        return readLine(this.path);
    }

    /**
     * Returns an entry (JSON) iterator
     */
    public *entries(): IterableIterator<JSON>
    {
        const lines = readLine(this.path);
        for (const line of lines) {
            yield JSON.parse(line);
        }
    }
}

// -----------------------------------------------------------------------------

/**
 * Any instance of NDJSONDirectory points to some directory path. Once an
 * instance is created, it will expose useful methods for iterating over the
 * lines (as string) or over the entries (as JSON objects). These iterators
 * will walk through the lines or entries from every ndjson file so the effect
 * would be as if the files are concatenated.
 *
 * Example:
 * ```js
 * const ndjson = new NDJSONDirectory("/path/to/dir");
 * ndjson.files();   // Files iterator
 * ndjson.lines();   // Lines iterator
 * ndjson.entries(); // JSON iterator
 * ```
 */
export class NDJSONDirectory
{
    /**
     * The path to the directory
     */
    protected path: string;

    /**
     * Creates an instance
     * @param path The path to the directory
     */
    public constructor(path: string)
    {
        this.path = path;
    }

    /**
     * Returns an iterator the included file paths
     */
    public files(): IterableIterator<string>
    {
        return filterFiles(this.path, /\.ndjson$/i);
    }

    /**
     * Returns a line (as JSON) iterator for all the combined entries from all
     * the included ndjson files.
     */
    public *lines(): IterableIterator<string>
    {
        const files = this.files();
        for (const filePath of files) {
            const ndjson = new NDJSONFile(filePath);
            const lines = ndjson.lines();
            for (const line of lines) {
                yield line;
            }
        }
    }

    /**
     * Returns an entry (as JSON) iterator for all the combined entries from all
     * the included ndjson files.
     */
    public *entries(): IterableIterator<JSON>
    {
        const files = this.files();
        for (const filePath of files) {
            const ndjson = new NDJSONFile(filePath);
            const _entries = ndjson.entries();
            for (const entry of _entries) {
                yield entry;
            }
        }
    }
}

// -----------------------------------------------------------------------------

/**
 * If we happen to have the entire ndjson as a string, we can create an instance
 * of NDJSONString which will provide the `lines` and `entries` iterators.
 *
 * Example:
 * ```js
 * const ndjson = new NDJSONString("{}\n{}");
 * ndjson.lines();   // Lines iterator
 * ndjson.entries(); // JSON iterator
 * ```
 */
export class NDJSONString
{
    /**
     * The ndjson as an array
     */
    public data: string;

    /**
     * Creates an instance
     * @param data The ndjson as a string
     */
    public constructor(data: string)
    {
        this.data = data;
    }

    /**
     * Returns a line iterator
     */
    public lines(): IterableIterator<string>
    {
        return this.data.split(/\r?\n/).values();
    }

    /**
     * Returns an entry (JSON) iterator
     */
    public *entries(): IterableIterator<JSON>
    {
        const lines = this.lines();
        for (const line of lines) {
            yield JSON.parse(line);
        }
    }
}

// -----------------------------------------------------------------------------

/**
 * If we happen to have the entire ndjson as array, we can create an instance
 * of NDJSONArray which will provide the `lines` and `entries` iterators.
 *
 * Example:
 * ```js
 * const ndjson = new NDJSONArray( [ {}, {} ] );
 * ndjson.lines();   // Lines iterator
 * ndjson.entries(); // JSON iterator
 * ```
 */
export class NDJSONArray
{
    /**
     * The ndjson as an array
     */
    public data: JSON[];

    /**
     * Creates an instance
     * @param data The ndjson as array
     */
    public constructor(data: JSON[])
    {
        this.data = data;
    }

    /**
     * Returns a line iterator
     */
    public *lines(): IterableIterator<string>
    {
        for (const entry of this.data) {
            yield JSON.stringify(entry);
        }
    }

    /**
     * Returns an entry (JSON) iterator
     */
    public entries(): IterableIterator<JSON>
    {
        return this.data.values();
    }
}

// -----------------------------------------------------------------------------



// csv-to-csv
// csv-to-tsv
// csv-to-ndjson
// csv-to-json

// tsv-to-csv
// tsv-to-tsv
// tsv-to-ndjson
// tsv-to-json

// ndjson-to-csv
// ndjson-to-tsv
// ndjson-to-ndjson
    // const entries = new NDJSONDirectory("/path/to/dir").entries;
    // let lineCount = 0;
    // for (const entry of entries) {
    //     fs.appendFileSync(
    //         path,
    //         (++lineCount === 1 ? "" : "\r\n") + JSON.stringify(entry)
    //     );
    // }
// ndjson-to-json
    // const entries = new NDJSONDirectory("/path/to/dir").entries;

// json-to-csv
// json-to-tsv
// json-to-ndjson
// json-to-json
