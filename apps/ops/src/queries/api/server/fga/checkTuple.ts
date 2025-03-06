import { getAccessToken, getSession } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import { getCookie, setCookie } from 'cookies-next';
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';

import { getUserData } from '@deps/helpers/query-data.helper';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { CheckTupleResponse, Tuple } from '@deps/types/fga';
import { DEFAULT_PERMISSIONS_COOKIE, PERMISSIONS_COOKIE_NAME, PermissionsCookie } from '@deps/types/permissionsCookie';
import { logWarn } from '@deps/utils/server-logging';

const checkTupleUrlSsr = `${apiServerBaseUrl}/fga/v1/check`;

export const checkTuple = async (accessToken: string, partyId: string, relation: string, tupleObject: string): Promise<boolean> => {
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
            file: 'queries/api/fga',
            function: 'checkTupleSsr',
            url: checkTupleUrlSsr,
            partyId,
            relation,
            tupleObject,
        });

        return false;
    }
};

// handles getting the auth token and checking the permissions cookie for page requests
export const checkTuplePage = async (ctx: GetServerSidePropsContext, relation: string, tupleObject: string) => {
    try {
        const permissionsCookie = getCookie(PERMISSIONS_COOKIE_NAME, { req: ctx.req, res: ctx.res }) || DEFAULT_PERMISSIONS_COOKIE;
        const permissions = JSON.parse(permissionsCookie) as PermissionsCookie;
        if (permissions.tuples?.[relation]?.[tupleObject] !== undefined) {
            return permissions.tuples?.[relation]?.[tupleObject];
        }

        const user = await getUserData(ctx);
        const accessToken = (await getAccessToken(ctx.req, ctx.res)).accessToken;
        const result = await checkTuple(accessToken as string, user.partyId, relation, tupleObject);
        if (!permissions.tuples?.[relation]) {
            permissions.tuples[relation] = {};
        }
        permissions.tuples[relation][tupleObject] = result;
        setCookie(PERMISSIONS_COOKIE_NAME, JSON.stringify(permissions), { req: ctx.req, res: ctx.res });
        return result;
    } catch (e) {
        logWarn('checkTuplePage::An error occurred while checking tuple', {
            file: 'queries/api/fga',
            function: 'checkTuplePage',
            relation,
            tupleObject,
        });
        return false;
    }
};

// handles getting the auth token and checking the permissions cookie for API requests
export const checkTupleApi = async (req: NextApiRequest, res: NextApiResponse, relation: string, tupleObject: string) => {
    try {
        const permissionsCookie = getCookie(PERMISSIONS_COOKIE_NAME, { req, res }) || DEFAULT_PERMISSIONS_COOKIE;
        const permissions = JSON.parse(permissionsCookie) as PermissionsCookie;
        if (permissions.tuples?.[relation]?.[tupleObject] !== undefined) {
            return permissions.tuples?.[relation]?.[tupleObject];
        }
        const session = await getSession(req, res);
        const accessToken = session?.accessToken;
        const result = await checkTuple(accessToken as string, session?.user?.partyId, relation, tupleObject);
        if (!permissions.tuples?.[relation]) {
            permissions.tuples[relation] = {};
        }
        permissions.tuples[relation][tupleObject] = result;
        setCookie(PERMISSIONS_COOKIE_NAME, JSON.stringify(permissions), { req, res });
        return result;
    } catch (e) {
        logWarn('checkTupleApi::An error occurred while checking tuple', {
            file: 'queries/api/fga',
            function: 'checkTupleApi',
            relation,
            tupleObject,
        });
        return false;
    }
};
