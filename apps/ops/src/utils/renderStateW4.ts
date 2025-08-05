const allowedStates = [
    'AR',
    'CT',
    'GA',
    'IA',
    'ME',
    'MI',
    'MN',
    'NC',
    'OR',
    'VA',
];

const allowedStatesSSW = ['CT', 'IA', 'MI', 'MN', 'NE', 'OK'];
const allowedStatesRMD = ['CT', 'IA', 'MI', 'MN', 'NE', 'OK'];
const allowedStatesWithdrawals = ['CT', 'IA', 'MI', 'MN', 'NE', 'OK', 'VA'];

const isStateAllowed = (
    state: string | undefined,
    allowed: string[]
): boolean => allowed.includes(state ?? '');

export const isAllowedState = (state: string | undefined): boolean =>
    isStateAllowed(state, allowedStates);

export const isAllowedStateSSW = (state: string): boolean =>
    isStateAllowed(state, allowedStatesSSW);

export const isAllowedStateRMD = (state: string): boolean =>
    isStateAllowed(state, allowedStatesRMD);

export const isAllowedStateWithdrawals = (state: string): boolean =>
    isStateAllowed(state, allowedStatesWithdrawals);
