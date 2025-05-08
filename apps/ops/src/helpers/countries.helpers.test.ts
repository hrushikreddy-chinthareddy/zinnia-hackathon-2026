import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { getCountryByCode, getCountryCodes, getCountryName, getCountryNames } from './countries.helpers';

describe('Countries', () => {
    it('should return an array of country names', () => {
        const countryNames = getCountryNames();
        expect(countryNames).toContain('Afghanistan');
        expect(countryNames).toContain('United States');
    });

    it('should return an array of country codes', () => {
        const countryCodes = getCountryCodes();
        expect(countryCodes).toContain('AF');
        expect(countryCodes).toContain('US');
    });

    it('should return the correct country name by country code', () => {
        const countryName = getCountryName('US');
        expect(countryName).toBe('United States');
    });

    it('should return the default error string for an unknown country code', () => {
        const countryName = getCountryByCode('XX'); // Replace 'XX' with an unknown country code
        expect(countryName).toBe(DEFAULT_ERROR_STRING);
    });

    it('should return the correct country code by country name', () => {
        const countryCode = getCountryByCode('United States');
        expect(countryCode).toBe('US');
    });

    it('should return the default error string for an unknown country name', () => {
        const countryCode = getCountryName('Unknown Country'); // Replace with an unknown country name
        expect(countryCode).toBe(DEFAULT_ERROR_STRING);
    });
});
