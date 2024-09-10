import { GridReadyEvent, CellValueChangedEvent, ColumnApi } from 'ag-grid-community';
import clsx from 'clsx';
import React, { useState } from 'react';

import DepTable from '@deps/components/table/table';

import { ComparisonBenefitsTableProps, RowConfig } from './benefits-table.types';

const BenefitsTable = ({
    rowConfig,
    initialData,
    colConfig,
    onBenefitTableChange,
    tableWrapperClassName,
}: ComparisonBenefitsTableProps) => {
    const [, setGridColumnApi] = useState<ColumnApi | null>(null);
    const [rowData, setRowData] = useState<RowConfig[] | any>(initialData || rowConfig);

    const hanldeGridReady = (params: GridReadyEvent) => {
        setGridColumnApi(params?.columnApi);
        params.api.sizeColumnsToFit();
    };
    const handleCellValueChanged = (params: CellValueChangedEvent) => {
        if (params.rowIndex !== null && params.colDef.field !== undefined) {
            const updatedData = [...rowData];
            updatedData[params.rowIndex][params.colDef.field] = params.newValue;
            onBenefitTableChange(updatedData);
            setRowData(updatedData);
        }
    };

    return (
        <DepTable
            rowData={rowData}
            cols={colConfig}
            automaticHeight={true}
            onGridReady={hanldeGridReady}
            onCellValueChanged={handleCellValueChanged}
            data-testid="benefits-table-test-id"
            className={clsx('rounded-lg shadow-md', tableWrapperClassName)}
            suppressAutoSize={true}
            defaultColDef={{ resizable: false }}
            customComparisonTableStyles
            singleClickEdit
            stopEditingWhenCellsLoseFocus
        />
    );
};

export default BenefitsTable;
