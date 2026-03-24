import dayjs from 'dayjs';

import { DataDefinition } from '@deps/types/data';

export const sort = <T extends object>(
    a: DataDefinition<T>,
    b: DataDefinition<T>
) => {
    if (!b || b?.value === undefined || b?.value === null) return -1;
    if (!a || a?.value === undefined || a?.value === null) return 1;

    if (b.value < a.value) {
        return -1;
    }
    if (b.value > a.value) {
        return 1;
    }
    return 0;
};

export const orderObjectsByString = (
    objects: any[],
    orderedSet: string[] = [],
    key = ''
): any[] => {
    const indexMap = new Map<any, number>();

    if (!orderedSet.length || !objects.length) return [];

    // Populate the map with the indexes of the strings in the ordered set
    orderedSet.map((value, index) => indexMap.set(value, index));

    // Sort objects based on indexes in the ordered set
    objects.sort((a, b) => {
        const indexA = indexMap.get(a[key]);
        const indexB = indexMap.get(b[key]);

        const isIndexAUndefined = indexA === undefined;
        const isIndexBUndefined = indexB === undefined;

        // If one or both of the strings are not in the ordered set, place them at the end
        if (isIndexAUndefined && isIndexBUndefined) {
            return 0;
        } else if (isIndexAUndefined) {
            return 1;
        } else if (isIndexBUndefined) {
            return -1;
        }

        return indexA - indexB;
    });

    return objects;
};

export const orderObjectsByFirstString = (
    objects: any[],
    orderedSet: string[],
    key = ''
): any[] => {
    const sortedObjects = [...objects];

    sortedObjects.sort((a, b) => {
        const indexA = orderedSet.indexOf(a[key][0]?.text);
        const indexB = orderedSet.indexOf(b[key][0]?.text);

        const isIndexAUndefined = indexA === -1; // indexOf returns -1 when element is not found
        const isIndexBUndefined = indexB === -1;

        // If one or both of the strings are not in the ordered set, place them at the end
        if (isIndexAUndefined && isIndexBUndefined) {
            return 0;
        } else if (isIndexAUndefined) {
            return 1;
        } else if (isIndexBUndefined) {
            return -1;
        }

        return indexA - indexB;
    });

    return sortedObjects;
};

export const sortByAndThenBy = <T>(objects: T[], ...keys: (keyof T)[]): T[] =>
    [...objects].sort((a, b) => {
        for (const key of keys) {
            const aValue = a[key];
            const bValue = b[key];

            if (aValue === bValue) continue; // If values are the same, move to the next key
            if (
                typeof aValue === 'string' &&
                typeof bValue === 'string' &&
                dayjs(aValue).isValid() &&
                dayjs(bValue).isValid()
            ) {
                return dayjs(aValue).valueOf() - dayjs(bValue).valueOf();
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return aValue.localeCompare(bValue);
            } else if (
                typeof aValue === 'number' &&
                typeof bValue === 'number'
            ) {
                return aValue - bValue;
            }
        }

        return 0; // If all provided keys are equal
    });
