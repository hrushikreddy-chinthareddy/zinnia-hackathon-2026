import { PartyRole } from '@zinnia/api-types/types/sor';

export const isPartyOwner = (partyRoles: PartyRole[]) => {
  return partyRoles.includes(PartyRole.OWNER);
};

export const isPartyPayor = (partyRoles: PartyRole[]) => {
  return partyRoles.includes(PartyRole.PAYOR);
};

export const isPayorOnly = (partyRoles: PartyRole[]) => {
  return isPartyPayor(partyRoles) && !isPartyOwner(partyRoles);
};
