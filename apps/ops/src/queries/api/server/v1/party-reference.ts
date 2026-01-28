import { apiServerBaseUrl } from '@deps/queries/api-config';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import { EnterpriseTokenApi } from '@deps/services/enterprise-api-token-http';
import { PartyReference } from '@deps/types/party-reference';
import { LoggingContext } from '@deps/utils/server-logging';
import {
    PartySearchRequest,
    PartySearchResponse,
} from '@zinnia/api-types/types/partyreference';

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
            {
                headers: { 'Content-Type': 'application/json' },
            },
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
