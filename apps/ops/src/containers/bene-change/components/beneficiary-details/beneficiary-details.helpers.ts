import { Email, IdentificationType, PartyRole } from '@zinnia/api-types/types/sor';

import { EnterpriseAddress, getAddresses } from './address-details/address-details.helpers';
import { getPersonalEmails } from './email-details/email-details.helpers';
import { EnterprisePhone, getPhones } from './phone-details/phone-details.helpers';

export const getInitialBene = (
    partyRole: PartyRole,
    index: string,
    selectedParty?: any,
    relationshipToInsured?: any,
    partyId?: string,
    isReadOnly?: boolean,
    action?: string,
    partyRoleId?: any
) => {
    const { emails, phones, addresses, beneficiaryPercentage } = selectedParty ?? {};
    const currentEmails: Email[] = getPersonalEmails({ emails });
    const currentPhones: EnterprisePhone[] = getPhones({ phones });
    const currentAddresses: EnterpriseAddress[] = getAddresses({ addresses });
    const beneInfo: any = {
        isPerStirpes: false,
        isIrrevocable: false,
        isRestrictedBeneficiary: false,
    };
    const allocationDetails = {
        beneficiaryPercentage: beneficiaryPercentage,
        relationshipToInsured: relationshipToInsured,
    };

    const currentParty = {
        firstName: selectedParty?.firstName,
        middleName: selectedParty?.middleName,
        lastName: selectedParty?.lastName,
        fullName: selectedParty?.fullName,
        prefix: selectedParty?.prefix,
        suffix: selectedParty?.suffix,
        gender: selectedParty?.gender,
        ssn: selectedParty?.identifications?.find((ids: any) => ids.identificationType === IdentificationType.SSN)?.identificationValue,
        trustName: selectedParty?.lastName,
        companyName: selectedParty?.lastName,
        dateOfBirth: selectedParty?.dateOfBirth,
        partyType: selectedParty?.partyType,
        trustType: selectedParty?.trustType,
    };

    const beneData = {
        actionType: 'BENE_CHANGE',
        action: action ? action : 'NONE',
        partyRole: {
            partyRole: partyRole,
            partyId: partyId,
            partyRoleId: partyRoleId,
        },
        party: {
            partyId: partyId,
            info: currentParty,
            allocation: allocationDetails,
            addresses: currentAddresses,
            phones: currentPhones,
            emails: currentEmails,
        },
        beneInfo: { ...beneInfo },
        index,
    };
    return beneData;
};
