import { PolicyOverview, PolicyStatus } from '@/types/policy';

export const policyOverviewData = {
  policyDetails: {
    marketingName: 'Everly Life',
    planName: 'SB UL Premium Match',
    policyStatus: PolicyStatus.Active,
    policyNumber: 'AK20000015',
    firstName: 'Michael',
    lastName: 'Williams',
  },
  upcomingPremium: {
    amount: 99,
    nextActivityDate: '2024-03-15',
  },
  accountValue: {
    totalFundValue: 463.685491,
    timestamp: '2024-02-26T21:16:39.874Z',
    valueChange: 9.638554,
  },
  coverage: {
    totalCoverageAmount: 299992,
    policyStartDate: '2023-09-15',
    maturityDate: '2100-09-14',
    beneficiaryCount: 2, // partyRoles.length - 1 (to exclude the insured)
  },
} as PolicyOverview;
