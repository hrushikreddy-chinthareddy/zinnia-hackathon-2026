import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { sortAddressesByType } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import { sortEmailsByType } from '@deps/containers/people-data-cards/email-card/email-card.helpers';
import { convertToChipText } from '@deps/containers/people-sub-page/people-sub-page.helpers';
import { CaseActivityContextProps } from '@deps/contexts/CaseActivityContext';
import { calculateDaysAgo } from '@deps/helpers/case-management';
import { isEndDated } from '@deps/helpers/date.helper';
import { getPartyFullName } from '@deps/helpers/party-info-helper';
import { bestAvailableContactNumber } from '@deps/helpers/phone.helper';
import { formatDate, formatPhone, toTitleCase } from '@deps/helpers/string.helper';
import { Case } from '@deps/models/case/case';
import { PartyInstance } from '@deps/models/case/party-instance';
import { IdentificationType, PartyRole, Policy } from '@deps/models/policy/sor-policy';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import { CaseSideNavProps } from './CaseSideNav';
import { PartiesProps, PartyInfo } from './CaseSideNavParties';

// Generate a sorted array from a set of parties.
const agentsAndBrokersSorter = (agentsOrBrokersSet: Set<PartyInfo>): PartyInfo[] => {
    return Array.from(agentsOrBrokersSet).sort((a, b) => a.fullName.localeCompare(b.fullName));
};

// Case Parties do not have an id.  Use distinguishing values to create a party key
const createPartyKey = ({ firstName, lastName, fullName, ssn }: Partial<PartyInstance>): string => {
    return `${firstName}-${lastName}-${fullName}-${ssn?.slice(-4)}`;
};

export const getPartiesFromCase = ({ parties = [] }: Case, t: TFunction): PartiesProps => {
    const partyRecord = parties.reduce((acc, { partyRole, firstName, lastName, fullName, ssn }) => {
        const key = createPartyKey({ firstName, lastName, fullName, ssn });
        if (!acc[key]) {
            const createdFullName = toTitleCase(fullName ?? `${firstName ?? ''} ${lastName ?? ''}`);
            acc[key] = { id: key, fullName: createdFullName, roles: [], ssn: ssn };
        }
        acc[key].roles.push(convertToChipText(partyRole, t));
        return acc;
    }, {} as Record<string, PartyInfo>);
    const ownerParties: Set<PartyInfo> = new Set();
    const agentParties: Set<PartyInfo> = new Set();
    const brokerParties: Set<PartyInfo> = new Set();

    parties.forEach(party => {
        const partyRole = party?.partyRole?.toLowerCase();
        if (partyRole?.includes('owner')) {
            ownerParties.add(partyRecord[createPartyKey(party)]);
        } else if (partyRole?.includes('agent')) {
            agentParties.add(partyRecord[createPartyKey(party)]);
        } else if (partyRole?.includes('broker')) {
            brokerParties.add(partyRecord[createPartyKey(party)]);
        }
    });

    // sort owners, putting primary owners in front of owners in front of joint owners
    const owners = Array.from(ownerParties).sort((a, b) => {
        let isAJoint = false;
        let isBJoint = false;
        let isAPrimary = false;
        let isBPrimary = false;
        a.roles.forEach(role => {
            const lowerRole = role.toLowerCase();
            if (lowerRole.includes('owner')) {
                if (lowerRole.includes('joint')) {
                    isAJoint = true;
                }
                if (lowerRole.includes('primary')) {
                    isAPrimary = true;
                }
            }
        });
        b.roles.forEach(role => {
            const lowerRole = role.toLowerCase();
            if (lowerRole.includes('owner')) {
                if (lowerRole.includes('joint')) {
                    isBJoint = true;
                }
                if (lowerRole.includes('primary')) {
                    isBPrimary = true;
                }
            }
        });
        if (isAJoint && !isBJoint) {
            return 1;
        }
        if (isBJoint && !isAJoint) {
            return -1;
        }
        if (isAPrimary && !isBPrimary) {
            return -1;
        }
        if (isBPrimary && !isAPrimary) {
            return 1;
        }
        return a.fullName.localeCompare(b.fullName);
    });

    const agents = agentsAndBrokersSorter(agentParties);
    const brokers = agentsAndBrokersSorter(brokerParties);
    return { owners, agents, brokers: brokers.length ? brokers : undefined };
};

export const getPartiesFromPolicy = ({ parties = [], partyRoles = [] }: Policy, t: TFunction): PartiesProps => {
    const agentIds = new Set<string>();
    const ownerIds = new Set<string>();
    const jointOwnerIds = new Set<string>();
    const orderedRoles: string[] = t('colDefs:people.orderedRoles', { returnObjects: true });
    const orderedRolesMap = orderedRoles.reduce((acc, role, index) => {
        acc[role] = index;
        return acc;
    }, {} as Record<string, number>);
    partyRoles.forEach(role => {
        if (isEndDated(role.endDate) || !role.partyId) {
            return;
        }
        switch (role.partyRole) {
            case PartyRole.AGENT:
            case PartyRole.PRIMARYWRITINGAGENT:
            case PartyRole.PRIMARYSERVICINGAGENT:
                agentIds.add(role.partyId);
                break;
            case PartyRole.OWNER:
                ownerIds.add(role.partyId);
                break;
            case PartyRole.JOINTOWNER:
                jointOwnerIds.add(role.partyId);
                break;
            default:
                break;
        }
    });

    const rolesSorter = (a: string, b: string): number => {
        const aIndex = orderedRolesMap[a] ?? -1;
        const bIndex = orderedRolesMap[b] ?? -1;
        if (aIndex === -1 && bIndex === -1) {
            return 0;
        }
        if (aIndex === -1) {
            return 1;
        }
        if (bIndex === -1) {
            return -1;
        }
        return aIndex - bIndex;
    };

    const getPartyRolesForPartyId = (partyId: string) =>
        partyRoles
            .filter(role => role.partyId === partyId && !isEndDated(role.endDate))
            .map(role => convertToChipText(role.partyRole, t))
            .sort(rolesSorter);

    const owners = [...Array.from(ownerIds), ...Array.from(jointOwnerIds)]
        .map((ownerId): PartyInfo | undefined => {
            const owner = parties.find(party => party.partyId === ownerId);
            if (!owner) {
                return;
            }
            const address = sortAddressesByType(owner)[0];
            const dob = formatDate(owner.dateOfBirth);
            const email = sortEmailsByType(owner)[0];
            const fullName = getPartyFullName(owner);
            const phone = bestAvailableContactNumber({ party: owner });
            const fields = {
                address: { label: t('colDefs:owner.mailingAddress'), value: address },
                dob: { label: t('colDefs:owner.birthDate'), value: dob ?? DEFAULT_ERROR_STRING },
                email: { label: t('colDefs:owner.email'), value: email?.emailAddress ?? DEFAULT_ERROR_STRING },
                phone: {
                    label: phone?.phoneType
                        ? t(`people.card.phone.phoneOptions.${phone.phoneType.toLocaleLowerCase()}`)
                        : t('colDefs:owner.primaryPhone'),
                    value: phone?.contactNumber ? formatPhone(phone.contactNumber) : DEFAULT_ERROR_STRING,
                },
            };
            const roles = getPartyRolesForPartyId(ownerId);
            const ssn = owner?.identifications?.find(id => id.identificationType === IdentificationType.SSN)?.identificationValue;

            return {
                id: owner.partyId ?? fullName,
                fields,
                fullName,
                roles,
                ssn,
            };
        })
        .filter(Boolean) as PartyInfo[];

    const agents = Array.from(agentIds)
        .map((agentId): PartyInfo | undefined => {
            const agent = parties.find(party => party.partyId === agentId);
            if (!agent) {
                return;
            }
            const fullName = getPartyFullName(agent);
            const roles = getPartyRolesForPartyId(agentId);
            return {
                id: agent.partyId ?? fullName,
                fullName,
                roles,
            };
        })
        .filter(Boolean) as PartyInfo[];

    return { owners, agents, brokers: [] };
};

export const getSideNavData = (
    caseDetails: Case,
    caseActivityContext: CaseActivityContextProps,
    t: TFunction
): CaseSideNavProps['data'] => {
    let parties;
    if (caseActivityContext.isNewBusinessCase) {
        parties = getPartiesFromCase(caseDetails, t);
    } else {
        if (caseActivityContext.policy) {
            parties = getPartiesFromPolicy(caseActivityContext.policy, t);
        }
    }

    const daysAgo = calculateDaysAgo(new Date(caseDetails.createdAt));
    const daysAgoText = t('temporal.daysAgo', { count: daysAgo });
    const process = caseDetails?.process;

    return {
        carrier: caseDetails.carrier,
        status: caseDetails.caseStatus,
        parties,
        policyNumber: caseDetails.policyNumber,
        productName: caseDetails.productName,
        processType: process,
        createdDate: daysAgoText,
        updatedDate: dayjs(caseDetails.updatedAt).format('MM/DD/YYYY'),
    };
};
