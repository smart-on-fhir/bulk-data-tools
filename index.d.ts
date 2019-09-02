
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
}