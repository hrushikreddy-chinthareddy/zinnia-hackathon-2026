import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { convertToChipText } from '@deps/containers/people-sub-page/people-sub-page.helpers';
import { CaseActivityContextProps } from '@deps/contexts/CaseActivityContext';
import { calculateDaysAgo } from '@deps/helpers/case-management';
import { toTitleCase } from '@deps/helpers/string.helper';
import { AgingTimeRangesKeysExtended, Case, StatCount, Statuses } from '@deps/models/case/case';
import { PartyInstance } from '@deps/models/case/party-instance';

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

export const getPartiesFromCase = (caseDetails: Case, t: TFunction): PartiesProps => {
    const brokerDealerName = caseDetails?.additionalData?.brokerDealerName;
    const parties = caseDetails?.parties;
    const partyRecord = parties.reduce((acc, { partyRole, firstName, lastName, fullName, ssn }) => {
        const key = createPartyKey({ firstName, lastName, fullName, ssn });
        if (!acc[key]) {
            const createdFullName = toTitleCase(fullName ?? `${firstName ?? ''} ${lastName ?? ''}`);
            acc[key] = { id: key, fullName: createdFullName, roles: [], fields: {}};
            if (ssn) {
                acc[key].fields.ssn = {
                    label: t('colDefs:owner.ssnAbbreviated'),
                    value: ssn,
                };
            }
            if (brokerDealerName && partyRole?.toLowerCase().includes('agent')) {
                const titleCaseBrokerDealer = brokerDealerName.toLowerCase()
                    .split(' ')
                    .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
                    .join(' ');
                acc[key].fields.brokerDealer = {
                    label: "",
                    value: titleCaseBrokerDealer,
                };
            }
        }
        // if there's two of the same person, just add the roles to the first found
        if (partyRole?.toLowerCase().includes('owner')){
            acc[key].roles.unshift(convertToChipText(partyRole, t));
        } else {
            acc[key].roles.push(convertToChipText(partyRole, t));
        }

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

export const getSideNavData = (
    caseDetails: Case,
    caseActivityContext: CaseActivityContextProps,
    t: TFunction
): CaseSideNavProps['data'] => {
    const daysAgo = calculateDaysAgo(new Date(caseDetails.createdAt));
    const daysAgoText = t('temporal.daysAgo', { count: daysAgo });
    const process = caseDetails?.process;

    return {
        carrier: caseDetails.carrier,
        createdDate: daysAgoText,
        parties: getPartiesFromCase(caseDetails, t),
        policyNumber: caseDetails.policyNumber,
        processType: process,
        productName: caseDetails.productName,
        status: caseDetails.caseStatus,
        updatedDate: dayjs(caseDetails.updatedAt).format('MM/DD/YYYY'),
    };
};

export const formatCaseTotals = (count: number, stats: StatCount, hasSearch: boolean) => {
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
    const progCt = inProgressCount;
    const excepCt = exceptionCount;
    const allCount = count - completedCount - canceledCount;

    return {
        All: allCount,
        [Statuses.InProgress]: progCt,
        [Statuses.Exception]: excepCt,
    };
};

export const dateToString = (dateObject: Date) => {
    const date = dateObject.getDate();
    const month = dateObject.getMonth() + 1;
    const year = dateObject.getFullYear();
    const dateParts = [month.toString().padStart(2, '0'), date.toString().padStart(2, '0'), year.toString()];
    return dateParts.join('');
};

export const getDateWithDaysOffset = (daysOffset: number): Date => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() - daysOffset);
    return newDate;
};

export const formatDateToApi = (date: string, isStartDate: boolean) => {
    const dateParts = [date.slice(0, 2), date.slice(2, 4), date.slice(4, 8)];
    const dateInLocalTimezone = dayjs(`${dateParts[2]}-${dateParts[0]}-${dateParts[1]}`);
    return isStartDate ? dateInLocalTimezone.startOf('day').format() : dateInLocalTimezone.endOf('day').format();
};

export const getStartAndEndDates = (timeframe: AgingTimeRangesKeysExtended) => {
    switch (timeframe) {
        case 'ZeroToSeven':
            return {
                createdDateStart: formatDateToApi(dateToString(getDateWithDaysOffset(6)), true),
                createdDateEnd: formatDateToApi(dateToString(getDateWithDaysOffset(0)), false),
            };
        case 'EightToFourteen':
            return {
                createdDateStart: formatDateToApi(dateToString(getDateWithDaysOffset(13)), true),
                createdDateEnd: formatDateToApi(dateToString(getDateWithDaysOffset(7)), false),
            };
        case 'FifteenToThirty':
            return {
                createdDateStart: formatDateToApi(dateToString(getDateWithDaysOffset(29)), true),
                createdDateEnd: formatDateToApi(dateToString(getDateWithDaysOffset(14)), false),
            };
        case 'ThirtyOneToFortyFive':
            return {
                createdDateStart: formatDateToApi(dateToString(getDateWithDaysOffset(44)), true),
                createdDateEnd: formatDateToApi(dateToString(getDateWithDaysOffset(30)), false),
            };
        case 'FortySixToFiftyNine':
            return {
                createdDateStart: formatDateToApi(dateToString(getDateWithDaysOffset(58)), true),
                createdDateEnd: formatDateToApi(dateToString(getDateWithDaysOffset(45)), false),
            };
        case 'SixtyPlus':
            return {
                createdDateStart: formatDateToApi(dateToString(new Date(new Date().getFullYear(), 0, 1)), true),
                createdDateEnd: formatDateToApi(dateToString(getDateWithDaysOffset(59)), false),
            };
        case 'All':
        default:
            return {
                createdDateStart: formatDateToApi(dateToString(new Date(new Date().getFullYear())), true),
                createdDateEnd: formatDateToApi(dateToString(new Date()), false),
            };
    }
};
