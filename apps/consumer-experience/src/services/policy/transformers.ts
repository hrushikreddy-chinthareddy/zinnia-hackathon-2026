import { PolicyReferenceDataModel } from '@zinnia/api-types/types/search';
import {
  BankAccount,
  PartyRole,
  Policy,
  PolicyStatus,
  Transaction,
  TransactionType,
} from '@zinnia/api-types/types/sor';
import { DEFAULT_ERROR_STRING, policyOwner } from '@zinnia/utils';

import { BankDetail } from '@/components/person-data/types';
import {
  Beneficiary,
  BeneficiaryData,
  MethodAndProgram,
  PolicyAccountValue,
  PolicyCoverage,
  PolicyDetails,
  PolicyProfile,
  PolicyReferenceData,
  UpcomingPremium,
  ExtendedReason,
  ExtendedTransactionStatus,
  PaymentHistory,
} from '@/types/policy';
import { bankAccountNumberSanitizer } from '@/utils/data';

const allBeneficiaries = (policy: Policy) => {
  const benesWithRoles = [] as Beneficiary[];
  const beneRoles = [
    PartyRole.CONTINGENTBENEFICIARY,
    PartyRole.PRIMARYBENEFICIARY,
  ];

  policy.parties?.forEach(party => {
    const correspondingRole = policy.partyRoles?.find(
      role => role.partyId === party.partyId
    );

    if (
      correspondingRole &&
      correspondingRole.partyRole &&
      beneRoles.includes(correspondingRole.partyRole)
    ) {
      benesWithRoles.push({
        firstName: party.firstName,
        lastName: party.lastName,
        partyType: party.partyType,
        partyId: party.partyId,
        beneficiaryPercentage: party.beneficiaryPercentage,
        addresses: party.addresses,
        emails: party.emails,
        partyRole: correspondingRole.partyRole,
        relationshipToInsured: correspondingRole.relationshipToInsured,
      } as Beneficiary);
    }
  });

  return benesWithRoles;
};

export const transformPolicyReferenceData = (
  policyReferences: PolicyReferenceDataModel[]
): PolicyReferenceData[] => {
  return policyReferences.map(p => {
    return {
      policyNumber: p.policyNumber,
      companyName: p.companyName,
      id: p.id,
      planCode: p.planCode,
      productName: p.productName,
    };
  });
};

export const transformPolicyForAccountValue = (
  policy: Policy
): PolicyAccountValue => {
  return {
    timestamp: policy.timestamp,
    totalFundValue: policy?.allocation?.funds?.[0]?.totalFundValue,
    // TODO: update this to use real data
    valueChange: 9.638554,
  };
};

export const transformPolicyForHeaderDetails = (
  policy: Policy
): PolicyDetails => {
  const ownerInfo = policyOwner(policy);
  return {
    marketingName: policy.product?.marketingName || '',
    planName: policy.product?.planName || '',
    policyStatus: policy.policyStatus || PolicyStatus.NOTISSUED,
    policyNumber: policy.policyNumber || '',
    firstName: ownerInfo?.firstName || '',
    lastName: ownerInfo?.lastName || '',
  };
};

export const transformPolicyForProfile = (policy: Policy): PolicyProfile => {
  const ownerInfo = policyOwner(policy);
  const bankDetails: BankDetail[] = (ownerInfo?.bankDetails || []).map(b => {
    return {
      ...b,
      accountNumber: bankAccountNumberSanitizer(b?.accountNumber),
      // TODO: update this to use real data
      autopayEnabled: false,
    };
  });
  return {
    preferredAddressIndicator: ownerInfo?.preferredAddressIndicator || '',
    name: {
      firstName: ownerInfo?.firstName || '',
      lastName: ownerInfo?.lastName || '',
    },
    addresses: ownerInfo?.addresses || [],
    bankDetails,
    emails: ownerInfo?.emails || [],
    phones: ownerInfo?.phones || [],
  };
};

export const transformPolicyForUpcomingPremium = (
  policy: Policy
): UpcomingPremium => {
  return {
    amount: policy.systematicPrograms?.[0]?.amount || 0,
    nextActivityDate: policy.systematicPrograms?.[0]?.nextProgramDate || '',
    planName: policy.product?.planName || '',
    policyStatus: policy.policyStatus || PolicyStatus.NOTISSUED,
  };
};

export const transformPolicyForCoverage = (policy: Policy): PolicyCoverage => {
  return {
    beneficiaryCount: allBeneficiaries(policy).length,
    maturityDate: policy.policyDates?.maturityDate,
    policyStartDate: policy.policyDates?.policyStartDate,
    totalCoverageAmount: policy.coverage?.totalCoverageAmount,
    maximumCoverageIncreaseAmount: policy.coverage?.maximumCoverageIncreaseAmount,
    riderCount: policy.riders?.length || 0,
  };
};

export const transformPolicyForBeneficiaries = (
  policy: Policy
): BeneficiaryData => {
  return {
    totalCoverageAmount: policy.coverage?.totalCoverageAmount,
    beneficiaries: allBeneficiaries(policy),
  };
};

export const transformPolicyForBeneficiary = (
  policy: Policy,
  partyId: string
): Beneficiary | undefined => {
  const bene = allBeneficiaries(policy).find(
    party => party.partyId === partyId
  );

  return bene;
};

export const transformPolicyforPaymentDetails = (
  policy: Policy
): BankDetail => {
  const premiumSystematicProgram = policy.systematicPrograms?.find(
    program => program.reason === ExtendedReason.PREMIUMREASON
  );

  let bankDetails: BankAccount | undefined;
  if (premiumSystematicProgram) {
    const currentPayor = (premiumSystematicProgram?.party || [])[0];
    const currentPayorParty = policy?.parties?.find(
      party => party.partyId === currentPayor?.partyId
    );
    bankDetails = currentPayorParty?.bankDetails?.find(
      bank => bank.bankId === currentPayor?.bankId
    );
  }

  return {
    ...bankDetails,
    accountNumber: bankAccountNumberSanitizer(bankDetails?.accountNumber),
    autopayEnabled: true,
  };
};
export const transformPolicyToMethodAndProgram = (
  policy: Policy
): MethodAndProgram | undefined => {
  const paymentProgram = policy?.systematicPrograms?.find(
    program => program.reason === ExtendedReason.PREMIUMREASON
  );
  const programFirstPayor = (paymentProgram?.party || [])[0];
  const paymentProgramFinancialInstitutionId = programFirstPayor?.bankId;
  const payor = policy?.parties?.find(
    party => party.partyId === programFirstPayor?.partyId
  );
  const paymentMethod = payor?.bankDetails?.find(bank =>
    [bank.appliesToPartyId, bank.accountNumber, bank.bankId].includes(
      paymentProgramFinancialInstitutionId
    )
  );

  if (!paymentMethod) {
    return;
  }

  return {
    ...paymentMethod,
    frequency: paymentProgram?.frequency,
    amount: paymentProgram?.amount,
  };
};

export const transformPaymentHistory = (
  policy: Policy,
  transaction: Transaction | undefined
): PaymentHistory => {
  const paymentMethod = transformPolicyToMethodAndProgram(policy);
  const { effectiveDate, status, transactionAmounts, transactionType } =
    transaction ?? {};
  const { appliedAmount, requestedAmount } = transactionAmounts ?? {};
  const accountType = paymentMethod?.accountType;
  const accountNumber = bankAccountNumberSanitizer(
    paymentMethod?.internationalBankAccountNumber ??
      paymentMethod?.accountNumber
  );

  const date =
    status === ExtendedTransactionStatus.PROCESSING
      ? 'Processing'
      : effectiveDate;

  const paymentHistoryObject: PaymentHistory = {
    amount: requestedAmount,
    date,
    frequency: paymentMethod?.frequency,
    type: transactionType?.toString() as keyof typeof ExtendedReason,
    bankDetails: {
      accountType,
      accountNumber,
    },
    title: DEFAULT_ERROR_STRING,
    isPending: status === ExtendedTransactionStatus.Pending,
  };

  if (!transactionType) {
    return paymentHistoryObject;
  }

  switch (transactionType) {
    case TransactionType.PAYMENT_INITIAL_PREMIUM:
    case TransactionType.INITIAL_PREMIUM:
      paymentHistoryObject.amount =
        transactionType === TransactionType.PAYMENT_INITIAL_PREMIUM
          ? requestedAmount
          : appliedAmount;
      paymentHistoryObject.title = 'Premium payment';
      break;
    case TransactionType.PAYMENT_ONE_TIME_PREMIUM:
    case TransactionType.ONE_TIME_PREMIUM:
      paymentHistoryObject.amount =
        transactionType === TransactionType.PAYMENT_ONE_TIME_PREMIUM
          ? requestedAmount
          : appliedAmount;
      paymentHistoryObject.title = 'Premium payment';
      break;
    case TransactionType.SUBSEQUENT_PAYMENT:
    case TransactionType.SUBSEQUENT_PREMIUM:
      paymentHistoryObject.amount = paymentMethod?.amount;
      paymentHistoryObject.title = 'Premium autopay';
      break;
    case 'Activation':
      paymentHistoryObject.title = 'Policy activation';
      break;
    case 'Anniversary':
      paymentHistoryObject.title = '"Policy anniversary';
      break;
    default:
      paymentHistoryObject.title = transactionType ?? DEFAULT_ERROR_STRING;
      break;
  }

  return paymentHistoryObject;
};
