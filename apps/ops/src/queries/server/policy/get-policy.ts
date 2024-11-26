import { AxiosResponse } from 'axios';

import { apiServerBaseUrl, policyApiBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { CheckTupleResponse } from '@deps/types/fga';
import { fullyMaskPolicyResponse, policyResponseSanitizer } from '@deps/utils/sanitizers';

const getPolicy = async ({
    authToken,
    loggingContext,
    partyId,
    planCode,
    policyNumber,
}: {
    authToken: string | undefined;
    loggingContext?: object;
    partyId?: string;
    planCode: string;
    policyNumber: string;
    version?: number;
}) => {
    const unmaskingResponse = await serverApi.post<any, AxiosResponse<CheckTupleResponse>>(
        `${apiServerBaseUrl}/fga/v1/check`,
        { user: `party:${partyId}`, relation: 'unmask_pii', object: `policy:${policyNumber}_${planCode}` },
        { authorization: 'Bearer ' + authToken },
        loggingContext
    );
    const masker = unmaskingResponse.data?.allowed ? policyResponseSanitizer : fullyMaskPolicyResponse;
    const response = await serverApi.get(
        `${policyApiBaseUrl}/${planCode}/${policyNumber}?viewDetails=true`,
        {
            authorization: 'Bearer ' + authToken,
        },
        loggingContext
    );

    return masker(response.data);
};

export default getPolicy;
