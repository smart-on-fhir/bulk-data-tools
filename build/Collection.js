"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This class represents a collection of data entries. An instance can be
 * created from different kinds of input using the static methods starting with
 * `from` (that are available on the subclasses) and converted to other kinds of
 * output using the instance methods starting with `to`. This class is designed
 * to handle large files or directories by using iterators and reading files one
 * line at a time.
 */
class Collection {
    constructor() {
        /**
         * The internal lines iterator. In some cases iterating over lines is simple.
         * For example, if we create an instance from string or array we already
         * have all the lines. However, if the input is a file, the lines iterator
         * will be a function that reads one line at a time.
         */
        this._lines = [].values;
        /**
         * The internal entries iterator. In some cases iterating over lines is
         * simple. For example, if we create an instance from string or array we
         * already have all the lines. However, if the input is a file, the entries
         * iterator will be a function that reads and parses one line at a time.
         */
        this._entries = [].values;
    }
    /**
     * Sets the entries iterator of the instance. Useful while composing an
     * instance from different sources
     * @param linesIterator The iterator to use
     * @returns The instance to allow chaining
     */
    setLines(linesIterator) {
        this._lines = linesIterator;
        return this;
    }
    /**
     * Sets the entries iterator of the instance. Useful while composing an
     * instance from different sources. The "entries" might be JSON objects
     * representing NDJSON lines or JS arrays of strings representing a line
     * in CSV or TSV file.
     * @param linesIterator The iterator to use
     * @returns The instance to allow chaining
     */
    setEntries(entriesIterator) {
        this._entries = entriesIterator;
        return this;
    }
    /**
     * The lines iterator of the instance. Yields lines as strings.
     */
    lines() {
        return this._lines();
    }
    /**
     * The entries iterator of the instance. Yields lines as objects.
     */
    entries() {
        return this._entries();
    }
}
exports.default = Collection;
