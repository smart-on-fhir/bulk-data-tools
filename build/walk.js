"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const walk_1 = __importDefault(require("walk"));
/**
 * Walks a folder recursively and calls the callback for each file. A filter
 * function can be provided to narrow the list of visited files.
 * @param options  The walk options. Defaults to `{ dir: "." }`.
 * @param cb The callback function
 */
function forEachFile(options, cb) {
    options = { dir: ".", ...options };
    const walker = walk_1.default.walk(options.dir, { followLinks: !!options.followLinks });
    let job = Promise.resolve();
    walker.on("file", (root, fileStats, next) => {
        const path = path_1.default.resolve(root, fileStats.name);
        if (options.filter && !options.filter(path)) {
            return next();
        }
        job = job.then(() => cb(path, fileStats)).then(next);
    });
    walker.on("errors", (root, nodeStatsArray, next) => {
        console.error(`Error at ${root}: $nodeStatsArray.error`);
        next();
    });
    return job;
}
exports.forEachFile = forEachFile;
/**
 * Given a directory path, walks through it and calls the callback for each file
 * having the specified file extension.
 * @param root The path to the directory to walk
 * @param ext The file extension (with or without the dot)
 * @param cb The callback function
 */
function forEachFileOfType(root, ext, cb) {
    ext = ext.replace(/\.([^\.]+)$/, "$1");
    return forEachFile({
        dir: root,
        filter: (path) => path.endsWith(`.${ext}`)
    }, cb);
}
exports.forEachFileOfType = forEachFileOfType;
// forEachFileOfType("../leap-bulk-data-server", "js", (path, stats) => {
//     console.log(`${path} - ${Lib.readableFileSize(stats.size)}`);
// });
/**
 * List all files in a directory recursively in a synchronous fashion.
 * @param {String} dir
 */
function* walkSync(dir) {
    const files = fs_1.default.readdirSync(dir);
    for (const file of files) {
        const pathToFile = path_1.default.join(dir, file);
        const isDirectory = fs_1.default.statSync(pathToFile).isDirectory();
        if (isDirectory) {
            yield* walkSync(pathToFile);
        }
        else {
            yield pathToFile;
        }
    }
}
exports.walkSync = walkSync;
/**
 * Walks a directory recursively in a synchronous fashion and yields JSON
 * objects. Only `.json` and `.ndjson` files are parsed. Yields ane JSON object
 * for each line of an NDJSON file and one object for each JSON file. Other
 * files are ignored.
 *
 * @param {String} dir A path to a directory
 * @returns {IterableIterator<JSON>}
 */
function* jsonEntries(dir) {
    const files = walkSync(dir);
    for (const file of files) {
        if (file.match(/\.json$/i)) {
            yield JSON.parse(fs_1.readFileSync(file, "utf8"));
        }
        else if (file.match(/\.ndjson$/i)) {
            for (const line of readLine(file)) {
                yield JSON.parse(line);
            }
        }
    }
}
exports.jsonEntries = jsonEntries;
/**
 * Walk a directory recursively and find files that match the @filter if its a
 * RegExp, or for which @filter returns true if its a function.
 * @param {string} dir Path to directory
 * @param {RegExp|Function} filter
 * @returns {IterableIterator<String>}
 */
function* filterFiles(dir, filter) {
    const files = walkSync(dir);
    for (const file of files) {
        if (filter instanceof RegExp && !filter.test(file)) {
            continue;
        }
        if (typeof filter == "function" && !filter(file)) {
            continue;
        }
        yield file;
    }
}
exports.filterFiles = filterFiles;
/**
 * Reads a file line by line in a synchronous fashion. This will read the file
 * line by line without having to store more than one line in the memory (so the
 * file size does not really matter). This is much easier than an equivalent
 * readable stream implementation. It is also easier to debug and should produce
 * reliable stack traces in case of error.
 * @todo Add ability to customize the EOL or use a RegExp to match them all.
 * @param filePath The path to the file to read (preferably an absolute path)
 */
function* readLine(filePath) {
    const CHUNK_SIZE = 1024 * 64;
    const fd = fs_1.default.openSync(filePath, "r");
    const chunk = Buffer.alloc(CHUNK_SIZE, "", "utf8");
    let eolPos;
    let blob = "";
    while (true) {
        eolPos = blob.indexOf("\n");
        // buffered line
        if (eolPos > -1) {
            yield blob.substring(0, eolPos);
            blob = blob.substring(eolPos + 1);
        }
        else {
            // Read next chunk
            const bytesRead = fs_1.default.readSync(fd, chunk, 0, CHUNK_SIZE, null);
            if (!bytesRead) {
                fs_1.default.closeSync(fd);
                break;
            }
            blob += chunk.slice(0, bytesRead);
        }
    }
    // Last line
    if (blob) {
        yield blob;
    }
}
exports.readLine = readLine;
function csvToArray() { }
exports.csvToArray = csvToArray;
function csvToJson() { }
exports.csvToJson = csvToJson;
function csvToNdJson() { }
exports.csvToNdJson = csvToNdJson;
// InputDirectory      - A directory (it's path as string) to collect input from
// ├┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ - optional filter by file type
// └─ files            - A file iterator (of file paths)
//    ├─ lines         - Line iterator (as string)
//    └─ entries       - Iterator of JSON object or scalar values (e.g. parsed line)
//       │
//       ├┄┄┄┄┄┄┄┄┄┄┄┄ - optional data manipulation
//       │
//    ┌─ entries       - Iterator of JSON object or scalar values
//    ├─ lines         - Line iterator (as string)
// ┌─ OutputFile       - A file (it's path as string) to write output at
// ├┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ - optional postprocessing to generate a filename (spread to multiple files)
// OutputDirectory     - A directory (it's path as string) to write output at
class Input {
}
class DirectoryInput {
    constructor(dir) {
        this.path = dir;
    }
    *files() {
        const files = walkSync(this.path);
        for (const file of files) {
            yield new FileInput(file);
        }
    }
}
class FileInput {
    constructor(dir) {
        this.path = dir;
    }
    lines() {
        return readLine(this.path);
    }
}
// CSV file to JSON array
// CSV file to JSON array
class CSV {
    getHeader() { }
    readLine() { }
}
// =============================================================================
// NDJSON file to CSV file
// NDJSON object to CSV file
// NDJSON object to CSV object
// const input = new Input({
//     src: [],
//     filter(o => ouput.resourceType == "Patient")
// });
// const ouput = new Output({ dst: [] });
