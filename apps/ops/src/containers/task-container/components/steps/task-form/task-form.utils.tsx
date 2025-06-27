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

export const normalizeFormData = (formData: any) => {
    function isStringifiedObject(str: string) {
        if (typeof str !== 'string') return false;
        try {
            const parsed = JSON.parse(str);
            return typeof parsed === 'object' && parsed !== null;
        } catch {
            return false;
        }
    }
    function isArrayOfStringifiedObjects(arr: string[]) {
        return (
            Array.isArray(arr) &&
            arr.length > 0 &&
            arr.every((item) => isStringifiedObject(item))
        );
    }

    function traverse(formData: any) {
        if (Array.isArray(formData)) {
            for (let i = 0; i < formData.length; i++) {
                if (typeof formData[i] === 'object' && formData[i] !== null) {
                    traverse(formData[i]);
                } else if (isStringifiedObject(formData[i])) {
                    formData[i] = JSON.parse(formData[i]);
                    traverse(formData[i]);
                }
            }
        } else if (typeof formData === 'object' && formData !== null) {
            for (const key in formData) {
                if (!Object.prototype.hasOwnProperty.call(formData, key))
                    continue;
                const value = formData[key];

                if (isArrayOfStringifiedObjects(value)) {
                    formData[key] = value.map((item: any) => {
                        const parsed = JSON.parse(item);
                        traverse(parsed);
                        return parsed;
                    });
                } else if (isStringifiedObject(value)) {
                    formData[key] = JSON.parse(value);
                    traverse(formData[key]);
                } else {
                    traverse(value);
                }
            }
        }
    }

    traverse(formData);
    return formData;
};
