import {
  PartyRole,
  Policy,
  PolicyStatus,
  Transaction,
  TransactionType,
  MetricsType,
  Party,
  PolicyFeature,
  Status,
  Reason,
  Transaction_Payor,
  FeatureType,
  LineOfBusiness,
  Frequency,
} from '@zinnia/api-types/types/sor';
import { policyOwner } from '@zinnia/utils';
import dayjs from 'dayjs';

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
  PolicyWithdrawals,
  PolicySurrender,
  PolicyStatusDetail,
  PolicyFeatureDetail,
  CarrierPolicyDetails,
  PolicyWithAgent,
  PolicyParty,
} from '@/types/policy';
import { RidersAndBenefits } from '@/types/riders';
import {
  allowedAnnualWithdrawals,
  bankAccountNumberSanitizer,
  policyWithdrawalsRemaining,
  getRiderDescription,
  policyHasVested,
  allPolicyOwnerBanks,
  isEndDatedAndEndDateUpcoming,
  banksByPartyId,
} from '@/utils/data';
import { DEFAULT_ERROR_STRING } from '@/utils/strings';
import { LimitedPolicyParty } from './types';

export const allBeneficiaries = (policy: Policy) => {
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
        fullName: party.fullName,
        partyType: party.partyType,
        partyId: party.partyId,
        beneficiaryPercentage: party.beneficiaryPercentage,
        addresses: party.addresses,
        emails: party.emails,
        phones: party.phones,
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
      endingAccountValue: p?.accountValues?.endingAccountValue,
      totalCoverageAmount: p?.coverage?.totalCoverageAmount,
      policyStartDate: p?.policyDates?.policyStartDate,
      // Date of last policy transaction, when policy value was last updated
      effectiveDate: p?.effectiveDate,
      issueDate: p?.policyDates?.issueDate,
      lineOfBusiness: p?.product?.lineOfBusiness,
      cumulativeGrossDeathBenefitAmount:
        p?.coverage?.cumulativeGrossDeathBenefitAmount,
      ...policyDetails,
    };
  });
};

export const transformPolicyForAccountValue = (
  policy: Policy
): PolicyAccountValue => {
  return {
    // Date of last policy transaction, when policy value was last updated
    // the frequency of transactions is a lot higher on life products, so the
    // effective date shows when the last transaction occurred
    // for annuity products, we just show current date
    // (decision documented in CUI-512)
    effectiveDate:
      policy?.product?.lineOfBusiness === LineOfBusiness.ANNUITY
        ? new Date().toISOString()
        : policy?.effectiveDate,
    endingAccountValue: policy?.accountValues?.endingAccountValue,
    policyStartDate: policy?.policyDates?.policyStartDate,
    lineOfBusiness: policy?.product?.lineOfBusiness,
    cumulativeGrossDeathBenefitAmount:
      policy?.coverage?.cumulativeGrossDeathBenefitAmount,
    freeWithdrawalAmount: policy?.withdrawalValues?.freeWithdrawalAmount,
    totalYearToDatePremiumAmount:
      policy?.accountValues?.totalYearToDatePremiumAmount,
    withdrawalAllowedStartDate:
      policy?.withdrawalValues?.withdrawalAllowedStartDate,
    carrierId: policy.carrierId,
    //TODO: We use these values for the annuity account value page. This could eventually be multiple funds.
    //TODO: Refactor this to not only pull from the first array. Designs will need to change to support that.
    fundId: policy?.allocation?.funds?.[0]?.fundId,
    interestGuaranteedPeriod:
      policy?.allocation?.funds?.[0]?.interestGuaranteedPeriod,
    renewalDate: policy?.allocation?.funds?.[0]?.fundSegments?.[0]?.renewalDate,
    uncollectedCharges: policy?.accountValues?.uncollectedCharges,
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

// TODO: at some point rename this, no longer being used by policy header
export const transformPolicyForHeaderDetails = (
  policy: Policy
): PolicyDetails => {
  const ownerInfo = policyOwner(policy);

  return {
    marketingName: policy?.product?.marketingName || '',
    planName: policy?.product?.planName || '',
    policyStatus: policy?.policyStatus || PolicyStatus.NOTISSUED,
    policyNumber: policy?.policyNumber || '',
    carrierId: policy.carrierId,
    firstName: ownerInfo?.firstName || '',
    lastName: ownerInfo?.lastName || '',
    // Note: the api returns a term product type, but the api spec does not reflect that
    // that is why we are using the ExtendedPolicyProductType type here
    // @TODO: remove typecast once api spec is updated with the term product type
    product: policy?.product,
  };
};

export const policyParties = (policy: Policy): PolicyParty[] => {
  return (policy.parties || []).map(party => {
    // Collect all roles for the party
    const partyRoles = policy.partyRoles
      ?.filter(role => role?.partyId === party?.partyId)
      .map(role => role.partyRole)
      // failsafe if a role in the party doesn't map to a the list of party roles in policy.partyRoles
      .filter(role => role !== undefined);

    return {
      partyId: party.partyId,
      firstName: party.firstName,
      lastName: party.lastName,
      fullName: party.fullName,
      addresses: party.addresses,
      emails: party.emails,
      phones: party.phones,
      partyRoles: partyRoles,
      partyType: party.partyType,
      allocationPercentage: party.beneficiaryPercentage,
    };
  });
};

export const transformPolicyForProfile = (
  policy: Policy,
  partyId?: string
): PolicyProfile => {
  const partyInfo = policy.parties?.find(p => p.partyId === partyId);

  const bankDetails = banksByPartyId(policy, partyId);
  const parties = policyParties(policy);

  return {
    preferredAddressIndicator: partyInfo?.preferredAddressIndicator || '',
    partyId: partyInfo?.partyId || '',
    name: {
      firstName: partyInfo?.firstName || '',
      lastName: partyInfo?.lastName || '',
    },
    addresses: partyInfo?.addresses || [],
    bankDetails,
    emails: partyInfo?.emails || [],
    phones: partyInfo?.phones || [],
    parties: parties || [],
  };
};

export const transformPolicyForUpcomingPremium = (
  policy: Policy
): UpcomingPremium => {
  const upcomingPremium = policy.systematicPrograms?.find(
    sp => sp.reason === Reason.PREMIUM
  );

  return {
    arrangementId: upcomingPremium?.arrangementId || '',
    amount: upcomingPremium?.amount || 0,
    frequency: upcomingPremium?.frequency as Frequency,
    nextActivityDate: upcomingPremium?.nextProgramDate || '',
    nextActivityStatus: upcomingPremium?.status,
    planName: policy.product?.planName || '',
    policyStatus: policy.policyStatus || PolicyStatus.NOTISSUED,
    lineOfBusiness: policy?.product?.lineOfBusiness,
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
    policyTerm: policy.policyTerm,
    policyProductType: policy?.product?.productType,
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

/**
 * Gets the list of funds from the policy and builds a fund object containing things like fundName, allocation percentage, and total fund value
 * @param policy
 * @returns
 */
export const transformPolicyForFundDetails = (
  policy: Policy
): PolicyFund[] | null => {
  if (
    !policy?.allocation ||
    policy?.allocation?.fundAllocationsInvestments?.length === 0
  ) {
    return null;
  }

  const policyAlloc = policy.allocation?.fundAllocationsInvestments || [];
  const policyFunds = policy.allocation?.funds || [];

  // Merge the two funds and allocations arrays and combine the data in both.
  // Combines data if the ID exists in both arrays
  const map = new Map<string, PolicyFund>();

  //Loop over allocations and make sure to set percentage
  policyAlloc.forEach(
    item =>
      item.fundId &&
      !isEndDatedAndEndDateUpcoming(item.endDate) &&
      map.set(item.fundId, {
        ...item,
        fundName: item?.fundName,
        allocationPercentage: item?.allocationPercentage,
      })
  );

  //Loop over the funds and make sure to set total fund value
  policyFunds.forEach(
    item =>
      item.fundId &&
      map.set(item.fundId, {
        ...map.get(item.fundId), //get the previous mapped value if it exists and spread the object out
        ...item,
        fundName: item?.fundName,
        totalFundValue: item?.totalFundValue,
      })
  );
  const mergedArr = Array.from(map.values());
  return mergedArr;
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
  const requiredMinimumDistribution = policy.requiredMinimumDistribution || {};
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
    freeWithdrawalAmount: withdrawalValues.freeWithdrawalAmount,
    requiredMinimumDistributionAmount:
      requiredMinimumDistribution.totalRequiredMinimumDistributionAnnualAmount,
    // Date of last policy transaction, when policy value was last updated
    effectiveDate: policy.effectiveDate,
    endingAccountValue: policy.accountValues?.endingAccountValue,
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
    amount: { requestedAmount, appliedAmount },
    date,
    frequency: null,
    type: transactionType?.toString() as keyof typeof Reason,
    bankDetails: {
      accountType,
      accountNumber,
      partyId: transaction?.payors?.[0]?.partyId,
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
      paymentHistoryObject.title = 'Premium payment';
      paymentHistoryObject.frequency = 'initial';
      break;
    case TransactionType.PAYMENT_ONE_TIME_PREMIUM:
    case TransactionType.ONE_TIME_PREMIUM:
      paymentHistoryObject.title = 'Premium payment';
      paymentHistoryObject.frequency = 'one-time';
      break;
    case TransactionType.SUBSEQUENT_PAYMENT:
    case TransactionType.SUBSEQUENT_PREMIUM:
      {
        if (status === ExtendedTransactionStatus.Pending) {
          paymentHistoryObject.amount = { paymentAmount };
        }
        paymentHistoryObject.title = 'Premium autopay';
      }
      break;
    case 'Activation':
      paymentHistoryObject.title = 'Policy activation';
      break;
    case 'Anniversary':
      paymentHistoryObject.title = 'Policy anniversary';
      break;
    case TransactionType.INTEREST_CREDIT:
      paymentHistoryObject.amount = { appliedAmount };
      paymentHistoryObject.title = 'Interest Credit';
      break;
    default:
      paymentHistoryObject.title = transactionType ?? DEFAULT_ERROR_STRING;
      break;
  }

  return paymentHistoryObject;
};

export const transformRiders = (policy: Policy): RidersAndBenefits => {
  const { riders, product } = policy;
  const lapsedProtection = transformPolicyFeature(
    policy,
    FeatureType.LAPSEPROTECTION
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
      coverageId: rider.coverageId,
      cost: rider.terminalRiderPaymentAmount,
      description: getRiderDescription(rider.riderCode || ''),
      effectiveDate: rider.effectiveDate,
      isElected: rider.riderElected?.toLowerCase() === 'elected',
      isOwner:
        ownerInfo?.partyId === riderInsured?.insuredId ||
        // We are assuming that the insured is owner for annuities because
        // annuities are not returning a partyRole with partyRole === INSURED,
        // which is what we are looking for on life products (decision documented in CUI-512)
        product?.lineOfBusiness === LineOfBusiness.ANNUITY,
      title: rider.riderName,
      status: rider.status,
      insured: {
        firstName: insuredParty?.firstName,
        lastName: insuredParty?.lastName,
      },
      unbornChildIndicator: rider.unbornChildIndicator,
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
  feature: FeatureType
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

  // Free look is returned as a feature but the policy status will say active
  // so need to check specifically against the endDate of the free look
  // feature
  const freeLookFeature = transformPolicyFeature(policy, FeatureType.FREELOOK);
  const freeLookActive = dayjs().isBefore(dayjs(freeLookFeature?.endDate));

  if (policyStatus === PolicyStatus.PENDINGLAPSE) {
    const featureDetails = transformPolicyFeature(
      policy,
      FeatureType.LAPSEASSESSMENT
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
      FeatureType.LAPSEASSESSMENT
    );

    const reinstantementDetails = transformPolicyFeature(
      policy,
      FeatureType.REINSTATEMENT
    );

    return {
      policyStatus,
      lapsedOn: lapseAssessmentDetails?.endDate,
      reinstatmentDate: reinstantementDetails?.startDate,
      reinstatementPeriod: reinstantementDetails?.period,
    };
  }

  if (freeLookActive && policyStatus !== PolicyStatus.CANCELEDFREELOOK) {
    return {
      policyStatus: FeatureType.FREELOOK,
      endDate: freeLookFeature?.endDate,
      period: freeLookFeature?.period,
    };
  }

  return {
    policyStatus,
  };
};

export const transformPolicyDetails = (policy: Policy): PolicyWithAgent => {
  const primaryServicingAgentId = policy.partyRoles?.find(
    party => party.partyRole === PartyRole.PRIMARYSERVICINGAGENT
  )?.partyId;
  const primaryWritingAgentId = policy.partyRoles?.find(
    party => party.partyRole === PartyRole.PRIMARYWRITINGAGENT
  )?.partyId;

  // TODO: add comments about how this logic works
  const primaryAgentId = primaryServicingAgentId || primaryWritingAgentId;

  return {
    policyStatus: policy?.policyStatus || PolicyStatus.NOTISSUED,
    product: {
      productType: policy.product?.productType,
      planName: policy.product?.planName,
      planCode: policy.product?.planCode,
      marketingName: policy?.product?.marketingName || '',
    },
    carrierId: policy.carrierId,
    accountValues: {
      loanedPortionOfAccountValue:
        policy.accountValues?.loanedPortionOfAccountValue,
    },
    primaryAgentExternalId: primaryAgentId
      ? policy.parties?.find(p => p.partyId === primaryAgentId)?.agentExternalId
      : null,
  };
};

export const sortPoliciesByIssuedDate = (policies: CarrierPolicyDetails[]) => {
  return policies.sort((a, b) => {
    return dayjs(a.policyStartDate).isBefore(dayjs(b.policyStartDate)) ? 1 : -1;
  });
};

/**
 *
 * Generates a list of the partyRoles that apply to a particular partyId on a policy.
 * Note this partyId is a totally separate thing from the accessToken partyId.
 * TODO: At some point, CIAM is updating this to match the accessToken partyId
 * This one is particular to a policy party
 */
export const getPartyRolesFromPolicyPartyId = (
  policyPartyId: string | undefined,
  policy: Policy
) => {
  // Find all partyRoles entries matching the partyId
  const matchingPartyRoles =
    policy.partyRoles?.filter(p => p.partyId === policyPartyId) || [];

  // generate a list of the partyRoles that applies to the user
  return matchingPartyRoles
    .filter(p => p.partyRole !== undefined)
    .map(p => p.partyRole!);
};

export const transformPolicyParties = (
  policy: Policy
): LimitedPolicyParty[] | undefined => {
  return policy.parties
    ?.map(party => {
      if (!party) {
        return null;
      }

      return {
        partyId: party.partyId,
        firstName: party.firstName,
        lastName: party.lastName,
        fullName: party.fullName,
        addresses: party.addresses,
        emails: party.emails,
        phones: party.phones,
        partyRoles: getPartyRolesFromPolicyPartyId(party.partyId, policy),
        partyType: party.partyType,
        allocationPercentage: party.beneficiaryPercentage,
      };
    })
    .filter(p => p !== null);
};
