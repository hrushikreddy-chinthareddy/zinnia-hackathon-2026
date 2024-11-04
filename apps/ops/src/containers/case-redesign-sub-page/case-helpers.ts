import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { convertToChipText } from '@deps/containers/people-sub-page/people-sub-page.helpers';
import { CaseActivityContextProps } from '@deps/contexts/CaseActivityContext';
import { calculateDaysAgo } from '@deps/helpers/case-management';
import { PolicyParty } from '@deps/helpers/policy-sor/Parties';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { formatPhone, toTitleCase } from '@deps/helpers/string.helper';
import { Case, StatCount, Statuses } from '@deps/models/case/case';
import { PartyInstance } from '@deps/models/case/party-instance';
import { IdentificationType, PartyRole } from '@deps/models/policy/sor-policy';
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
            acc[key] = { id: key, fullName: createdFullName, roles: [] };
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

export const getPartiesFromPolicy = (policyDetails: PolicyDetails, t: TFunction): PartiesProps => {
    const policyOwners = policyDetails.allOwners;
    const policyAgents = Array.from(
        new Set([
            ...policyDetails.getPartiesWithRole(PartyRole.AGENT),
            ...policyDetails.getPartiesWithRole(PartyRole.PRIMARYSERVICINGAGENT),
            ...policyDetails.getPartiesWithRole(PartyRole.PRIMARYWRITINGAGENT),
            ...policyDetails.getPartiesWithRole('ADDITIONALSERVICINGAGENT' as PartyRole),
            ...policyDetails.getPartiesWithRole('ADDITIONALWRITINGAGENT' as PartyRole),
        ])
    );

    const getPartyRoles = (party: PolicyParty) => {
        return party.partyRoles.map(role => convertToChipText(role.partyRole, t));
    };

    const owners = policyOwners
        .map((owner, index): PartyInfo | undefined => {
            if (!owner) {
                return;
            }
            const address = owner.bestAvailableAddress;
            const dob = owner.formattedBirthDate;
            const email = owner.bestAvailableEmail;
            const fullName = owner.fullName;
            const phone = owner.bestAvailablePhone;
            const fields = {
                address: { label: t('colDefs:owner.mailingAddress'), value: address },
                dob: { label: t('colDefs:owner.birthDate'), value: dob ?? DEFAULT_ERROR_STRING },
                email: { label: t('colDefs:owner.email'), value: email?.emailAddress ?? DEFAULT_ERROR_STRING },
                phone: {
                    label: phone?.phoneType
                        ? t(`people.card.phone.phoneOptions.${phone.phoneType.toLocaleLowerCase()}`)
                        : t('colDefs:owner.primaryPhone'),
                    value: phone ? formatPhone(phone) : DEFAULT_ERROR_STRING,
                },
                ssn: {
                    label: t('colDefs:owner.ssnAbbreviated'),
                    value:
                        owner?.identifications?.find(id => id.identificationType === IdentificationType.SSN)?.identificationValue ||
                        DEFAULT_ERROR_STRING,
                },
            };
            const roles = getPartyRoles(owner);

            return {
                id: owner.partyId ?? fullName ?? index,
                fields,
                fullName,
                roles,
            };
        })
        .filter(Boolean) as PartyInfo[];

    const agents = policyAgents
        .map((agent): PartyInfo | undefined => {
            if (!agent) {
                return;
            }
            const fullName = agent.fullName;
            const roles = getPartyRoles(agent);
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
        createdDate: daysAgoText,
        parties,
        policyNumber: caseDetails.policyNumber,
        processType: process,
        productName: caseDetails.productName,
        status: caseDetails.caseStatus,
        updatedDate: dayjs(caseDetails.updatedAt).format('MM/DD/YYYY'),
    };
};

export const formatCaseTotals = (
    count: number,
    stats: StatCount,
    showOnlyCompletedCases: boolean,
    showOnlyCanceledCases: boolean,
    hasSearch: boolean
) => {
    const keyedStats = stats.counts.reduce((acc, stat) => {
        acc[stat.label] = stat.value;
        return acc;
    }, {} as Record<string, number>);
    const inProgressCount = keyedStats[Statuses.InProgress] ?? 0;
    const exceptionCount = keyedStats[Statuses.Exception] ?? 0;
    const completedCount = keyedStats[Statuses.Completed] ?? 0;
    const canceledCount = keyedStats[Statuses.Canceled] ?? 0;

    // if there's a search, don't mess with the caseStats counts.
    if (hasSearch) {
        return {
            All: count,
            [Statuses.InProgress]: inProgressCount,
            [Statuses.Exception]: exceptionCount,
        };
    }
    // all is either only the completed count, the total count when there's a search term, or the total minus completed when no search term
    // const allCount = hasSearch ? count : count - completedCount;
    let allCount = 0;
    let progCt = 0;
    let excepCt = 0;
    if (showOnlyCompletedCases && showOnlyCanceledCases) {
        allCount = completedCount + canceledCount;
    } else if (showOnlyCompletedCases) {
        allCount = completedCount;
    } else if (showOnlyCanceledCases) {
        allCount = canceledCount;
    } else {
        progCt = inProgressCount;
        excepCt = exceptionCount;
        allCount = count - completedCount - canceledCount;
    }

    return {
        All: allCount,
        [Statuses.InProgress]: progCt,
        [Statuses.Exception]: excepCt,
    };
};
