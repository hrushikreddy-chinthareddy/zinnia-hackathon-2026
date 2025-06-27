import {
    Policy,
    EmailType,
    AddressType,
    PartyRole,
    PolicyPartyRoles,
} from '@zinnia/api-types/types/sor';

import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { isNonProductionEnvironment } from '@deps/utils/environment.helpers';

import { ClaimActionTypes, NotificationMethod } from '../../death-claim.types';

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

const getTransformAddress = (address: any) => {
    return {
        action: ClaimActionTypes.NONE,
        addressType: address?.addressType || AddressType.RESIDENCE,
        addressLine1: address?.addressLine1 || null,
        addressLine2: address?.addressLine2 || null,
        addressLine3: address?.addressLine3 || null,
        city: address?.city || null,
        state: address?.state || null,
        zipCode: address?.zipCode || null,
        zipCodeExtension: address?.zipCodeExtension || null,
        country: address?.country || 'USA',
        addressId: address?.addressId || null,
    };
};

const getTransformEmail = (email: any) => {
    return {
        action: ClaimActionTypes.NONE,
        emailType: email?.emailType || EmailType.PERSONAL,
        emailAddress: email?.emailAddress || null,
        emailId: email?.emailId || null,
    };
};

export const getBeneficiariesByRole = (
    policy: Policy,
    roles: PartyRole[]
): NotificationMethod[] => {
    const extractedPartyRoles: PolicyPartyRoles[] = getExtractedPartyRoles(
        policy,
        roles
    );
    const beneficiaries: NotificationMethod[] = [];

    extractedPartyRoles?.map((correspondingRole) => {
        const party = policy?.parties?.find(
            (party) => party.partyId === correspondingRole?.partyId
        );

        if (party && correspondingRole) {
            const { addresses, emails } = party;
            const personalEmail =
                emails?.filter(
                    (email) => email.emailType === EmailType.PERSONAL
                )?.[0] || {};
            const residentialAddresse =
                addresses?.filter(
                    (address) => address.addressType === AddressType.RESIDENCE
                )?.[0] || {};

            const beneficiary = {
                party: {
                    partyId: party?.partyId || '',
                    partyRoleId: correspondingRole.partyRoleId,
                    partyRole: correspondingRole.partyRole,
                    partyType: party.partyType,
                    prefix: party?.prefix || '',
                    suffix: party.suffix || '',
                    firstName: party?.firstName || '',
                    middleName: party?.middleName || '',
                    lastName: party?.lastName || '',
                    fullName: party?.fullName || '',
                    gender: party?.gender || '',
                    dateOfBirth: party?.dateOfBirth || '',
                    relationshipToInsured:
                        correspondingRole?.relationshipToInsured || '',
                },
                email: {
                    ...getTransformEmail(personalEmail),
                },
                faxNumber: null,
                address: {
                    ...getTransformAddress(residentialAddresse),
                },
                notificationMethod: null,
            } as NotificationMethod;
            beneficiaries.push(beneficiary);
        }
    });
    return beneficiaries;
};

export const isEqualObjects = (obj1: any, obj2: any) => {
    const diffInFields = Object.entries(obj2).filter(
        ([field, obj2Value]) => obj1[field] !== obj2Value
    );
    return diffInFields.length > 0 ? false : true;
};

//export const domainValidation = /^[a-zA-Z0-9](\.?[a-zA-Z0-9]){3,}@zinnia\.com$/;
export const domainValidation = /^[A-Za-z0-9._%+-]+@zinnia\.com$/i;
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const faxRegex = /^\d{10}$/;

export const validateEmail = (email: string) => {
    if (isNullEmptyOrUndefined(email)) {
        return 'errors.emailIsRequired';
    }
    if (!emailRegex.test(email)) {
        return 'errors.inValidEmail';
    }
    if (!domainValidation.test(email) && isNonProductionEnvironment()) {
        return 'errors.inValidDomain';
    }
    return;
};

export const validateFax = (fax: string) => {
    if (isNullEmptyOrUndefined(fax)) {
        return 'errors.faxIsRequired';
    }
    if (!isNullEmptyOrUndefined(fax) && !faxRegex.test(fax)) {
        return 'errors.inValidFax';
    }
};

export const validateAddress = (address: any) => {
    if (
        isNullEmptyOrUndefined(address?.addressLine1) ||
        isNullEmptyOrUndefined(address?.city) ||
        isNullEmptyOrUndefined(address?.state) ||
        isNullEmptyOrUndefined(address?.zipCode)
    ) {
        return 'errors.addressIsRequired';
    }
};
