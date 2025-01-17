import { v4 as uuidv4 } from 'uuid';

import { FormMetadata, TaskType } from '@deps/models/case/task';
import { MatchingCaseTypes, PotentialMatches } from '@deps/models/case/task/doc-matching-payment';
import { ManagementTask } from '@deps/models/case/task-instance';
export const TaskMetadataHelper = (task: ManagementTask, tasksMetadata: any[]) => {
    return tasksMetadata.map((taskMetadata: FormMetadata) => {
        switch (task.taskType) {
            case TaskType.PURCHASE_DOCUMENT_MATCHING: {
                if (taskMetadata.uiSchema) {
                    if (taskMetadata.uiSchema) {
                        const potentialMatchesOptions = generatePotentialMatchesOptions(task.data.potentialMatches);
                        taskMetadata.uiSchema.potentialMatches?.['ui:options'].customOptions.unshift(...potentialMatchesOptions);
                    }
                }

                return taskMetadata;
            }

            default:
                return taskMetadata;
        }
    });
};

const generatePotentialMatchesOptions = (potentialMatches: PotentialMatches[]): any[] => {
    return potentialMatches.map((item: PotentialMatches) => {
        const id = uuidv4();
        const subElement = {
            label: MatchingCaseTypes[item.entityType as keyof typeof MatchingCaseTypes] ?? MatchingCaseTypes.NB_APPLICATION_DATA,
            value: item.zlCaseId,
            title: item.entityType,
            type: 'link',
            url: `/cases/${item.zlCaseId}`,
            disabled: false,
        };
        return { label: item.entityType, value: item.correlationId, id, subElement };
    });
};
