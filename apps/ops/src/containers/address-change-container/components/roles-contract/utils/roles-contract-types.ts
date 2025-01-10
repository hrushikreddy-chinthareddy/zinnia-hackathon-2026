import { Address, Phone, PolicyParties } from '@deps/models/policy/sor-policy';
import { TagKey } from '@deps/types/components';

export interface PartyAddressCard {
    firstName?: string;
    lastName?: string;
    address?: Address;
    homePhone?: Phone;
    partyRoles: string[];
    roleIdentifiers: PolicyParties[];
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
