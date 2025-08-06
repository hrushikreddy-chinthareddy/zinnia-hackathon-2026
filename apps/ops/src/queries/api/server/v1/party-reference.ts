import {
    PartySearchRequest,
    PartySearchResponse,
} from '@xd/api-types/dist/generated-types/partyreference';

import { apiServerBaseUrl } from '@deps/queries/api-config';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import { EnterpriseTokenApi } from '@deps/services/enterprise-api-token-http';
import { PartyReference } from '@deps/types/party-reference';
import { LoggingContext } from '@deps/utils/server-logging';

export const PARTY_REFERENCE_API_ORIGIN = 'party-reference-api';

export const getPartyReferenceByPartyId = async (
    partyId: string,
    loggingContext: LoggingContext
): Promise<PartyReference | undefined> => {
    try {
        const partyReferenceUrl = `${apiServerBaseUrl}/party/v1/parties/${partyId}/reference`;
        const partyReferenceResponse = await EnterpriseTokenApi.get(
            partyReferenceUrl,
            {},
            loggingContext
        );
        const partyReferenceResponseObject =
            await partyReferenceResponse.json();

        if (partyReferenceResponseObject.message) {
            throwTypedError(
                partyReferenceResponseObject.message,
                PARTY_REFERENCE_API_ORIGIN
            );
        }

        return partyReferenceResponseObject;
    } catch (error: any) {
        throwTypedError(error.message, PARTY_REFERENCE_API_ORIGIN);
    }
};

export const partyRefSearch = async (
    searchReq: PartySearchRequest,
    limit: number,
    offset: number,
    loggingContext: LoggingContext
): Promise<PartySearchResponse | undefined> => {
    try {
        const partyReferenceUrl = `${apiServerBaseUrl}/party/v1/parties/reference/search?offset=${offset}&limit=${limit}`;
        const partyReferenceResponse = await EnterpriseTokenApi.post(
            partyReferenceUrl,
            JSON.stringify(searchReq),
            {},
            loggingContext
        );
        const partyReferenceResponseObject =
            await partyReferenceResponse.json();

        if (partyReferenceResponseObject.message) {
            throwTypedError(
                partyReferenceResponseObject.message,
                PARTY_REFERENCE_API_ORIGIN
            );
        }

        return partyReferenceResponseObject;
    } catch (error: any) {
        throwTypedError(error.message, PARTY_REFERENCE_API_ORIGIN);
    }
};
