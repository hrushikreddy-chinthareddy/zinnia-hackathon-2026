import { TaskType } from '@deps/models/case/task';
import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import {
    ActiveWithdrawalCase,
    ActiveWithdrawalCaseData,
} from '@deps/models/case/withdrawal/case';

export const mapTaskToActiveWithdrawalCaseTask = (
    data: ManagementTask<TaskStatus>,
    payload: ActiveWithdrawalCaseData
): ActiveWithdrawalCase => {
    return {
        taskId: data.id,
        carrier: data.carrier,
        caseId: data.caseId,
        status: data.status,
        taskType: data.taskType as TaskType,
        updatedDate: data.updatedAt,
        createdDate: data.createdAt,
        source: 'Zinnia.TaskManagement',
        data: payload,
    };
};

export const mapTaskToActiveRenewalCaseTask = (
    data: ManagementTask<TaskStatus>,
    payload: any
): any => {
    return {
        taskId: data.id,
        carrier: data.carrier,
        caseId: data.caseId,
        status: data.status,
        taskType: data.taskType as TaskType,
        updatedDate: data.updatedAt,
        createdDate: data.createdAt,
        createdByPartyId: data?.createdByPartyId,
        source: 'Zinnia.TaskManagement',
        data: payload,
    };
};
