import { PartyReferenceDataModel } from '@zinnia/api-types/types/partyreference';
import { PartyRole } from '@zinnia/api-types/types/sor';

/**
 *
 * Takes in a policy number and returns the policy partyId associated with that policy number
 * Note this returned partyId is a totally separate thing from the accessToken partyId and is specific to a policy.
 * TODO: At some point, CIAM is updating this to match the accessToken partyId
 */
export const getPolicyPartyIdByPolicyNumber = (
  partyReferenceData: PartyReferenceDataModel,
  policyNumber: string
) => {
  const policy = partyReferenceData.alias.find(
    p => p.policyNumber === policyNumber
  );
  if (policy) {
    return policy.partyId;
  }
};

export const getPartyRolesByPolicyNumber = (
  partyReferenceData: PartyReferenceDataModel,
  policyNumber: string
) => {
  const policy = partyReferenceData.alias.find(
    p => p.policyNumber === policyNumber
  );
  if (policy) {
    return policy.partyRoles as PartyRole[]; //TODO: remove casting when CIAM updates API specs
  }
};
