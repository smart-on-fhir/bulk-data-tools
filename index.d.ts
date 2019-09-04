
declare namespace BulkDataTools {
    interface IReadableFileSizeOptions {

        /**
         * The decimal units precision
         */
        precision?: number;

        /**
         * The number of decimal units for fixed precision
         */
        fixed?: number;

        /**
         * If true use 1024 based fractions
         */
        useBinary?: boolean;
    }

    interface IAnyObject {
        [key: string]: any;
    }

    /**
     * A number or a (presumably numeric) string
     */
    type Numeric = string | number;

    /**
     * Options for parsing and serializing delimited formats like CSV ot TSV
     */
    interface IDelimitedFormatOptions {

        /**
         * The value delimiter to use while parsing and serializing. E.g.: ","
         * for CSV or "\t" for TSV.
         */
        delimiter?: string;

        /**
         * The line separator to use while converting to string. Note that this
         * does not affect parsing, which will detect both "\n" and "\r\n" as
         * lines separators.
         */
        eol?: string;

        /**
         * The file extension for this format, E.g.: "csv" or "tsv".
         */
        extension?: string;

        /**
         * How to compute the header if the input is an array of objects.
         * If `false`, only the first row object  will be used to compute the
         * header. If true, all the row objects will be used to create a header
         * having every possible property.
         */
        strictHeader?: boolean;
    }
}