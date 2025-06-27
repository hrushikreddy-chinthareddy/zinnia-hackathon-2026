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
