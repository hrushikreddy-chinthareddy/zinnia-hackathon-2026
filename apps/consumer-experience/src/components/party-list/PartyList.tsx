import { PartyRole, PartyType } from '@zinnia/api-types/types/sor';
import { Button, Icon, IconType, SideSheet } from '@zinnia/bloom/components';
import { CSSProperties } from 'react';

import { PolicyParty } from '@/types/policy';
import { filterItemsWithPastEndDate } from '@/utils/data';
import { formatPartyRoles } from '@/utils/party';

import styles from './PartyList.module.css';
import { Addresses } from '../person-data/Addresses';
import { Emails } from '../person-data/Emails';
import { Phones } from '../person-data/Phones';
import { FullName } from '../pii/FullName';

export interface PartyListProps {
  parties: PolicyParty[];
}

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
        return <Party key={party.partyId} party={party} />;
      })}
    </div>
  );
};

export const Party = ({ party }: { party: PolicyParty }) => {
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
  const roles = formatPartyRoles(partyRoles);

  const filteredAddresses = filterItemsWithPastEndDate(addresses);
  const fileteredPhones = filterItemsWithPastEndDate(phones);
  const filteredEmails = filterItemsWithPastEndDate(emails);

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
    <div key={partyId}>
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
        <div
          style={
            {
              '--cols': 1,
            } as CSSProperties
          }
          className={styles.personDetails}
        >
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
