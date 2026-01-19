import { Loader, LoaderVariant } from '@zinnia/bloom/components';

import AssigneePopover, {
    AssigneePopoverPositionMode,
} from '@deps/containers/task-management-queue/table-elements/assignee-popover';
import {
    AssignedTask,
    ManagementTask,
    UnassignedTask,
} from '@deps/models/case/task-instance';

export type Task = AssignedTask | UnassignedTask | ManagementTask;

export interface AssigneeFieldProps {
    task: Task;
    isOpsManagerView?: boolean;

    assigneeList: Array<{
        user: string;
        partyId: string;
    }>;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    assigneeLoading: boolean;
    actionLoader: boolean;
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
    onTaskUpdated?: (task: Task) => void;

    fallback?: React.ReactNode;
    positionMode?: AssigneePopoverPositionMode;
}

export const AssigneeField = ({
    task,
    isOpen,
    onOpen,
    onClose,
    positionMode,
    isAssigning,
    actionLoader,
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

    return (
        <AssigneePopover
            task={task}
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            positionMode={positionMode}
            assignee={task.assignee}
            assigneeList={assigneeList}
            assigneeLoading={assigneeLoading}
            actionLoader={actionLoader}
            searchValue={searchValue}
            handleClick={handleClick}
            handleSearch={handleSearch}
            hasAssignee={hasAssignee}
            handleTaskAssignAsAdmin={handleTaskAssignAsAdmin}
            handleTaskUnassignAsAdmin={handleTaskUnassignAsAdmin}
        />
    );
};
