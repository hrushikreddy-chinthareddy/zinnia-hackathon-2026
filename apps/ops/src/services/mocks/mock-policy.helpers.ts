import { Policy } from '@zinnia/api-types/types/sor';

import { mockPolicy } from './sor-policy';
import { mockPolicy as mockIulPolicy } from './sor-policy-iul';

// FIXME: Mock data may not fully match Policy type after API regeneration
export const getMockPolicy = (isIul = false): Policy => {
    if (isIul) {
        return mockIulPolicy as unknown as Policy;
    }

    return mockPolicy as unknown as Policy;
};
