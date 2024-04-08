import { PolicyReferenceDataModel } from '@zinnia/api-types/types/search';
import {
  AccountType,
  Address,
  BankAccount,
  Email,
  Frequency,
  LoanValues,
  MetricsType,
  PartyRole,
  PartyType,
  Phone,
  PolicyStatus,
  Reason,
  TransactionStatus,
  WithdrawalValues,
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
  maximumCoverageIncreaseAmount?: number | null;
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

export interface PolicyApiResponse<T> {
  message: string;
  data: T;
  status: number;
}

export interface PolicyRequestInputs {
  planCode: string;
  policyNumber: string;
}

export interface PolicyMetricsRequestInputs {
  startDate: string;
  endDate: string;
  metrics: Array<keyof typeof MetricsType>;
}

export interface BeneficiaryRequestInputs extends PolicyRequestInputs {
  partyId: string;
}

export interface BeneficiaryData {
  totalCoverageAmount?: number | null;
  beneficiaries: Beneficiary[] | null;
}

export interface Beneficiary {
  firstName?: string | null;
  lastName?: string | null;
  partyId?: string | null;
  partyType: PartyType;
  partyRole: PartyRole;
  relationshipToInsured: string;
  beneficiaryPercentage: number;
  addresses?: Address[];
  emails?: Email[];
}

export interface TransactionRequestInputs extends PolicyRequestInputs {
  eventNames: string[];
  limit?: number;
  offset?: number;
  order?: 'ASC' | 'DESC';
  status: keyof typeof ExtendedTransactionStatus;
  year?: string;
}

export enum CompletedPremiumTransactionType {
  InitialPremium = 'InitialPremium',
  SubsequentPremium = 'SubsequentPremium',
  OneTimePremium = 'OneTimePremium',
}

export enum PendingPremiumTransactionType {
  PaymentInitialPremium = 'PaymentInitialPremium',
  SubsequentPayment = 'SubsequentPayment',
  PaymentOneTimePremium = 'PaymentOneTimePremium',
}

export type MethodAndProgram = BankAccount & {
  amount?: number;
  frequency?: Frequency;
};

export enum PremiumReason {
  PREMIUMREASON = 'PREMIUMREASON',
}

//export type ExtendedReason = Reason | PremiumReason;

export const ExtendedReason = {
  ...Reason,
  PREMIUMREASON: 'PREMIUMREASON',
};

export const ExtendedTransactionStatus = {
  ...TransactionStatus,
  PROCESSING: 'Processing',
  Pending: 'Pending',
  Completed: 'Completed',
};

export interface TransactionRequestErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  errorDesc: string;
  errorDetailedDesc: string;
  message: string;
}

export interface PaymentHistory {
  amount?: number;
  date?: string;
  frequency?: Frequency;
  type?: keyof typeof ExtendedReason;
  bankDetails?: {
    accountType?: AccountType;
    accountNumber?: string;
  };
  title: string;
  isPending?: boolean;
}

export interface PaymentHistoryTransaction {
  completedTransactions: PaymentHistory[];
  pendingTransactions: PaymentHistory[];
}

export interface Metric {
  metric: MetricsType;
  begin: number;
  minimum: number;
  maximum: number;
  average: number;
  sum: number;
  count: number;
  end: number;
}

export interface AccountValueSummary {
  fundCount?: number;
  hasWithdrawalEligibility?: boolean;
  hasLoanEligibility?: boolean;
}

export interface PolicyFund {
  fundName?: string | null;
  allocationPercentage?: number | null;
  totalFundValue?: number | null;
  fundAccountType?: string | null;
}

export interface PolicyLoans extends LoanValues {
  isEligible?: boolean;
}

export interface PolicyWithdrawals extends WithdrawalValues {
  isEligibleForWithdrawals: boolean;
  annualWithdrawalsTaken: number | null;
  annualWithdrawalsRemaining: number;
}
