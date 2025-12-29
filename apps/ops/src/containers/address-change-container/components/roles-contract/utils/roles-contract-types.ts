import { TagKey } from '@deps/types/components';
import { Address, Phone, PolicyPartyRoles } from '@zinnia/api-types/types/sor';

export interface PartyAddressCard {
    firstName?: string;
    lastName?: string;
    address?: Address;
    homePhone?: Phone;
    partyRoles: string[];
    roleIdentifiers: PolicyPartyRoles[];
    tags: TagKey[];
    email?: string;
}

export interface AssociateAddressTableRow {
    id: string;
    check: boolean;
    policyNumber: string;
    partyRole: string;
    partyRoleLabel: string;
    partyRoleId: string;
    partyId: string;
    address: string;
    city: string;
    state: string;
    zip: string;
}

export enum RoleContractValidationKeys {
    RolesContractPresent = 'RolesContractPresent',
}
