import { getAccessToken, getSession } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from 'next';

import { getUserData } from '@deps/helpers/query-data.helper';
import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { ApiResponse } from '@deps/types/api-response';
import { CheckTupleResponse, Tuple } from '@deps/types/fga';
import { addTupleToCookie, checkPermissionsCookieForTuple } from '@deps/utils/permissionsCookie';
import { LoggingContext, logWarn } from '@deps/utils/server-logging';

const checkTupleUrlSsr = `${apiServerBaseUrl}/fga/v1/check`;

// THIS SHOULD NOT BE USED DIRECTLY!  We should always be checking the permissions storage before making a checkTuple request
// Use checkTuplePage or checkTupleApi depending on the use case
const checkTuple = async (accessToken: string, partyId: string, relation: string, tupleObject: string): Promise<ApiResponse<boolean>> => {
    if (!accessToken || !partyId) {
        return { data: false, error: { status: 400, message: 'Missing partyId or accessToken', name: 'Error checking tuple' } };
    }

    try {
        const tuple = {
            user: `party:${partyId}`,
            relation,
            object: tupleObject,
        };

        const tupleCheck = await serverApi.post<Tuple, AxiosResponse<CheckTupleResponse>>(checkTupleUrlSsr, tuple, {
            authorization: `Bearer ${accessToken}`,
        });
        const response: ApiResponse<boolean> = { data: tupleCheck?.data?.allowed || false, error: null };

        if (tupleCheck.status !== 200) {
            logWarn('checkTuple::An error occurred while checking tuple', {
                file: 'queries/api/fga',
                function: 'checkTuple',
                url: checkTupleUrlSsr,
                partyId,
                relation,
                tupleObject,
            });
            response.error = { status: tupleCheck.status, message: tupleCheck.statusText, name: 'Error checking tuple' };
        }

        return response;
    } catch (error: any) {
        logWarn('checkTupleSsr::An error occurred while checking tuple', {
            file: 'queries/api/fga',
            function: 'checkTupleSsr',
            url: checkTupleUrlSsr,
            partyId,
            relation,
            tupleObject,
        });

        return { data: false, error: { status: 500, message: error.message, name: 'Error checking tuple' } };
    }
};

// handles getting the auth token and checking the permissions cookie for page requests
export const checkTuplePage = async (
    ctx: GetServerSidePropsContext,
    relation: string,
    tupleObject: string,
    loggingContext: LoggingContext
): Promise<boolean> => {
    try {
        const val = checkPermissionsCookieForTuple(relation, tupleObject, ctx.req, ctx.res);
        if (val !== undefined) {
            return val;
        }

        const user = await getUserData(ctx);
        const accessToken = (await getAccessToken(ctx.req, ctx.res)).accessToken;
        const result = await checkTuple(accessToken as string, user.partyId, relation, tupleObject);

        if (!result.error) {
            addTupleToCookie(relation, tupleObject, !!result.data, ctx.req, ctx.res);
        }
        return !!result.data;
    } catch (e) {
        logWarn('checkTuplePage::An error occurred while checking tuple', {
            ...loggingContext,
            file: 'queries/api/fga',
            function: 'checkTuplePage',
            inputs: {
                relation,
                tupleObject,
            },
        });
        return false;
    }
};

// handles getting the auth token and checking the permissions cookie for API requests
export const checkTupleApi = async (req: NextApiRequest, res: NextApiResponse, relation: string, tupleObject: string): Promise<boolean> => {
    try {
        const val = checkPermissionsCookieForTuple(relation, tupleObject, req, res);
        if (val !== undefined) {
            return val;
        }

        const session = await getSession(req, res);
        const accessToken = session?.accessToken;
        const result = await checkTuple(accessToken as string, session?.user?.partyId, relation, tupleObject);

        if (!result.error) {
            addTupleToCookie(relation, tupleObject, !!result.data, req, res);
        }
        return !!result.data;
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
