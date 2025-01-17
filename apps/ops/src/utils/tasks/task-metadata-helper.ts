import { v4 as uuidv4 } from 'uuid';

import { FormMetadata, TaskType } from '@deps/models/case/task';
import { PotentialMatches } from '@deps/models/case/task/doc-matching-payment';
import { ManagementTask } from '@deps/models/case/task-instance';
export const TaskMetadataHelper = (task: ManagementTask, tasksMetadata: any[]) => {
    return tasksMetadata.map((taskMetadata: FormMetadata) => {
        switch (task.taskType) {
            case TaskType.PURCHASE_DOCUMENT_MATCHING: {
                // const conditions = task.data.potentialMatches.map((item: any) => {
                //     return {
                //         if: {
                //             properties: {
                //                 potentialMatches: { const: item.correlationId },

                //             },
                //         },
                //         then: {
                //             properties: {
                //                 isDuplicate: {
                //                     type: 'string',
                //                     title: 'Is this document a duplicate?',
                //                     enum: ['Yes', 'No'],
                //                 },
                //             },
                //         },
                //     };
                // });

                // if (taskMetadata.formSchema) {
                //     taskMetadata.formSchema.allOf = [...(taskMetadata.formSchema.allOf || []), ...conditions];
                // }

                if (taskMetadata.uiSchema) {
                    const potentialMatchesOptions =
                        task.data.potentialMatches.map((item: PotentialMatches) => {
                            const id = uuidv4();
                            const subElement = {
                                label: item.entityType,
                                value: item.correlationId,
                                title: item.entityType,
                                type: 'link',
                                url: `/cases/${item.zlCaseId}`,
                                disabled: false,
                            };
                            return { label: item.entityType, value: item.correlationId, id, subElement };
                        }) || [];

                    taskMetadata.uiSchema.potentialMatches?.['ui:options'].customOptions.unshift(...potentialMatchesOptions);
                }

                return taskMetadata;
            }

            default:
                return taskMetadata;
        }
    });
};
