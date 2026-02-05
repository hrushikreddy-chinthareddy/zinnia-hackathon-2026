import { cleanup } from '@testing-library/react';

import {
    areObjectsDifferent,
    getObjDeepValue,
    hasSameProperties,
    isEmptyObject,
} from './objects.helpers';

describe('helpers/objects.helpers', () => {
    afterEach(() => cleanup());

    describe('getObjDeepValue', () => {
        const obj = { a: { b: { c: 5 }, d: null }, x: 0 } as any;

        it('returns nested value by dot path', () => {
            expect(getObjDeepValue(obj, 'a.b.c')).toBe(5);
        });

        it('returns undefined for missing path and supports null segments', () => {
            expect(getObjDeepValue(obj, 'a.z.c')).toBeUndefined();
            expect(getObjDeepValue(obj, 'a.d.c')).toBeUndefined();
        });

        it('returns root value when no dot in key', () => {
            expect(getObjDeepValue(obj, 'x')).toBe(0);
        });
    });

    describe('isEmptyObject', () => {
        it('returns true for {} and for empty array []', () => {
            expect(isEmptyObject({})).toBe(true);
            expect(isEmptyObject([] as any)).toBe(true);
        });

        it('returns false when object has at least one own property', () => {
            expect(isEmptyObject({ a: 1 })).toBe(false);
            expect(isEmptyObject(Object.create({ a: 1 }))).toBe(true);
        });
    });

    describe('hasSameProperties', () => {
        it('returns true when specified props match', () => {
            const o1 = { a: 1, b: 2, c: 3 };
            const o2 = { a: 1, b: 2, c: 9 };
            expect(hasSameProperties(o1, o2, ['a', 'b'])).toBe(true);
        });

        it('returns false when any specified prop differs', () => {
            const o1 = { a: 1, b: 2 };
            const o2 = { a: 1, b: 3 };
            expect(hasSameProperties(o1, o2, ['a', 'b'])).toBe(false);
        });
    });

    describe('stripNullishValues', () => {
        it('removes null and undefined values from flat object', () => {
            const input = { a: 1, b: null, c: undefined, d: 'hello' };
            expect(stripNullishValues(input)).toEqual({ a: 1, d: 'hello' });
        });

        it('recursively removes nullish values from nested objects', () => {
            const input = {
                name: 'John',
                details: {
                    age: 30,
                    email: null,
                    address: {
                        city: 'NYC',
                        zip: undefined,
                    },
                },
            };
            expect(stripNullishValues(input)).toEqual({
                name: 'John',
                details: {
                    age: 30,
                    address: {
                        city: 'NYC',
                    },
                },
            });
        });

        it('preserves arrays and Date objects', () => {
            const date = new Date('2024-01-01');
            const input = {
                items: [1, 2, 3],
                createdAt: date,
                empty: null,
            };
            const result = stripNullishValues(input);
            expect(result).toEqual({ items: [1, 2, 3], createdAt: date });
            expect(result.createdAt).toBe(date);
        });

        it('removes nested objects that become empty after stripping', () => {
            const input = {
                a: 1,
                nested: {
                    b: null,
                    c: undefined,
                },
            };
            expect(stripNullishValues(input)).toEqual({ a: 1 });
        });

        it('preserves falsy but non-nullish values', () => {
            const input = { a: 0, b: '', c: false, d: null };
            expect(stripNullishValues(input)).toEqual({
                a: 0,
                b: '',
                c: false,
            });
        });
    });

    describe('areObjectsDifferent', () => {
        it('treats both nullish as not different, one nullish as different', () => {
            expect(areObjectsDifferent(undefined as any, null as any)).toBe(
                false
            );
            expect(areObjectsDifferent({} as any, null as any)).toBe(true);
        });

        it('considers null/undefined/empty string equal for a key', () => {
            const o1 = { a: null };
            const o2 = { a: undefined };
            const o3 = { a: '' };
            expect(areObjectsDifferent(o1, o2)).toBe(false);
            expect(areObjectsDifferent(o1, o3)).toBe(false);
            expect(areObjectsDifferent(o2, o3)).toBe(false);
        });

        it('does deep comparison for nested plain objects', () => {
            const o1 = { a: { b: 1 } };
            const o2 = { a: { b: 1 } };
            const o3 = { a: { b: 2 } };
            expect(areObjectsDifferent(o1, o2)).toBe(false);
            expect(areObjectsDifferent(o1, o3)).toBe(true);
        });

        it('treats arrays as values (not deep equal), compares by reference/value', () => {
            const arr1 = [1, 2];
            const o1 = { a: arr1 } as any;
            const o2 = { a: arr1 } as any;
            const o3 = { a: [1, 2] } as any;
            expect(areObjectsDifferent(o1, o2)).toBe(false);
            expect(areObjectsDifferent(o1, o3)).toBe(true);
        });
    });
});
