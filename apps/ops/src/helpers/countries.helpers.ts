import { countries as Countries } from 'countries-list';

import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

interface Country {
    Name: string;
    Code: string;
}

export const simpleCountries: Country[] = Object.entries(Countries).map(([key, value]) => {
    return {
        Code: key,
        Name: value.name,
    };
});

export function getCountryCodes() {
    return simpleCountries.map(c => c.Code);
}

export function getCountryNames() {
    return simpleCountries.map(c => c.Name);
}

const getCountry = (item = '') =>
    simpleCountries.find(
        country => country.Name.toUpperCase() === item?.toUpperCase() || country.Code.toUpperCase() === item?.toUpperCase()
    );

// In case the country code is titlecased,
// we need to convert it to uppercase
export function getCountryByCode(item: string | undefined) {
    if (item === '' || item == null) return DEFAULT_ERROR_STRING;

    return getCountry(item)?.Code?.toUpperCase() || DEFAULT_ERROR_STRING;
}

export function getCountryName(code: string | undefined) {
    if (code === '' || code == null) return DEFAULT_ERROR_STRING;

    return getCountry(code)?.Name || DEFAULT_ERROR_STRING;
}
