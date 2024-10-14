import { ColDef } from 'ag-grid-community';

import { Benefit } from '../create-disclosure/create-disclosure.types';
export interface ComparisonBenefitsTableProps {
    onBenefitTableChange?: any;
    rowConfig?: Benefit[];
    colConfig: ColDef[];
    initialData?: Benefit[];
    tableWrapperClassName?: string;
}

export interface TableCell {
    headerName: string;
    field: string;
    editable: boolean;
    cellClass?: string[];
}

export interface TableConfigInterface {
    title: string;
    rowConfig: RowConfig[];
    colConfigFixed?: TableCell;
    colConfigVariable?: TableCell;
}

export interface RowConfig {
    period: string;
    returnGuarRate: string;
    returnCurrRate: string;
    return0Prct: string;
    return6Prct: string;
    return12Prct: string;
}

interface ColConfig {
    headerName: string;
    field: string;
    editable: boolean;
    cellClass: string[];
    valueParser?: any;
    valueFormatter?: any;
}

export interface TableConfig {
    title: string;
    rowConfig: RowConfig[];
    colConfigFixed: ColConfig;
    colConfigVariable: ColConfig;
}
