import { Parties, Policy } from '@zinnia/api-types/types/sor';

export const policyOwner = (policy: Policy): Parties | undefined => {
    const ownerParty = policy?.partyRoles?.find((p) =>
        ['Owner', 'OWNER'].includes(p.partyRole || '')
    );
    const ownerInfo = policy?.parties?.find(
        (p) => p.partyId === ownerParty?.partyId
    );

    return ownerInfo;
};
