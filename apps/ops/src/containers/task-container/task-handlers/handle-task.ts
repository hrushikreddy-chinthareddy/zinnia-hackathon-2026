import { TaskType } from '@deps/models/case/task';
import { LoggingContext, logWarn } from '@deps/utils/server-logging';

import { allowedTaskTypes } from './task-config';

export async function applyDynamicOptions(
    task: any,
    accessToken: string = '',
    currentTaskMetadata: any,
    logCtx: LoggingContext
) {
    const { taskType } = task;

    if (!Object.values(TaskType).includes(taskType as TaskType)) {
        return;
    }

    const validatedTaskType = taskType as TaskType;

    if (!allowedTaskTypes.has(validatedTaskType)) {
        return;
    }

    try {
        const taskFileName = validatedTaskType.toLowerCase().replace(/_/g, '-');
        const handlerModule = await import(`./tasks/${taskFileName}`);
        const handler = handlerModule.default;

        if (!handler)
            throw new Error(`Handler not found for task: ${validatedTaskType}`);

        // Pass the full task object to the handler so it can construct the correct payload
        const payload = handler.getPayload(task);
        const response = await handler.api(payload, accessToken);
        handler.transformResponse(response, currentTaskMetadata, task, logCtx);
    } catch (error) {
        logWarn(
            `applyDynamicOptions:: Error handling task ${validatedTaskType}:`,
            {
                ...logCtx,
                error,
            }
        );
    }
}
