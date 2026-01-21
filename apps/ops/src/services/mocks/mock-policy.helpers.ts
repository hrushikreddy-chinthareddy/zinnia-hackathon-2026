import { Policy } from '@zinnia/api-types/types/sor';

import { mockPolicy } from './sor-policy';
import { mockPolicy as mockIulPolicy } from './sor-policy-iul';

export const getMockPolicy = (isIul = false): Policy => {
    if (isIul) {
        return mockIulPolicy;
    }

    return mockPolicy;
};
