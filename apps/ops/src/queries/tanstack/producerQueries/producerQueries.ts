import { ApiGetProducerResponse } from '@xd/pom/src/types/get.types';
import { uniq } from 'lodash';

import {
    getDownlineBySellingCode,
    getHierarchyBySellingCode,
    getProducerById,
    getProducersByNameAndCarrier,
} from '@deps/queries/api/v1/producers';
import {
    GetDownlineResponse,
    GetHierarchyResponse,
    ProducersResponse,
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

export const getProducersByNameAndCarrierCodeQuery = async (
    partialFullName: string,
    carrierCode: string
): Promise<ProducersResponse> => {
    const response = await getProducersByNameAndCarrier(
        partialFullName,
        carrierCode
    );
    if (response.error?.status) {
        throw response.error;
    }
    return response.data;
};

export const getProducersByIdQuery = async (
    id: string
): Promise<ApiGetProducerResponse | null> => {
    const response = await getProducerById(id);
    if (response.error?.status) {
        throw response.error;
    }
    return response.data;
};
