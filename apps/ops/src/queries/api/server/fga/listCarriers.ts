import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import { GetServerSidePropsContext } from 'next';

import { getUserData } from '@deps/helpers/query-data.helper';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { ApiResponse } from '@deps/types/api-response';
import { GetCarrierListQuery } from '@deps/types/fga';
import { addCarrierListToCookie, checkPermissionsCookieForCarrierList } from '@deps/utils/permissionsCookie';
import { logWarn } from '@deps/utils/server-logging';

const listCarrierUrlSsr = `${apiServerBaseUrl}/fga/v1/list-carriers`;

// handles getting the auth token and checking the permissions cookie for listCarriers requests from a nextjs page
export const listCarriersPage = async (ctx: GetServerSidePropsContext, relation: string): Promise<string[]> => {
    try {
        const val = checkPermissionsCookieForCarrierList(relation, ctx.req, ctx.res);

        if (val) {
            val;
        }

        const user = await getUserData(ctx);
        const accessToken = (await getAccessToken(ctx.req, ctx.res)).accessToken;
        const result = await getCarrierListSSR(accessToken as string, user.partyId, relation);

        // add the list to the cookie only if the request was successful
        if (!result.error) {
            addCarrierListToCookie(relation, result.data ?? [], ctx.req, ctx.res);
        }

        return result.data ?? [];
    } catch (e) {
        logWarn('listCarriersPage::An error occurred while getting the carrier list', {
            file: 'queries/api/fga',
            function: 'listCarriersPage',
            relation,
        });
        return [];
    }
};

// THIS SHOULD NOT BE DIRECTLY USED!
// We should always be checking the permissions storage before making a listCarriers request
const getCarrierListSSR = async (accessToken: string, partyId: string, relation: string): Promise<ApiResponse<string[]>> => {
    try {
        const listCarrierCheck = await serverApi.post<GetCarrierListQuery, AxiosResponse>(
            listCarrierUrlSsr,
            {
                user: `party:${partyId}`,
                relation,
            },
            {
                authorization: `Bearer ${accessToken}`,
            }
        );

        const reponse: ApiResponse<string[]> = { data: listCarrierCheck?.data?.carriers || [], error: null };

        if (listCarrierCheck.status !== 200) {
            logWarn('getCarrierListSSR::An error occurred while getting the carrier list', {
                file: 'queries/api/fga',
                function: 'getCarrierListSSR',
                url: listCarrierUrlSsr,
                partyId,
                relation,
            });
            reponse.error = { status: listCarrierCheck.status, message: listCarrierCheck.statusText, name: 'Error getting carrier list' };
        }

        return reponse;
    } catch (error: any) {
        logWarn('getCarrierListServerSSR::An error occurred while getting the carrier list', {
            file: 'queries/api/fga',
            function: 'getCarrierListServerSSR',
            url: listCarrierUrlSsr,
        });
        return { data: [], error: { status: 500, message: error?.message, name: 'Error getting carrier list' } };
    }
};
