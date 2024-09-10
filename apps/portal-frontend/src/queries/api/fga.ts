import { AxiosResponse } from 'axios';

import { UserPermission } from '@deps/models/user-profile';
import { pullFromCache, writeToCache } from '@deps/utils/cache';
import { logWarn } from '@deps/utils/server-logging';

import { apiServerBaseUrl, baseAppUrl } from '../api-config';
import { client } from '../api-utils/client';
import { serverApi } from '../api-utils/serverApiClient';

type GetCarrierListQuery = {
    user: string;
    relation: string;
    planCode?: string | string[] | undefined;
    policyNumber?: string | undefined;
};

const listCarrierUrlSSR = `${apiServerBaseUrl}/fga/v1/list-carriers`;
const baseUrl = baseAppUrl + '/api/fga/v1';

export const getCarrierListServerSSR = async (accessToken: string, partyId: string, relation: UserPermission): Promise<string[]> => {
    const partyString = `party:${partyId}`;
    try {
        const { data } = await serverApi.post<GetCarrierListQuery, AxiosResponse>(
            listCarrierUrlSSR,
            {
                user: partyString,
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
            url: listCarrierUrlSSR,
        });
        return [];
    }
};

export const getCarrierList = async (partyId: string, relation: UserPermission, planCode?: string | string[] | undefined, policyNumber?: string | undefined ): Promise<string[]> => {
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

        const { data } = await client.post<GetCarrierListQuery, AxiosResponse>(
            `${baseUrl}/list-carriers`,
            query,
        );
        const result = data?.carriers || [];
        writeToCache('getCarrierList', query, result, 10);
        return result;
    } catch (error: any) {
        logWarn('getCarrierList::An error occurred while getting the carrier list', {
            file: 'queriers/api/fga',
            function: 'getCarrierList',
            url: listCarrierUrlSSR,
        });
        return [];
    }
};