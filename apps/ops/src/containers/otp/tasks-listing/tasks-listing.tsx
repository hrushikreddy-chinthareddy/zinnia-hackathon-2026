import { ICellRendererParams } from 'ag-grid-community/dist/lib/rendering/cellRenderers/iCellRenderer';

import NavElement, { NavElementType, NavElementSize, NavElementVariant } from '@deps/components/nav-element/nav-element';
import DepTable from '@deps/components/table/table';
import { getSlug } from '@deps/helpers/string.helper';

import { Task, TaskTableRow, TasksListingProps } from './task-listing.types';

export const buildTaskLink = (taskId: string, caseId: string, caseType: string, documentNumber: string, clientId: string) => {
    const caseSlug = getSlug(caseType);
    const link = `/create-case/${caseSlug}/${caseId}?taskId=${taskId}&doc=${documentNumber}&clientId=${clientId}`;
    return link;
};

export function CellLink(params: ICellRendererParams) {
    return <a href={params.data.taskInfoLink}>{params.data.taskId}</a>;
}

export const toFormattedTask = (task: Task, caseId: string, caseType: string, documentNumber: string, clientId: string) => {
    return {
        taskId: task.id,
        taskInfoLink: buildTaskLink(task.id, caseId, caseType, documentNumber, clientId),
        status: task.status,
        taskName: task.taskName,
        statusDuration: '-',
        actions: '-',
    };
};

export default function TasksListing({ tasks, config, caseId, caseType, documentNumber, clientId }: TasksListingProps) {
    let taskTableRows: TaskTableRow[] = tasks?.map(task => toFormattedTask(task, caseId, caseType, documentNumber, clientId)) || [];

    taskTableRows = taskTableRows.filter(task => task.status === 'NEW' || task.status === 'COMPLETED');

    const onFirstDataRendered = (params: any) => {
        params.api.sizeColumnsToFit();
    };

    const onGridSizeChanged = (params: any) => {
        params.api.sizeColumnsToFit();
    };

    const route = `${caseType.toLowerCase()}/${caseId}`;

    return (
        <div className="pb-6 pt-12">
            <div className="grid grid-cols-2">
                <div className="col-span-1">
                    <p className="leading-7.5 mb-4 font-primary text-xl font-medium text-gray-900">{config.searchResults}</p>
                </div>
                <div className="col-span-1">
                    <NavElement
                        type={NavElementType.Link}
                        className="float-right flex items-center"
                        size={NavElementSize.Small}
                        variant={NavElementVariant.Default}
                        href={`/create-case/${route}?doc=${documentNumber}&clientId=${clientId}`}
                    >
                        <span>{config.createNewTask}</span>
                    </NavElement>
                </div>
            </div>
            {tasks.length > 0 ? (
                <DepTable
                    rowData={taskTableRows}
                    cols={config.taskTableColConfig}
                    automaticHeight={true}
                    suppressAutoSize={true}
                    defaultColDef={{ resizable: false }}
                    onFirstDataRendered={onFirstDataRendered}
                    onGridSizeChanged={onGridSizeChanged}
                    paginationPageSize={5}
                    pagination={true}
                />
            ) : (
                <div>{config.noTasksMessage}</div>
            )}
        </div>
    );
}
