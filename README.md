# bulk-data-tools

This is a NodeJS library for working with bulk data in different formats and mostly for converting the data between those formats. Some utility functions for reading directories, parsing and others are also included.

## Installation and Usage
The library is written in TypeScript and then compiled to JavaScript. It is not currently published to NPM so it should be used via GitHub:
```sh
git clone https://github.com/smart-on-fhir/bulk-data-tools.git
```
Then `require` what you need from the `build/src` folder or import it directly from `/src` if you are using TypeScript.

## [API Documentation](http://docs.smarthealthit.org/bulk-data-tools)

## Collections
In order to simplify conversions between data formats we handle the data through collection instances. A collection is an abstract representation of the underlying data, regardless of how that data was obtained. The collections have `entries` and `lines` iterator methods that will iterate over the entries without having to maintain everything in memory. The `entries()` method will yield JSON objects and the `lines()` method yields format specific strings.

### [NDJSONCollection](http://docs.smarthealthit.org/bulk-data-tools/classes/ndjsoncollection.html)
These collections have one entry for each input line. If created from a directory that contains multiple NDJSON files, then all those files will be combined into single collection.

### [JSONCollection](http://docs.smarthealthit.org/bulk-data-tools/classes/jsoncollection.html)
Typically these collections have one entry. If created from a directory that contains multiple JSON files or from array containing multiple objects, then all those files/objects will be combined as entries of single collection.

### [DelimitedCollection](http://docs.smarthealthit.org/bulk-data-tools/classes/delimitedcollection.html)
Represents a Delimited (CSV, TSV, etc.) object. These collections have one entry for each input line.

## Memory Restrictions
Working with bulk data implies that we have to deal with lots of files (or with big ones). The code of this library is written in a way that provides a balance between performance and simplicity.

In some cases we assume that the input or output might be big and use iterators to handle the data one entry at a time. Such cases are:
- Reading directories using `Collection.fromDirectory(...)`
- Reading NDJSON, CSV, TSV or other delimited file format
- Exporting to NDJSON, CSV, TSV or other delimited file

In other cases we know that the data is not that big:
- `Collection.fromString(...)`, `Collection.fromStringArray(...)`, `Collection.fromArray(...)` implies that the string or array argument is already available in memory
- `Collection.toString(...)`, `Collection.toStringArray(...)`, `Collection.toArray(...)`... implies that the caller requires the result as a whole (in memory).


## Converting data between different formats

1. We handle 4 basic data formats - `json`, `ndjson`, `csv` and `tsv`. There are
    classes to represent collections in each data format:
    - [JSONCollection](http://docs.smarthealthit.org/bulk-data-tools/classes/jsoncollection.html) - represents a collection of zero or more JSON objects
    - [NDJSONCollection](http://docs.smarthealthit.org/bulk-data-tools/classes/ndjsoncollection.html) - represents a collection of zero or more NDJSON objects
    - [DelimitedCollection](http://docs.smarthealthit.org/bulk-data-tools/classes/delimitedcollection.html) - represents a collection of zero or more CSV or TSV objects
2. The data can be feed into the library in multiple ways:
    - Can be passed as a string
    - Can be passed as an array of objects
    - Can be passed as an array of strings
    - Can be read from a file
    - Can be read from every file in a directory
3. Once a collection is created, the data can be exported to:
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

## Utility Functions
In addition to the collection classes, this library comes with a collection of global function that can be useful for some related tasks. Some interesting examples are:

**Working with CSV and TSV**
- [parseDelimitedLine](http://docs.smarthealthit.org/bulk-data-tools/globals.html#parsedelimitedline) - Splits the line into cells using the provided delimiter (or by comma by default) and returns the cells array. supports quoted strings and escape sequences.
- [delimitedHeaderFromArray](http://docs.smarthealthit.org/bulk-data-tools/globals.html#delimitedheaderfromarray) - Loops over an array of objects or arrays (rows) and builds a header that matches the structure of the rows.
- [escapeDelimitedValue](http://docs.smarthealthit.org/bulk-data-tools/globals.html#escapedelimitedvalue) - Escapes a value a value for use in delimited formats like CSV or TSV
    - If it contains a double quote, new line or delimiter (typically a comma), the value is quoted.
    - any contained quotes are escaped with another quote
    - undefined is converted to empty string.
    - everything else is converted to string (but is not quoted)

**Working with files and directories**
- [walkSync](http://docs.smarthealthit.org/bulk-data-tools/globals.html#walksync) - List all files in a directory recursively in a synchronous fashion.
- [filterFiles](http://docs.smarthealthit.org/bulk-data-tools/globals.html#filterfiles) - Walk a directory recursively and find files that match the `filter` parameter.
- [jsonEntries](http://docs.smarthealthit.org/bulk-data-tools/globals.html#jsonentries) - Walks a directory recursively in a synchronous fashion and yields JSON objects. Only `.json` and `.ndjson` files are parsed. Yields one JSON object for each line of an NDJSON file and one object for each JSON file. Other files are ignored.
- [readLine](http://docs.smarthealthit.org/bulk-data-tools/globals.html#readline) - Reads a file line by line in a synchronous fashion, without having to store more than one line in the memory (so the file size does not really matter).

**Working with JSON objects**
- [getPath](http://docs.smarthealthit.org/bulk-data-tools/globals.html#getpath) - Walks thru an object (or array) and returns the value found at the provided path.
- [setPath](http://docs.smarthealthit.org/bulk-data-tools/globals.html#setpath) - Finds a path in the given object and sets its value.


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
```js
for (const line of lib.readLine("/path/to/big/file")) {
    console.log(line);
}
```

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

