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
