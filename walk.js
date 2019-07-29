const Path = require("path");
const Walk = require("walk");
const Lib  = require("./lib");


/**
 * Walks a folder recursively
 * @param {Object} options
 * @param {String} options.dir The directory to walk. Defaults to `.`.
 * @param {(path: String)=>Boolean} [options.filter] Optional filter function.
 * @param {Boolean} [options.followLinks = false] Follow symlinks.
 * @param {(path, fileStats) => Promise<any>|void} cb 
 */
function forEachFile(options, cb)
{
    options = {
        dir        : ".",
        filter     : null,
        followLinks: false,
        ...options
    };

    const walker = Walk.walk(options.dir, { followLinks: options.followLinks });

    return new Promise(resolve => {

        let job = Promise.resolve();

        walker.on("file", (root, fileStats, next) => {
            let path = Path.resolve(root, fileStats.name);
            if (options.filter && !options.filter(path)) {
                return next();
            }
            job = job.then(() => cb(path, fileStats)).then(next);
        });

        walker.on("errors", (root, nodeStatsArray, next) => {
            console.error(`Error at ${root}: $nodeStatsArray.error`);
            next();
        });

        walker.on("end", () => resolve());
    });
}

function forEachFileOfType(root, ext, cb)
{
    return forEachFile({
        dir: root,
        filter: path => path.endsWith(`.${ext}`)
    }, cb);
}

// forEachFileOfType("../leap-bulk-data-server", "js", (path, stats) => {
//     console.log(`${path} - ${Lib.readableFileSize(stats.size)}`);
// });

module.exports = {
    forEachFile,
    forEachFileOfType
};

