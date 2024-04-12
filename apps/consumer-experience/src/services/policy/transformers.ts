import { PolicyReferenceDataModel } from '@zinnia/api-types/types/search';
import {
  BankAccount,
  PartyRole,
  Policy,
  PolicyStatus,
  Transaction,
  TransactionType,
  MetricsType,
  SystematicProgram,
  Party,
  FundAllocation,
  PolicyFeature,
} from '@zinnia/api-types/types/sor';
import { policyOwner } from '@zinnia/utils';

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
  Metric,
  PolicyFund,
  PolicyLoans,
  AccountValueSummary,
  PolicyWithdrawals,
  PolicySurrender,
  PolicyStatusDetail,
  PolicyFeatureDetail,
} from '@/types/policy';
import { PolicyRider } from '@/types/riders';
import {
  allowedAnnualWithdrawals,
  bankAccountNumberSanitizer,
  isPolicyEligibleForWithdrawals,
  policyWithdrawalsRemaining,
  getRiderDescription,
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
  };
};

export const transformPolicyMetricsForAccountValueChange = (
  metrics: Metric[]
): { valueChange: number } | null => {
  const accountValueData = metrics.find(
    metric => metric.metric === MetricsType.ACCOUNTVALUE
  );

  const valueChange = accountValueData
    ? accountValueData.begin - accountValueData.end
    : null;

  return valueChange ? { valueChange } : null;
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
  const bankDetails: BankDetail[] = (ownerInfo?.bankDetails || []).map(
    (b: BankAccount) => {
      return {
        ...b,
        accountNumber: bankAccountNumberSanitizer(b?.accountNumber),
        // TODO: update this to use real data
        autopayEnabled: false,
      };
    }
  );
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
    maximumCoverageIncreaseAmount:
      policy.coverage?.maximumCoverageIncreaseAmount,
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
    (program: SystematicProgram) =>
      program.reason === ExtendedReason.PREMIUMREASON
  );

  let bankDetails: BankAccount | undefined;
  if (premiumSystematicProgram) {
    const currentPayor = (premiumSystematicProgram?.party || [])[0];
    const currentPayorParty = policy?.parties?.find(
      (party: Party) => party.partyId === currentPayor?.partyId
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
    (program: SystematicProgram) =>
      program.reason === ExtendedReason.PREMIUMREASON
  );
  const programFirstPayor = (paymentProgram?.party || [])[0];
  const paymentProgramFinancialInstitutionId = programFirstPayor?.bankId;
  const payor = policy?.parties?.find(
    (party: Party) => party.partyId === programFirstPayor?.partyId
  );
  const paymentMethod = payor?.bankDetails?.find((bank: BankAccount) =>
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
    policy.withdrawalValues?.totalYearToDateWithdrawalTaken;
  const withdrawalValues = policy.withdrawalValues || {};

  return {
    ...policy.withdrawalValues,
    withdrawalAllowedStartDate: withdrawalValues.withdrawalAllowedStartDate,
    maximumWithdrawalAmount: withdrawalValues.maximumWithdrawalAmount,
    numberOfWithdrawal: withdrawalValues.numberOfWithdrawal,
    totalWithdrawalAmount: withdrawalValues.totalWithdrawalAmount,
    availableToWithdrawTaxFree: policy.costBasis?.costBasis,
    annualWithdrawalLimitNoCoverageDecrease:
      withdrawalValues.annualWithdrawalLimitNoCoverageDecrease,
    isEligibleForWithdrawals: isPolicyEligibleForWithdrawals({
      allowedWithdrawals: annualWithdrawalsAllowed,
      withdrawalsTaken,
    }),
    annualWithdrawalsTaken:
      policy.withdrawalValues?.totalYearToDateWithdrawalTaken,
    annualWithdrawalsRemaining: policyWithdrawalsRemaining({
      allowedWithdrawals: annualWithdrawalsAllowed,
      withdrawalsTaken,
    }),
    nextMonthiversaryDate: policy.policyDates?.nextMonthiversaryDate,
    nextAnniversaryDate: policy.policyDates?.nextAnniversaryDate,
  };
};

export const transformPolicyForLoans = (policy: Policy): PolicyLoans => {
  const isEligible =
    policy?.policyStatus === PolicyStatus.ACTIVE &&
    !!policy?.accountValues?.beginningAccountValue &&
    policy?.accountValues?.beginningAccountValue > 0;

  return {
    totalLoanBalance: policy.loanValues?.totalLoanBalance,
    maximumLoanAmount: policy.loanValues?.maximumLoanAmount,
    timestamp: policy.timestamp,
    // Return either the boolean OR undefined since there is a difference between
    // inelgible and data doesn't exist
    isEligible: policy && policy.accountValues ? isEligible : undefined,
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
  const withdrawalDetails = transformPolicyForWithdrawals(policy);
  const loanValues = transformPolicyForLoans(policy);

  return {
    fundCount: fundDetails?.length,
    hasWithdrawalEligibility: withdrawalDetails
      ? withdrawalDetails.isEligibleForWithdrawals
      : null,
    hasLoanEligibility: loanValues?.isEligible,
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
      paymentHistoryObject.title = 'Policy anniversary';
      break;
    default:
      paymentHistoryObject.title = transactionType ?? DEFAULT_ERROR_STRING;
      break;
  }

  return paymentHistoryObject;
};

export const transformRiders = (policy: Policy): PolicyRider[] | null => {
  const { riders } = policy;

  if (!riders || !riders.length) {
    return null;
  }

  const ownerInfo = policyOwner(policy);
  const insuredPartyFromRoles = policy.partyRoles?.find(
    party => party.partyRole?.toLowerCase() === PartyRole.INSURED.toLowerCase()
  );
  const insuredParty = policy.parties?.find(
    party => party.partyId === insuredPartyFromRoles?.partyId
  );

  return riders.map(rider => {
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
    };
  }

  return {
    policyStatus,
  };
};
