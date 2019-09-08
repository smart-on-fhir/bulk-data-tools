import { appendFileSync } from "fs";
import Collection from "./Collection";
import {
    filterFiles,
    readLine,
    getPath,
    parseDelimitedLine,
    delimitedHeaderFromArray,
    escapeDelimitedValue
} from "./lib";


/**
 * This class represents a collection in delimited format.
 * - An instance can be created from different kinds of input using the static
 * methods starting with `from` and converted to other kinds of output using the
 * instance methods starting with `to`.
 * - This class is designed to handle large files or directories by using
 * iterators and reading files one line at a time.
 * - The `entries` iterator will yield json objects for each line.
 */
export default class Delimited extends Collection
{
    /**
     * Converts the contents of the collection to array of "values".
     * The values are json objects representing each line, excluding the header.
     *
     * **NOTE:** Don't use this for big objects/files because the output array
     * is built into memory and then returned. For big files iterate over the
     * entries instead, which will yield the same objects:
     * ```js
     * for (const entry of collection.entries()) {
     *     // entry is an object representing a row
     * }
     * ```
     * @alias `toJSON`
     */
    public toArray(): BulkDataTools.IAnyObject[]
    {
        return [...this._entries()];
    }

    /**
     * Converts the instance to NDJSON string.
     *
     * **NOTE:** Don't use this for big objects/files because the output string
     * is built into memory and then returned. For big files iterate over the
     * entries instead and serialize one line at a time:
     * ```js
     * for (const entry of collection.entries()) {
     *     const line = JSON.stringify(entry);
     * }
     * ```
     * @param eol The new line character to use. Defaults to `\r\n`.
     */
    public toNDJSON(eol: string = "\r\n"): string
    {
        let out = "", len = 0;
        for (const item of this.entries()) {
            if (++len > 1) {
                out += eol;
            }
            out += JSON.stringify(item);
        }
        return out;
    }

    /**
     * Serializes the contents of the collection to a string. The result can be
     * a CSV, TSV or other delimited format depending on the options. The
     * default options will output CSV string. For TSV use:
     * ```js
     * instance.toString({ delimiter: "\t" });
     * ```
     * @param [options] The serialization options.
     * @param [options.delimiter] The delimiter to use. Defaults to ",".
     * @param [options.eol] The new line character to use. Defaults to "\r\n".
     * @param [options.strictHeader] If `true`, all the entries will be iterated
     * through to compute the header. If `false`, we assume that all the entries
     * have the same structure and only use the first one to compute the header.
     * Defaults to `false`.
     */
    public toString(options: BulkDataTools.IDelimitedFormatOptions = {}): string
    {
        const delimiter = options.delimiter || ",";
        const eol = options.eol || "\r\n";
        const header = delimitedHeaderFromArray(this.entries(), { fast: !options.strictHeader });

        let out = header.map(cell => escapeDelimitedValue(cell, delimiter)).join(delimiter);
        for (const entry of this.entries()) {
            const row = header.map(cell => escapeDelimitedValue(getPath(entry, cell), delimiter));
            out += `${eol}${row.join(delimiter)}`;
        }

        return out;
    }

    /**
     * Converts the contents of the collection to an array of strings. The
     * result strings can be in CSV, TSV or other delimited format depending on
     * the options. The default options will output CSV strings. For TSV use:
     * ```js
     * instance.toStringArray({ delimiter: "\t" });
     * ```
     * @param [options] The serialization options.
     * @param [options.delimiter] The delimiter to use. Defaults to ",".
     * @param [options.strictHeader] If `true`, all the entries will be iterated
     * through to compute the header. If `false`, we assume that all the entries
     * have the same structure and only use the first one to compute the header.
     * Defaults to `false`.
     */
    public toStringArray(options: BulkDataTools.IDelimitedFormatOptions = {}): string[]
    {
        const delimiter = options.delimiter || ",";
        const header = delimitedHeaderFromArray(this.entries(), { fast: !options.strictHeader });

        const out = [
            header.map(cell => escapeDelimitedValue(cell, delimiter)).join(delimiter)
        ];

        for (const entry of this.entries()) {
            out.push(
                header.map(cell => escapeDelimitedValue(getPath(entry, cell), delimiter)).join(delimiter)
            );
        }

        return out;
    }

    /**
     * Writes the collection to a file.
     * @param path Absolute path to file.
     * @param [options] The serialization options.
     * @param [options.delimiter] The delimiter to use. Defaults to ",".
     * @param [options.eol] The new line character to use. Defaults to "\r\n".
     */
    public toFile(path: string, options: BulkDataTools.IDelimitedFormatOptions = {}): Collection
    {
        const delimiter = options.delimiter || ",";
        const eol = options.eol || "\r\n";

        let header;
        for (const entry of this.entries()) {
            if (!header) {
                header = delimitedHeaderFromArray([entry], { fast: true });
                appendFileSync(
                    path,
                    header.map(
                        h => escapeDelimitedValue(h, delimiter)
                    ).join(delimiter)
                );
            }

            const line = header.map(
                h => escapeDelimitedValue(getPath(entry, h), delimiter)
            ).join(delimiter);

            appendFileSync(path, `${eol}${line}`);
        }
        return this;
    }

    // =========================================================================
    // Input Methods
    // =========================================================================

    /**
     * If we have the entire csv or tsv as a string, we can create an instance
     * like so:
     * ```js
     * const csv = Delimited.fromString("a,b\n1,2\r\n3,4");
     * csv.lines();   // Lines iterator -> "1,2", "3,4"
     * csv.entries(); // JSON iterator  -> { a: "1", b: "2" }, { a: "3", b: "4" }
     * ```
     * @param input The input string that can be parsed as CSV or TSV
     * @param [options] The options for parsing the input string
     * @param [options.delimiter=","] The delimiter to use
     */
    public static fromString(input: string, options: BulkDataTools.IDelimitedFormatOptions = {}): Delimited
    {
        return Delimited.fromStringArray(input.split(/\r?\n/), options);
    }

    /**
     * If we have the entire collection as an array of string lines, we can
     * create an instance like so:
     * ```js
     * const csv = Delimited.fromStringArray(["a,b", "1,2", "3,4"]);
     * csv.lines();   // Lines iterator -> "1,2", "3,4"
     * csv.entries(); // JSON iterator  -> { a: "1", b: "2" }, { a: "3", b: "4" }
     * ```
     * The fist line is used as header!
     * @param arr An array of strings that can be parsed as CSV or TSV
     */
    public static fromStringArray(arr: string[], options: BulkDataTools.IDelimitedFormatOptions = {}): Delimited
    {
        const delimiter = options.delimiter || ",";

        // Create the output instance
        const out = new Delimited();

        // Remove empty lines
        const lines = arr.map(l => l.trim()).filter(Boolean);

        if (lines.length > 0) {

            // Use the first line as header
            const header = parseDelimitedLine(lines.shift() as string, delimiter);

            // lines will exclude the first line (assumed to be the header)
            out.setLines(function *() {
                for (const l of lines) {
                    yield parseDelimitedLine(l, delimiter).map(c => c.trim()).join(delimiter);
                }
            });

            // Entries are the json objects representing each line
            out.setEntries(function *() {
                for (const l of lines) {
                    const entry: BulkDataTools.IAnyObject = {};
                    const line = parseDelimitedLine(l, delimiter);
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
    public static fromArray(arr: BulkDataTools.IAnyObject[], options: BulkDataTools.IDelimitedFormatOptions = {}): Delimited
    {
        const delimiter = options.delimiter || ",";

        const out = new Delimited();

        const header = delimitedHeaderFromArray(arr, { fast: !options.strictHeader });

        // out.setEntries(() => arr.values());
        out.setEntries(function *() {
            for (const entry of arr) {
                const row = {};
                header.forEach(key => row[key] = getPath(entry, key));
                yield row;
                // yield header
                //     .map(key => getPath(entry, key))
                    // .join(delimiter);
            }
        });

        out.setLines(function *() {
            console.log(header, arr);
            for (const entry of arr) {
                yield header
                    .map(key => escapeDelimitedValue(getPath(entry, key), delimiter))
                    .join(delimiter);
            }
        });

        return out;
    }

    /**
     * Creates and returns an instance from directory path. This will walk
     * (recursively) through the directory and collect all the files having
     * a `.csv` extension. The `lines` and `entries` iterators will yield
     * results from all those files combined. Example:
     * ```js
     * const csv = Delimited.fromDirectory("/path/to/directory/containing/csv/files");
     * csv.lines();   // Lines iterator
     * csv.entries(); // JSON iterator
     * ```
     * @param path Absolute path to directory
     */
    public static fromDirectory(path: string, options: BulkDataTools.IDelimitedFormatOptions = {}): Delimited
    {
        const delimiter = options.delimiter || ",";
        const extension = String(options.extension || "csv").replace(/^\.*/, ".");

        const out = new Delimited();

        function *lines(): IterableIterator<string>
        {
            const files = filterFiles(path, new RegExp(extension + "$", "i"));
            for (const filePath of files) {
                try {
                    const ndjson = Delimited.fromFile(filePath, { delimiter });
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
            const files = filterFiles(path, new RegExp(extension + "$", "i"));
            for (const filePath of files) {
                try {
                    const ndjson = Delimited.fromFile(filePath, { delimiter });
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
     * Creates and returns an instance from a file path. The `lines` and
     * `entries` iterators will read the file one line at a time. Example:
     * ```js
     * const csv = Delimited.fromFile("/path/to/file.csv");
     * csv.lines();   // Lines iterator
     * csv.entries(); // Entries iterator
     * ```
     * For TSV or another custom delimited format provide a delimiter option
     * like so:
     * ```js
     * const tsv = Delimited.fromFile("/path/to/file.tsv", { delimiter: "\t" });
     * ```
     * @param path Absolute path to CSV or TSV file
     */
    public static fromFile(path: string, options: BulkDataTools.IDelimitedFormatOptions = {}): Delimited
    {
        const delimiter = options.delimiter || ",";

        function *lines(): IterableIterator<string>
        {
            const _lines = readLine(path);
            let headerSkip;
            for (let line of _lines) {
                if (!headerSkip) {
                    headerSkip = 1;
                    continue;
                }
                const arr = parseDelimitedLine(line.trim(), delimiter);
                line = arr.map(c => c.trim()).join(delimiter);
                if (line) {
                    yield line;
                }
            }
        }

        function *entries(): IterableIterator<BulkDataTools.IAnyObject>
        {
            let header;
            for (const line of readLine(path)) {
                const arr = parseDelimitedLine(line.trim(), delimiter);
                if (!header) {
                    header = arr;
                }
                else {
                    const entry: BulkDataTools.IAnyObject = {};
                    header.forEach((key, index) => {
                        entry[key] = arr[index];
                    });
                    yield entry;
                }
            }
        }

        const out = new Delimited();
        out.setLines(lines);
        out.setEntries(entries);
        return out;
    }
}
