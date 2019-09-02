const Lab               = require("lab");
const { expect }        = require("code");
const { Readable }      = require("stream");
const lib               = require("../build/lib");
const NdJsonToDelimited = require("../build/streams/NdJsonToDelimited").default;
const GenericReadStream = require("./mocks/GenericReadStream");

const lab = exports.lab = Lab.script();
const { describe, it, beforeEach, afterEach } = lab;


describe("NdJsonToDelimited", () => {
    it("works a s expected", async () => {
        function * generate() {
            yield { a: 1, b: 2 };
            yield { a: 3, b: 4 };
            yield { a: 5, b: 6 };
        }

        const lines = await new Promise((resolve, reject) => {
            const out = [];
            const readable  = new GenericReadStream(generate());
            const transform = new NdJsonToDelimited();
            transform.on("data", line => out.push(line + ""));
            transform.once("end", () => resolve(out));
            transform.once("error", reject);
            readable.pipe(transform);
        });

        expect(lines).to.equal([
            "a,b", "\r\n",
            "1,2", "\r\n",
            "3,4", "\r\n",
            "5,6"
        ]);
    });
});
