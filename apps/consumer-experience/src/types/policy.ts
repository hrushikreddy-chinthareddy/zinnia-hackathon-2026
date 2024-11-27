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
  ProductType,
  Fund,
  LineOfBusiness,
  Status,
  FeatureType,
} from '@zinnia/api-types/types/sor';

import { BankDetail } from '@/components/person-data/types';

export enum CarrierId {
  SBUL = 'SBUL',
  SB = 'SB',
  ELIC = 'ELIC',
}

export interface PolicyDetails {
  marketingName: string;
  planName: string;
  policyStatus: PolicyStatus;
  policyNumber: string;
  firstName: string;
  lastName: string;
  carrierId?: string;
}

export interface UpcomingPremium {
  amount: number;
  nextActivityDate: string;
  nextActivityStatus?: Status;
  planName: string;
  policyStatus: PolicyStatus;
  productType?: ProductType;
  lineOfBusiness?: LineOfBusiness;
}

export interface PolicyAccountValue {
  endingAccountValue?: number | null;
  effectiveDate?: string | null;
  valueChange?: number | null;
  policyStartDate?: string;
  lineOfBusiness?: LineOfBusiness;
  cumulativeGrossDeathBenefitAmount?: number | null;
  freeWithdrawalAmount?: number | null;
  totalYearToDatePremiumAmount?: number | null;
  withdrawalAllowedStartDate?: string | null;
  carrierId?: string;
  fundId?: string;
  interestGuaranteedPeriod?: number | null;
  renewalDate?: string | null;
}

export interface PolicyCoverage {
  totalCoverageAmount?: number | null;
  maximumCoverageIncreaseAmount?: number | null;
  policyStartDate?: string | null;
  maturityDate?: string | null;
  // This one is calculated, so will either be a number or 0
  beneficiaryCount?: number;
  riderCount: number;
  effectiveDate?: string | null;
}

interface Person {
  firstName: string;
  lastName: string;
}

export interface PolicyProfile {
  preferredAddressIndicator: string;
  name: Person;
  partyId: string;
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
  effectiveDate?: string | null;
  lineOfBusiness?: LineOfBusiness;
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

export enum CompletedAnnuityTransactionType {
  CostOfInsurance = 'CostOfInsurance',
  CoverageCharge = 'CoverageCharge',
  CoverageCredit = 'CoverageCredit',
  Disbursement = 'Disbursement',
  ExpenseCharge = 'ExpenseCharge',
  FullSurrender = 'FullSurrender',
  FundTransfer = 'FundTransfer',
  InitialPremium = 'InitialPremium',
  InterestCredit = 'InterestCredit',
  InterestCreditMatch = 'InterestCreditMatch',
  MatchBonusVesting = 'MatchBonusVesting',
  OneTimePremium = 'OneTimePremium',
  PartialWithdrawalOneTime = 'PartialWithdrawalOneTime',
  PaymentExpiration = 'PaymentExpiration',
  PaymentOneTimePremium = 'PaymentOneTimePremium',
  ValueAdjustment = 'ValueAdjustment',
  SubsequentPayment = 'SubsequentPayment',
  SubsequentPremium = 'SubsequentPremium',
  Sweep = 'Sweep',
  SystematicPartialWithdrawal = 'SystematicPartialWithdrawal',
  SystematicRequiredMinimumDistribution = 'SystematicRequiredMinimumDistribution',
  SystematicAnnuityPayout = 'SystematicAnnuityPayout',
  TPDChange = 'TPDChange',
  UnitExpenseCharge = 'UnitExpenseCharge',
  PaymentInitialPremium = 'PaymentInitialPremium',
}

export enum PendingAnnuityTransactionType {
  PaymentInitialPremium = 'PaymentInitialPremium',
  OneTimePremium = 'OneTimePremium',
  PartialWithdrawalOneTime = 'PartialWithdrawalOneTime',
  PaymentOneTimePremium = 'PaymentOneTimePremium',
  SubsequentPayment = 'SubsequentPayment',
  SubsequentPremium = 'SubsequentPremium',
  SystematicPartialWithdrawal = 'SystematicPartialWithdrawal',
  SystematicRequiredMinimumDistribution = 'SystematicRequiredMinimumDistribution',
  SystematicAnnuityPayout = 'SystematicAnnuityPayout',
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

export interface PolicyFund extends Fund {
  allocationPercentage?: number | null;
}

export interface PolicyLoans {
  effectiveDate?: string | null;
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
  annualWithdrawalsTaken?: number | null;
  annualWithdrawalsRemaining?: number | null;
  nextMonthiversaryDate?: string;
  nextAnniversaryDate?: string;
  withdrawalAllowedStartDate?: string | null;
  freeWithdrawalAmount?: number | null;
  maximumWithdrawalAmount?: number | null;
  numberOfWithdrawal?: number | null;
  totalWithdrawalAmount?: number | null;
  annualWithdrawalLimitNoCoverageDecrease?: number | null;
  availableToWithdrawTaxFree?: number | null;
  vestingDetails: VestingDetails;
  effectiveDate?: string;
  endingAccountValue?: number | null;
}

// export type PolicyFeatureType = keyof typeof PolicyFeature.featureType;

export interface PolicyFeatureDetail {
  timestamp?: string;
  featureType?: FeatureType;
  startDate?: string;
  endDate?: string;
  status?: boolean;
  period?: number;
  effectiveDate?: string;
  totalRequiredAmount?: number;
  totalMinimumRequiredAmount?: number;
  paymentAmount?: number;
  totalPaymentAmount?: number;
  underwritingDecision?: boolean;
  approvalDate?: string;
}

export interface PolicyStatusDetail {
  policyStatus: PolicyStatus | FeatureType;
  minimumPaymentDue: number;
  minimumPaymentDueDate: string;
  lapsedOn: string;
  reinstatmentDate: string;
  reinstatementPeriod: number | null;
  endDate?: string;
  period?: number;
}
