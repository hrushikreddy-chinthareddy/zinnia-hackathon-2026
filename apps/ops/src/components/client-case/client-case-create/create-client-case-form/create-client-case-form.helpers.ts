import { groupBy, sortBy } from 'lodash';

import {
    GetHierarchyResponse,
    MAIN_AGENCY_ROLE,
    Upline,
} from '@deps/types/producers';

export interface AgencyOption {
    value: string;
    textValue: string;
}

const formatAgenciesForSelect = (agenciesUpline: Upline[]): AgencyOption[] => {
    return agenciesUpline.map((agency) => {
        return {
            value: agency.sellingCode,
            textValue: agency.fullName
                ? agency.fullName
                : `${agency.firstName} ${agency.lastName}`,
        };
    });
};

function getUniqueDuplicates(uplines: Upline[]) {
    const duplicateUplinesCount = uplines.reduce<Record<string, number>>(
        (acc, item) => {
            acc[item.sellingCode] = (acc[item.sellingCode] || 0) + 1;
            return acc;
        },
        {}
    );

    const duplicateUplines = uplines.filter(
        (item) => duplicateUplinesCount[item.sellingCode] > 1
    );

    const seen = new Set();
    return duplicateUplines.filter((item) => {
        if (seen.has(item.sellingCode)) {
            return false;
        }
        seen.add(item.sellingCode);
        return true;
    });
}

export const getAgentAgenciesForSelectOptions = (
    hieararchyResponses: GetHierarchyResponse[]
) => {
    const needMatchAgencies = hieararchyResponses.length > 1;
    const hierarchiesUpline = hieararchyResponses.map(
        (response) => response?.upline
    );
    const flattedHierarchyUpline = hierarchiesUpline.flatMap(
        (upline) => upline
    );

    let agentUplines: Upline[] = [];

    if (needMatchAgencies) {
        agentUplines = getUniqueDuplicates(flattedHierarchyUpline);
    } else {
        agentUplines = flattedHierarchyUpline;
    }

    const mainAgencies = agentUplines.filter(
        (upline) => upline?.role === MAIN_AGENCY_ROLE
    );
    const sortedAgencies = sortBy(mainAgencies, 'level');
    const groupAgencies = groupBy(sortedAgencies, 'level');
    const NEAREST_HIEARCHY_LEVEl = 0;
    const nearestHierarchyAgencyGroupKey =
        Object.keys(groupAgencies)[NEAREST_HIEARCHY_LEVEl];
    const formattedAgencies = formatAgenciesForSelect(
        groupAgencies[nearestHierarchyAgencyGroupKey] ?? []
    );

    return formattedAgencies;
};
