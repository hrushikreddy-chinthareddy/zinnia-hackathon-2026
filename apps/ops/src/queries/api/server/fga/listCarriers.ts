import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import { GetServerSidePropsContext } from 'next';

import { getUserData } from '@deps/helpers/query-data.helper';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
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
        addCarrierListToCookie(relation, result, ctx.req, ctx.res);
        return result;
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
const getCarrierListSSR = async (accessToken: string, partyId: string, relation: string): Promise<string[]> => {
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
            file: 'queries/api/fga',
            function: 'getCarrierListServerSSR',
            url: listCarrierUrlSsr,
        });
        return [];
    }
};
