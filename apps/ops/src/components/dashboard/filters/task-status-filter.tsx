import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import sharedStyles from '@deps/components/dashboard/dashboard-shared.module.css';
import { TasksVolumeContext } from '@deps/components/dashboard/sections/tasks-volume/context/tasks-volume-context';
import { FieldSize } from '@deps/components/fields/field';
import Select from '@deps/components/select/select';

import { TaskStatus } from '../sections/tasks-volume/utils';

export type TaskStatusType = { [key: string]: string };

const STATUS_GROUPS = {
    Open: [TaskStatus.OPEN, TaskStatus.INPROGRESS],
    Closed: [TaskStatus.CLOSED, TaskStatus.COMPLETED, TaskStatus.COMPLETE],
};
const STATUS_OPTIONS = [
    {
        label: 'Open',
        value: 'Open',
        displayText: 'Open',
    },
    {
        label: 'Closed',
        value: 'Closed',
        displayText: 'Closed',
    },
];

const getSelectedGroups = (selectedStatus: TaskStatus[]): TaskStatusType => {
    const groups: TaskStatusType = {};

    const hasOpen = STATUS_GROUPS.Open.some((status) =>
        selectedStatus.includes(status)
    );
    if (hasOpen) {
        groups['Open'] = 'Open';
    }

    const hasClosed = STATUS_GROUPS.Closed.some((status) =>
        selectedStatus.includes(status)
    );
    if (hasClosed) {
        groups['Closed'] = 'Closed';
    }

    return groups;
};
const handleStatusChangeLogic = (
    selected: string,
    currentSelectedStatus: TaskStatus[]
): TaskStatus[] => {
    let newStatuses: TaskStatus[] = [...currentSelectedStatus];

    if (selected === 'Open') {
        const hasOpen = STATUS_GROUPS.Open.some((status) =>
            currentSelectedStatus.includes(status)
        );
        if (hasOpen) {
            newStatuses = newStatuses.filter(
                (status) => !STATUS_GROUPS.Open.includes(status)
            );
        } else {
            newStatuses = [
                ...newStatuses.filter(
                    (status) => !STATUS_GROUPS.Open.includes(status)
                ),
                ...STATUS_GROUPS.Open,
            ];
        }
    } else if (selected === 'Closed') {
        const hasClosed = STATUS_GROUPS.Closed.some((status) =>
            currentSelectedStatus.includes(status)
        );
        if (hasClosed) {
            newStatuses = newStatuses.filter(
                (status) => !STATUS_GROUPS.Closed.includes(status)
            );
        } else {
            newStatuses = [
                ...newStatuses.filter(
                    (status) => !STATUS_GROUPS.Closed.includes(status)
                ),
                ...STATUS_GROUPS.Closed,
            ];
        }
    }
    return newStatuses;
};

export const TaskStatusFilter = () => {
    const { t } = useTranslation();
    const { selectedStatus, setSelectedStatus } =
        useContext(TasksVolumeContext);

    const statusValueObject = getSelectedGroups(selectedStatus);

    const handleStatusChange = (selected: string) => {
        const newStatuses = handleStatusChangeLogic(selected, selectedStatus);
        setSelectedStatus(newStatuses);
    };

    return (
        <Select
            label={String(t('caseStats.tasks.filters.status.label') ?? '')}
            placeholder={String(
                t('caseStats.tasks.filters.status.placeholder') ?? ''
            )}
            options={STATUS_OPTIONS}
            size={FieldSize.XS}
            name="task-status-dropdown-btn"
            value={statusValueObject}
            isMultiselect
            className={sharedStyles.multiselectDropdowns}
            onChange={handleStatusChange}
        />
    );
};
