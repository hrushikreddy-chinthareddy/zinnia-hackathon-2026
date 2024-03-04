export enum PolicyStatus {
  NotIssued = 'NOTISSUED',
  PendingIssued = 'PENDINGISSUED',
  Active = 'ACTIVE',
  PendingLapse = 'PENDINGLAPSE',
  Lapse = 'LAPSE',
}

export interface PolicyDetails {
  marketingName: string;
  planName: string;
  policyStatus: PolicyStatus;
  policyNumber: string;
  firstName: string;
  lastName: string;
}

export interface UpcomingPremium {
  amount: number;
  nextActivityDate: string;
}

export interface PolicyAccountValue {
  totalFundValue: number;
  timestamp: string; // or Date?
  valueChange: number;
}

export interface PolicyCoverage {
  totalCoverageAmount: number;
  policyStartDate: string;
  maturityDate: string;
  beneficiaryCount: number;
}

export type PolicyOverview = {
  policyDetails: PolicyDetails;
  upcomingPremium: UpcomingPremium;
  accountValue: PolicyAccountValue;
  coverage: PolicyCoverage;
};
