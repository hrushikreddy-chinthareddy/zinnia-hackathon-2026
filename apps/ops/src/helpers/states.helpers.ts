import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { toTitleCase } from './string.helpers';

const states = {
    ALABAMA: 'AL',
    ALASKA: 'AK',
    ARIZONA: 'AZ',
    ARKANSAS: 'AR',
    CALIFORNIA: 'CA',
    COLORADO: 'CO',
    CONNECTICUT: 'CT',
    DC: 'DC',
    DELAWARE: 'DE',
    FLORIDA: 'FL',
    GEORGIA: 'GA',
    HAWAII: 'HI',
    IDAHO: 'ID',
    ILLINOIS: 'IL',
    INDIANA: 'IN',
    IOWA: 'IA',
    KANSAS: 'KS',
    KENTUCKY: 'KY',
    LOUISIANA: 'LA',
    MAINE: 'ME',
    MARYLAND: 'MD',
    MASSACHUSETTS: 'MA',
    MICHIGAN: 'MI',
    MINNESOTA: 'MN',
    MISSISSIPPI: 'MS',
    MISSOURI: 'MO',
    MONTANA: 'MT',
    NEBRASKA: 'NE',
    NEVADA: 'NV',
    'NEW HAMPSHIRE': 'NH',
    'NEW JERSEY': 'NJ',
    'NEW MEXICO': 'NM',
    'NEW YORK': 'NY',
    'NORTH CAROLINA': 'NC',
    'NORTH DAKOTA': 'ND',
    OHIO: 'OH',
    OKLAHOMA: 'OK',
    OREGON: 'OR',
    PENNSYLVANIA: 'PA',
    'RHODE ISLAND': 'RI',
    'SOUTH CAROLINA': 'SC',
    'SOUTH DAKOTA': 'SD',
    TENNESSEE: 'TN',
    TEXAS: 'TX',
    UTAH: 'UT',
    VERMONT: 'VT',
    VIRGINIA: 'VA',
    WASHINGTON: 'WA',
    'WEST VIRGINIA': 'WV',
    WISCONSIN: 'WI',
    WYOMING: 'WY',
};

export const territoriesAndOutlyingIslands = {
    'AMERICAN SAMOA': 'AS',
    'MARSHALL ISLANDS': 'MH',
    'NORTHERN MARIANA ISLANDS': 'MP',
    'PUERTO RICO': 'PR',
    'U.S. MINOR OUTLYING ISLANDS': 'UM',
    'U.S. VIRGIN ISLANDS': 'VI',
    GUAM: 'GU',
    MICRONESIA: 'FM',
    PALAU: 'PW',
};

export const statesAndTerritories = {
    ...states,
    ...territoriesAndOutlyingIslands,
};

export function getStateNames() {
    return Object.keys(states);
}

export function getStateCodes() {
    return Object.values(states);
}

export function getStateName(input: string | undefined) {
    if (input === '' || input == null) return DEFAULT_ERROR_STRING;

    const upperInput = input.toUpperCase();
    if (statesAndTerritories[upperInput as keyof typeof statesAndTerritories]) {
        return toTitleCase(upperInput);
    }
    const stateName = (
        Object.keys(
            statesAndTerritories
        ) as (keyof typeof statesAndTerritories)[]
    ).find((key) => statesAndTerritories[key] === upperInput);
    return stateName ? toTitleCase(stateName) : DEFAULT_ERROR_STRING;
}

export function getStateCode(input: string) {
    const upperInput = input.toUpperCase();
    if (
        (
            Object.keys(
                statesAndTerritories
            ) as (keyof typeof statesAndTerritories)[]
        ).find((key) => statesAndTerritories[key] === upperInput)
    ) {
        return upperInput;
    }
    return (
        statesAndTerritories[upperInput as keyof typeof statesAndTerritories] ||
        DEFAULT_ERROR_STRING
    );
}

export function getStateCodesForSelectInput(): Array<{
    value: string;
    textValue: string;
}> {
    const stateCodes = getStateCodes();
    const usStateCodeDisplay = stateCodes.map((stateCode) => ({
        value: stateCode,
        textValue: stateCode,
    }));

    return usStateCodeDisplay;
}
