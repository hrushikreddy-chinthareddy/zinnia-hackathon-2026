import { PolicyReferenceDataModel } from '@zinnia/api-types/types/search';
import { Policy, PolicyStatus } from '@zinnia/api-types/types/sor';
import { policyOwner } from '@zinnia/utils';

import { BankDetail } from '@/components/person-data/types';
import {
  PolicyAccountValue,
  PolicyCoverage,
  PolicyDetails,
  PolicyProfile,
  PolicyReferenceData,
  UpcomingPremium,
} from '@/types/policy';

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
    nextActivityDate: policy.systematicPrograms?.[0]?.startDate || '',
    planName: policy.product?.planName || '',
    policyStatus: policy.policyStatus || PolicyStatus.NOTISSUED,
  };
};

export const transformPolicyForCoverage = (policy: Policy): PolicyCoverage => {
  return {
    beneficiaryCount: policy.parties && policy.parties?.length - 1,
    maturityDate: policy.policyDates?.maturityDate,
    policyStartDate: policy.policyDates?.policyStartDate,
    totalCoverageAmount: policy.coverage?.totalCoverageAmount,
    riderCount: policy.riders?.length || 0,
  };
};
