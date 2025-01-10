import { CarrierPolicyDetails } from '@/types/policy';

export const filterPoliciesByCarrierId = (
  policies: CarrierPolicyDetails[],
  carrierId: string[]
) => {
  return policies.filter(
    policy => policy?.carrierId && carrierId.includes(policy.carrierId)
  );
};
