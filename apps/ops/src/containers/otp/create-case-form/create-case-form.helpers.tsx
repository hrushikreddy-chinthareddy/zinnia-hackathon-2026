import { TFunction } from 'next-i18next';

import { TaskStatus } from '@deps/models/case/task-instance';
import { CaseStatus } from '@deps/models/case/withdrawal/case';

export default function getCreateCaseConfig(t: TFunction) {
    const isReadOnly = (status: string) => {
        return status === CaseStatus.Submit || status === TaskStatus.Completed;
    };

    // REG60 is the spacial case which wont be editable yet
    const isEditable = (status: string) => {
        return (
            status === CaseStatus.Pending ||
            status === TaskStatus.New ||
            status === TaskStatus.InProgress
        );
    };

    const taskTableConfig = {
        searchResults: t('tasksListing.searchResults'),
        createNewTask: t('tasksListing.createNewTask'),
        noTaskFound: {
            createNewTask: t('tasksListing.createNewTask'),
            noTasksFoundTitle: t('tasksListing.noTasksFoundTitle'),
            noTasksMessage: t('tasksListing.noTasksMessage'),
        },
        actionCellParams: {
            isReadOnly,
            isEditable,
            actionLabels: {
                edit: t('tasksListing.actions.edit'),
                readOnlyView: t('tasksListing.actions.readOnlyView'),
                duplicateTaskContent: t('tasksListing.actions.edit'),
            },
            actionMenu: t('tasksListing.actionMenu'),
        },
    };

    return {
        taskTableConfig,
    };
}
