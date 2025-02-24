import { getSession } from '@auth0/nextjs-auth0';
import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { requestHandler } from '@deps/queries/api-utils/server';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { ErrorResponse } from '@deps/types/api';
import { CheckTupleResponse } from '@deps/types/fga';
import { withAuthAndLogging } from '@deps/utils/server-logging';

import type { NextApiRequest, NextApiResponse } from 'next';

// BPB - TODO: MASK STUFF
const mcsResponseSanitizer = (response: any) => response;
const fullyMaskMcsResponse = (response: any) => response;

export default withAuthAndLogging(
    async (req: NextApiRequest, res: NextApiResponse<AxiosResponse<any> | ErrorResponse>, loggingContext: object) => {
        const session = await getSession(req, res);
        const { clientCode, idType, id, parentIdType, parentId, skip, take, policyNumber, planCode } = req.query;

        const url = `${apiServerBaseUrl}/api/${clientCode}/salesentity`;
        const queryParams = new URLSearchParams();
        if (idType) queryParams.append('idType', idType as string);
        if (id) queryParams.append('id', id as string);
        if (parentIdType) queryParams.append('parentIdType', parentIdType as string);
        if (parentId) queryParams.append('parentId', parentId as string);
        if (skip) queryParams.append('skip', skip as string);
        if (take) queryParams.append('take', take as string);
        const proxyUrl = `${url}?${queryParams.toString()}`;

        // BPB - Using policyNumber and planCode to determine pii masking capabilities since we don't have any other way to determine this yet.
        const unmaskingResponse = await serverApi.post<any, AxiosResponse<CheckTupleResponse>>(
            `${apiServerBaseUrl}/fga/v1/check`,
            { user: `party:${session?.user?.partyId}`, relation: 'unmask_pii', object: `policy:${policyNumber}_${planCode}` },
            { authorization: 'Bearer ' + session?.accessToken },
            loggingContext
        );

        const masker = unmaskingResponse.data?.allowed ? mcsResponseSanitizer : fullyMaskMcsResponse;
        return await requestHandler<any>(proxyUrl, req, res, masker);
    },
    { file: 'api/:clientCode/salesentity', function: 'routeHandler' }
);
