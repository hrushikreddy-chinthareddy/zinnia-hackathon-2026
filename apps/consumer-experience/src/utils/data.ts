import { TransactionResponse } from '@zinnia/api-types/types/bpm';
import {
  AccountType,
  Address,
  Email,
  Frequency,
  Phone,
  PolicyStatus,
  Policy,
  SystematicProgram,
  ArrangementType,
  PartyRole,
  BankAccount,
  ProductType,
  LineOfBusiness,
} from '@zinnia/api-types/types/sor';
import { policyOwner } from '@zinnia/utils';
import dayjs from 'dayjs';

import { BankDetail } from '@/components/person-data/types';
import { LineOfBusinessPath } from '@/types';

import { DEFAULT_ERROR_STRING, toSentenceCase } from './strings';

export const EVERLY_CONTACT_PHONE_NUMBER = '1-855-290-0529';
export const WELLABE_CONTACT_PHONE_NUMBER = '1-888-222-3003';
export const POLICY_ACKNOWLEDGEMENT_DOC_TYPE = 'NWB';

export const policyStatusDisplayText: { [key in PolicyStatus]: string } = {
  [PolicyStatus.ACTIVE]: 'active',
  [PolicyStatus.PENDINGISSUED]: 'active',
  [PolicyStatus.PENDINGLAPSE]: 'pending lapse',
  [PolicyStatus.LAPSE]: 'lapsed',
  [PolicyStatus.SURRENDERED]: 'surrendered',
  [PolicyStatus.CANCELEDFREELOOK]: 'canceled',
  // These are statuses we don't display, users should not be able to log in with these statuses
  [PolicyStatus.NOTISSUED]: '',
  [PolicyStatus.CANCELEDNOPREMIUM]: '',
  [PolicyStatus.TERMINATED]: '',
  [PolicyStatus.MATURED]: '',
  [PolicyStatus.LIVINGCLAIMPENDING]: '',
  [PolicyStatus.DEATHCLAIMPENDING]: '',
  [PolicyStatus.DEATHCLAIMPAID]: '',
  [PolicyStatus.NOTTAKEN]: '',
  [PolicyStatus.ISSUED]: '',
  [PolicyStatus.PARTIALDEATHCLAIM]: '',
  [PolicyStatus.PAYOUT]: '',
};

/**
 *
 * @param endDate
 * @returns Boolean -
 * In Zahara an end date in the past is equivalent to item deletion
 */
export const isEndDatedAndEndDateUpcoming = (
  endDate?: string | null
): boolean => {
  // If there's no end date (it's a forever thing)
  // OR the end date is in the future so the value is upcoming, return false
  // this is really more like isEndDatedAndEndDateUpcoming
  if (!endDate || dayjs(endDate).isAfter(dayjs())) {
    return false;
  }

  return true;
};

export type ItemsWithEndDate = Address | Email | Phone | BankDetail;

export const filterItemsWithPastEndDate = (
  items?: ItemsWithEndDate[]
): ItemsWithEndDate[] => {
  if (!items) {
    return [];
  }
  return items?.filter(item => !isEndDatedAndEndDateUpcoming(item?.endDate));
};

export const formatPhoneNumberWithExtension = (phone: Phone): string => {
  let formattedNumber = '';
  if (phone.countryCode) {
    formattedNumber += `${phone.countryCode}-`;
  }
  if (phone.areaCode) {
    formattedNumber += `${phone.areaCode}`;
  }
  if (phone.dialNumber) {
    formattedNumber += `-${phone.dialNumber.substring(0, 3)}-${phone.dialNumber.substring(3, 8)}`;
  }
  if (phone.extension) {
    formattedNumber += ` ext. ${phone.extension}`;
  }
  return formattedNumber;
};

// TODO: confirm this error handling
export const fullName = ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) => {
  return !firstName && !lastName
    ? DEFAULT_ERROR_STRING
    : `${toSentenceCase(firstName)} ${toSentenceCase(lastName)}`;
};

// TODO: should this return 0? or have a prop for displaying 0 if 0 is not null?
/**
 *
 * @param value
 * @returns default error string (-) if value is null otherwise returns value
 */
export const checkIfNull = <T>(value: T, zeroIsValid?: boolean): T | string => {
  if (!zeroIsValid && !value) {
    return DEFAULT_ERROR_STRING;
  }

  if (zeroIsValid && isNullEmptyOrUndefined(value)) {
    return DEFAULT_ERROR_STRING;
  }

  return value;
};

export const isNullEmptyOrUndefined = <T>(value: T): boolean =>
  value === null || value === undefined || value === '';

export const bankAccountNumberSanitizer = (
  accountNum?: string | null
): string | undefined => {
  if (!accountNum) {
    return DEFAULT_ERROR_STRING;
  }

  // This seems like an extreme edge case, but should probably add some better handling here
  if (accountNum.length < 4) {
    return accountNum.slice(-3);
  }

  return accountNum.slice(-4);
};

export const getFrequency = (
  frequency: Frequency | null | undefined
): string | null => {
  switch (frequency) {
    case Frequency.ANNUAL:
      return 'Annual';
    case Frequency.DAILY:
      return 'Daily';
    case Frequency.EVERYTWOWEEKS:
      return 'Bi-annual';
    case Frequency.MONTHLY:
      return 'Monthly';
    case Frequency.SEMIANNUAL:
      return 'Semi-annual';
    case Frequency.SINGLEPAYMENT:
      return 'One-time';
    case Frequency.QUARTERLY:
      return 'Quarterly';
    default:
      return null;
  }
};

export const formatBankAccountTypeText = (
  accountType: AccountType | null | undefined
): string => {
  switch (accountType) {
    case AccountType.BROKERAGEACCOUNT:
      return 'Brokerage Account';
    case AccountType.CERTIFICATEOFDEPOSIT:
      return 'Certificate of Deposit';
    case AccountType.CHECKING:
      return 'Checking';
    case AccountType.CREDITCARD:
      return 'Credit Card';
    case AccountType.DEBITCARD:
      return 'Debit Card';
    case AccountType.SAVINGS:
      return 'Savings';
    default:
      return DEFAULT_ERROR_STRING;
  }
};

export const getRiderDescription = (code: string) => {
  switch (code) {
    case 'SBLCHR':
      return "If you're diagnosed with a qualifying chronic illness, you may claim the lesser of: 50% of your death benefit or $500,000. Please refer to your policy for more details.";
    case 'SBLCRI':
      return "If you're diagnosed with a qualifying critical illness, you may be eligible to claim a portion of your death benefit. Eligible amounts depend on the illness tier. For tier 1 illnesses: it's 5% of the death benefit or ($5,000.00), whichever is less. For tier 2 illnesses, it's 50% of the death benefit or ($500,000.00), whichever is less. Please refer to your policy for more details.";
    case 'SBLTRM':
      return 'If you are diagnosed with a terminal illness, you may claim the lesser of: 50% of your death benefit or $500,000. Please refer to your policy for more details.';
    case 'SBLOPR':
      return 'If you take a loan on your policy that eventually exceeds the account value, this rider will apply, preventing the policy from lapsing and triggering a taxable event. Please refer to your policy for more details.';
    case 'LAPSEPROTECTION':
      return 'If you are in compliance with all other policy terms and conditions, then this policy guarantees a death benefit for 20 years (even if the account value is insufficient to cover the monthly deductions) as long as the required minimum payments are paid. Please refer to your policy for more details.';
    default:
      return null;
  }
};

export const allowedAnnualWithdrawals = ({
  policyStatus,
  accountValues,
  allocation,
  withdrawalValues,
}: Policy) => {
  // If any of these values are null, we want to return null rather than a default number
  // can only actually determine the number of withdrawals given values for all of these
  if (
    isNullEmptyOrUndefined(policyStatus) ||
    !accountValues ||
    isNullEmptyOrUndefined(accountValues?.surrenderValue) ||
    isNullEmptyOrUndefined(accountValues?.beginningAccountValue) ||
    isNullEmptyOrUndefined(allocation?.matchSegment?.matchVestingDate)
  ) {
    return null;
  }

  // Eligibility Checks
  const eligiblePolicyStatus =
    policyStatus &&
    [PolicyStatus.ACTIVE, PolicyStatus.PENDINGLAPSE].includes(policyStatus);
  const eligibleSurrenderValue = accountValues.surrenderValue! > 0;
  const eligibleAccountValue = accountValues.beginningAccountValue! > 0;
  const matchVestingDate = allocation?.matchSegment?.matchVestingDate;

  if (
    eligiblePolicyStatus &&
    eligibleSurrenderValue &&
    eligibleAccountValue &&
    matchVestingDate
  ) {
    return dayjs(matchVestingDate).isBefore(dayjs())
      ? withdrawalValues?.maximumWithdrawalRequestAfterVestingPeriod
      : withdrawalValues?.maximumWithdrawalRequestDuringVestingPeriod;
  }

  return null;
};

export const policyHasVested = ({ allocation }: Policy) => {
  if (!dayjs(allocation?.matchSegment?.matchVestingDate).isValid()) {
    return null;
  }

  return dayjs(allocation?.matchSegment?.matchVestingDate).isBefore(dayjs());
};

export const policyWithdrawalsRemaining = ({
  allowedWithdrawals,
  withdrawalsTaken,
}: {
  allowedWithdrawals?: number | null;
  withdrawalsTaken?: number | null;
}) => {
  if (withdrawalsTaken == null || allowedWithdrawals == null) {
    return null;
  }

  return Math.max(0, allowedWithdrawals - withdrawalsTaken);
};

export const autopayBankId = (policy: Policy) => {
  // Find the systematic program that is for the premium autopay
  const autopayProgram = policy.systematicPrograms?.find(
    (program: SystematicProgram) =>
      // TODO: this doesn't match the type described in generated types
      program.arrangementType === ('PAYMENT' as ArrangementType)
  );

  // Party on the return is an arry, so ensure using bankId of
  // payor from the systematic program
  const autopayPayor = autopayProgram?.party?.find(
    party => party.partyRole === PartyRole.PAYOR
  );

  return autopayPayor?.bankId;
};

export const allPolicyOwnerBanks = (policy: Policy): BankDetail[] => {
  const ownerInfo = policyOwner(policy);

  return (ownerInfo?.bankDetails || [])
    .map((b: BankAccount) => {
      return {
        ...b,
        accountNumber: bankAccountNumberSanitizer(b?.accountNumber),
        autopayEnabled: b.bankId === autopayBankId(policy),
      };
    })
    .filter(bank => !isEndDatedAndEndDateUpcoming(bank.endDate));
};

export const productTypeDisplay = (
  productType?: ProductType
): string | null => {
  switch (productType) {
    case ProductType.INDEXEDUNIVERSALLIFE:
      return 'Indexed Universal Life';
    case 'TERMLIFE' as ProductType:
      return 'Term Life';
    case ProductType.UNIVERSALLIFE:
      return 'Universal Life';
    case ProductType.VARIABLEUNIVERSALLIFE:
      return 'Variable Universal Life';
    case ProductType.WHOLELIFE:
      return 'Whole Life';
    default:
      return null;
  }
};

export const eligibilityStatus = (transaction: TransactionResponse) => {
  const { status } = transaction;

  if (!status) {
    return null;
  }

  return status === 'success';
};

export const getBankAccountByBankId = (
  bankId: string,
  bankAccounts: BankAccount[]
) => {
  return bankAccounts.find(b => b.bankId === bankId);
};

export const isAnnuity = (lineOfBusiness?: LineOfBusiness) => {
  return (
    lineOfBusiness === LineOfBusiness.ANNUITY ||
    lineOfBusiness === ('Annuity Product' as LineOfBusiness)
  );
};

// TODO: should this default to policies or should we return null if its not one of the two expected?
export const lineOfBusinessUrlPath = (lineOfBusiness?: LineOfBusiness) => {
  if (!lineOfBusiness) {
    return '';
  }

  if (isAnnuity(lineOfBusiness)) {
    return LineOfBusinessPath.ANNUITIES;
  }

  return LineOfBusinessPath.POLICIES;
};

export const lineOfBusinessDisplayText = (lineOfBusiness?: LineOfBusiness) => {
  if (isAnnuity(lineOfBusiness)) {
    return 'contract';
  }

  return 'policy';
};
