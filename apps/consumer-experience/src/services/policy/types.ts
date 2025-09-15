import { Party, PartyRole } from '@xd/api-types/dist/generated-types/sor';

export enum getLoggedInUserPolicyAndPartyDataErrors {
  NO_POLICY_FOUND = 'No policy found: getPolicyPartyIdByPolicyNumber',
  NO_PARTY_REFERENCE_DATA_FOUND = 'No party reference data found: getPartyReferenceData',
  NO_PARTY_ID_FOUND = 'No policy partyId found: getPolicyPartyIdByPolicyNumber',
}

export type LimitedPolicyParty = Pick<
  Party,
  | 'partyId'
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'partyType'
  | 'addresses'
  | 'emails'
  | 'phones'
> & { partyRoles: PartyRole[] };
