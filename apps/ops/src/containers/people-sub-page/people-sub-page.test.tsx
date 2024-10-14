import { partyRoleOrder, TitleCasedPartyRole } from '@deps/constants/party-roles';
import { PartyRole, PartyType, PolicyAllOfPartiesItem, PolicyParties } from '@deps/models/policy/sor-policy';

import { combineNameAndRoles } from './people-sub-page.helpers';


describe('combineNameAndRoles', () => {
    const mockPolicyPartiesArr: PolicyAllOfPartiesItem[] = [
        {
            partyId: '1',
            partyType: PartyType.INDIVIDUAL,
            firstName: 'John',
            lastName: 'Doe',
        },
        {
            partyId: '2',
            partyType: PartyType.TRUST,
            fullName: 'Example Trust'
        },
        {
            partyId: '3',
            partyType: PartyType.ORGANIZATION,
            organizationCode: 'ORGCODE'
        },
    ];

    const mockPartyRolesArr: PolicyParties[] = [
        {
            partyId: '1',
            partyRole: PartyRole.COVERAGEINSURED,
            partyRoleId: 1
        },
        {
            partyId: '1',
            partyRole: PartyRole.ASSIGNEE,
            partyRoleId: 2
        },
        {
            partyId: '2',
            partyRole: PartyRole.ASSIGNEE,
            partyRoleId: 2
        },
        {
            partyId: '3',
            partyRole: PartyRole.COVERAGEINSURED,
            partyRoleId: 1
        },
    ];

    const mockTFunction = jest.fn().mockImplementation((key: string) => {
        switch (key) {
            case 'chipFilter.partyRole.riderInsured':
                return TitleCasedPartyRole.RiderInsured;
            case 'chipFilter.partyRole.assignee':
                return TitleCasedPartyRole.Assignee;
            default:
                return partyRoleOrder;
        }
    });

    it('should combine name and roles correctly and return tags in right order', () => {
        const result = combineNameAndRoles(mockPolicyPartiesArr, mockPartyRolesArr, mockTFunction);

        expect(result).toEqual([
            {
                partyId: '1',
                partyType: PartyType.INDIVIDUAL,
                firstName: 'John',
                lastName: 'Doe',
                tags: [{ text: TitleCasedPartyRole.Assignee }, { text: TitleCasedPartyRole.RiderInsured }],
                partyRoles: [PartyRole.COVERAGEINSURED, PartyRole.ASSIGNEE],
                partyRoleIds: [ 1, 2],
            },
            {
                partyId: '2',
                partyType: PartyType.TRUST,
                fullName: 'Example Trust',
                tags: [{ text: TitleCasedPartyRole.Assignee }],
                partyRoles: [PartyRole.ASSIGNEE],
                partyRoleIds: [2],
            },
            {
                partyId: '3',
                partyType: PartyType.ORGANIZATION,
                organizationCode: 'ORGCODE',
                tags: [{ text: TitleCasedPartyRole.RiderInsured }],
                partyRoles: [PartyRole.COVERAGEINSURED],
                partyRoleIds: [1],
            },
        ]);
    });

    it('should return an empty array if policyPartiesArr is empty', () => {
        const result = combineNameAndRoles([], mockPartyRolesArr, mockTFunction);

        expect(result).toEqual([]);
    });

    it('should return an empty array if partyRolesArr is empty', () => {
        const result = combineNameAndRoles(mockPolicyPartiesArr, [], mockTFunction);

        expect(result).toEqual([]);
    });

    it('should return an empty array if policyPartiesArr and partyRolesArr are empty', () => {
        const result = combineNameAndRoles([], [], mockTFunction);

        expect(result).toEqual([]);
    });

    it('should return an array with one item if policyPartiesArr and partyRolesArr have the same length of 1', () => {
        const result = combineNameAndRoles(
            [mockPolicyPartiesArr[0]],
            [mockPartyRolesArr[0]],
            mockTFunction
        );

        expect(result).toEqual([
            {
                partyId: '1',
                partyType: PartyType.INDIVIDUAL,
                firstName: 'John',
                lastName: 'Doe',
                tags: [{ text: TitleCasedPartyRole.RiderInsured }],
                partyRoles: [PartyRole.COVERAGEINSURED],
                partyRoleIds: [1]
            },
        ]);
    });
});