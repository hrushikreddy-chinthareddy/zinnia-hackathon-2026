import { Party, Policy } from '@xd/api-types/dist/generated-types/sor';

import {
    BeneChangePayload,
    ExtendedParty,
} from '@deps/contexts/BeneChangeContext';

export function updateIdentificationsFromPolicy(
    policy: Policy | null,
    body: BeneChangePayload | null
): any {
    const identificationsByPartyId: Record<string, any[]> = {};

    if (policy?.parties && Array.isArray(policy.parties)) {
        policy.parties.forEach((party: Party) => {
            if (
                party.identifications &&
                Array.isArray(party.identifications) &&
                party.partyId
            ) {
                identificationsByPartyId[party.partyId] = party.identifications;
            }
        });
    }

    if (body?.actionData && Array.isArray(body.actionData)) {
        body.actionData.forEach((record: { party: ExtendedParty }) => {
            const partyId = record.party?.partyId;
            if (partyId && identificationsByPartyId[partyId] && record.party) {
                record.party.identifications =
                    identificationsByPartyId[partyId];
            }
        });
    }

    return body;
}
