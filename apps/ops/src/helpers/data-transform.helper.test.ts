import { filterTruthyProps } from './data-transform.helper';

describe('filterTruthyProps', () => {
    it('should filter out falsy values', () => {
        const testObj = {
            a: 'string', // truthy
            b: 0, // falsy
            c: true, // truthy
            d: false, // falsy
            e: null, // falsy
            f: undefined, // falsy
            g: [], // truthy
            h: {}, // truthy
        };

        const result = filterTruthyProps(testObj);

        expect(result).toEqual({
            a: 'string',
            c: true,
            g: [],
            h: {},
        });
    });

    it('should return an empty object if all properties are falsy', () => {
        const testObj = {
            a: 0,
            b: false,
            c: null,
            d: undefined,
        };

        const result = filterTruthyProps(testObj);

        expect(result).toEqual({});
    });

    it('should return the same object if all properties are truthy', () => {
        const testObj = {
            a: 'string',
            b: 1,
            c: true,
            d: {},
            e: [],
        };

        const result = filterTruthyProps(testObj);

        expect(result).toEqual(testObj);
    });

    it('should return an empty object for an empty input object', () => {
        const testObj = {};

        const result = filterTruthyProps(testObj);

        expect(result).toEqual({});
    });
});
