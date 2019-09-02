/**
 * This class represents a collection of data entries. An instance can be
 * created from different kinds of input using the static methods starting with
 * `from` (that are available on the subclasses) and converted to other kinds of
 * output using the instance methods starting with `to`. This class is designed
 * to handle large files or directories by using iterators and reading files one
 * line at a time.
 */
export default abstract class Collection
{
    /**
     * The internal lines iterator. In some cases iterating over lines is simple.
     * For example, if we create an instance from string or array we already
     * have all the lines. However, if the input is a file, the lines iterator
     * will be a function that reads one line at a time.
     */
    protected _lines: () => IterableIterator<string> = [].values;

    /**
     * The internal entries iterator. In some cases iterating over lines is
     * simple. For example, if we create an instance from string or array we
     * already have all the lines. However, if the input is a file, the entries
     * iterator will be a function that reads and parses one line at a time.
     */
    protected _entries: () => IterableIterator<BulkDataTools.IAnyObject> = [].values;

    /**
     * Sets the entries iterator of the instance. Useful while composing an
     * instance from different sources
     * @param linesIterator The iterator to use
     * @returns The instance to allow chaining
     */
    public setLines(linesIterator: () => IterableIterator<string>): Collection
    {
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
    public setEntries(entriesIterator: () => IterableIterator<BulkDataTools.IAnyObject>): Collection
    {
        this._entries = entriesIterator;
        return this;
    }

    /**
     * The lines iterator of the instance. Yields lines as strings.
     */
    public lines(): IterableIterator<string>
    {
        return this._lines();
    }

    /**
     * The entries iterator of the instance. Yields lines as objects.
     */
    public entries(): IterableIterator<BulkDataTools.IAnyObject>
    {
        return this._entries();
    }

    // =========================================================================
    // Output Methods
    // =========================================================================

    /**
     * Serializes the contents of the collection to a string. The subclasses
     * must implement this depending on the output format they represent.
     */
    public abstract toString(): string;

    /**
     * Converts the contents of the collection to an array of strings. The
     * subclasses must implement this depending on the output format they
     * represent.
     */
    public abstract toStringArray(): string[];

    /**
     * Converts the contents of the collection to array of "values". The
     * subclasses must implement this depending on the output format they
     * represent.
     */
    public abstract toArray(): BulkDataTools.IAnyObject[];

    /**
     * Writes the collection to a file. The subclasses must implement this
     * depending on the output format they represent.
     */
    public abstract toFile(path: string, options?: any): Collection;
}
