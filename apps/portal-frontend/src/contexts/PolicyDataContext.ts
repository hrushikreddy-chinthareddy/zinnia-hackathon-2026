import { createContext } from 'react';

import { Policy } from '@deps/models/policy/sor-policy';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
export const PolicyData = createContext({ policy: {} as Policy, refreshPolicy: noop });
