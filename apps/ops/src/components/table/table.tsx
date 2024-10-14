import { ColDef, GridApi, GridReadyEvent, RowClassRules, RowClickedEvent, SelectionChangedEvent } from 'ag-grid-community';
import { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import clsx from 'clsx';
import { RefObject, useMemo, useRef, useState } from 'react';

import { useStylesheet } from './useStylesheet';

export interface TableProps extends AgGridReactProps {
    automaticHeight?: boolean;
    cols: ColDef<any>[];
    onGridReady?: (e: GridReadyEvent) => void;
    onRowClicked?: (e: RowClickedEvent) => void;
    rowClass?: string;
    rowClassRules?: RowClassRules;
    rowData?: any[];
    rowSelectHandler?: (ref: RefObject<AgGridReact<any>>, e: SelectionChangedEvent<any, any>) => void;
    suppressRowHoverHighlight?: boolean;
    customComparisonTableStyles?: boolean;
}

export default function DepTable(props: TableProps): JSX.Element {
    useStylesheet('https://cdn.jsdelivr.net/npm/ag-grid-community@29.2.0/styles/ag-grid.css');
    useStylesheet('https://cdn.jsdelivr.net/npm/ag-grid-community@29.2.0/styles/ag-theme-alpine.css');

    const [, setGridApi] = useState<GridApi | null>(null);

    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);

    const {
        automaticHeight,
        cols,
        onGridReady,
        onRowClicked,
        rowClass,
        rowClassRules,
        rowData,
        rowSelectHandler,
        suppressRowHoverHighlight,
        customComparisonTableStyles,
    } = props;

    const gridRef = useRef<AgGridReact>(null);

    // Set GridAPI when the Grid is Ready.
    const handleGridReady = (event: GridReadyEvent) => {
        setGridApi(event.api);

        if (onGridReady) {
            onGridReady(event);
        }
    };

    const gridCustomStyles = customComparisonTableStyles ? 'custom-grid-comaprison-table-styles' : '';

    return (
        <div style={containerStyle} className="text-sm">
            <div className={clsx("ag-theme-alpine", gridCustomStyles)}>
                <AgGridReact
                    {...props}
                    columnDefs={cols}
                    domLayout={automaticHeight ? 'autoHeight' : 'normal'}
                    onGridReady={handleGridReady}
                    onRowClicked={onRowClicked}
                    onSelectionChanged={e => rowSelectHandler && rowSelectHandler(gridRef, e)}
                    ref={gridRef}
                    rowClass={rowClass}
                    rowClassRules={rowClassRules}
                    rowData={rowData}
                    rowSelection="single"
                    suppressRowHoverHighlight={suppressRowHoverHighlight}
                />
            </div>
        </div>
    );
}
