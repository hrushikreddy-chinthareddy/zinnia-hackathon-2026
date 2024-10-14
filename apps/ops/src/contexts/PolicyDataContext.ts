import { createContext } from 'react';

import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { Policy } from '@deps/models/policy/sor-policy';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
export const PolicyData = createContext({ policy: {} as Policy, policyDetails: {} as PolicyDetails, refreshPolicy: noop });
