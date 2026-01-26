import {
    Email,
    Identification,
    PartyRole,
    PartyType,
} from '@zinnia/api-types/types/sor';

import {
    EnterpriseAddress,
    getAddresses,
} from './address-details/address-details.helpers';
import { getPersonalEmails } from './email-details/email-details.helpers';
import {
    EnterprisePhone,
    getPhones,
} from './phone-details/phone-details.helpers';

export const getInitialBene = (
    partyRole: PartyRole,
    index: string,
    selectedParty?: any,
    relationshipToParty?: any,
    partyId?: string,
    isReadOnly?: boolean,
    action?: string,
    partyRoleId?: any
) => {
    const { emails, phones, addresses, beneficiaryPercentage } =
        selectedParty ?? {};
    const currentEmails: Email[] = getPersonalEmails({ emails });
    const currentPhones: EnterprisePhone[] = getPhones({ phones });
    const currentAddresses: EnterpriseAddress[] = getAddresses({ addresses });
    let lastName: string | null = null;

    if (selectedParty?.lastName) {
        lastName = selectedParty.lastName;
    } else if (selectedParty?.partyType !== PartyType.INDIVIDUAL) {
        lastName = selectedParty?.fullName ?? null;
    }

    const beneInfo: any = {
        isPerStirpes: selectedParty?.isPerStirpes || false,
        isIrrevocable: selectedParty?.isIrrevocable || false,
        isRestrictedBeneficiary:
            selectedParty?.isRestrictedBeneficiary || false,
    };
    const allocationDetails = {
        beneficiaryPercentage: beneficiaryPercentage,
        relationshipToParty: relationshipToParty,
    };

    const currentParty = {
        firstName: selectedParty?.firstName,
        middleName: selectedParty?.middleName,
        lastName: lastName,
        fullName: selectedParty?.fullName,
        prefix: selectedParty?.prefix,
        suffix: selectedParty?.suffix,
        gender: selectedParty?.gender,
        ssn: selectedParty?.identifications?.find(
            (ids: any) =>
                ids.identificationType === Identification.identificationType.SSN
        )?.identificationValue,
        trustName: selectedParty?.lastName,
        companyName: selectedParty?.lastName,
        dateOfBirth: selectedParty?.dateOfBirth,
        trustDate: selectedParty?.trustDate,
        partyType: selectedParty?.partyType,
        trustType: selectedParty?.trustType,
        entityType: selectedParty?.entityType,
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
