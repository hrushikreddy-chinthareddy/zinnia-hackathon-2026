import { TFunction } from 'next-i18next';

import ActionCellRenderer from '@deps/components/tasks-listing/action-cell-renderer';
import { TaskStatus } from '@deps/models/case/task-instance';
import { CaseStatus } from '@deps/models/case/withdrawal/case';

export default function getCreateCaseConfig(t: TFunction) {
    const isReadOnly = (status: string) => {
        return status === CaseStatus.Submit || status === TaskStatus.Completed;
    };

    // REG60 is the spacial case which wont be editable yet
    const isEditable = (status: string) => {
        return (status === CaseStatus.Pending || status === TaskStatus.New ||  status === TaskStatus.InProgress);
    };

    const taskTableColConfig = [
        {
            headerName: t('tasksListing.tableColumns.status'),
            field: 'taskStatus',
            sortable: true,
        },
        {
            headerName: t('tasksListing.tableColumns.taskId'),
            field: 'taskId',
        },
        {
            headerName: t('tasksListing.tableColumns.statusDuration'),
            field: 'statusDuration',
        },
        {
            headerName: t('tasksListing.tableColumns.userId'),
            field: 'userId',
        },
        {
            headerName: t('tasksListing.tableColumns.actions'),
            field: 'actions',
            cellRenderer: ActionCellRenderer,
            cellRendererParams: {
                isReadOnly,
                isEditable,
                actionLabels: {
                    edit: t('tasksListing.actions.edit'),
                    readOnlyView: t('tasksListing.actions.readOnlyView'),
                    duplicateTaskContent: t('tasksListing.actions.edit'),
                },
                actionMenu: t('tasksListing.actionMenu'),
            },
        },
    ];

    const taskTableConfig = {
        searchResults: t('tasksListing.searchResults'),
        createNewTask: t('tasksListing.createNewTask'),
        taskTableColConfig,
        noTaskFound: {
            createNewTask: t('tasksListing.createNewTask'),
            noTasksFoundTitle: t('tasksListing.noTasksFoundTitle'),
            noTasksMessage: t('tasksListing.noTasksMessage'),
        },
    };

    return {
        taskTableConfig,
    };
}
