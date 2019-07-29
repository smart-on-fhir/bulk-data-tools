# bulk-data-tools

## File System Utils

## Reading a directory (recursively)
```js
// Stepping through files synchronously
for (let file of walkSync("some/path")) {
    // do something with file
}

// Asynchronously with file callback and returning a Promise
forEachFile({ dir: "some/path" }, (file, fileStats) => {
    // do something with file
}).then(() => {
    // it is done
})
```

## Finding (filtering) files in directory (recursively)
```js
// Stepping through files synchronously
for (let file of filterFiles("some/path", /Patient\.\d+\.ndjson$/)) {
    // do something with file
}

// Asynchronously with file callback and returning a Promise
forEachFile({
    dir: "some/path",
    filter: path => path.match(/Patient\.\d+\.ndjson$/)
}, (file, fileStats) => {
    // do something with file
}).then(() => {
    // it is done
})
```

## Finding (filtering) files in directory by file extension (recursively)
```js
// Stepping through files synchronously
for (let file of filterFiles("some/path", /\.ndjson$/)) {
    // do something with file
}

// Asynchronously with file callback and returning a Promise
forEachFileOfType("some/path", "ndjson", (file, fileStats) => {
    // do something with file
}).then(() => {
    // it is done
})
```

## Reading a file line by line
```js
// Synchronously
// NOTE: readLine returns an iterator that reads one line at a time.
// It DOES NOT load the entire file in memory!
for (let line of readLine("/some/file")) {
    // do something with line
}

// Asynchronously flowing
forEachLine(
    "/path/to/file",
    (line, index) => {
        console.log(`${index}: ${line}`);
    },
    count => console.log("count: " + count)
);

// Asynchronously paused
const lineStream = forEachLine("/path/to/file");
lineStream.on('readable', () => {
    let line, i = 0;
    while (null !== (line = lineStream.read())) {
        console.log(`${++i}: ${line}`);
    }
    console.log("count: " + i);
});

```

## Processing entire directory of NDJSON files
```js
for (let file of filterFiles("/some/path", /\.ndjson$/)) {
    for (let line of file) {
        const object = JSON.parse(line);
    }
}
```

## Processing entire directory of NDJSON files and writing them into single CSV
```js
function *ndjsonDirToCSV() {
    for (let file of filterFiles("/some/path", /Patient\.\d+\.ndjson$/)) {
        let header;
        for (let line of file) {
            const json = JSON.parse(line);
            if (!header) {
                header = csvHeaderFromJson(json);
                yield header.map(h => escapeCsvValue(h)).join(",");
            }
            yield "\n" + csvHeader.map(path => escapeCsvValue(getPath(json, path))).join(",");
        }
    }
}

for (let csvLine of ndjsonDirToCSV()) {
    FS.appendFileSync(path, csvLine + "\r\n");
}
```