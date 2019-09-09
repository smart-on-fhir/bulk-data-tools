# bulk-data-tools

This is a NodeJS library for working with bulk data in different formats and mostly
for converting the data between those formats. Some utility functions for reading
directories, parsing and others are also included.

## Converting data between different formats

1. We handle 4 basic data formats - `json`, `ndjson`, `csv` and `tsv`. There are
    classes to represent collections in each data format:
    - `JSONCollection` - represents a collection of zero or more JSON objects
    - `NDJSONCollection` - represents a collection of zero or more NDJSON objects
    - `DelimitedCollection` - represents a collection of zero or more CSV or TSV objects
2. The data can be feed into the library in multiple ways:
    - Can be passed as a string
    - Can be passed as an array of objects
    - Can be passed as an array of strings
    - Can be read from a file
    - Can be read from every file in a directory
3. Once loaded, the data can be exported to:
    - string - format dependent (json, ndjson, csv or tsv)
    - array of objects (lines)
    - array of strings (format dependent lines)
    - written to file

To convert the data follow these simple steps (example from CSV to anything):
```js
// 1. Create a collection for the input data - one of:
const input = DelimitedCollection.fromString();      // parse string as CSV
const input = DelimitedCollection.fromStringArray(); // parse strings as CSV rows
const input = DelimitedCollection.fromArray();       // load from row objects
const input = DelimitedCollection.fromFile();        // load from file
const input = DelimitedCollection.fromDirectory();   // load from directory

// 2. Then "export" it to whatever you need:
const output = input.toString();      // CSV string
const output = input.toStringArray(); // CSV string rows
const output = input.toArray();       // CSV row objects
const output = input.toJSON();        // JSON string
const output = input.toNDJSON();      // NDJSON string
const output = input.toFile();        // CSV file
```


## Examples

### Recursively read a directory and update all the json files
```js
const files = lib.filterFiles("/path/to/dir", /\.json$/i);
for (const file of files) {
    const json = JSON.parse(fs.readFileSync(file, "utf8"));
    json.lastModified = Date.now();
    fs.writeFileSync(file, JSON.stringify(json));
}
```

### Read big file line by line without loading it into memory

### Recursively read a directory, parse all the csv files and combine them into one ndjson file
```js
const ndjson = DelimitedCollection.fromDirectory("/path/to/dir");

// Note that we DO NOT use toJSON() because the result might be big. Instead, we
// iterate over entries() which will handle rows one by one and will not consume
// a lot of memory!
let lineCount = 0;
for (const entry of ndjson.entries()) {
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

