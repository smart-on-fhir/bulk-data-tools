import Collection from "../Collection";
import {
    filterFiles,
    readLine,
    parseDelimitedLine,
    delimitedHeaderFromArray,
    escapeDelimitedValue
} from "../lib";




/**
 * This class represents a collection in delimited format.
 * - An instance can be created from different kinds of input using the static
 * methods starting with `from` and converted to other kinds of output using the
 * instance methods starting with `to`.
 * - This class is designed to handle large files or directories by using
 * iterators and reading files one line at a time.
 * - The `entries` iterator will yield json objects for each line.
 */
export default class CSV extends Collection
{
    /**
     * The value delimiter to use while parsing and serializing.
     */
    protected _delimiter: string = ",";

    /**
     * The line separator to use while converting to string.
     */
    protected _eol: string = "\r\n";

    /**
     * Converts the contents of the collection to array of "values". The
     * subclasses must implement this depending on the output format they
     * represent.
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
     * Serializes the contents of the collection to a string. The subclasses
     * must implement this depending on the output format they represent.
     */
    public toString(): string
    {
        return "";
    }

    /**
     * Converts the contents of the collection to an array of strings. The
     * subclasses must implement this depending on the output format they
     * represent.
     */
    public toStringArray(): string[]
    {
        return [];
    }

    /**
     * Writes the collection to a file. The subclasses must implement this
     * depending on the output format they represent.
     */
    public toFile(path: string, options?: any): Collection
    {
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
    public static fromString(input: string, delimiter: string = ","): CSV
    {
        return CSV.fromStringArray(input.split(/\r?\n/));
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
    public static fromStringArray(arr: string[]): CSV
    {
        // Create the output instance
        const out = new CSV();

        // Split into lines
        const lines = arr.map(l => l.trim()).filter(Boolean);

        if (lines.length > 0) {

            // Use the first line as header
            const header = parseDelimitedLine(lines.shift() as string);

            // lines will exclude the first line (assumed to be the header)
            out.setLines(function *() {
                for (const l of lines) {
                    yield parseDelimitedLine(l).map(c => c.trim()).join(",");
                }
            });

            // Entries are the json objects representing each line
            out.setEntries(function *() {
                for (const l of lines) {
                    const entry: BulkDataTools.IAnyObject = {};
                    const line = parseDelimitedLine(l);
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
    public static fromArray(arr: BulkDataTools.IAnyObject[], strict: boolean = false): CSV
    {
        const out = new CSV();

        out.setEntries(() => arr.values());

        const header = delimitedHeaderFromArray(arr, { fast: !strict });

        out.setLines(function *() {
            for (const entry of arr) {
                yield header
                    .map(key => escapeDelimitedValue(entry[key]))
                    .join(",");
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
     * const csv = CSV.fromDirectory("/path/to/directory/containing/csv/files");
     * csv.lines();   // Lines iterator
     * csv.entries(); // JSON iterator
     * ```
     * @param path Absolute path to directory
     */
    public static fromDirectory(path: string): CSV
    {
        const out = new CSV();

        function *lines(): IterableIterator<string>
        {
            const files = filterFiles(path, /\.csv$/i);
            for (const filePath of files) {
                try {
                    const ndjson = CSV.fromFile(filePath);
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
            const files = filterFiles(path, /\.csv$/i);
            for (const filePath of files) {
                try {
                    const ndjson = CSV.fromFile(filePath);
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
     * const csv = CSV.fromFile("/path/to/file.csv");
     * csv.lines();   // Lines iterator
     * csv.entries(); // Entries iterator
     * ```
     * @param path Absolute path to CSV or TSV file
     */
    public static fromFile(path: string): CSV
    {
        function *lines(): IterableIterator<string>
        {
            const _lines = readLine(path);
            let headerSkip;
            for (let line of _lines) {
                if (!headerSkip) {
                    headerSkip = 1;
                    continue;
                }
                const arr = parseDelimitedLine(line.trim());
                line = arr.map(c => c.trim()).join(",");
                if (line) {
                    yield line;
                }
            }
        }

        function *entries(delimiter: string = ","): IterableIterator<BulkDataTools.IAnyObject>
        {
            let header;
            for (const line of readLine(path)) {
                const arr = parseDelimitedLine(line.trim());
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

        const out = new CSV();
        out.setLines(lines);
        out.setEntries(entries);
        return out;
    }
}
