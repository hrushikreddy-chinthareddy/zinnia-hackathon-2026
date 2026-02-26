import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { updateCaseTask } from '@deps/operations/tasks/task-operations';
import { browserLogInfo } from '@deps/utils/browser-logging';

import { Phone } from './task-handlers/types';

export const updateTask = async (
    task: ManagementTask,
    correlationId: string,
    taskStatus?: TaskStatus
): Promise<boolean> => {
    browserLogInfo('updateTask::Updating task', {
        payload: {
            taskType: task.taskType,
            carrier: task.carrier,
            processType: task.process,
            taskId: task.id,
        },
    });
    const taskResponse = await updateCaseTask(task, taskStatus);
    if (!taskResponse) {
        return false;
    }
    return true;
};

export const getFormattedPhoneNumber = (phone: Phone) => {
    if (!phone) return null;

    const rawDialNumber = phone?.dialNumber ?? '';

    const dialNumber =
        rawDialNumber.length >= 7
            ? rawDialNumber.slice(rawDialNumber.length - 7)
            : rawDialNumber;
    const areaCode =
        phone?.areaCode ??
        (rawDialNumber.length >= 10
            ? rawDialNumber.slice(
                  rawDialNumber.length - 10,
                  rawDialNumber.length - 7
              )
            : '');
    const countryCode =
        phone?.countryCode ??
        (rawDialNumber.length > 10
            ? rawDialNumber.slice(0, rawDialNumber.length - 10)
            : '1');

    const formattedNumber = `${countryCode}${areaCode}${dialNumber}`;
    return formattedNumber.trim() || null;
};
