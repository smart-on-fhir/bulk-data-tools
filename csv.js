const { forEachLine } = require("./ndjson");

function strPad(str, length = 0) {
    let strLen = str.length;
    while (strLen < length) {
        str += " ";
        strLen += 1;
    }
    return str;
}

class CSVHeaderCell
{
    constructor({ name, children, path } = { name: "" })
    {
        this.path     = path;
        this.label    = name     || "";
        this.children = children || null;
        this.colspan  = 1;
    }

    toString()
    {
        return strPad(this.label, 13 * this.colspan);
    }
}

class CSVHeaderRow
{
    constructor()
    {
        this.cells = [];
    }

    forEachCell(callback, scope)
    {
        return this.cells.forEach(callback, scope);
    }

    normalize()
    {
        for (let i = 0; i < this.cells.length; i++) {
            if (this.cells[i] === undefined) {
                this.cells[i] = new CSVHeaderCell();
            }
        }
    }

    toString()
    {
        return "| " + this.cells.map(c => c === undefined ? new CSVHeaderCell() : c).join(" | ") + " |";
    }

    addCell(cell, parentCellIndex)
    {
        this.cells.push(cell);
    }

    isEmpty()
    {
        return !this.cells.some(cell => !!cell.label);
    }
}

class CSVHeader
{
    constructor(rows = [])
    {
        this.rows = [];
        this.setData(rows);
    }

    setData(data)
    {
        const firstRow = new CSVHeaderRow();
        this.rows.push(firstRow);
        data.forEach(cellData => {
            firstRow.addCell(new CSVHeaderCell(cellData));
        }, this);

        const addNextRow = (parentRow) => {
            const nextRow = new CSVHeaderRow();

            for (let i = 0; i < parentRow.cells.length; i++) {
                const children = parentRow.cells[i].children || [];

                if (children.length) {
                    children.forEach((child, childIndex) => {
                        nextRow.addCell(new CSVHeaderCell(child));
                        if (childIndex > 0) {
                            parentRow.cells.splice(i + childIndex, 0, new CSVHeaderCell({}));
                            i += 1;
                        }
                    });
                } else {
                    nextRow.addCell(new CSVHeaderCell({}));
                }
            }
            
            // parentRow.forEachCell(({ label, children }, parentColIndex) => {
            //     if (!label) {
            //         return;
            //     }
            //     if (Array.isArray(children) && children.length) {
            //         children.forEach((child, childIndex) => {
            //             nextRow.addCell(new CSVHeaderCell(child));
            //             if (childIndex > 0) {
            //                 parentRow.cells.splice(parentColIndex + childIndex, 0, new CSVHeaderCell({}));
            //             }
            //         });
            //     } else {
            //         nextRow.addCell(new CSVHeaderCell({}));
            //     }
            // }, this);

            if (!nextRow.isEmpty()) {
                this.rows.push(nextRow);
                addNextRow(nextRow);
            }
        };

        addNextRow(firstRow);
    }

    addRow(data)
    {
        const row = new CSVHeaderRow(data);
        this.rows.push(row);
        return row;
    }

    normalize()
    {
        this.rows.forEach(row => row.normalize());
        return this;
    }

    addCell(rowIndex, colIndex, cell)
    {
        let row = this.rows[rowIndex];
        if (!row) {
            row = new CSVHeaderRow();
            this.rows[rowIndex] = row;
        }

        // if (row.cells[colIndex] === undefined) {
            row.cells[colIndex] = cell;
        // } else {
            // row.cells.splice(colIndex, 1, cell);
        // }
        // if (colIndex > 0) {
        //     while (rowIndex > 0) {
        //     //     --rowIndex;
        //         this.addCell(--rowIndex, colIndex, new CSVHeaderCell());
        //     }
        // }
    }

    toString()
    {
        return this.rows.join("\n");
    }
}

function getHeader(obj, pathPrefix) {
    let header = [];
    for (let name in obj) {
        const path = [pathPrefix, name].filter(Boolean).join(".");
        const entry = { name, path };

        if (obj[name] && typeof obj[name] == "object") {
            entry.children = getHeader(obj[name], path);
        }
        
        header.push(entry);
    }
    return header;
}

// TODO
function compileHeader(header) {
    const rows = [[]];

    function addRow() {
        const parentRow = rows[rows.length - 1];
        const childRow = [];
        let isEmpty = true;
        parentRow.forEach((parentCol, parentColIndex) => {
            if (parentCol.children) {
                isEmpty = false;
                parentCol.children.forEach((child, i) => {
                    childRow.push({
                        ...child,
                        toString() { return child.name; }
                    });
                    if (i > 0) {
                        parentRow.splice(parentColIndex, 0, {
                            toString() { return ""; }
                        })
                    }
                });
            } else {
                childRow.push({
                    toString() { return ""; }
                });
            }
        })

        if (!isEmpty) {
            rows.push(childRow);
            return true;
        }

        return false;
    }
    

    // Loop on first level
    header.forEach((entry, colIndex) => {
        rows[0].push({
            ...entry,
            toString() { return this.name; }
        });

        if (entry.children) {
            addRow(entry.children);
        }
    });

    let nextRow;
    do {
        nextRow = addRow();
    } while (nextRow);

    return rows;
}

// =============================================================================
function getHeader3(obj) {
    let header = [];
    function loop3(obj, rowIndex = 0, colIndex = 0)
    {
        if (!header[rowIndex]) {
            header[rowIndex] = [];
        }

        // Go to the left and fill in blanks if needed
        let ci = colIndex - 1;
        while (ci >= 0) {
            const val = header[rowIndex][ci];
            if (val === undefined) {
                header[rowIndex][ci] = "...";
            }
            ci--;
        }

        ci = colIndex;
        for (const key in obj) {
            // header[rowIndex][ci] = key;
            header[rowIndex].push(key);

            const value = obj[key];
            if (value && typeof value == "object") {
                loop3(value, rowIndex + 1, ci);
            }

            if (ci - colIndex > 0) {
                let ri = rowIndex;
                while (ri > 0) {
                    header[--ri].splice(ci, 0, "...");
                }
            }

            ci += 1
        }

        return header;
    }

    loop3(obj)

    const x = Math.max.apply(Math, header.map(row => row.length));

    header = header.map(row => {
        while (row.length < x) row.push("...");
        return row;
    });

    return header;
}


function loop(rowIndex, colIndex, obj, header)
{
    let hasNextRow = false;

    // Build the first row -----------------------------------------------------
    for (const key in obj) {
        const value = obj[key];
        const data  = { name: key };
        if (value && typeof value == "object") {
            data.children = value;
            hasNextRow = true
        }
        header.addCell(rowIndex, colIndex, new CSVHeaderCell(data));
        colIndex += 1
    }

    // Additional rows ---------------------------------------------------------
    while (hasNextRow) {
        hasNextRow = false;
        const thisRow = header.rows[rowIndex];
        rowIndex++;

        // Cells
        for (let i = 0; i < thisRow.cells.length; i++) {
            const cell = thisRow.cells[i];
        
            // Cells that have children - recursion
            if (cell.children) {
                let childIndex = 0;
                for (const key in cell.children)
                {
                    // console.log(key)
                    const value = cell.children[key];
                    const data  = { name: key };
                    if (value && typeof value == "object") {
                        data.children = value;
                        hasNextRow = true;
                    }
                    
                    header.addCell(rowIndex, i + childIndex, new CSVHeaderCell(data));

                    // If this cell has more than one child, go up and append
                    // one cell after the current one
                    if (childIndex > 0) {
                        let _rowIndex = rowIndex - 1;
                        while (_rowIndex >= 0) {
                            // header.rows[_rowIndex].cells[i + childIndex].colspan += 1;
                            header.rows[_rowIndex].cells.splice(
                                // i + childIndex,
                                i + 1,
                                0,
                                new CSVHeaderCell()
                            );
                            _rowIndex--
                        }
                        
                    }

                    i += childIndex;

                    childIndex += 1;
                }

                
            }

            // Cells that don't have children - just add empty cell below
            else {
                header.addCell(rowIndex, i, new CSVHeaderCell({ name: "" }));
            }
        }
    }

    // loop(rowIndex, colIndex, obj, header)

    // return header.rows[rowIndex];
}

function loop2(rowIndex, header)
{
    const childRow  = new CSVHeaderRow();
    const parentRow = header.rows[rowIndex];

    parentRow.forEachCell((cell, colIndex) => {
        if (cell.children) {
            let propIndex = 0;
            for (const name in cell.children) {
                childRow.addCell(new CSVHeaderCell({ name }));
                // header.addCell(rowIndex + 1, colIndex, new CSVHeaderCell({ name }))
                if (++propIndex > 1) {
                    header.addCell(rowIndex, colIndex + propIndex, new CSVHeaderCell())
                }
            }
        } else {
            childRow.addCell(new CSVHeaderCell({}));
        }
    });

    if (!childRow.isEmpty()) {
        rowIndex = header.rows.push(childRow);
        // loop2(rowIndex, header)
    }
}

function NdJsonToCSV(filePath) {
    let header = new CSVHeader();

    forEachLine(filePath, (line, i) => {
        const json = JSON.parse(line);

        

        // console.log
        if (i > 0) {
            return;
        }

        // console.log(JSON.stringify(json, null, 4));
        // loop(0, 0, json, header)
        console.log(
            getHeader3(json).map(row => {
                return "|" + row.map(cell => strPad(cell || " ", 13)).join("|") + "|";
            }).join("\n")
        );
        

        
        // loop2(0, header)
        // ---------------------------------------------------------------------

        // const row = header.addRow();
        // for (const key in json) {
        //     const value = json[key];
        //     row.addCell(new CSVHeaderCell({
        //         name    : key,
        //         children: value && typeof value == "object" ? value : undefined,
        //         path    : undefined
        //     }));
        // }

        // const nextRow = header.addRow();
        // for (const key in json) {
        //     const value = json[key];
        //     if (value && typeof value == "object") {
        //         for (const key2 in value) {
        //             nextRow.addCell(new CSVHeaderCell({
        //                 name    : key2
        //             }));
        //         }
        //     } else {
        //         nextRow.addCell(new CSVHeaderCell({
        //             name: ""
        //         }));    
        //     }
            
            
        // }


        // Object.assign(header, getHeader(json));
    }, () => {
        // console.log(JSON.stringify(compileHeader(header).map(String), null, 2));
        // console.log(JSON.stringify(header, null, 4));
        // console.log(new CSVHeader(header).toString());
        // console.log(header.normalize().toString());
        // console.log(header.join(",") + "\n");

        // forEachLine(filePath, line => {
        //     const json = JSON.parse(line);
        //     const csvLine = header.map(prop => json[prop]);
        //     console.log(csvLine.join(","));
        // });
    })
}

module.exports = {
    NdJsonToCSV
};


// NdJsonToCSV("../sample-apps-stu3/fhir-downloader/downloads/2.Immunization.ndjson");
NdJsonToCSV("../sample-apps-stu3/fhir-downloader/downloads/3.Procedure.ndjson");