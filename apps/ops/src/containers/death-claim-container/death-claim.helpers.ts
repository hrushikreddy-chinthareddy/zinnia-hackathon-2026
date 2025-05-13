
import dayjs from 'dayjs';
import { TFunction } from "i18next";
import { v4 as uuid4 } from 'uuid';

import { DATE_PICKER_FORMAT } from '@deps/components/fields/field-date-select/field-date-select';
import { ZAHARA_DATE_FORMAT } from '@deps/helpers/date.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { FormValidationErrors } from "@deps/models/case/withdrawal/case";
import { Policy, EmailType, AddressType, PhoneType } from "@deps/models/policy/sor-policy";
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { ClaimActionTypes, ClaimCommunicationTypes, DeceasedParty, NotificationMethod, NotifierParty, RoleType } from "./death-claim.types";

export const DEFAULT_ADDRESS = {
    action: ClaimActionTypes.NONE,
    addressType: AddressType.RESIDENCE,
    addressLine1: null,
    addressLine2: null,
    addressLine3: null,
    city: null,
    state: null,
    zipCode: null,
    zipCodeExtension: null,
    country: 'USA',
    addressId: null
};

/*const getTransformAddress = (address: any) => {
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
        emailId: email?.emailId || null
    }
}*/

/*const getBeneficiaryByRole = (policy: Policy, role: PartyRole): NotificationMethod | undefined => {
    const correspondingRole = policy?.partyRoles?.find(pr => pr.partyRole === role);
    const party = policy?.parties?.find(party => party.partyId === correspondingRole?.partyId);

    if (party && correspondingRole) {
        const { addresses, emails } = party;
        const personalEmail = emails?.filter(
            email => email.emailType === EmailType.PERSONAL
        )?.[0] || {};
        const residentialAddresse = addresses?.filter(
            address => address.addressType === AddressType.RESIDENCE
        )?.[0] || {};

        return {
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
                    relationshipToInsured: correspondingRole?.relationshipToInsured || ''
                },
                email: {
                    ...getTransformEmail(personalEmail)
                },
                faxNumber : null,
                address: {
                    ...getTransformAddress(residentialAddresse)
                },
                notificationMethod: null
        };
    }
};*/

/*export const getBeneficiariesByRole = (policy: Policy, roles: PartyRole[])  => {
    const parties: any = [];
    roles && roles?.forEach(role => {
        if (role)  {
          const party = getBeneficiaryByRole(policy, role);
          if (party) {
              parties.push(party);
          }
        }
    });
    return parties;
};*/

export const getCommunicationTypes = (t: TFunction) => {
    return [
        {
            label: t('notificationMethod.email'),
            value: ClaimCommunicationTypes.Email,
        },
        {
            label: t('notificationMethod.fax'),
            value: ClaimCommunicationTypes.Fax,
        },
        {
            label: t('notificationMethod.paperMail'),
            value: ClaimCommunicationTypes.Mail,
        },
    ];
};


export const validateOtherNotifier = (notifier: any, roleType: RoleType, t: TFunction) => {
    const errors: FormValidationErrors = {};
    const { firstName, middleName, lastName, suffix, relationshipToInsured } = notifier;

    if (!firstName) {
        errors['firstName'] = t('formErrors.formValidation.firstNameIsRequired');
    } else {
        errors['firstName'] = '';
    }
    if (!middleName) {
        errors['middleName'] = t('formErrors.formValidation.middleNameIsRequired');
    } else {
        errors['middleName'] = '';
    }
    if (!lastName) {
        errors['lastName'] = t('formErrors.formValidation.lastNameIsRequired');
    } else {
        errors['lastName'] = '';
    }
    if (!suffix) {
        errors['suffix'] = t('formErrors.formValidation.suffixIsRequired');
    } else {
        errors['suffix'] = '';
    }

    if (roleType === RoleType.Other && !relationshipToInsured) {
        errors['relationship'] = t('formErrors.formValidation.relationshipToInsuredIsRequired');
    } else {
        errors['relationship'] = '';
    }


    return errors;

};

const formatBene = (value: any) => {
    return  {
        ...value,
        dateOfDeath: !isNullEmptyOrUndefined(value?.dateOfDeath) ? dayjs(value?.dateOfDeath, DATE_PICKER_FORMAT).format(ZAHARA_API_DATE_FORMAT) : null,
    };
};

const formatPhone = (phone: any) => {
    return {
        action: phone.action,
        phoneType: phone.phoneType,
        countryCode: 'US',
        dialNumber: `${phone.areaCode}${phone.dialNumber}`
    }
};

const formatNotifier = (value: any) => {
    return  {
        ...value,
        party: {
            ...value.party,
            phone: formatPhone(value?.party?.phone)
        }
    };

};

export const buildClaimPaylod = (policy: Policy, document: any = {}, selNotifiers: NotifierParty, selOwners: DeceasedParty[], selBeneficiaries: NotificationMethod[]) => {
    const { policyNumber, policyStatus, product, carrierId } = policy;
    const ownersRec = selOwners.map((item: any) => formatBene(item));
    return {
        ...DEFAULT_PAYLOAD,
        businessKey: document?.documentNumber,
        correlationid: uuid4(),
        onbaseCaseId: document?.caseId,
        caseId: null,
        documentDate: document ? dayjs(document?.documentDate).format(ZAHARA_API_DATE_FORMAT) : null,
        carrierId: carrierId,
        planCode: product?.planCode,
        policyNumber: policyNumber,
        policyStatus: policyStatus,
        channel: '',
        notifiers: formatNotifier(selNotifiers),
        owners: ownersRec,
        beneficiaries: selBeneficiaries
    };
};

export const DEFAULT_PAYLOAD = {
    correlationid: null,
    onbaseCaseId: null,
    caseId: null,
    sorSystem: 'LifeCad',
    sourceSystem: 'ZLCM',
    channel: 'MAIL',
    carrierId: null,
    planCode: null,
    policyNumber: null,
    policyStatus: null,
    documentDate: null,
    type: 'Document.Created',
    transactionType: 'Initial Death Claim'
};

export const DEFAULT_PHONE = {
    action: ClaimActionTypes.NONE,
    phoneType: PhoneType.HOME,
    countryCode: '1',
    dialNumber: '',
    areaCode: ''
};

export const DEFAULT_PARTY = {
    partyId: '',
    //partyRoleId: '',
    //partyRole: '',
    //partyType: '',
    prefix: '',
    suffix: null,
    firstName: '',
    middleName: '',
    lastName: '',
    fullName: '',
    gender: '',
    dateOfBirth: '',
    relationshipToInsured: ''
};

export const DEFAULT_NOTIFIER_PARTY = {
    notifierRole: '',
    dateOfNotification: dayjs().format(ZAHARA_DATE_FORMAT),
    isPrimaryBeneInfoOnFile: false,
    party: {
        ...DEFAULT_PARTY,
        phone: {
            ...DEFAULT_PHONE
        }
    }
};

export const DEFAULT_EMAIL = {
    action: ClaimActionTypes.NONE,
    emailType: EmailType.PERSONAL,
    emailAddress: null,
    emailId: null,
}