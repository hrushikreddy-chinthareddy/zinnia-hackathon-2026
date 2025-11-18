import { cleanup } from '@testing-library/react';

import {
    replacePlaceholders,
    formatAddressLines,
    formatDirtyAddress,
} from './value-placement.helpers';

describe('helpers/value-placement.helpers', () => {
    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    describe('replacePlaceholders', () => {
        const data = {
            first: 'John',
            last: 'Doe',
            nested: { a: { b: 'X' } },
            list: [{ name: 'N0' }, { name: 'N1_val' }],
            with_underscores: 'a_b_c',
        } as any;

        it('replaces simple placeholders in strings', () => {
            const tpl = 'Hello {{first}} {{last}}';
            expect(replacePlaceholders(tpl, data)).toBe('Hello John Doe');
        });

        it('supports nested object keys and array indices', () => {
            const tpl = 'Deep {{nested.a.b}} and list {{list[1].name}}';
            expect(replacePlaceholders(tpl, data)).toBe(
                'Deep X and list N1_val'
            );
        });

        it('accepts data-prefixed paths', () => {
            const tpl = 'Prefix {{data.nested.a.b}}';
            expect(replacePlaceholders(tpl, data)).toBe('Prefix X');
        });

        it('returns original token if no match and returnEmptyOnNoMatch=false', () => {
            const tpl = 'Missing {{unknown}}';
            expect(replacePlaceholders(tpl, data, false)).toBe(
                'Missing {{unknown}}'
            );
        });

        it('returns empty string for no match when returnEmptyOnNoMatch=true', () => {
            const tpl = 'Missing {{unknown}}';
            expect(replacePlaceholders(tpl, data, true)).toBe('Missing ');
        });

        it('stringifies object results', () => {
            const tpl = 'Obj {{nested.a}}';
            expect(replacePlaceholders(tpl, data)).toBe('Obj {"b":"X"}');
        });

        it('replaces underscores in values when replaceUnderscores=true', () => {
            const tpl = 'Unders {{with_underscores}} and arr {{list[1].name}}';
            expect(replacePlaceholders(tpl, data, false, true)).toBe(
                'Unders a b c and arr N1 val'
            );
        });

        it('handles arrays templates by mapping', () => {
            const tpl = ['{{first}}', '{{nested.a.b}}'];
            expect(replacePlaceholders(tpl, data)).toEqual(['John', 'X']);
        });

        it('handles object templates by recursing keys', () => {
            const tpl = { g: '{{nested.a.b}}', keep: 5 } as any;
            expect(replacePlaceholders(tpl, data)).toEqual({ g: 'X', keep: 5 });
        });

        it('returns non-string primitives unchanged', () => {
            expect(replacePlaceholders(42 as any, data)).toBe(42);
            expect(replacePlaceholders(null as any, data)).toBeNull();
            expect(replacePlaceholders(undefined as any, data)).toBeUndefined();
        });
    });

    describe('formatAddressLines', () => {
        it('returns empty object for undefined input', () => {
            expect(formatAddressLines(undefined)).toEqual({});
        });
        it('maps addressVal values to addressLineN keys and skips falsy', () => {
            const input = [
                { addressVal: 'L1' },
                { addressVal: '' },
                { addressVal: 'L3' },
                {},
            ];
            expect(formatAddressLines(input as any)).toEqual({
                addressLine1: 'L1',
                addressLine3: 'L3',
            });
        });
    });

    describe('formatDirtyAddress', () => {
        it('returns empty object when input falsy', () => {
            expect(formatDirtyAddress(undefined as any)).toEqual({});
        });
        it('copies addressLines array into numbered lines and includes non-empty fields', () => {
            const dirty: any = {
                addressLines: ['L1', 'L2'],
                city: 'NY',
                state: 'NY',
                zip: '', // ignored
                ext: null, // ignored
            };
            expect(formatDirtyAddress(dirty)).toEqual({
                addressLine1: 'L1',
                addressLine2: 'L2',
                addressLines: ['L1', 'L2'],
                city: 'NY',
                state: 'NY',
            });
        });
        it('handles when addressLines missing or not array by just copying other fields', () => {
            const dirty: any = { city: 'A', addressLines: {} };
            expect(formatDirtyAddress(dirty)).toMatchObject({
                city: 'A',
                addressLines: {} as any,
            });
        });
    });
});
