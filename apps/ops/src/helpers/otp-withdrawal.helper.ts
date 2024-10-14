import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { Address, AddressTypes, FormParty, Party, PartyRoles } from '@deps/models/case/withdrawal/case';

export interface SignatureField {
    fieldName: string;
    fieldLabel: string;
    required: boolean;
}
// type signature config
export interface SignatureConfiguration {
    type: SignatureValidationTypeWithdrawal;
    key: string;
    fields: SignatureField[];
}

const determinePrimaryAddress = (addresses: Address[] = []): Address | null => {
    return addresses.find(address => address.addressType === AddressTypes.DEFAULT) || addresses[0] || null;
};

const determinePartyOwner = (parties: Party[] = []): Party | null => {
    return parties.find(({ partyRoleType }) => partyRoleType === PartyRoles.OWNER) || null;
};

export const getOwnerStateOfResidence = (formParty: FormParty): string | null => {
    const owner = determinePartyOwner(formParty.parties);
    if (!owner) return null;
    const ownerPrimaryAddress = determinePrimaryAddress(owner.addresses);
    return ownerPrimaryAddress?.state || null;
};
