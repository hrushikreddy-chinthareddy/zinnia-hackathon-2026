import { PartyRole } from '@zinnia/api-types/types/sor';

import { PolicyParty } from '@/types/policy';

import { logTrace } from './logging/log-fns';
import { toTitleCase } from './strings';

const partyRoleDisplayText: { [key in PartyRole]?: string } = {
  [PartyRole.CONTINGENTBENEFICIARY]: 'Contingent Beneficiary',
  [PartyRole.PRIMARYBENEFICIARY]: 'Primary Beneficiary',
  [PartyRole.PRIMARYWRITINGAGENT]: 'Agent of Record',
  [PartyRole.PRIMARYSERVICINGAGENT]: 'Primary Servicing agent',
  [PartyRole.ADDITIONALWRITINGGAGENT]: 'Additional Writing agent',
  [PartyRole.ADDITIONALSERVICINGAGENT]: 'Additional Servicing agent',
  [PartyRole.OWNER]: 'Owner',
  [PartyRole.PAYEE]: 'Payee',
  [PartyRole.PAYOR]: 'Payor',
  [PartyRole.INSURED]: 'Insured',
  [PartyRole.ANNUITANT]: 'Annuitant',
  [PartyRole.JOINTOWNER]: 'Joint-owner',
  [PartyRole.JOINTANNUITANT]: 'Joint Annuitant',
  [PartyRole.COVERAGEINSURED]: 'Coverage Insured',
  [PartyRole.THIRDPARTYDESIGNEE]: 'Third Party Designee',
  [PartyRole.ASSIGNEE]: 'Assignee',
  [PartyRole.EXCHANGECOMPANY]: 'Exchange Company',
  [PartyRole.AGENT]: 'Agent',
};

export const isPartyOwner = (partyRoles: PartyRole[]) => {
  return partyRoles.includes(PartyRole.OWNER);
};

export const isPartyPayor = (partyRoles: PartyRole[]) => {
  return partyRoles.includes(PartyRole.PAYOR);
};

export const isPayorOnly = (partyRoles: PartyRole[]) => {
  return isPartyPayor(partyRoles) && !isPartyOwner(partyRoles);
};

export const partyRolesAreInAllowedList = (partyRoles: PartyRole[]) => {
  const acceptedRoles = [
    PartyRole.OWNER,
    PartyRole.JOINTOWNER,
    PartyRole.ANNUITANT,
    PartyRole.JOINTANNUITANT,
    PartyRole.PAYOR,
    PartyRole.TRUSTEE,
    PartyRole.INSURED,
    'JOINTINSURED',
    PartyRole.ASSIGNEE,
    PartyRole.THIRDPARTYDESIGNEE,
    PartyRole.AUTHORIZEDSIGNATORY,
  ];

  const filteredPartyRoles = partyRoles.filter(element =>
    acceptedRoles.includes(element)
  );

  if (filteredPartyRoles.length === 0) {
    logTrace('Party roles were not found in allowed list', {
      filteredPartyRoles,
      partyRoles,
      acceptedRoles,
    });
  }

  return filteredPartyRoles.length > 0;
};

export const formatPartyRoles = (partyRoles: PartyRole[] | undefined) => {
  return partyRoles
    ?.map(role => toTitleCase(partyRoleDisplayText[role]))
    .join(', ')
    .replace(/, ([^,]*)$/, ', and $1'); // replace the last comma with 'and'
};

export const filterPayorViewParties = (parties: PolicyParty[]) => {
  return parties?.filter(party =>
    [PartyRole.PAYOR, PartyRole.OWNER, PartyRole.JOINTOWNER].some(role =>
      party.partyRoles?.includes(role)
    )
  );
};
