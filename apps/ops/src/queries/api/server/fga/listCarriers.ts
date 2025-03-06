import { getAccessToken } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import { getCookie, setCookie } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';

import { getUserData } from '@deps/helpers/query-data.helper';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { GetCarrierListQuery } from '@deps/types/fga';
import { DEFAULT_PERMISSIONS_COOKIE, PERMISSIONS_COOKIE_NAME, PermissionsCookie } from '@deps/types/permissionsCookie';
import { logWarn } from '@deps/utils/server-logging';
const listCarrierUrlSsr = `${apiServerBaseUrl}/fga/v1/list-carriers`;

export const listCarriersPage = async (ctx: GetServerSidePropsContext, relation: string): Promise<string[]> => {
    try {
        const permissionsCookie = getCookie(PERMISSIONS_COOKIE_NAME, { req: ctx.req, res: ctx.res }) || DEFAULT_PERMISSIONS_COOKIE;
        const permissions = JSON.parse(permissionsCookie) as PermissionsCookie;
        if (permissions.carriers?.[relation] !== undefined) {
            return permissions.carriers?.[relation];
        }

        const user = await getUserData(ctx);
        const accessToken = (await getAccessToken(ctx.req, ctx.res)).accessToken;
        const result = await getCarrierListServerSSR(accessToken as string, user.partyId, relation);
        permissions.carriers[relation] = result;
        setCookie(PERMISSIONS_COOKIE_NAME, JSON.stringify(permissions), { req: ctx.req, res: ctx.res });
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

export const getCarrierListServerSSR = async (accessToken: string, partyId: string, relation: string): Promise<string[]> => {
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
