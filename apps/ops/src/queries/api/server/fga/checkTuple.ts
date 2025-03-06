import { getAccessToken, getSession } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';

import { getUserData } from '@deps/helpers/query-data.helper';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { CheckTupleResponse, Tuple } from '@deps/types/fga';
import { addTupleToCookie, checkPermissionsCookieForTuple } from '@deps/utils/permissionsCookie';
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
        const val = checkPermissionsCookieForTuple(relation, tupleObject, ctx.req, ctx.res);
        if (val !== undefined) {
            return val;
        }

        const user = await getUserData(ctx);
        const accessToken = (await getAccessToken(ctx.req, ctx.res)).accessToken;
        const result = await checkTuple(accessToken as string, user.partyId, relation, tupleObject);

        addTupleToCookie(relation, tupleObject, result, ctx.req, ctx.res);
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
        const val = checkPermissionsCookieForTuple(relation, tupleObject, req, res);
        if (val !== undefined) {
            return val;
        }

        const session = await getSession(req, res);
        const accessToken = session?.accessToken;
        const result = await checkTuple(accessToken as string, session?.user?.partyId, relation, tupleObject);

        addTupleToCookie(relation, tupleObject, result, req, res);
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
