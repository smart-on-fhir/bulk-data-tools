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

Below are some examples of how the `bulk_data` executable can be used in CLI to
convert data between different formats. **Note** that the examples will output
their result to the terminal. You can add a `--output <file>` parameter to write
the result to file.

```sh
# ------------------------------------------------------------------------------
# Converting anything to JSON
# ------------------------------------------------------------------------------

# Collect ndjson files from directory and put them into one json array.
node bulk_data.js --input path/to/files/ --input-type ndjson --output-type json

# Collect csv files from directory and put them into one json array.
node bulk_data.js --input path/to/files/ --input-type csv --output-type json

# Collect TSV files from directory and put them into one json array.
node bulk_data.js --input path/to/files/ --input-type tsv --output-type json

# Convert TSV file to JSON
node bulk_data.js --input path/to/file.tsv --input-type tsv --output-type json

# Convert CSV file to JSON
node bulk_data.js --input path/to/file.csv --input-type csv --output-type json

# Convert NDJSON file to JSON
node bulk_data.js --input path/to/file.ndjson --input-type ndjson --output-type json


# ------------------------------------------------------------------------------
# Converting anything to NDJSON
# ------------------------------------------------------------------------------

# Collect ndjson files from directory and put them into one big ndjson.
node bulk_data.js --input path/to/files/ --input-type ndjson --output-type ndjson

# Collect csv files from directory and put them into one ndjson.
node bulk_data.js --input path/to/files/ --input-type csv --output-type ndjson

# Collect TSV files from directory and put them into one ndjson.
node bulk_data.js --input path/to/files/ --input-type tsv --output-type ndjson

# Convert TSV file to NDJSON
node bulk_data.js --input path/to/file.tsv --input-type tsv --output-type ndjson

# Convert CSV file to NDJSON
node bulk_data.js --input path/to/file.csv --input-type csv --output-type ndjson

```
