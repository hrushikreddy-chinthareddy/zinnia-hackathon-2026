import { Loader, LoaderVariant } from '@zinnia/bloom/components';

import AssigneePopover from '@deps/containers/task-management-queue/table-elements/assignee-popover';
import {
    AssignedTask,
    ManagementTask,
    TaskStatus,
    UnassignedTask,
    TaskInstance,
} from '@deps/models/case/task-instance';

export type Task =
    | ManagementTask
    | TaskInstance
    | AssignedTask
    | UnassignedTask;

export interface AssigneeFieldProps {
    task: Task;
    isOpsManagerView?: boolean;

    assigneeList: Array<{
        user: string;
        partyId: string;
    }>;
    assigneeLoading: boolean;
    searchValue: string;
    handleClick: () => void;
    handleSearch: (value: string) => void;
    hasAssignee: () => boolean;
    handleTaskAssignAsAdmin: (
        taskId: string,
        assigneePartyId: string
    ) => Promise<void>;
    handleTaskUnassignAsAdmin: (
        taskId: string,
        assigneePartyId: string
    ) => Promise<void>;

    isAssigning?: boolean;
    onTaskUpdated?: (
        task: ManagementTask | TaskInstance | AssignedTask | UnassignedTask
    ) => void;

    fallback?: React.ReactNode;
    positionMode?: 'table' | 'portal';
}

export const AssigneeField = ({
    task,
    positionMode,
    isAssigning,
    handleClick,
    handleSearch,
    assigneeList,
    assigneeLoading,
    searchValue,
    hasAssignee,
    handleTaskAssignAsAdmin,
    handleTaskUnassignAsAdmin,
}: AssigneeFieldProps) => {
    if (isAssigning) {
        return (
            <div className="flex items-center">
                <Loader variant={LoaderVariant.CTA} />
            </div>
        );
    }

    const canUsePopover =
        task.status !== TaskStatus.Completed &&
        task.status !== TaskStatus.Canceled;

    if (canUsePopover) {
        return (
            <AssigneePopover
                task={task}
                positionMode={positionMode}
                assignee={task.assignee}
                assigneeList={assigneeList}
                assigneeLoading={assigneeLoading}
                searchValue={searchValue}
                handleClick={handleClick}
                handleSearch={handleSearch}
                hasAssignee={hasAssignee}
                handleTaskAssignAsAdmin={handleTaskAssignAsAdmin}
                handleTaskUnassignAsAdmin={handleTaskUnassignAsAdmin}
            />
        );
    }
};
