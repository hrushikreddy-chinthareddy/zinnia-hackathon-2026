import { ManagementTask, TaskStatus } from '@deps/models/case/task-instance';
import { updateCaseTask } from '@deps/operations/tasks/task-operations';
import { browserLogInfo } from '@deps/utils/browser-logging';

import { SubOptionsKeyName } from './task-handlers/types';

export const getCheckBoxesSelectWidgetUiSchema = ({
    enumOptions,
    subOptionsKeyName = SubOptionsKeyName.ExceptionSubRefs,
    subOptionsUniqueKey = 'subNigoId',
    readonlyItemLabelKey = 'detailedReason',
    dataPath,
}: {
    enumOptions: any[];
    subOptionsKeyName?: string;
    subOptionsUniqueKey?: string;
    readonlyItemLabelKey?: string;
    dataPath?: string[];
}) => {
    const uiSchema: any = {
        'ui:options': {
            label: true,
            widget: 'CheckBoxesSelectWidget',
            enumOptions: enumOptions,
            subOptionsKeyName,
            subOptionsUniqueKey,
            readonlyItemLabelKey,
        },
    };
    if (dataPath) {
        uiSchema['ui:dataPath'] = dataPath;
    }
    return uiSchema;
};

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
