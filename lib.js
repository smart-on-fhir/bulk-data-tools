const FS   = require("fs");
const Path = require("path");

/**
 * Rounds a number to given precision
 * @param {Number|String} n The number to round
 * @param {Number} [precision = 0] 
 * @param {Number} [fixed = 0]
 * @returns {Number|String} String with fixed precision and number otherwise
 */
function roundToPrecision(n, precision = 0, fixed = 0) {
    n = parseFloat(n + "");

    if ( isNaN(n) || !isFinite(n) ) {
        return NaN;
    }

    if ( !precision || isNaN(precision) || !isFinite(precision) || precision < 1 ) {
        return Math.round( n );
    }

    var q = Math.pow(10, precision);
    n = Math.round( n * q ) / q;

    if (fixed) {
        n = n.toFixed(fixed);
    }

    return n;
}

/**
 * Obtains a human-readable file size string (1024 based).
 * @param {Number} bytes The file size in bytes
 * @param {Object} options
 * @param {Number} [options.precision = 2]
 * @param {Number} [options.fixed = 0] Apply fixed precision 
 * @param {Boolean} [options.useBinary = false] If true, use binary units (1024 vs 1000)
 * @return {String}
 */
function readableFileSize(bytes, { precision, fixed, useBinary } = {}) {
    let i = 0;
    const base = useBinary ? 1024 : 1000;
    const units = useBinary ?
        ["Bytes", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"] :
        ["Bytes", "kB" , "MB" , "GB" ,  "TB", "PB" , "EB" , "ZB" , "YB" ];

    while (bytes > base && i < units.length - 1) {
        bytes = bytes / base;
        i++;
    }

    let num = Math.max(bytes, 0);
    
    if (precision || precision === 0) {
        num = +roundToPrecision( num, precision );
    }

    return (fixed ? num.toFixed(fixed) : num) + " " + units[i];
}

/**
 * Returns the int representation of the first argument or the
 * "defaultValue" if the int conversion is not possible.
 * @memberof Utils
 * @param {*} x The argument to convert
 * @param {*} [defaultValue] The fall-back return value. This is going to be
 * converted to integer too.
 * @return {Number} The resulting integer.
 */
function intVal( x, defaultValue ) {
    var out = parseInt(x, 10);
    if ( isNaN(out) || !isFinite(out) ) {
        out = defaultValue === undefined ? 0 : intVal(defaultValue);
    }
    return out;
}

/**
 * Returns the float representation of the first argument or the
 * "defaultValue" if the int conversion is not possible.
 * @memberof Utils
 * @param {*} x The argument to convert
 * @param {*} [defaultValue] The fall-back return value. This is going to be
 * converted to float too.
 * @return {Number} The resulting integer.
 */
function floatVal( x, defaultValue ) {
    var out = parseFloat(x);
    if ( isNaN(out) || !isFinite(out) ) {
        out = defaultValue === undefined ? 0 : floatVal(defaultValue);
    }
    return out;
}

function uInt( x, defaultValue ) {
    return Math.max(intVal( x, defaultValue ), 0);
}

function uFloat( x, defaultValue ) {
    return Math.max(floatVal( x, defaultValue ), 0);
}

/**
 * Tests if the given argument is an object
 * @param {*} x The value to test
 * @returns {Boolean}
 */
function isObject(x)
{
    return x && typeof x == "object";
}

/**
 * Walks thru an object (ar array) and returns the value found at the
 * provided path. This function is very simple so it intentionally does not
 * support any argument polymorphism, meaning that the path can only be a
 * dot-separated string. If the path is invalid returns undefined.
 * @param {Object} obj The object (or Array) to walk through
 * @param {String} [path=""] The path (eg. "a.b.4.c")
 * @returns {*} Whatever is found in the path or undefined
 */
function getPath(obj, path = "")
{
    return path.split(".").reduce((out, key) => out ? out[key] : undefined, obj);
}


function setPath(obj, path, value)
{
    const segments = Array.isArray(path) ? path : String(path).split(".");

    if (!segments.length) {
        throw new Error("Path cannot be empty");
    }

    const key = segments.shift();

    if (segments.length) {

        // Create intermediate object or array properties
        if (!obj.hasOwnProperty(key)) {
            if (segments[0].match(/^\d+$/)) {
                obj[key] = [];
            } else {
                obj[key] = {};
            }
        }
        
        // Step in
        return setPath(obj[key], segments, value);
    }

    if (obj.hasOwnProperty(key)) {
        const target         = obj[key];
        const sourceIsObject = isObject(value);
        const targetIsObject = isObject(target);

        if (sourceIsObject !== targetIsObject) {
            throw new Error(
                "Unable to merge incompatible objects" +
                " (array or object with scalar value)"
            );
        }

        if (Array.isArray(value) !== Array.isArray(target)) {
            throw new Error(
                "Unable to merge incompatible objects" +
                " (cannot mix arrays with objects)"
            );
        }
    }

    obj[key] = value;
}

/**
 * List all files in a directory recursively in a synchronous fashion.
 *
 * @param {String} dir
 * @returns {IterableIterator<String>}
 */
function* walkSync(dir) {
    const files = FS.readdirSync(dir);

    for (const file of files) {
        const pathToFile = Path.join(dir, file);
        const isDirectory = FS.statSync(pathToFile).isDirectory();
        if (isDirectory) {
            yield *walkSync(pathToFile);
        } else {
            yield pathToFile;
        }
    }
}

/**
 * Walk a directory recursively and find files that match the @filter if its a
 * RegExp, or for which @filter returns true if its a function.
 * @param {string} dir Path to directory 
 * @param {RegExp|Function} filter
 * @returns {IterableIterator<String>}
 */
function* filterFiles(dir, filter = null) {
    for (let file of walkSync(dir)) {
        if (filter instanceof RegExp && !filter.test(file)) {
            continue;
        }
        if (typeof filter == "function" && !filter(file)) {
            continue;
        }
        yield file;
    }
}

/**
 * Reads a file line by line in a synchronous fashion.
 * @param {String} filePath
 * @returns {IterableIterator<String>}
 */
function* readLine(filePath) {
    const CHUNK_SIZE = 1024 * 64;
    const fd = FS.openSync(filePath, "r");
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
            const bytesRead = FS.readSync(fd, chunk, 0, CHUNK_SIZE, null);
            if (!bytesRead) {
                FS.closeSync(fd);
                break;
            }
            blob += chunk.slice(0, bytesRead);
        }
    }

    // Last line
    if (blob) yield blob;
}

module.exports = {
    uFloat,
    uInt,
    intVal,
    floatVal,
    readableFileSize,
    roundToPrecision,
    setPath,
    isObject,
    walkSync,
    filterFiles,
    readLine,
    getPath
};
