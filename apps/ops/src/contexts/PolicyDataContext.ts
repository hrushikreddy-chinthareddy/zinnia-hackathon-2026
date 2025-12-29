import { createContext, useContext } from 'react';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { Policy } from '@zinnia/api-types/types/sor';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
export const PolicyData = createContext({
    policy: {} as Policy,
    policyDetails: {} as PolicyDetails,
    refreshPolicy: noop,
});

export const usePolicyDataContext = () => {
    return useContext(PolicyData);
};
