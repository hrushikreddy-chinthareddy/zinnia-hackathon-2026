import { UiSchema } from '@rjsf/utils';

import { browserLogWarn } from '@deps/utils/browser-logging';

const getRefByPath = (root: any, path: string[]) => {
    let ref = root;
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!ref[key] || typeof ref[key] !== 'object') {
            ref[key] = {};
        }
        ref = ref[key];
    }
    return ref;
};

const isEqual = (a: any, b: any): boolean => {
    return JSON.stringify(a) === JSON.stringify(b);
};

export const getUpdatedTaskFromFormData = (
    prevTask: any,
    formData: any,
    uiSchema: UiSchema
) => {
    const updatedTask = structuredClone(prevTask);

    Object.keys(formData).forEach((field) => {
        const dataPath = uiSchema[field]?.['ui:dataPath'];
        if (!dataPath) return;

        const ref = getRefByPath(updatedTask.data, dataPath);
        const refPrev = getRefByPath(prevTask.data, dataPath);
        const lastKey = dataPath[dataPath.length - 1];

        const currentValue = formData[field];
        const prevValue = refPrev[lastKey];

        if (!isEqual(prevValue, currentValue)) {
            ref[lastKey] = Array.isArray(currentValue)
                ? [...currentValue]
                : currentValue;
        }
    });

    return updatedTask;
};

export const extractFormData = (data: any, uiSchema: UiSchema, schema: any) => {
    const formData: any = {};
    const requiredFields = new Set(schema?.required || []);

    Object.keys(uiSchema).forEach((field) => {
        const dataPath = uiSchema[field]?.['ui:dataPath'];
        if (!dataPath) return;

        let ref = data;
        for (let i = 0; i < dataPath.length; i++) {
            if (ref == null) {
                browserLogWarn(
                    `Path broken at ${dataPath[i]}, skipping ${field}`
                );
                return;
            }
            ref = ref[dataPath[i]];
        }

        if (ref !== undefined) {
            formData[field] = ref;
        } else if (requiredFields.has(field)) {
            browserLogWarn(`Required field ${field} is missing!`);
        }
    });
    if (!Object.keys(formData).length) {
        return data;
    }
    return formData;
};
