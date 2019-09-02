const Lab               = require("lab");
const { expect }        = require("code");
const { Readable }      = require("stream");
const lib               = require("../build/lib");
const BytesToLines      = require("../build/streams/BytesToLines");
const GenericReadStream = require("./mocks/GenericReadStream");

const lab = exports.lab = Lab.script();
const { describe, it, beforeEach, afterEach } = lab;


describe("BytesToLines", () => {
    it("works a s expected", async () => {
        function * generate() {
            yield "line1\nline2";
            yield "\nline3\n";
            yield "\nline4";
        }

        const lines = await new Promise((resolve, reject) => {
            const out = [];
            const readable = new GenericReadStream(generate());
            const transform = new BytesToLines();
            transform.on("data", line => out.push(line + ""));
            transform.once("end", () => resolve(out));
            transform.once("error", reject);
            readable.pipe(transform);
        });

        expect(lines).to.equal([
            "line1",
            "line2",
            "line3",
            "line4"
        ]);
    });
});
