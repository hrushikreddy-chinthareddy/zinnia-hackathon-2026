import policyEndpointData from '@vitest/mocks/policyPage/policyEndpointData.json';

/** Annuity base data — mirrors what policyEndpointData already has (lineOfBusiness: ANNUITY) */
export const annuityPolicyOverrides = {
    product: {
        ...policyEndpointData.product,
        lineOfBusiness: 'ANNUITY',
        productType: 'FIXEDINDEXEDANNUITY',
    },
};

/** Life UL base data — overrides the default ANNUITY mock to LIFE */
export const lifePolicyOverrides = {
    product: {
        ...policyEndpointData.product,
        lineOfBusiness: 'LIFE',
        productType: 'UNIVERSALLIFE',
    },
};

export const termPolicyOverrides = {
    product: {
        ...policyEndpointData.product,
        lineOfBusiness: 'LIFE',
        productType: 'TERM',
    },
};

export const iulPolicyOverrides = {
    product: {
        ...policyEndpointData.product,
        lineOfBusiness: 'LIFE',
        productType: 'INDEXEDUNIVERSALLIFE',
    },
};
