import { cleanup } from '@testing-library/react';

import { mockPolicy } from '@deps/services/mocks/sor-policy-iul';

import { getPolicyVisibility } from './policy-visibility-helper';
import { PolicyDetails } from '../policy-sor/PolicyDetails';

export const tpaMocks = [
    [
        'Zinnia',
        {
            value: 'Zinnia',
            result: {
                showFundsAndAccounts: true,
                showLoans: true,
                showWithdrawals: true,
                showPremiums: true,
                showRMD: true,
                detailLinkType: 'policyDetails',
            },
        },
    ],
    [
        'null',
        {
            value: 'null',
            result: {
                showFundsAndAccounts: true,
                showLoans: true,
                showWithdrawals: true,
                showPremiums: true,
                showRMD: true,
                detailLinkType: 'policyDetails',
            },
        },
    ],
    [
        'SE2',
        {
            value: 'tpa-12345',
            result: {
                showFundsAndAccounts: true,
                showLoans: true,
                showWithdrawals: true,
                showPremiums: true,
                showRMD: true,
                detailLinkType: 'policyDetails',
            },
        },
    ],
    [
        'Non-Zinnia',
        {
            value: 'Non-Zinnia',
            result: {
                showFundsAndAccounts: false,
                showLoans: false,
                showWithdrawals: false,
                showPremiums: false,
                showRMD: false,
                detailLinkType: 'policyDetails',
            },
        },
    ],
] as const;

describe('.getPolicyVisibility', () => {
    afterEach(() => cleanup);
    test.each(tpaMocks)(
        'returns visibility booleans based on TPA ID %s',
        async (_, { value, result }) => {
            const mock = Object.assign(
                {},
                { ...mockPolicy, thirdPartyAdministratorId: value }
            );
            const mockPolicyDetails = new PolicyDetails(mock);
            const visibility = await getPolicyVisibility(mockPolicyDetails);
            expect(visibility).toStrictEqual(result);
        }
    );
});
