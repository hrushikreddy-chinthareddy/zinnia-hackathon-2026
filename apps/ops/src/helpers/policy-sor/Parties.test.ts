import { mockPolicy } from '@deps/services/mocks/sor-policy-iul';
import { DEFAULT_ERROR_STRING } from '@deps/utils/strings';
import {
    Party,
    PartyRole,
    PolicyPartyRoles,
} from '@zinnia/api-types/types/sor';

import { Parties, PolicyParty } from './Parties';

jest.mock('@deps/helpers/policy-sor/party-items/Addresses', () => ({
    Addresses: jest.fn().mockImplementation(() => {
        return {
            preferred: 'mockPreferredAddress',
            bestAvailable: 'mockBestAvailableAddress',
        };
    }),
}));

jest.mock('@deps/helpers/policy-sor/party-items/Banks', () => ({
    Banks: jest.fn().mockImplementation(() => {
        return {
            preferred: 'mockPreferredBank',
        };
    }),
}));

jest.mock('@deps/helpers/policy-sor/party-items/Emails', () => ({
    Emails: jest.fn().mockImplementation(() => {
        return {
            preferred: 'mockPreferredEmail',
            bestAvailable: 'mockBestAvailableEmail',
        };
    }),
}));

jest.mock('@deps/helpers/policy-sor/party-items/Phones', () => ({
    Phones: jest.fn().mockImplementation(() => {
        return {
            bestAvailable: 'mockBestAvailablePhone',
        };
    }),
}));

let parties: Parties;
let party: PolicyParty;
describe('Parties', () => {
    beforeAll(() => {
        parties = new Parties(mockPolicy);
    });

    describe('Parties Class', () => {
        it('should have a parties array', () => {
            expect(parties.parties).toBeTruthy();
            expect(parties.parties).toHaveLength(4);
        });

        it('should return the owner', () => {
            const owner = parties.owner;
            expect(owner?.partyId).toEqual('Party_PI_1');
        });

        it('should return all owners', () => {
            const owner = parties.owner;
            const allOwners = parties.allOwners;
            expect(allOwners).toHaveLength(1);
            expect(allOwners.includes(owner as PolicyParty)).toBeTruthy();
        });

        it('should get the party by id', () => {
            const partyById = parties.getPartyById('Party_PI_1');
            const owner = parties.owner;
            expect(partyById).toEqual(owner);
        });

        it('should get the parties with role', () => {
            const owner = parties.owner;
            const partiesWithRole = parties.getPartiesWithRole(PartyRole.OWNER);
            expect(partiesWithRole).toHaveLength(1);
            expect(partiesWithRole.includes(owner as PolicyParty)).toBeTruthy();
        });

        it('should not blow up if no policy is passed in', () => {
            const noPolicy = new Parties(undefined);
            expect(noPolicy.getPartiesWithRole(PartyRole.OWNER)).toHaveLength(
                0
            );
            expect(noPolicy.getPartyById('Party_PI_1')).toBeUndefined();
            expect(noPolicy.owner).toBeUndefined();
            expect(noPolicy.allOwners).toHaveLength(0);
        });
    });

    describe('Party Class', () => {
        beforeAll(() => {
            party = new PolicyParty(mockPolicy.parties?.[0] as Party);
        });

        it('should return proper values', () => {
            expect(party.partyId).toEqual('Party_PI_1');
            expect(party.firstName).toEqual('Jonathan');
            expect(party.lastName).toEqual('Karadimas');
            expect(party.fullName).toEqual('Jonathan Karadimas');
            expect(party.formattedBirthDate).toEqual('4/20/1985');
        });

        it('should get ssn correctly', () => {
            expect(party.ssn).toEqual('***-**-6768');
        });

        it('should add a party role properly', () => {
            const roleToAdd = mockPolicy.partyRoles?.[0] as PolicyPartyRoles;
            party.addPartyRole(roleToAdd);
            expect(party.partyRoles).toHaveLength(1);
            expect(party.partyRoles[0]).toEqual(roleToAdd);
        });

        it('should properly reference child class methods', () => {
            expect(party.preferredAddress).toEqual('mockPreferredAddress');
            expect(party.preferredBank).toEqual('mockPreferredBank');
            expect(party.preferredEmail).toEqual('mockPreferredEmail');
            expect(party.bestAvailableAddress).toEqual(
                'mockBestAvailableAddress'
            );
            expect(party.bestAvailableEmail).toEqual('mockBestAvailableEmail');
            expect(party.bestAvailablePhone).toEqual('mockBestAvailablePhone');
        });

        it('should not blow up if no party is passed in', () => {
            const noParty = new PolicyParty(undefined);
            expect(noParty.formattedBirthDate).toBe(DEFAULT_ERROR_STRING);
            expect(noParty.ssn).toBeUndefined();
            expect(noParty.partyRoles).toHaveLength(0);
            // just don't blow up here
            expect(noParty.addPartyRole(undefined)).toBeUndefined();
        });
    });
});
