import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { getDisplayAge } from './age.helper';

describe('Age Helper', () => {
    describe('getDisplayAge()', () => {
        const singularTranslation = '1 year old';
        const pluralTranslation = '2 years';

        it('should return the default empty string if the value is null', () => {
            const displayAge = getDisplayAge(null, singularTranslation, pluralTranslation);

            expect(displayAge).toBe(DEFAULT_ERROR_STRING);
        });

        it('should return the default empty string if the value is undefined', () => {
            const displayAge = getDisplayAge(undefined, singularTranslation, pluralTranslation);

            expect(displayAge).toBe(DEFAULT_ERROR_STRING);
        });

        it('should return "0" if the value is 0', () => {
            const displayAge = getDisplayAge(0, singularTranslation, pluralTranslation);

            expect(displayAge).toBe('0');
        });

        it('should return "1 year" if the value is 1', () => {
            const displayAge = getDisplayAge(1, singularTranslation, pluralTranslation);

            expect(displayAge).toBe('1 year old');
        });

        it('should return "2 years" if the value is 2', () => {
            const displayAge = getDisplayAge(2, singularTranslation, pluralTranslation);

            expect(displayAge).toBe('2 years');
        });
    });
});
