import { cleanup } from '@testing-library/react';

import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';

import {
    defToObject,
    fillColDefs,
    filterTruthyProps,
    rateFormatted,
} from './data-transform.helpers';

jest.mock('./objects.helpers', () => ({
    getObjDeepValue: (obj: any, key: string) => obj?.[key],
}));

afterEach(() => {
    jest.clearAllMocks();
    cleanup();
});

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

describe('rateFormatted', () => {
    it('should format a decimal rate as a percentage', () => {
        const result = rateFormatted(0.0375);
        expect(result).toBe('3.75%');
    });
    it('should format a whole number rate as a percentage', () => {
        const result = rateFormatted(3.75);
        expect(result).toBe('3.75%');
    });
    it('should return a default error string if null or undefined', () => {
        const result = rateFormatted(null);
        expect(result).toBe(DEFAULT_ERROR_STRING);
    });
    it('should return 0 if the rate is 0', () => {
        const result = rateFormatted(0);
        expect(result).toBe('0%');
    });
});

describe('fillColDefs', () => {
    const t = ((key: any) => `t:${key}`) as any;

    it('returns original colDefs when obj is falsy', () => {
        const defs = [
            { key: 'name', accessKey: 'n', defaultValue: '-', tooltip: true },
        ] as any;
        expect(fillColDefs(undefined as any, defs)).toBe(defs);
    });

    it('fills values from object and applies format only when not default', () => {
        const obj = { name: 'Alice', missing: undefined };
        const defs = [
            {
                key: 'name',
                defaultValue: '-',
                format: (v: string) => v.toUpperCase(),
            },
            {
                key: 'missing',
                defaultValue: 'N/A',
                format: (v: string) => `X-${v}`,
            },
        ] as any;
        const out = fillColDefs(obj, defs);
        expect(out[0].value).toBe('ALICE');
        expect(out[1].value).toBe('N/A'); // format not applied because equals emptyValue
    });

    it('adds translations when t provided and respects accessKey, tooltip and group', () => {
        const obj = { code: 'X' };
        const defs = [
            { key: 'code', accessKey: 'codeKey', tooltip: true, group: 'grp' },
        ] as any;
        const out = fillColDefs(obj, defs, t, 'path.base');
        expect(out[0].label).toBe('t:path.base.codeKey');
        expect(out[0].tooltip).toBe('t:path.base.codeKeyTooltip');
        expect(out[0].tooltipBody).toBe('t:path.base.codeKeyTooltipBody');
        expect(out[0].groupLabel).toBe('t:path.base.groups.grp');
        expect(out[0].value).toBe('X');
    });
});

describe('defToObject', () => {
    it('maps value keyed by accessKey when present, otherwise by key', () => {
        const defs = [
            { key: 'a', value: 1 },
            { key: 'b', accessKey: 'bee', value: 2 },
            { key: 'c', value: 3 },
        ] as any;
        const out = defToObject(defs);
        expect(out).toEqual({ a: 1, bee: 2, c: 3 });
    });
});
