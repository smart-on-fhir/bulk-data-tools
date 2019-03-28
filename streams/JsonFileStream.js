const { Readable }          = require("stream");
const FS                    = require("fs");
const { forEachFileOfType } = require("../walk");

class JsonFileStream extends Readable
{
    constructor(path) {
        super({ objectMode: true });
        this.path = path;
        this._paths = null;
    }

    async getPaths() {
        if (!this._paths) {
            this._paths = [];
            await forEachFileOfType(this.path, "json", path => {
                this._paths.push(path);
            });
        }
        return this._paths;
    }

    async _read() {
        await this.getPaths();
        if (this._paths.length) {
            const path = this._paths.shift();
            try {
                const data = FS.readFileSync(path, "utf8");
                this.push(data);
            } catch (error) {
                setImmediate(() => this.emit('error', error));
            }
        } else {
            this.push(null);
        }
    }
}

module.exports = JsonFileStream;