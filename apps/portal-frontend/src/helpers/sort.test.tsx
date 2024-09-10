import { DataDefinition } from '@deps/types/data';

import { orderObjectsByFirstString, orderObjectsByString, sort, sortByAndThenBy } from './sort.helper';

describe('Sort Helper', () => {
    describe('> sort', () => {
        it('should be sort by value', () => {
            const array: DataDefinition<any>[] = [
                {
                    value: 'Zebra',
                    key: 'mammal',
                    label: 'Hoofed Animal',
                },
                {
                    value: 'Arachnid',
                    key: 'spider',
                    label: 'Spider',
                },
            ];
            const sortedArray = array.sort(sort);

            expect(sortedArray).toBe(array.reverse());
        });
    });

    describe('> orderObjectsByString', () => {
        const objects = [
            { id: 1, firstName: 'Alice' },
            { id: 2, firstName: 'John' },
            { id: 3, firstName: 'Bob' },
            { id: 4, firstName: 'David' },
        ];

        it('should order objects based on the ordered set of strings', () => {
            const orderedSet = ['Bob', 'John', 'Alice', 'David'];
            const orderedObjects = orderObjectsByString(objects, orderedSet, 'firstName');

            expect(orderedObjects).toEqual([
                { id: 3, firstName: 'Bob' },
                { id: 2, firstName: 'John' },
                { id: 1, firstName: 'Alice' },
                { id: 4, firstName: 'David' },
            ]);
        });

        it('should place objects with strings not in the ordered set at the end', () => {
            const orderedSet = ['Bob', 'Alice'];
            const orderedObjects = orderObjectsByString(objects, orderedSet, 'firstName');

            expect(orderedObjects).toEqual([
                { id: 3, firstName: 'Bob' },
                { id: 1, firstName: 'Alice' },
                { id: 2, firstName: 'John' },
                { id: 4, firstName: 'David' },
            ]);
        });

        it('should return an empty array if either the ordered set or objects array is empty', () => {
            const emptyOrderedSet: string[] = [];
            const emptyOrderedObjects = orderObjectsByString(objects, emptyOrderedSet, 'firstName');

            expect(emptyOrderedObjects).toEqual([]);

            const emptyObjects: string[] = [];
            const emptyObjectsArray = orderObjectsByString(emptyObjects, ['Alice', 'Bob'], 'firstName');

            expect(emptyObjectsArray).toEqual([]);
        });
    });

    describe('> sortByAndThenBy', () => {
        it('should sort objects by primary key and then by secondary key', () => {
            const objects = [
                { id: 1, firstName: 'John', beneficiaryPercentage: 25 },
                { id: 2, firstName: 'Alice', beneficiaryPercentage: 30 },
                { id: 3, firstName: 'Bob', beneficiaryPercentage: 20 },
                { id: 4, firstName: 'Alice', beneficiaryPercentage: 35 },
            ];

            const sortedObjects = sortByAndThenBy(objects, 'firstName', 'beneficiaryPercentage');

            expect(sortedObjects).toEqual([
                { id: 2, firstName: 'Alice', beneficiaryPercentage: 30 },
                { id: 4, firstName: 'Alice', beneficiaryPercentage: 35 },
                { id: 3, firstName: 'Bob', beneficiaryPercentage: 20 },
                { id: 1, firstName: 'John', beneficiaryPercentage: 25 },
            ]);
        });

        it('should handle primary key and secondary key having the same values', () => {
            const objectsWithSameName = [
                { id: 1, firstName: 'John', beneficiaryPercentage: 25 },
                { id: 2, firstName: 'Alice', beneficiaryPercentage: 30 },
                { id: 3, firstName: 'Alice', beneficiaryPercentage: 20 },
                { id: 4, firstName: 'Bob', beneficiaryPercentage: 35 },
            ];

            const sortedObjects = sortByAndThenBy(objectsWithSameName, 'firstName', 'beneficiaryPercentage');

            expect(sortedObjects).toEqual([
                { id: 3, firstName: 'Alice', beneficiaryPercentage: 20 },
                { id: 2, firstName: 'Alice', beneficiaryPercentage: 30 },
                { id: 4, firstName: 'Bob', beneficiaryPercentage: 35 },
                { id: 1, firstName: 'John', beneficiaryPercentage: 25 },
            ]);
        });

        it('should handle primary key and secondary key and tertiary key having the same values', () => {
            const objectsWithSameName = [
                { id: 1, firstName: 'John', lastName: 'Smith', beneficiaryPercentage: 25 },
                { id: 2, firstName: 'Alice', lastName: 'Jones', beneficiaryPercentage: 25 },
                { id: 3, firstName: 'Alice', lastName: 'Green', beneficiaryPercentage: 25 },
                { id: 4, firstName: 'Bob', lastName: 'Adams', beneficiaryPercentage: 25 },
            ];

            const sortedObjects = sortByAndThenBy(objectsWithSameName, 'beneficiaryPercentage', 'firstName', 'lastName');

            expect(sortedObjects).toEqual([
                { id: 3, firstName: 'Alice', lastName: 'Green', beneficiaryPercentage: 25 },
                { id: 2, firstName: 'Alice', lastName: 'Jones', beneficiaryPercentage: 25 },
                { id: 4, firstName: 'Bob', lastName: 'Adams', beneficiaryPercentage: 25 },
                { id: 1, firstName: 'John', lastName: 'Smith', beneficiaryPercentage: 25 },
            ]);
        });
    });

    describe('> orderObjectsByFirstString', () => {
        const objects = [
            { id: 1, firstName: [{ text: 'Alice' }] },
            { id: 2, firstName: [{ text: 'John' }] },
            { id: 3, firstName: [{ text: 'Bob' }] },
            { id: 4, firstName: [{ text: 'David' }] },
        ];

        it('should order objects based on the ordered set of strings', () => {
            const orderedSet = ['Bob', 'John', 'Alice', 'David'];
            const orderedObjects = orderObjectsByFirstString(objects, orderedSet, 'firstName');

            expect(orderedObjects).toEqual([
                { id: 3, firstName: [{ text: 'Bob' }] },
                { id: 2, firstName: [{ text: 'John' }] },
                { id: 1, firstName: [{ text: 'Alice' }] },
                { id: 4, firstName: [{ text: 'David' }] },
            ]);
        });

        it('should place objects with first strings not in the ordered set at the end', () => {
            const orderedSet = ['Bob', 'Alice'];
            const orderedObjects = orderObjectsByFirstString(objects, orderedSet, 'firstName');

            expect(orderedObjects).toEqual([
                { id: 3, firstName: [{ text: 'Bob' }] },
                { id: 1, firstName: [{ text: 'Alice' }] },
                { id: 2, firstName: [{ text: 'John' }] },
                { id: 4, firstName: [{ text: 'David' }] },
            ]);
        });

        it('should return the original array if the ordered set is empty', () => {
            const emptyOrderedSet: string[] = [];
            const orderedObjects = orderObjectsByFirstString(objects, emptyOrderedSet, 'firstName');

            expect(orderedObjects).toEqual(objects);

            const emptyObjects: any[] = [];
            const orderedEmptyObjects = orderObjectsByFirstString(emptyObjects, ['Alice', 'Bob'], 'firstName');

            expect(orderedEmptyObjects).toEqual([]);
        });
    });
});
