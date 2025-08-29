import { CarrierPolicyDetails, PolicyParty } from '@/types/policy';

export const filterPoliciesByCarrierId = (
  policies: CarrierPolicyDetails[],
  carrierId: string[]
) => {
  return policies.filter(
    policy => policy?.carrierId && carrierId.includes(policy.carrierId)
  );
};

export const getPartyName = (party: PolicyParty) => {
  let str = '';
  if (party.fullName?.length) str = party.fullName;
  else if (party.firstName?.length && party.lastName?.length)
    str = `${party.firstName} ${party.lastName}`;
  return str;
};
