import {
  PartyRole,
  Policy,
  PolicyStatus,
  Transaction,
  TransactionType,
  MetricsType,
  Party,
  FundAllocation,
  PolicyFeature,
  Status,
  Reason,
  Transaction_Payor,
} from '@zinnia/api-types/types/sor';
import { policyOwner } from '@zinnia/utils';

import { BankDetail } from '@/components/person-data/types';
import {
  Beneficiary,
  BeneficiaryData,
  PolicyAccountValue,
  PolicyCoverage,
  PolicyDetails,
  PolicyProfile,
  UpcomingPremium,
  ExtendedTransactionStatus,
  PaymentHistory,
  Metric,
  PolicyFund,
  PolicyLoans,
  AccountValueSummary,
  PolicyWithdrawals,
  PolicySurrender,
  PolicyStatusDetail,
  PolicyFeatureDetail,
  CarrierPolicyDetails,
} from '@/types/policy';
import { RidersAndBenefits } from '@/types/riders';
import {
  allowedAnnualWithdrawals,
  bankAccountNumberSanitizer,
  policyWithdrawalsRemaining,
  getRiderDescription,
  policyHasVested,
  allPolicyOwnerBanks,
} from '@/utils/data';
import { DEFAULT_ERROR_STRING } from '@/utils/strings';

const allBeneficiaries = (policy: Policy) => {
  const benesWithRoles = [] as Beneficiary[];
  const beneRoles = [
    PartyRole.CONTINGENTBENEFICIARY,
    PartyRole.PRIMARYBENEFICIARY,
  ];

  policy.parties?.forEach((party: Party) => {
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
  policyReferences: Partial<Policy>[]
): CarrierPolicyDetails[] => {
  return policyReferences.map(p => {
    const policyDetails = transformPolicyForHeaderDetails(p);
    return {
      planCode: p?.product?.planCode || '',
      totalFundValue: p?.allocation?.funds?.[0]?.totalFundValue,
      totalCoverageAmount: p?.coverage?.totalCoverageAmount,
      policyStartDate: p?.policyDates?.policyStartDate,
      // Date of last policy transaction, when policy value was last updated
      effectiveDate: p?.effectiveDate,
      ...policyDetails,
    };
  });
};

export const transformPolicyForAccountValue = (
  policy: Policy
): PolicyAccountValue => {
  return {
    // Date of last policy transaction, when policy value was last updated
    effectiveDate: policy?.effectiveDate,
    totalFundValue: policy?.accountValues?.endingAccountValue,
    policyStartDate: policy?.policyDates?.policyStartDate,
  };
};

export const transformPolicyMetricsForAccountValueChange = (
  metrics: Metric[]
): { valueChange: number } | null => {
  const accountValueData = metrics.find(
    metric => metric.metric === MetricsType.ACCOUNTVALUE
  );

  const valueChange = accountValueData
    ? accountValueData.end - accountValueData.begin
    : null;

  return valueChange ? { valueChange } : null;
};

export const transformPolicyForHeaderDetails = (
  policy: Policy
): PolicyDetails => {
  const ownerInfo = policyOwner(policy);

  return {
    marketingName: policy?.product?.marketingName || '',
    planName: policy?.product?.planName || '',
    policyStatus: policy?.policyStatus || PolicyStatus.NOTISSUED,
    policyNumber: policy?.policyNumber || '',
    firstName: ownerInfo?.firstName || '',
    lastName: ownerInfo?.lastName || '',
  };
};

export const transformPolicyForProfile = (policy: Policy): PolicyProfile => {
  const ownerInfo = policyOwner(policy);
  const bankDetails = allPolicyOwnerBanks(policy);

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
    productType: policy?.product?.productType,
  };
};

export const transformPolicyForCoverage = (policy: Policy): PolicyCoverage => {
  return {
    // Date of last policy transaction, when policy value was last updated
    effectiveDate: policy.effectiveDate,
    beneficiaryCount: allBeneficiaries(policy).length,
    maturityDate: policy?.policyDates?.maturityDate,
    policyStartDate: policy?.policyDates?.policyStartDate,
    totalCoverageAmount: policy?.coverage?.totalCoverageAmount,
    maximumCoverageIncreaseAmount:
      policy?.coverage?.maximumCoverageIncreaseAmount,
    riderCount: policy?.riders?.length || 0,
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
): BankDetail[] => {
  return allPolicyOwnerBanks(policy);
};

export const transformPolicyForFundDetails = (
  policy: Policy
): PolicyFund[] | null => {
  if (
    !policy?.allocation ||
    policy?.allocation?.fundAllocationsInvestments?.length === 0
  ) {
    return null;
  }

  const allocations = policy.allocation?.fundAllocationsInvestments?.map(
    (fund: FundAllocation) => {
      const fundDetails = policy.allocation?.funds?.find(
        (detail: FundAllocation) => detail?.fundId === fund?.fundId
      );

      return {
        fundName: fund?.fundName,
        allocationPercentage: fund?.allocationPercentage,
        totalFundValue: fundDetails?.totalFundValue,
        fundAccountType: fundDetails?.fundAccountType,
      };
    }
  );

  return allocations || null;
};

export const transformPolicyForWithdrawals = (
  policy: Policy
): PolicyWithdrawals | null => {
  if (!policy?.withdrawalValues) {
    return null;
  }

  const annualWithdrawalsAllowed = allowedAnnualWithdrawals(policy);
  const withdrawalsTaken =
    policy.withdrawalValues?.yearToDateNumberOfWithdrawal;
  const withdrawalValues = policy.withdrawalValues || {};

  return {
    withdrawalAllowedStartDate: withdrawalValues.withdrawalAllowedStartDate,
    maximumWithdrawalAmount: withdrawalValues.maximumWithdrawalAmount,
    numberOfWithdrawal: withdrawalValues.numberOfWithdrawal,
    totalWithdrawalAmount: withdrawalValues.totalWithdrawalAmount,
    annualWithdrawalLimitNoCoverageDecrease:
      withdrawalValues.annualWithdrawalLimitNoCoverageDecrease,
    annualWithdrawalsTaken: withdrawalsTaken,
    annualWithdrawalsRemaining: policyWithdrawalsRemaining({
      allowedWithdrawals: annualWithdrawalsAllowed,
      withdrawalsTaken,
    }),
    nextMonthiversaryDate: policy.policyDates?.nextMonthiversaryDate,
    nextAnniversaryDate: policy.policyDates?.nextAnniversaryDate,
    vestingDetails: {
      maximumWithdrawalRequestAfterVestingPeriod:
        withdrawalValues?.maximumWithdrawalRequestAfterVestingPeriod,
      maximumWithdrawalRequestDuringVestingPeriod:
        withdrawalValues?.maximumWithdrawalRequestDuringVestingPeriod,
      vestingPeriod: policy.allocation?.matchSegment?.vestingPeriod,
      policyHasVested: policyHasVested(policy),
      matchVestingDate: policy.allocation?.matchSegment?.matchVestingDate,
    },
    // Date of last policy transaction, when policy value was last updated
    effectiveDate: policy.effectiveDate,
  };
};

export const transformPolicyForLoans = (policy: Policy): PolicyLoans => {
  return {
    totalLoanBalance: policy.loanValues?.totalLoanBalance,
    maximumLoanAmount: policy.loanValues?.maximumLoanAmount,
    // Date of last policy transaction, when policy value was last updated
    effectiveDate: policy.effectiveDate,
  };
};

export const transformPolicyForSurrender = (
  policy: Policy
): PolicySurrender => {
  return {
    surrenderValue: policy.accountValues?.surrenderValue,
  };
};

export const transformPolicyForAccountValueSummary = (
  policy: Policy
): AccountValueSummary => {
  const fundDetails = transformPolicyForFundDetails(policy);

  return {
    fundCount: fundDetails?.length,
  };
};

const getTransactionBankDetails = (
  policy: Policy,
  transactionPayor?: Transaction_Payor
) => {
  if (!transactionPayor) {
    return null;
  }
  // TODO: is it possible to have multiple payors? what is the ui for that if so?
  const transactionPayorPartyId = transactionPayor.partyId;
  const transactionBankId = transactionPayor.bankId;
  const transactionPolicyParty = policy.parties?.find(
    ({ partyId }) => partyId === transactionPayorPartyId
  );

  return transactionPolicyParty?.bankDetails?.find(
    ({ bankId }) => bankId === transactionBankId
  );
};

export const transformPaymentHistory = (
  policy: Policy,
  transaction: Transaction | undefined
): PaymentHistory => {
  const paymentMethod = getTransactionBankDetails(
    policy,
    transaction?.payors?.[0]
  );
  const { effectiveDate, status, transactionAmounts, transactionType } =
    transaction ?? {};
  const { appliedAmount, requestedAmount, paymentAmount } =
    transactionAmounts ?? {};
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
    frequency: null,
    type: transactionType?.toString() as keyof typeof Reason,
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
      paymentHistoryObject.frequency = 'initial';
      break;
    case TransactionType.PAYMENT_ONE_TIME_PREMIUM:
    case TransactionType.ONE_TIME_PREMIUM:
      paymentHistoryObject.amount =
        transactionType === TransactionType.PAYMENT_ONE_TIME_PREMIUM
          ? requestedAmount
          : appliedAmount;
      paymentHistoryObject.title = 'Premium payment';
      paymentHistoryObject.frequency = 'one-time';
      break;
    case TransactionType.SUBSEQUENT_PAYMENT:
    case TransactionType.SUBSEQUENT_PREMIUM:
      paymentHistoryObject.amount =
        status === ExtendedTransactionStatus.Pending
          ? paymentAmount
          : transactionType === TransactionType.SUBSEQUENT_PAYMENT
            ? requestedAmount
            : appliedAmount;
      paymentHistoryObject.title = 'Premium autopay';
      break;
    case 'Activation':
      paymentHistoryObject.title = 'Policy activation';
      break;
    case 'Anniversary':
      paymentHistoryObject.title = 'Policy anniversary';
      break;
    default:
      paymentHistoryObject.title = transactionType ?? DEFAULT_ERROR_STRING;
      break;
  }

  return paymentHistoryObject;
};

export const transformRiders = (policy: Policy): RidersAndBenefits => {
  const { riders } = policy;
  const lapsedProtection = transformPolicyFeature(
    policy,
    'LAPSEPROTECTION' as PolicyFeature.featureType
  );

  const additionalBenefits = [];
  const ownerInfo = policyOwner(policy);
  const insuredPartyFromRoles = policy.partyRoles?.find(
    party => party.partyRole?.toLowerCase() === PartyRole.INSURED.toLowerCase()
  );
  const insuredParty = policy.parties?.find(
    party => party.partyId === insuredPartyFromRoles?.partyId
  );

  const allRiders = riders?.map(rider => {
    const riderInsured = rider.riderParticipant?.find(
      party => party.insuredId === insuredPartyFromRoles?.partyId
    );
    return {
      riderCode: rider.riderCode,
      // TODO: DATA - {rider.terminalRiderPaymentAmount}
      cost: rider.terminalRiderPaymentAmount,
      description: getRiderDescription(rider.riderCode || ''),
      effectiveDate: rider.effectiveDate,
      isElected: rider.riderElected?.toLowerCase() === 'elected',
      isOwner: ownerInfo?.partyId === riderInsured?.insuredId,
      title: rider.riderName,
      status: rider.status,
      insured: {
        firstName: insuredParty?.firstName,
        lastName: insuredParty?.lastName,
      },
    };
  });

  if (lapsedProtection) {
    additionalBenefits.push({
      riderCode: lapsedProtection.featureType,
      cost: lapsedProtection.paymentAmount,
      description: getRiderDescription(lapsedProtection.featureType || ''),
      effectiveDate: lapsedProtection.startDate,
      isElected: true,
      isOwner: true,
      title: 'Lapse protection guarantee',
      status: !lapsedProtection.endDate ? Status.ACTIVE : Status.TERMINATED,
      insured: {
        firstName: insuredParty?.firstName,
        lastName: insuredParty?.lastName,
      },
    });
  }

  return {
    riders: allRiders || null,
    additionalBenefits: additionalBenefits || null,
  };
};

export const transformPolicyFeature = (
  policy: Policy,
  feature: PolicyFeature.featureType
): PolicyFeatureDetail | null => {
  const { policyFeatures } = policy;

  const requestedFeature = policyFeatures?.find(
    (currentFeature: PolicyFeature) => currentFeature.featureType === feature
  );

  if (!requestedFeature) {
    return null;
  }

  return {
    featureType: requestedFeature.featureType,
    totalRequiredAmount: requestedFeature.totalRequiredAmount,
    totalMinimumRequiredAmount: requestedFeature.totalMinimumRequiredAmount,
    totalPaymentAmount: requestedFeature.totalPaymentAmount,
    startDate: requestedFeature.startDate,
    endDate: requestedFeature.endDate,
    status: requestedFeature.status,
    period: requestedFeature.period,
    effectiveDate: requestedFeature.effectiveDate,
    paymentAmount: requestedFeature.paymentAmount,
    underwritingDecision: requestedFeature.underwritingDecision,
    approvalDate: requestedFeature.approvalDate,
  };
};

export const transformPolicyStatusDetails = (
  policy: Policy
): Partial<PolicyStatusDetail> => {
  const policyStatus = policy.policyStatus;

  if (policyStatus === PolicyStatus.PENDINGLAPSE) {
    const featureDetails = transformPolicyFeature(
      policy,
      'LAPSEASSESSMENT' as PolicyFeature.featureType
    );

    return {
      policyStatus,
      minimumPaymentDue: featureDetails?.totalMinimumRequiredAmount,
      minimumPaymentDueDate: featureDetails?.endDate,
    };
  }

  if (policyStatus === PolicyStatus.LAPSE) {
    const lapseAssessmentDetails = transformPolicyFeature(
      policy,
      'LAPSEASSESSMENT' as PolicyFeature.featureType
    );

    const reinstantementDetails = transformPolicyFeature(
      policy,
      'REINSTATEMENT' as PolicyFeature.featureType
    );

    return {
      policyStatus,
      lapsedOn: lapseAssessmentDetails?.endDate,
      reinstatmentDate: reinstantementDetails?.startDate,
      reinstatementPeriod: reinstantementDetails?.period,
    };
  }

  return {
    policyStatus,
  };
};
