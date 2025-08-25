export const getObjDeepValue = (object: any, key: string) =>
    key.split('.').reduce((r, k) => r?.[k], object);

export const isEmptyObject = (obj: any) => {
    return Object.entries(obj).length === 0;
};

export function hasSameProperties(
    obj1: any,
    obj2: any,
    propsToMatch: string[]
) {
    for (const key of propsToMatch) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
}

export const areObjectsDifferent = (obj1: any, obj2: any): boolean => {
    if (!obj1 && !obj2) return false;
    if (!obj1 || !obj2) return true;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    const allKeys = [...keys1];

    for (const key of keys2) {
        if (!allKeys.includes(key)) {
            allKeys.push(key);
        }
    }

    return allKeys.some((key) => {
        if (
            (obj1[key] === null ||
                obj1[key] === undefined ||
                obj1[key] === '') &&
            (obj2[key] === null || obj2[key] === undefined || obj2[key] === '')
        ) {
            return false;
        }

        if (
            typeof obj1[key] === 'object' &&
            obj1[key] !== null &&
            typeof obj2[key] === 'object' &&
            obj2[key] !== null &&
            !Array.isArray(obj1[key]) &&
            !Array.isArray(obj2[key])
        ) {
            return areObjectsDifferent(obj1[key], obj2[key]);
        }

        return obj1[key] !== obj2[key];
    });
};
