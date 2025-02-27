import { v4 as uuidv4 } from 'uuid';

import { FormMetadata, TaskType } from '@deps/models/case/task';
import { PotentialMatches } from '@deps/models/case/task/doc-matching-payment';
import { ManagementTask } from '@deps/models/case/task-instance';
export const TaskMetadataHelper = (task: ManagementTask, tasksMetadata: any[]) => {
    return tasksMetadata.map((taskMetadata: FormMetadata) => {
        switch (task.taskType) {
            case TaskType.PURCHASE_DOCUMENT_MATCHING: {
                const uiSchema = taskMetadata.uiSchema || {};

                if (uiSchema.matchingResult?.['ui:options']?.customOptions) {
                    const existingOptions = uiSchema.matchingResult['ui:options'].customOptions.map((option: any) => {
                        if (option.value === undefined) {
                            return { ...option, value: null };
                        }
                        return option;
                    });

                    const potentialMatchesOptions = generatePotentialMatchesOptions(task?.data?.potentialMatches || []) || [];

                    uiSchema.matchingResult['ui:options'].customOptions = [...potentialMatchesOptions, ...existingOptions];
                }

                return taskMetadata;
            }

            default:
                return taskMetadata;
        }
    });
};

const generatePotentialMatchesOptions = (potentialMatches: PotentialMatches[]): any[] => {
    return (
        potentialMatches
            ?.filter(item => item.correlationid && item.correlationid !== '')
            ?.map((item: PotentialMatches) => {
                const id = uuidv4();
                const subElement = {
                    label: '',
                    value: item?.zlCaseId ?? '',
                    title: item?.entityType ?? '',
                    url: `/cases/${item.zlCaseId}`,
                    disabled: false,
                };
                return { label: item.entityType, value: item.correlationid, id, subElement };
            }) || []
    );
};
