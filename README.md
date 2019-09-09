# bulk-data-tools

## Converting data between different formats

The input can be ane of:
- `String`
    - JSON string (e.g. the result of reading a `.json` file)
    - NDJSON string (e.g. the result of reading a `.ndjson` file)
    - String in some delimited format (e.g. the result of reading a `.csv` or `.tsv` file)
    - Absolute path to file (json, ndjson, csv or tsv)
    - Absolute path to directory containing some of the files above
- `Object`
    - Any object or array that can be serialized as JSON


## Working with files
The library provides a few methods that can be very useful for reading and parsing large files.
- To read an entire file use one of the built-in node function.
- To read a file by iterating over the lines use the `readLine` function.
- To read a file as stream use the .


## Examples

### Recursively read a directory and update all the json files
```js
const files = filterFiles("/path/to/dir", /\.json$/i);
for (const file of files) {
    const json = JSON.parse(fs.readFileSync(file, "utf8"));
    json.lastModified = Date.now();
    fs.writeFileSync(file, JSON.stringify(json));
}
```

### Recursively read a directory, parse all the ndjson files and combine them into another ndjson file
```js
const entries = new NDJSONDirectory("/path/to/dir").entries;
let lineCount = 0;
for (const entry of entries) {
    fs.appendFileSync(
        path,
        (++lineCount === 1 ? "" : "\r\n") + JSON.stringify(entry)
    );
}
```

### Read an ndjson file and spread each line into its own json file
```js
const entries = new NDJSONFile("/path/to/ndjson").entries;
let lineCount = 0;
for (const entry of entries) {
    fs.writeFileSync(
        `/base/path/file-${++lineCount}.json`,
        JSON.stringify(entry)
    );
}
```

## Command line usage
---

The `bulk_data` executable can be used in the terminal to convert data between
different formats.

**Examples:**
```sh

# Convert CSV file to NDJSON
node bulk_data --input path/to/file.csv --output-type ndjson

# Convert NDJSON file to CSV
node bulk_data --input path/to/file.ndjson --output-type csv
```

**Note** that the examples will output their result to the terminal. You can
append ` > filename` to the command to write the result to file.

For the full list of possible conversions see [tests/bin.test.ts](tests/bin.test.ts).

**CLI parameters:**

- `--input` - Path to input directory or file.
- `--input-type` - The type of input (`json`, `ndjson`, `csv`, `tsv`, `auto`).
  Defaults to `auto` which means the input type can be omitted and will be detected
  based in the file extension of the file passed as `--input`.If the `--input` is
  a directory, then `--input-type` is required and cannot be `auto`.
- `--output-type` - The type of output (`json`, `ndjson`, `csv`, `tsv`).
- `--eol` - The line separator (CRLF, LF). Defaults to `CRLF`. If the `output-type`
  is delimited (csv or tsv), use this to specify what should be used as line
  separator. Defaults to `CRLF` (`\r\n`).
- `--strict` - If set, loop through every entry to compute the complete csv/tsv
  header. Otherwise assume that all entries have the same structure and only use
  the first entry. Only applicable when the `output-type` is csv or tsv.

