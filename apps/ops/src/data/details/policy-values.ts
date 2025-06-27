import { AccountValues, Policy } from '@zinnia/api-types/types/sor';

import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { DataDefinition } from '@deps/types/data';

export type PolicyValuesDto = AccountValues;

export const toPolicyValuesDto = (policy: Policy): PolicyValuesDto =>
    policy.accountValues as AccountValues;

export const PolicyValuesInfo = (): DataDefinition<PolicyValuesDto>[] => [
    {
        key: 'endingAccountValue',
        label: 'Account Value',
        format: numberFormatify,
    },
    {
        key: 'minimumRequiredAccountValue',
        label: 'Minimum Required Account Value',
        format: numberFormatify,
    },
    {
        key: 'accountValueByPolicyYear',
        label: 'Account Value by Policy Year',
        format: numberFormatify,
    },
    {
        key: 'unloanedPortionOfAccountValue',
        label: 'Unloaned Portion of Account Value',
        format: numberFormatify,
    },
    {
        key: 'loanedPortionOfAccountValue',
        label: 'Loaned Portion of Account Value',
        format: numberFormatify,
    },
    {
        key: 'surrenderValue',
        label: 'Account Surrender Value',
        format: numberFormatify,
    },
    {
        key: 'netAmountAtRisk',
        label: 'Net Amount At Risk for Policy',
        format: numberFormatify,
    },
];
