function roundToPrecision(n, precision, fixed) {
    n = parseFloat(n);

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
 * @param {Number} precision (optional) Defaults to 2
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

    let out = Math.max(bytes, 0);
    
    if (precision || precision === 0) {
        out = roundToPrecision( out, precision );
    }

    if (fixed) {
        out = out.toFixed(fixed);
    }

    return out + " " + units[i];
}

/**
 * Returns the int representation of the first argument or the
 * "defaultValue" if the int conversion is not possible.
 * @memberof Utils
 * @param {*} x The argument to convert
 * @param {*} defaultValue The fall-back return value. This is going to be
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
 * @param {*} defaultValue The fall-back return value. This is going to be
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

module.exports = {
    uFloat,
    uInt,
    intVal,
    floatVal,
    readableFileSize,
    roundToPrecision,
    setPath,
    isObject
};
