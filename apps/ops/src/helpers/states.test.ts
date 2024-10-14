import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { getStateCodes, getStateName, getStateNames, getStateCode } from './states.helper';

describe('State helper functions', () => {
    describe('getStateNames', () => {
        it('returns an array of state names', () => {
            const stateNames = getStateNames();
            expect(stateNames).toContain('ALABAMA');
            expect(stateNames).toContain('CALIFORNIA');
            expect(stateNames).toContain('NEW YORK');
            expect(stateNames.length).toBe(50);
        });
    });

    describe('getStateCodes', () => {
        it('returns an array of state codes', () => {
            const stateCodes = getStateCodes();
            expect(stateCodes).toContain('AL');
            expect(stateCodes).toContain('CA');
            expect(stateCodes).toContain('NY');
            expect(stateCodes.length).toBe(50);
        });
    });

    describe('getStateName', () => {
        it('returns the correct state name for a valid state code', () => {
            expect(getStateName('TX')).toBe('Texas');
            expect(getStateName('co')).toBe('Colorado');
        });

        it('returns the correct state name for a valid state name', () => {
            expect(getStateName('Texas')).toBe('Texas');
            expect(getStateName('COLORADO')).toBe('Colorado');
        });

        it('returns DEFAULT_ERROR_STRING for an invalid input', () => {
            expect(getStateName('ZZ')).toBe(DEFAULT_ERROR_STRING);
        });
    });

    describe('getStateName', () => {
        it('returns the correct state name for a valid territory or outlying island code', () => {
            expect(getStateName('AS')).toBe('American Samoa');
            expect(getStateName('mh')).toBe('Marshall Islands');
        });

        it('returns the correct state name for a valid territory or outlying island name', () => {
            expect(getStateName('American Samoa')).toBe('American Samoa');
            expect(getStateName('MARSHALL ISLANDS')).toBe('Marshall Islands');
        });

        it('returns DEFAULT_ERROR_STRING for an invalid territory or outlying island code', () => {
            expect(getStateName('ZZ')).toBe(DEFAULT_ERROR_STRING);
        });
    });

    describe('getStateCode', () => {
        it('returns the correct state code for a valid territory or outlying island name', () => {
            expect(getStateCode('American Samoa')).toBe('AS');
            expect(getStateCode('MARSHALL ISLANDS')).toBe('MH');
        });

        it('returns the correct state code for a valid territory or outlying island code', () => {
            expect(getStateCode('AS')).toBe('AS');
            expect(getStateCode('mh')).toBe('MH');
        });

        it('returns DEFAULT_ERROR_STRING for an invalid territory or outlying island name', () => {
            expect(getStateCode('Random Island')).toBe(DEFAULT_ERROR_STRING);
        });
    });

    describe('getStateCode', () => {
        it('returns the correct state code for a valid state name', () => {
            expect(getStateCode('Texas')).toBe('TX');
            expect(getStateCode('COLORADO')).toBe('CO');
        });

        it('returns the correct state code for a valid state code', () => {
            expect(getStateCode('TX')).toBe('TX');
            expect(getStateCode('co')).toBe('CO');
        });

        it('returns DEFAULT_ERROR_STRING for an invalid input', () => {
            expect(getStateCode('ZZ')).toBe(DEFAULT_ERROR_STRING);
        });
    });
});
