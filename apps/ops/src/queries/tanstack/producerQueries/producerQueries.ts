import { uniq } from 'lodash';

import {
    getDownlineBySellingCode,
    getHierarchyBySellingCode,
} from '@deps/queries/api/v1/producers';
import {
    GetDownlineResponse,
    GetHierarchyResponse,
} from '@deps/types/producers';

export const getUserHierarchyBySellingCode = async (
    sellingCode: string
): Promise<GetHierarchyResponse | null> => {
    const { data } = await getHierarchyBySellingCode(sellingCode);
    return data;
};

export const getUserDownlineBySellingCode = async (
    sellingCode: string,
    partialFullName = ''
): Promise<GetDownlineResponse[][] | null> => {
    const { data } = await getDownlineBySellingCode(
        sellingCode,
        partialFullName
    );
    return data;
};

export const getUsersDownlineList = async (
    sellingCodeArray: string[],
    agentName: string
) => {
    const filteredSellingCodes = sellingCodeArray.filter(
        (sellingCode) => !!sellingCode
    );
    const downlinePromises = filteredSellingCodes.map((sellingCode) =>
        getUserDownlineBySellingCode(sellingCode, agentName)
    );
    const hieararchyResponses = (await Promise.all(downlinePromises)).filter(
        (hierarchy) => !!hierarchy
    );

    return hieararchyResponses;
};

export const getUserHierarchyListBySellingCode = async (
    agentSellingCodes: string[]
) => {
    const filteredAgentSellingCodes = uniq(
        agentSellingCodes.filter((sellingCode) => !!sellingCode)
    );

    const hierarchyPromises = filteredAgentSellingCodes.map((sellingCode) =>
        getUserHierarchyBySellingCode(sellingCode)
    );
    const hieararchyResponses = (await Promise.all(hierarchyPromises)).filter(
        (hierarchy) => !!hierarchy
    );

    return hieararchyResponses;
};
