import { AxiosResponse } from 'axios';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { serverApi } from '@deps/queries/api-utils/serverApiClient';
import { ListResponse } from '@deps/types/fga';

// BPB - for now, the check is a little simplified.  If the user is trusted to unmask pii in our system through any of its roles, we assume they can unmask pii on all cases/notes/documents/call logs they are able to see.
const canUnmaskPii = async (accessToken: string | undefined, partyId: string | undefined, loggingContext?: object) => {
    const userUnmaskingRolesResponse = await serverApi.post<any, AxiosResponse<ListResponse>>(
        `${apiServerBaseUrl}/fga/v1/list`,
        { user: `party:${partyId}`, relation: 'unmask_pii', type: 'role' },
        { authorization: 'Bearer ' + accessToken },
        loggingContext
    );

    return !!userUnmaskingRolesResponse?.data?.objects?.length;
};

export default canUnmaskPii;
