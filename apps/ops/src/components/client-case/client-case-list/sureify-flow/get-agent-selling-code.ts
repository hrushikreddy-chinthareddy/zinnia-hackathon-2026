import { NEW_BUSINESS_API_ORIGIN } from '@deps/queries/api/server/v2/new-business';
import { throwTypedError } from '@deps/queries/api-utils/throwTypedError';
import { party } from '@deps/types/new-business';
import { LoggingContext, logTrace } from '@deps/utils/server-logging';

import { AOR_IDENTIFIER_LABEL, UPN_IDENTIFIER_LABEL } from './constants';
import { getSellingcodeFromPartyReference } from './get-selling-code-from-party-reference';

/**
 * Selling code resolution strategy:
 *
 * Priority 1: New Business identifiers (AOR + UPN)
 * Priority 2: PartyReference API lookup
 *
 * Some carriers provide both identifiers directly, others only store them in
 * PartyReference. FMWL build selling codes based on AOR + UPN This dual path
 * ensures support across integrations.
 */
export const getAgentSellingCode = async (
    agentParty: party,
    loggingContext: LoggingContext
) => {
    const logPrefix = `ClientCases:New:Sureify:getAgentSellingCode`;
    const logCtx = {
        ...loggingContext,
        file: 'build-client-case-from-new-business',
        function: 'getAgentSellingCode',
    };
    const { identifiers, partyId } = agentParty;

    if (identifiers) {
        const aorIdentifier = identifiers.find(
            ({ key }) => key === AOR_IDENTIFIER_LABEL
        );
        const upnIdentifier = identifiers.find(
            ({ key }) => key === UPN_IDENTIFIER_LABEL
        );
        if (upnIdentifier?.value && aorIdentifier?.value) {
            // For Farmers: AOR + UPN = SELLING_CODE
            const agentSellingCode = aorIdentifier.value + upnIdentifier.value;

            logTrace(`${logPrefix} Agent selling code built from AOR & UPN`, {
                ...logCtx,
                partyId,
                agentSellingCode,
            });

            return agentSellingCode;
        }
    }

    const agentSellingCode = await getSellingcodeFromPartyReference(
        partyId,
        loggingContext
    );

    if (!agentSellingCode) {
        return throwTypedError(
            'Agent Selling Code was not able to be obtained',
            NEW_BUSINESS_API_ORIGIN
        );
    }

    logTrace(`${logPrefix} Got agent selling code from party reference API`, {
        ...logCtx,
        partyId,
        agentSellingCode,
    });

    return agentSellingCode;
};
