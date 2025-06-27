export enum ColumnType {
    Text = 'text',
    Number = 'number',
    Boolean = 'boolean',
    Input = 'input',
}
export type TableColumn = {
    field: string;
    headerName?: string;
    editable?: boolean;
    sortable?: boolean;
    type?: ColumnType;
    width?: string;
    cellRenderer?: (params: any) => JSX.Element;
    cellRendererParams?: any;
};

export type TypedRow<T> = T & { [key: string]: any };

export type SortOrderColumn = {
    column: string;
    order: 'asc' | 'desc';
};
