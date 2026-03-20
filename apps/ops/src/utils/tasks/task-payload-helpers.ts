import { FormMetadata, TaskType } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';

import {
    getThirdPartyDetailPayload,
    getPurchaseDocumentPayload,
    getStandardDocumentPayload,
    getAssigneeChangePayload,
    getBeneficiaryChangePayload,
    getAnnuitantChangePayload,
    getBeneAddressVerificationPayload,
} from './task-payload-formatter';

export const buildTaskPayload = (
    task: ManagementTask,
    initialTask: ManagementTask
) => {
    switch (task.taskType) {
        case TaskType.PURCHASE_DOCUMENT_MATCHING:
            return getPurchaseDocumentPayload(task, initialTask);
        case TaskType.Standard_Document_Matching:
            return getStandardDocumentPayload(task, initialTask);
        case TaskType.Third_Party_Detail:
            return getThirdPartyDetailPayload(task);
        case TaskType.Initiate_AssigneeChange_Transaction:
            return getAssigneeChangePayload(task);
        case TaskType.Initiate_BeneChange_Transaction:
            return getBeneficiaryChangePayload(task);
        case TaskType.Initiate_AnnuitantChange_Transaction:
            return getAnnuitantChangePayload(task);
        case TaskType.Bene_Address_Verification:
            return getBeneAddressVerificationPayload(task);
        default:
            return task;
    }
};

/**
 * Cleans form data by removing properties marked for omission in the UI schema
 */

export const cleanForm = (formData: any, taskMetadata: FormMetadata) => {
    const removeOmittedProperties = (
        schema: any,
        data: any,
        parentPath: string[] = []
    ) => {
        Object.keys(schema).forEach((key) => {
            if (key.includes('ui')) return;
            const currentPath = [...parentPath, key];
            const options = schema[key]?.['ui:options'];

            if (Array.isArray(data?.[key]) && schema[key]?.items) {
                data[key].forEach((item: any) => {
                    removeOmittedProperties(schema[key].items, item, []);
                });
            }

            if (options?.omitValue) {
                let target = data;
                for (let i = 0; i < parentPath.length; i++) {
                    const currentKey = parentPath[i];
                    // if key with omitValue is present in an array,
                    // delete the key from all objects in the array and exit
                    if (currentKey === 'items') {
                        for (const item of target) {
                            delete item[key];
                        }
                        return;
                    }
                    // Traverse deeper into the object/array
                    target = target?.[currentKey];
                    if (!target) return;
                }
                // If traversal completed and target exists, delete the key
                if (target) delete target[key];
            } else if (
                typeof schema[key] === 'object' &&
                schema[key] !== null
            ) {
                removeOmittedProperties(schema[key], data, currentPath);
            }
        });
    };

    removeOmittedProperties(taskMetadata.uiSchema, formData.data || formData);
    return formData;
};
