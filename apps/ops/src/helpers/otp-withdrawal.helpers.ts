import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    Address,
    AddressTypes,
    FormParty,
    Party,
    PartyRoles,
} from '@deps/models/case/withdrawal/case';

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
    if (!addresses) return null;
    return (
        addresses?.find(
            (address) => address.addressType === AddressTypes.DEFAULT
        ) ||
        addresses[0] ||
        null
    );
};

const determinePartyOwner = (parties: Party[] = []): Party | null => {
    return (
        parties.find(
            ({ partyRoleType }) => partyRoleType === PartyRoles.OWNER
        ) || null
    );
};

const determinePartyAnnuitant = (parties: Party[] = []): Party | null => {
    return (
        parties.find(
            ({ partyRoleType }) => partyRoleType === PartyRoles.ANNUITANT
        ) || null
    );
};

export const getOwnerStateOfResidence = (
    formParty: FormParty
): string | null => {
    const owner = determinePartyOwner(formParty?.parties || []);
    if (!owner) return null;
    const ownerPrimaryAddress = determinePrimaryAddress(owner.addresses);
    return ownerPrimaryAddress?.state || null;
};

export const getAnnuitantStateOfResidence = (
    formParty: FormParty
): string | null => {
    const annuitant = determinePartyAnnuitant(formParty?.parties || []);
    if (!annuitant) return null;
    const annuitantPrimaryAddress = determinePrimaryAddress(
        annuitant.addresses
    );
    return annuitantPrimaryAddress?.state || null;
};

export const validQualTypesForSpousalSignature = [
    'Cust Inh IRA',
    'Cust Inh Roth IRA',
    'Cust Rollover IRA',
    'Cust SAR/SEP IRA',
    'Cust Simple IRA',
    'Cust Spousal IRA',
    'Custodial IRA',
    'Custodial IRA-SEP',
    'Custodial QLAC IRA',
    'Custodial Roth IRA',
];

export const validQualTypesForSpousalSignatureFAST = [
    'CUSTODIALINDIVIDUALRETIREMENTACCOUNT',
    'CUSTODIALROTHINDIVIDUALRETIREMENTACCOUNT',
    'CUSTODIALROLLOVERINDIVIDUALRETIREMENTACCOUNT',
];

export const spousalSignatureOnAnnuitantStateCodes: string[] = [
    'ID',
    'NV',
    'TX',
    'WA',
];
