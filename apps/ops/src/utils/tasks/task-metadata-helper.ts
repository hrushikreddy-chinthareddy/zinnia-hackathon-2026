import { v4 as uuidv4 } from 'uuid';

import { TaskType } from '@deps/models/case/task';
import { PotentialMatches } from '@deps/models/case/task/doc-matching-payment';
import { ManagementTask } from '@deps/models/case/task-instance';
export const TaskMetadataHelper = (task: ManagementTask, taskMetadata: any) => {
    switch (task.taskType) {
        case TaskType.NB_LINK_PAYMENT_POLICY: {
            const conditions = task.data.potentialMatches.map((item: any) => {
                return {
                    if: {
                        properties: {
                            potentialMatches: { const: item.value },
                        },
                    },
                    then: {
                        properties: {
                            isDuplicate: {
                                type: 'string',
                                title: 'Is this document a duplicate?',
                                enum: ['Yes', 'No'],
                            },
                        },
                    },
                };
            });

            taskMetadata.formSchema.allOf = [...taskMetadata.formSchema.allOf, ...conditions];

            if (taskMetadata.uiSchema) {
                const potentialMatchesOptions =
                    task.data.potentialMatches.map((item: PotentialMatches) => {
                        const id = uuidv4();
                        return { ...item, id };
                    }) || [];

                taskMetadata.uiSchema.potentialMatches?.['ui:options'].customOptions.unshift(...potentialMatchesOptions);
            }

            return taskMetadata;
        }

        default:
            return taskMetadata;
    }
};
