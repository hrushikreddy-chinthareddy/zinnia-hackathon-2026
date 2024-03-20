import { PolicyReferenceDataModel } from '@zinnia/api-types/types/search';
import {
  Address,
  Email,
  Phone,
  Policy,
  PolicyStatus,
} from '@zinnia/api-types/types/sor';

import { BankDetail } from '@/components/person-data/types';

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
  planName: string;
  policyStatus: PolicyStatus;
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
  riderCount: number;
}

interface Person {
  firstName: string;
  lastName: string;
}

export interface PolicyProfile {
  preferredAddressIndicator: string;
  name: Person;
  addresses: Address[];
  phones: Phone[];
  emails: Email[];
  bankDetails: BankDetail[];
}

export type PolicyReferenceData = Pick<
  PolicyReferenceDataModel,
  'id' | 'planCode' | 'policyNumber' | 'productName'
>;

export interface PolicyApiResponse {
  message: string;
  data: Policy;
  status: number;
}

export interface PolicyRequestInputs {
  planCode: string;
  policyNumber: string;
}
