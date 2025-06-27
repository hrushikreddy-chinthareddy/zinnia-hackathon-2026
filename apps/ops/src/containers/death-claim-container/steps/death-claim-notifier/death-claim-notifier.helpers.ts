import {
    PartyRole,
    PhoneType,
    Policy,
    PolicyPartyRoles,
} from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';

import { ZAHARA_DATE_FORMAT } from '@deps/helpers/date.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import {
    ClaimActionTypes,
    DeceasedParty,
    NotifierParty,
    PartyObj,
} from '../../death-claim.types';

export const getTransformPhone = (phone: any) => {
    return {
        action: ClaimActionTypes.NONE,
        phoneType: phone?.phoneType ?? PhoneType.HOME,
        countryCode: phone?.countyCode ?? 'US',
        dialNumber: phone?.dialNumber || '',
        areaCode: phone?.areaCode || '',
    };
};

export const getExtractedPartyRoles = (
    policy: Policy,
    roles: PartyRole[]
): PolicyPartyRoles[] => {
    return (
        policy?.partyRoles?.filter(
            (role) => role.partyRole && roles.includes(role.partyRole)
        ) || []
    );
};

export const getNotifiersByRoles = (
    policy: Policy,
    roles: PartyRole[]
): NotifierParty[] => {
    const extractedPartyRoles: PolicyPartyRoles[] = getExtractedPartyRoles(
        policy,
        roles
    );
    const notifierList: NotifierParty[] = [];

    extractedPartyRoles?.map((correspondingRole) => {
        const party = policy?.parties?.find(
            (party) => party.partyId === correspondingRole?.partyId
        );

        if (party && correspondingRole) {
            const { phones } = party;
            const homePhone =
                phones?.filter(
                    (phone) => phone.phoneType === PhoneType.HOME
                )?.[0] || {};
            const notifier = {
                notifierRole: '',
                dateOfNotification: dayjs().format(ZAHARA_DATE_FORMAT),
                isPrimaryBeneInfoOnFile: false,
                party: {
                    partyId: party.partyId || '',
                    partyRoleId: correspondingRole?.partyRoleId,
                    partyRole: correspondingRole?.partyRole,
                    partyType: party?.partyType,
                    prefix: party.prefix,
                    suffix: party.suffix,
                    firstName: party.firstName,
                    middleName: party.middleName,
                    lastName: party.lastName,
                    fullName: party.fullName,
                    gender: party.gender,
                    dateOfBirth: party.dateOfBirth,
                    relationshipToInsured:
                        correspondingRole.relationshipToInsured,
                    phone: {
                        ...getTransformPhone(homePhone),
                    },
                },
            } as NotifierParty;
            notifierList.push(notifier);
        }
    });
    return notifierList;
};

export const validatePhoneNumber = (phone: any, t: TFunction) => {
    const errors = {} as FormValidationErrors;
    const { areaCode, dialNumber } = phone;
    const phoneNumber = `${areaCode}${dialNumber}`;
    const phoneRegex = /^\d{10}$/;

    if (!isNullEmptyOrUndefined(phoneNumber) && !phoneRegex.test(phoneNumber)) {
        errors['phoneNumber'] = t('formErrors.formValidation.phoneIsInvalid');
    } else {
        errors['phoneNumber'] = '';
    }

    return errors;
};

export const getPolicyOwnersByRole = (
    policy: Policy,
    roles: PartyRole[]
): DeceasedParty[] => {
    const extractedPartyRoles: PolicyPartyRoles[] = getExtractedPartyRoles(
        policy,
        roles
    );
    const owners: DeceasedParty[] = [];

    extractedPartyRoles?.map((correspondingRole) => {
        const party = policy?.parties?.find(
            (party) => party.partyId === correspondingRole?.partyId
        );

        if (party && correspondingRole) {
            const owner = {
                party: {
                    partyId: party.partyId,
                    partyRoleId: correspondingRole.partyRoleId,
                    partyRole: correspondingRole.partyRole,
                    partyType: party.partyType,
                    prefix: party.prefix,
                    suffix: party.suffix,
                    firstName: party.firstName,
                    middleName: party.middleName,
                    lastName: party.lastName,
                    fullName: party.fullName,
                    gender: party.gender,
                    dateOfBirth: party.dateOfBirth,
                    relationshipToInsured:
                        correspondingRole.relationshipToInsured,
                } as PartyObj,
                isDeceased: false,
                isDiedInForeignCountry: null,
                dateOfDeath: '',
            } as DeceasedParty;
            owners.push(owner);
        }
    });
    return owners;
};
