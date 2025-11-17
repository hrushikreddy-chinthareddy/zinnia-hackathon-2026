import {
    getDownlineBySellingCode,
    getHierarchyBySellingCode,
    getProducerById,
    getProducersByNameAndCarrier,
} from '@deps/queries/api/v1/producers';
import { ApiGetProducerResponse } from '@deps/types/pom/get.types';
import {
    GetDownlineResponse,
    GetHierarchyResponse,
    ProducersResponse,
} from '@deps/types/producers';

export const getUserHierarchyBySellingCode = async (
    sellingCode: string,
    { carrierShortName }: { carrierShortName: string }
): Promise<GetHierarchyResponse | null> => {
    const { data } = await getHierarchyBySellingCode(sellingCode, {
        carrierShortName,
    });
    return data;
};

export const getUserDownlineBySellingCode = async (
    sellingCode: string,
    {
        carrierShortName,
        partialFullName = '',
    }: {
        carrierShortName: string;
        partialFullName?: string;
    }
): Promise<GetDownlineResponse[][] | null> => {
    const { data } = await getDownlineBySellingCode(sellingCode, {
        partialFullName,
        carrierShortName,
    });
    return data;
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
    id: string,
    carrierShortName: string
): Promise<ApiGetProducerResponse | null> => {
    const response = await getProducerById(id, carrierShortName);
    if (response.error?.status) {
        throw response.error;
    }
    return response.data;
};
