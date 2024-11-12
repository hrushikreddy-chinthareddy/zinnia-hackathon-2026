import { FGA_Tuple } from '@zinnia/utils';

export const getSuperAdminTupleCheck = (partyId: string): FGA_Tuple => {
    return {
        user: `party:${partyId}`,
        relation: 'party',
        object: 'role:zinnia_super_admin',
    };
};
