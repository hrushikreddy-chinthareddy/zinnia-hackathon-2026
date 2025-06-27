import { PartyInstance } from '@deps/models/case/party-instance';

import { getPolicyOwners, getAgents, PartyRole } from './parties';

// Mock Data for Parties
const parties: PartyInstance[] = [
    {
        partyRole: `${PartyRole.Owner}, Joint`,
        partyType: 'Individual',
        firstName: 'john',
        middleName: '',
        lastName: 'Doe',
        fullName: 'John Doe',
        prefix: 'Mr.',
        suffix: '',
        gender: 'M',
        ssn: '123456789',
        percent: '50',
    },
    {
        partyRole: `${PartyRole.Owner}, ${PartyRole.Primary}`,
        partyType: 'Individual',
        firstName: 'nicolas',
        middleName: '',
        lastName: 'Doe',
        fullName: 'nicolas  Doe',
        prefix: 'Mr.',
        suffix: '',
        gender: 'M',
        ssn: '234324325',
        percent: '50',
    },
    {
        partyRole: `Annuitant / Insured, ${PartyRole.Primary}`,
        partyType: 'Individual',
        firstName: 'nicolas',
        middleName: '',
        lastName: 'Doe',
        fullName: 'nicolas  Doe',
        prefix: 'Mr.',
        suffix: '',
        gender: 'M',
        ssn: '234324325',
        percent: '100',
    },
    {
        partyRole: `Beneficiary, ${PartyRole.Primary}`,
        partyType: 'Individual',
        firstName: 'renee',
        middleName: '',
        lastName: 'nott',
        fullName: 'renee  nott',
        prefix: 'Ms.',
        suffix: '',
        gender: 'F',
        ssn: '',
        percent: '100',
    },
    {
        partyRole: PartyRole.ServicingAgent,
        partyType: 'Individual',
        firstName: 'KRUPA',
        middleName: '',
        lastName: 'PREMKUMAR',
        fullName: 'KRUPA  PREMKUMAR',
        prefix: '',
        suffix: '',
        gender: 'M',
        ssn: 'NOTFOUND',
        percent: '100',
    },
    {
        partyRole: PartyRole.Agent,
        partyType: 'Individual',
        firstName: 'KRUPA',
        middleName: '',
        lastName: 'PREMKUMAR',
        fullName: 'KRUPA  PREMKUMAR',
        prefix: '',
        suffix: '',
        gender: 'M',
        ssn: 'NOTFOUND',
        percent: '100',
    },
];

describe('getPolicyOwners', () => {
    it('should not include non-owner roles', () => {
        const policyOwners = getPolicyOwners(parties);

        policyOwners.forEach((policyOwner) => {
            expect(policyOwner.partyRole.includes(PartyRole.Owner)).toBe(true);
        });
    });

    it('should return the Primary Owner as the first item', () => {
        const policyOwners = getPolicyOwners(parties);

        expect(policyOwners[0].partyRole.includes(PartyRole.Primary)).toBe(
            true
        );
    });
});

describe('getAgents', () => {
    it('should return only the unique agents, sorted first by Servicing Agent', () => {
        const agents = getAgents(parties);

        expect(agents.length).toEqual(1);
        expect(agents[0].partyRole).toEqual(PartyRole.ServicingAgent);
    });

    it('should not include non-agent roles', () => {
        const agents = getAgents(parties);

        agents.forEach((agent) => {
            expect(agent.partyRole.includes(PartyRole.Agent)).toBe(true);
        });
    });

    it('should return distinct agents based on their full names', () => {
        const agents = getAgents(parties);
        const uniqueAgents = Array.from(new Set(agents.map((a) => a.fullName)));
        expect(agents.length).toEqual(uniqueAgents.length);
    });
});
