import { AxiosResponse } from 'axios';

import { UserPermission } from '@deps/models/user-profile';
import { CheckTupleResponse, Tuple, GetCarrierListQuery } from '@deps/types/fga';
import { pullFromCache, writeToCache } from '@deps/utils/cache';
import { logWarn } from '@deps/utils/server-logging';

import { apiServerBaseUrl, baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';
import { serverApi } from '../api-utils/serverApiClient';

const checkTupleUrlSsr = `${apiServerBaseUrl}/fga/v1/check`;
const listCarrierUrlSsr = `${apiServerBaseUrl}/fga/v1/list-carriers`;
const baseUrl = baseAppUrl + '/api/fga/v1';

export const checkTupleSsr = async (accessToken: string, partyId: string, relation: string, tupleObject: string): Promise<boolean> => {
    if (!accessToken || !partyId) {
        return false;
    }

    try {
        const tuple = {
            user: `party:${partyId}`,
            relation,
            object: tupleObject,
        };

        const { data } = await serverApi.post<Tuple, AxiosResponse<CheckTupleResponse>>(checkTupleUrlSsr, tuple, {
            authorization: `Bearer ${accessToken}`,
        });

        return data?.allowed || false;
    } catch (error: any) {
        logWarn('checkTupleSsr::An error occurred while checking tuple', {
            file: 'queriers/api/fga',
            function: 'checkTupleSsr',
            url: checkTupleUrlSsr,
            partyId,
            relation,
            tupleObject,
        });

        return false;
    }
};

export const checkTuple = async (partyId: string, relation: string, tupleObject: string): Promise<boolean> => {
    const tuple = {
        user: `party:${partyId}`,
        relation,
        object: tupleObject,
    };
    const cachedResult = pullFromCache('checkTuple', tuple);

    if (cachedResult) return cachedResult;

    const { data } = await client.post<Tuple, AxiosResponse<CheckTupleResponse>>(`${baseUrl}/check`, tuple);

    const result = data?.allowed || false;

    writeToCache('checkTuple', tuple, result);

    return result;
};

export const getCarrierListServerSSR = async (accessToken: string, partyId: string, relation: UserPermission): Promise<string[]> => {
    try {
        const { data } = await serverApi.post<GetCarrierListQuery, AxiosResponse>(
            listCarrierUrlSsr,
            {
                user: `party:${partyId}`,
                relation,
            },
            {
                authorization: `Bearer ${accessToken}`,
            }
        );
        return data?.carriers || [];
    } catch (error: any) {
        logWarn('getCarrierListServerSSR::An error occurred while getting the carrier list', {
            file: 'queriers/api/fga',
            function: 'getCarrierListServerSSR',
            url: listCarrierUrlSsr,
        });
        return [];
    }
};

export const getCarrierList = async (
    partyId: string,
    relation: UserPermission,
    planCode?: string | string[] | undefined,
    policyNumber?: string | undefined
): Promise<string[]> => {
    const url = `${baseUrl}/list-carriers`;

    try {
        const query: GetCarrierListQuery = {
            user: `party:${partyId}`,
            relation,
        };
        if (planCode) {
            query.planCode = planCode;
        }
        if (policyNumber) {
            query.policyNumber = policyNumber;
        }

        const cachedResult = pullFromCache('getCarrierList', query);
        if (cachedResult) return cachedResult;

        const { data } = await client.post<GetCarrierListQuery, AxiosResponse>(url, query);
        const result = data?.carriers || [];

        writeToCache('getCarrierList', query, result, 10);

        return result;
    } catch (error: any) {
        logWarn('getCarrierList::An error occurred while getting the carrier list', {
            file: 'queriers/api/fga',
            function: 'getCarrierList',
            url,
        });
        return [];
    }
};
