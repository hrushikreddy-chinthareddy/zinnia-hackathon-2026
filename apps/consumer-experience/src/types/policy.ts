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
  totalFundValue?: number | null;
  timestamp?: string; // or Date?
  valueChange?: number | null;
}

export interface PolicyCoverage {
  totalCoverageAmount?: number | null;
  policyStartDate?: string | null;
  maturityDate?: string | null;
  // This one is calculated, so will either be a number or 0
  beneficiaryCount?: number;
}

export type PolicyOverview = {
  policyDetails: PolicyDetails;
  upcomingPremium: UpcomingPremium;
  accountValue: PolicyAccountValue;
  coverage: PolicyCoverage;
};
