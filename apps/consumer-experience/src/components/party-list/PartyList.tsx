'use-client';
import { PartyRole, PartyType } from '@zinnia/api-types/types/sor';
import { Button, Icon, IconType, SideSheet } from '@zinnia/bloom/components';
import React from 'react';

import { PolicyParty } from '@/types/policy';
import { filterItemsWithPastEndDate } from '@/utils/data';
import { toTitleCase } from '@/utils/strings';

import styles from './PartyList.module.css';
import { Addresses } from '../person-data/Addresses';
import { Emails } from '../person-data/Emails';
import { Phones } from '../person-data/Phones';
import { FullName } from '../pii/FullName';

export interface PartyListProps {
  parties: PolicyParty[];
}

const partyRoleDisplayText: { [key in PartyRole]?: string } = {
  [PartyRole.CONTINGENTBENEFICIARY]: 'Contingent Beneficiary',
  [PartyRole.PRIMARYBENEFICIARY]: 'Primary Beneficiary',
  [PartyRole.PRIMARYWRITINGAGENT]: 'Primary Writing agent',
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

/**
 * Sorts parties by the following order:
 * 0 -> parties with Owner role
 * 1 -> parties with Joint-owner role (and not Owner)
 * 2 -> the rest
 *
 * @param parties - The list of parties to be sorted
 * @returns The sorted list of parties
 */
const sortPartiesByRoles = (parties: PolicyParty[]) => {
  const getSortOrder = (party: PolicyParty) => {
    // Owner parties are first,
    if (party.partyRoles?.includes(PartyRole.OWNER)) return 0;
    // Joint-owner parties are second
    if (party.partyRoles?.includes(PartyRole.JOINTOWNER)) return 1;
    return 2;
  };

  // Sort parties according to that ranking
  return parties.sort((a, b) => getSortOrder(a) - getSortOrder(b));
};

export const PartyList = ({ parties }: PartyListProps) => {
  const key = React.useId();

  if (parties.length === 0) {
    return null;
  }

  const agentRoles = [
    PartyRole.PRIMARYWRITINGAGENT,
    PartyRole.ADDITIONALWRITINGGAGENT,
    PartyRole.PRIMARYSERVICINGAGENT,
    PartyRole.ADDITIONALSERVICINGAGENT,
  ];

  // Filter out agents
  const nonAgentParties = parties.filter(
    party => !party.partyRoles?.some(role => agentRoles.includes(role))
  );

  const sortedParties = sortPartiesByRoles(nonAgentParties);

  return (
    <div className={styles.container}>
      {sortedParties.map(party => {
        return <Party key={key} party={party} />;
      })}
    </div>
  );
};

export const Party = ({
  key,
  party,
}: {
  key?: string | null;
  party: PolicyParty;
}) => {
  const {
    partyId,
    partyRoles,
    firstName,
    lastName,
    fullName,
    addresses,
    phones,
    emails,
    partyType,
    allocationPercentage,
  } = party;

  // Format roles as a comma-separated string
  // Ex: "Owner, Payor, and Primary Beneficiary"
  const roles = partyRoles
    ?.map(role => toTitleCase(partyRoleDisplayText[role]))
    .join(', ')
    .replace(/, ([^,]*)$/, ', and $1'); // replace the last comma with 'and'

  const filteredAddresses = filterItemsWithPastEndDate(addresses);
  const fileteredPhones = filterItemsWithPastEndDate(phones);
  const filteredEmails = filterItemsWithPastEndDate(emails);
  const id = React.useId();

  const name =
    partyType === PartyType.INDIVIDUAL ? { firstName, lastName } : { fullName };

  // Only display the icon if partyRoles include either OWNER or JOINTOWNER
  const shouldDisplayIcon =
    partyRoles?.includes(PartyRole.OWNER) ||
    partyRoles?.includes(PartyRole.JOINTOWNER);

  const showAllocation =
    allocationPercentage &&
    (partyRoles?.includes(PartyRole.PRIMARYBENEFICIARY) ||
      partyRoles?.includes(PartyRole.CONTINGENTBENEFICIARY));

  return (
    <div key={key ?? id}>
      <SideSheet
        header="Person Details"
        trigger={
          <div className={styles.trigger}>
            <Button mode="link" size="small">
              <FullName {...name} />
            </Button>
            {shouldDisplayIcon && (
              <Icon type={IconType.USERS} small className={styles.icon} />
            )}
          </div>
        }
      >
        <div className={styles.personDetails}>
          <div className={styles.name}>
            <h2 className="mb-lg">Name</h2>
            <div>
              <FullName {...name} />
            </div>
            <span className={`${styles.role} typography-content-body-sm`}>
              {roles}
            </span>
          </div>
          {showAllocation && (
            <div>
              <h2 className="mb-lg">Allocation</h2>
              <p>{`${allocationPercentage}%`}</p>
            </div>
          )}
          {filteredAddresses.length > 0 && (
            <div>
              <h2 className="mb-lg">Address</h2>
              <Addresses
                addresses={filteredAddresses}
                partyId={partyId ?? ''}
                allowAddressChanges={false}
              />
            </div>
          )}
          {fileteredPhones.length > 0 && (
            <div>
              <Phones phones={fileteredPhones} title="Phone" />
            </div>
          )}
          {filteredEmails.length > 0 && (
            <div>
              <Emails emails={filteredEmails} title="Email" />
            </div>
          )}
        </div>
      </SideSheet>
      <span className={`${styles.role} typography-content-body-sm`}>
        {roles}
      </span>
    </div>
  );
};
