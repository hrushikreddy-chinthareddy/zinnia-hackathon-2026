import { partyRoleOrder, TitleCasedPartyRole } from '@deps/constants/party-roles';
import { mockPolicy } from '@deps/jest/data/mockPolicy';

import { groupPartiesByAddress } from './roles-contract-helper';

describe.skip('RolesAndContract helper', () => {
    describe('FLIC Form', () => {
        const mockTFunction = jest.fn().mockImplementation((key: string) => {
            switch (key) {
                case 'chipFilter.partyRole.owner':
                    return TitleCasedPartyRole.Owner;
                case 'chipFilter.partyRole.payee':
                    return TitleCasedPartyRole.Payee;
                case 'chipFilter.partyRole.jointOwner':
                    return TitleCasedPartyRole.JointOwner;
                case 'chipFilter.partyRole.insured':
                    return TitleCasedPartyRole.Insured;
                default:
                    return partyRoleOrder;
            }
        });
        // TODO: Add test cases
        it.skip('groupPartiesByAddress', () => {
            groupPartiesByAddress(mockPolicy?.partyRoles ?? [], mockPolicy?.parties ?? [], mockPolicy?.qualificationType ?? '', mockTFunction);
        });
    });
});
