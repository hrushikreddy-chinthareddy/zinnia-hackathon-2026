import { groupBy, sortBy } from 'lodash';

import {
    getNearestAgenciesFromUpline,
    isAgency,
} from '@deps/components/illustrations/helpers/hooks/pom';
import {
    GetHierarchyResponse,
    Upline,
    UplineItem,
} from '@deps/types/producers';

export interface AgencyOption {
    value: string;
    agentSellingCode: string;
    textValue: string;
}

function getUniqueDuplicates(upline: Upline) {
    const duplicateUplinesCount = upline.reduce<Record<string, number>>(
        (acc, item) => {
            acc[item.sellingCode] = (acc[item.sellingCode] || 0) + 1;
            return acc;
        },
        {}
    );

    const duplicateUplines = upline.filter(
        (item) => duplicateUplinesCount[item.sellingCode] > 1
    );

    const seen = new Set();
    return duplicateUplines.filter((item) => {
        if (seen.has(item.sellingCode)) {
            return false;
        }
        seen.add(item.sellingCode);
        return true;
    }) as Upline;
}

export const getNearestAgenciesFromHierarchies = (
    hierarchies: GetHierarchyResponse[]
) =>
    hierarchies
        .map((hierarchy) => {
            const { sellingCode, upline } = hierarchy;
            return {
                agentSellingCode: sellingCode,
                agencies: getNearestAgenciesFromUpline(upline),
            };
        })
        .filter(({ agencies }) => agencies.length);

export const getCommonAgenciesFromHierarchies = (
    authUserHierarchies: GetHierarchyResponse[],
    clientCaseAgentHierarchies: GetHierarchyResponse[]
) => {
    const commonAgencies = clientCaseAgentHierarchies.reduce(
        (acc, { sellingCode: agentSellingCode, upline }) => {
            const mixedUpline = authUserHierarchies
                .map(({ upline: authUserUpline }) =>
                    [...(authUserUpline ?? []), ...(upline ?? [])].filter(
                        isAgency
                    )
                )
                .map(getUniqueDuplicates)
                .flat();

            if (!mixedUpline.length) {
                return acc;
            }

            return {
                ...acc,
                [agentSellingCode]: mixedUpline,
            };
        },
        {} as Record<string, UplineItem[]>
    );

    const hasCommonAgencies = Object.keys(commonAgencies).length;

    if (!hasCommonAgencies) {
        return [];
    }

    return Object.entries(commonAgencies).flatMap(
        ([agentSellingCode, agencies]) =>
            getNearestAgenciesFromUpline(agencies).map((agency) => ({
                agentSellingCode,
                agency,
            }))
    );
};
