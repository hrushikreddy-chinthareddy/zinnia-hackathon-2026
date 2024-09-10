import { ICellRendererParams } from 'ag-grid-community/dist/lib/rendering/cellRenderers/iCellRenderer';

export function CellLink(params: ICellRendererParams) {
    return <a href={params.data.taskInfoLink}>{params.data.taskId}</a>;
}
