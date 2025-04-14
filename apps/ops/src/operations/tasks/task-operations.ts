import { mockService } from '@deps/jsonschema-mock-service/mock-service';
import { CaseType } from '@deps/models/case/case';
import { ApiVersion, ProcessType } from '@deps/models/case/enums';
import { CaseApiVersionMapper } from '@deps/models/case/helpers';
import { TaskType } from '@deps/models/case/task';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { getCaseTaskInstances, getCaseTasks, getTaskFormMetadataSSR } from '@deps/queries/api/v1/task';
import { getCaseTaskByIdSSR, updateTask } from '@deps/queries/api/v2/task';
import { LoggingContext } from '@deps/utils/server-logging';

interface TaskItem {
    id: string;
    status: string;
    taskName: string;
    userId: string;
    createdDate: string;
    updatedDate: string;
}

export const fetchTasks = async (caseId: string, caseType: CaseType) => {
    let tasks, formattedList;

    if (CaseApiVersionMapper[caseType] === ApiVersion.v2) {
        tasks = await getCaseTaskInstances({
            caseId: caseId,
            sortBy: 'updatedAt',
            sortDirection: 'asc',
            offset: '0',
            limit: '200',
        });

        const filteredTasks = tasks?.filter((task: any) => {
            return task.status === TaskStatus.New || task.status === TaskStatus.Completed || task.status === TaskStatus.InProgress;
        });

        formattedList = filteredTasks?.map((task: any) => {
            return {
                id: task.id,
                status: task.status,
                taskName: task.taskName,
                userId: task.data?.userId,
                createdDate: task.createdAt,
                updatedDate: task.updatedAt,
            };
        });
    } else {
        tasks = await getCaseTasks({ caseId: caseId });
        const filteredTasks = tasks?.filter((task: any) => {
            return task.status !== 'CANCELLED';
        });

        formattedList = filteredTasks?.map((task: any) => {
            return {
                id: task.taskId,
                status: task.status,
                taskName: '',
                userId: task.data?.userId,
                createdDate: task.createdDate,
                updatedDate: task.updatedDate,
            };
        });
        formattedList.sort((a: TaskItem, b: TaskItem) => b.updatedDate.localeCompare(a.updatedDate));
    }

    return formattedList;
};

export const getTaskFormMetadata = async (
    clientId: string,
    taskType: TaskType,
    processType: ProcessType | undefined,
    accessToken: string | undefined,
    logCtx: LoggingContext,
    taskSchemaOverride: boolean = false
) => {
    if (taskSchemaOverride) {
        return mockService.getTaskFormMetadataSSRMock(taskType);
    }
    return getTaskFormMetadataSSR(clientId, taskType, processType, accessToken, logCtx);
};
export const getCaseTaskById = async (
    taskId: string,
    accessToken: string | undefined,
    logCtx: LoggingContext,
    taskType?: TaskType
): Promise<ManagementTask<TaskStatus> | null> => {
    if (taskType) {
        return mockService.getCaseTaskByIdSSRMock(taskType);
    }
    return getCaseTaskByIdSSR(taskId, accessToken, logCtx);
};

export const updateCaseTask = async (task: ManagementTask, taskStatus?: TaskStatus): Promise<ManagementTask<TaskStatus> | null> => {
    const body = { ...task, status: taskStatus || TaskStatus.Completed };
    return await updateTask(task.caseId, task.id, body);
};
