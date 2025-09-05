import { groupBy, sortBy } from 'lodash';

import {
    GetHierarchyResponse,
    MAIN_AGENCY_ROLE,
    Upline,
} from '@deps/types/producers';

export interface AgencyOption {
    value: string;
    agentSellingCode?: string;
    textValue: string;
}

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

export const getAgenciesFromHierarchy = (
    authUserHierarchies: GetHierarchyResponse[],
    clientCaseAgentHierarchies: GetHierarchyResponse[]
) => {
    const uplineBySellingCode = clientCaseAgentHierarchies.reduce(
        (acc, clientCaseAgentHerarchy) => {
            const flattedHierarchyUpline = authUserHierarchies
                .map((hierarchy) => [
                    ...hierarchy.upline,
                    ...clientCaseAgentHerarchy.upline,
                ])
                .map(getUniqueDuplicates)
                .flat();

            return {
                ...acc,
                ...(!!flattedHierarchyUpline.length && {
                    [clientCaseAgentHerarchy.sellingCode]:
                        flattedHierarchyUpline,
                }),
            };
        },
        {} as Record<string, Upline[]>
    );

    const hasAgencies = Object.keys(uplineBySellingCode).length;

    const agentUplinesWithSellingCode = (
        hasAgencies
            ? Object.entries(uplineBySellingCode)
            : authUserHierarchies.map(
                  (response) =>
                      [response.sellingCode, response.upline] as [
                          string,
                          Upline[]
                      ]
              )
    ).map(([agentSellingCode, uplines]) => ({ agentSellingCode, uplines }));

    const mainAgenciesWithSellingCode = agentUplinesWithSellingCode
        .map(({ agentSellingCode, uplines }) => ({
            agentSellingCode,
            agencies: uplines.filter(
                (upline) => upline?.role === MAIN_AGENCY_ROLE
            ),
        }))
        .filter(({ agencies }) => agencies.length);

    mainAgenciesWithSellingCode
        .map(({ agentSellingCode, agencies }) => {
            const sortedAgencies = sortBy(agencies, 'level');
            const groupedAgencies = groupBy(sortedAgencies, 'level');

            const NEAREST_HIERARCHY_LEVEL = 0;
            const nearestHierarchyAgencyGroupKey =
                Object.keys(groupedAgencies)[NEAREST_HIERARCHY_LEVEL];

            return {
                agentSellingCode,
                agencies: groupedAgencies[nearestHierarchyAgencyGroupKey] ?? [],
            };
        })
        .filter(({ agencies }) => agencies.length);

    return mainAgenciesWithSellingCode.flatMap(
        ({ agentSellingCode, agencies }) =>
            agencies.map((agency) => ({ agentSellingCode, agency }))
    );
};
