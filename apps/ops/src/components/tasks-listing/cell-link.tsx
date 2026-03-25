import { ICellRendererParams } from 'ag-grid-community';

export function CellLink(params: ICellRendererParams) {
    return <a href={params.data.taskInfoLink}>{params.data.taskId}</a>;
}
