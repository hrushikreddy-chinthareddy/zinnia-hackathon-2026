import { PartyInstance } from '@deps/models/case/party-instance';

export enum PartyRole {
    Agent = 'Agent',
    Owner = 'Owner',
    Primary = 'Primary',
    ServicingAgent = 'Servicing Agent',
}

export function getPolicyOwners(parties: PartyInstance[]): PartyInstance[] {
    return parties
        .filter(party => party?.partyRole?.includes(PartyRole.Owner))
        .sort((a, b) => {
            if (a.partyRole?.includes(PartyRole.Primary)) {
                return -1;
            }
            if (b.partyRole?.includes(PartyRole.Primary)) {
                return 1;
            }
            return 0;
        });
}

export function getAgents(parties: PartyInstance[]): PartyInstance[] {
    return parties
        .filter(party => party?.partyRole?.includes(PartyRole.Agent))
        .sort(a => (a.partyRole.includes(PartyRole.ServicingAgent) ? -1 : 1))
        .filter((party, index, self) => index === self.findIndex(t => t.fullName === party.fullName));
}
