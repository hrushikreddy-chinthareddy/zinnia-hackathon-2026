import { PolicyReferenceDataModel } from '@zinnia/api-types/types/search';
import { PartyRole, Policy, PolicyStatus } from '@zinnia/api-types/types/sor';
import { policyOwner } from '@zinnia/utils';

import { BankDetail } from '@/components/person-data/types';
import {
  Beneficiary,
  BeneficiaryData,
  PolicyAccountValue,
  PolicyCoverage,
  PolicyDetails,
  PolicyProfile,
  PolicyReferenceData,
  UpcomingPremium,
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
    nextActivityDate: policy.systematicPrograms?.[0]?.startDate || '',
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
  const ownerInfo = policyOwner(policy);
  // TODO: this needs to be updated to use the correct data, how do we know which bankData to show here?
  return (
    {
      ...ownerInfo?.bankDetails?.[0],
      accountNumber: bankAccountNumberSanitizer(
        ownerInfo?.bankDetails?.[0]?.accountNumber
      ),
      autopayEnabled: true,
    } || {}
  );
};
