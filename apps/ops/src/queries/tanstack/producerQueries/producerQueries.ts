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
    partialFullName: string
): Promise<GetDownlineResponse[][] | null> => {
    const { data } = await getDownlineBySellingCode(
        sellingCode,
        partialFullName
    );
    return data;
};

export const getUserHierarchyListBySellingCode = async (
    agentSellingCodes: string[]
) => {
    const filteredAgentSellingCodes = agentSellingCodes.filter(
        (sellingCode) => !!sellingCode
    );
    const hierarchyPromises = filteredAgentSellingCodes.map((sellingCode) =>
        getUserHierarchyBySellingCode(sellingCode)
    );
    const hieararchyResponses = (await Promise.all(hierarchyPromises)).filter(
        (hierarchy) => !!hierarchy
    );

    return hieararchyResponses;
};
