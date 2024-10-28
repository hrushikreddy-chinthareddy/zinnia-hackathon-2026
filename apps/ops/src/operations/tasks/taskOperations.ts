import { mockService } from '@deps/mock-service/mockService';
import { CaseType } from '@deps/models/case/case';
import { ApiVersion, ProcessType } from '@deps/models/case/enums';
import { CaseApiVersionMapper } from '@deps/models/case/helpers';
import { TaskType } from '@deps/models/case/task';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { getCaseTaskInstances, getCaseTasks, getTaskFormMetadataSSR } from '@deps/queries/api/v1/task';

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

export const getTaskFormMetadata = async (clientId: string, taskType?: TaskType, processType?: ProcessType, accessToken?: string) => {
    const isMockService = true;
    if (isMockService) {
        return mockService.getTaskFormMetadataSSRMock();
    } else {
        return getTaskFormMetadataSSR(clientId, taskType, processType, accessToken);
    }
};
export const getCaseTaskByIdSSR = async (taskId: string, accessToken: string | undefined): Promise<ManagementTask<TaskStatus> | null> => {
    const isMockService = true;
    if (isMockService) {
        return mockService.getCaseTaskByIdSSRMock();
    } else {
        return getCaseTaskByIdSSR(taskId, accessToken);
    }
};
