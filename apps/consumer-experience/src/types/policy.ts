import { PolicyReferenceDataModel } from '@zinnia/api-types/types/search';
import {
  AccountType,
  Address,
  BankAccount,
  Email,
  Frequency,
  MetricsType,
  PartyRole,
  PartyType,
  Phone,
  PolicyStatus,
  Reason,
  TransactionStatus,
  PolicyFeature,
  ProductType,
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
  productType?: ProductType;
}

export interface PolicyAccountValue {
  totalFundValue?: number | null;
  timestamp?: string; // or Date?
  valueChange?: number | null;
  policyStartDate?: string;
}

export interface PolicyCoverage {
  totalCoverageAmount?: number | null;
  maximumCoverageIncreaseAmount?: number | null;
  policyStartDate?: string | null;
  maturityDate?: string | null;
  // This one is calculated, so will either be a number or 0
  beneficiaryCount?: number;
  riderCount: number;
  timestamp?: string | null;
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

export interface CarrierPolicyDetails extends PolicyDetails {
  planCode: string;
  totalFundValue?: number | null;
  totalCoverageAmount?: number | null;
  policyStartDate?: string | null;
  timestamp?: string | null;
}

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
  transactionTypes: string[];
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
  frequency?: 'one-time' | 'initial' | null;
  type?: keyof typeof Reason;
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
  hasWithdrawalEligibility?: boolean | null;
  hasLoanEligibility?: boolean | null;
}

export interface PolicyFund {
  fundName?: string | null;
  allocationPercentage?: number | null;
  totalFundValue?: number | null;
  fundAccountType?: string | null;
}

export interface PolicyLoans {
  isEligible?: boolean | null;
  timestamp?: string | null;
  totalLoanBalance?: number | null;
  maximumLoanAmount?: number | null;
}

export interface PolicySurrender {
  surrenderValue?: number | null;
}

interface VestingDetails {
  maximumWithdrawalRequestAfterVestingPeriod?: number | string | null;
  maximumWithdrawalRequestDuringVestingPeriod?: number | string | null;
  vestingPeriod?: number | null;
  policyHasVested?: boolean | null;
  matchVestingDate?: string | null;
}

export interface PolicyWithdrawals {
  isEligibleForWithdrawals?: boolean | null;
  annualWithdrawalsTaken?: number | null;
  annualWithdrawalsRemaining?: number | null;
  nextMonthiversaryDate?: string;
  nextAnniversaryDate?: string;
  withdrawalAllowedStartDate?: string | null;
  maximumWithdrawalAmount?: number | null;
  numberOfWithdrawal?: number | null;
  totalWithdrawalAmount?: number | null;
  annualWithdrawalLimitNoCoverageDecrease?: number | null;
  availableToWithdrawTaxFree?: number | null;
  vestingDetails: VestingDetails;
  timestamp?: string;
}

// export type PolicyFeatureType = keyof typeof PolicyFeature.featureType;

export interface PolicyFeatureDetail {
  timestamp?: string;
  featureType?: PolicyFeature.featureType;
  startDate?: string;
  endDate?: string;
  status?: boolean;
  period?: number;
  effectiveDate?: string;
  totalRequiredAmount?: number;
  totalMinimumRequiredAmount?: number;
  paymentAmount?: number;
  totalPaymentAmount?: number;
  underwritingDecision?: string;
  approvalDate?: string;
}

export interface PolicyStatusDetail {
  policyStatus: PolicyStatus;
  minimumPaymentDue: number;
  minimumPaymentDueDate: string;
  lapsedOn: string;
  reinstatmentDate: string;
  reinstatementPeriod: number | null;
}
