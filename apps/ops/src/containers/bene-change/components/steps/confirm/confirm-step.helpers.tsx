import dayjs from 'dayjs';
import { v4 as uuid4 } from 'uuid';

import { getChannel } from '@deps/containers/address-change-container/utils/address-change-helpers';
import { SignatureState } from '@deps/containers/bene-change/bene-change.types';
import { isNullEmptyOrUndefined, toTitleCase } from '@deps/helpers/string.helpers';
import { SignatureDesignation, SignatureValidationTypeWithdrawal, SignValidated } from '@deps/models/case/renewal/signature-validation';
import { AddressTypes, Carrier, SignatureWithdrawal } from '@deps/models/case/withdrawal/case';
import { Policy, IdentificationType, PhoneType, EmailType, Email, PartyType } from '@deps/models/policy/sor-policy';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import {
    ENTERPRISE_ADDRESS_TYPE,
    EnterpriseAddress,
    getAddresses,
} from '../../beneficiary-details/address-details/address-details.helpers';
import { TrustType } from '../../beneficiary-details/bene-identification/bene-identification.helpers';
import { getPersonalEmails } from '../../beneficiary-details/email-details/email-details.helpers';
import { ENTERPRISE_PHONE_TYPE, EnterprisePhone, getPhones } from '../../beneficiary-details/phone-details/phone-details.helpers';

const DEFAULT_PAYLOAD = {
    businessKey: null,
    correlationid: null,
    onbaseCaseId: null,
    sorSystem: 'LifeCad',
    sourceSystem: 'ONBASE',
    channel: 'MAIL',
    carrierId: null,
    planCode: null,
    policyNumber: null,
    policyStatus: null,
    documentDate: null,
    type: 'reRegProcessRequest',
    transactionType: 'Bene Change',
    isPrimaryBeneInfoOnFile: false,
    isContingentBeneInfoOnFile: false,
    contractInfo: {
        parties: {},
    },
    actionData: [],
    signatureData: {},
};

const toAddressPayload = (address: any) => ({
    addressLine1: address?.addressLine1 || null,
    addressLine2: address?.addressLine2 || null,
    addressLine3: address?.addressLine3 || null,
    addressType: address?.addressType === AddressTypes.DEFAULT ? ENTERPRISE_ADDRESS_TYPE.HOME : ENTERPRISE_ADDRESS_TYPE.DEFAULT,
    city: address?.city || null,
    country: address?.country || 'USA',
    state: address?.state || null,
    zipCode: address?.zip || null,
    zipCodeExtension: address?.zipPlusFour || null,
    startDate: address?.startDate || null,
    endDate: address?.endDate || null,
});

const toPhonePayload = (phone: any, dialNumber: any) => {
    /*if (isNullEmptyOrUndefined(dialNumber)) {
        return [];
    }*/

    if (phone) {
        return [{ ...phone, dialNumber: dialNumber }];
    } else {
        return [
            {
                countryCode: 'US',
                phoneType: ENTERPRISE_PHONE_TYPE.HOME,
                areaCode: null,
                dialNumber: dialNumber,
            },
        ];
    }
};

const getPolicySignatureType = (signType: SignatureValidationTypeWithdrawal) => {
    switch (signType) {
        case SignatureValidationTypeWithdrawal.Owner:
            return 'OWNER';
        case SignatureValidationTypeWithdrawal.JointOwner:
            return 'JOINT_OWNER';
        case SignatureValidationTypeWithdrawal.IrrevocableBeneficiary:
            return 'IRREVOCABLE';
        case SignatureValidationTypeWithdrawal.Spouse:
            return 'SPOUSE';
        case SignatureValidationTypeWithdrawal.Witness:
            return 'WITNESS';
    }
};

export const transformSignatureStateToPayload = (data: SignatureState | null) => {
    if (!data) return {};

    const signature = data.signatures.map((item: SignatureWithdrawal) => ({
        signType: item.signType.text ? getPolicySignatureType(item.signType?.text) : null,
        isSignedPresent: item.isSigned || false,
        signDate: item.signDate.text || null,
        signPrintName: item.signName || null,
        signGurantee: item.signTitle.text === SignatureDesignation.AttorneyInFact ? item?.signGuaranteeStamp?.text : null,
        signDesignation: item.signTitle.text == SignValidated.Unselected ? null : item.signTitle.text || null,
    }));

    return {
        signatures: signature,
        isSpousePresent: data.isSpousePresent ?? null,
        isIrrevocableBene: data.isIrrevocableBene ?? false,
    };
};

const DEFAULT_CONTRACT_ADDRESS = {
    addressLine1: null,
    addressLine2: null,
    addressLine3: null,
    addressType: ENTERPRISE_ADDRESS_TYPE.HOME,
    city: null,
    country: 'USA',
    state: null,
    zipCode: null,
    zipCodeExtension: null,
};

const isEqualObjects = (obj1: any, obj2: any) => {
    const diffInFields = Object.entries(obj2).filter(([field, obj2Value]) => obj1[field] !== obj2Value);
    return diffInFields.length > 0 ? false : true;
};

export const getContractInfo = (ownerInfo: any, policy: Policy) => {
    const parties = ownerInfo?.map((item: any) => {
        // By role find party id for owner information
        const partyRole = policy?.partyRoles?.find(partyItem => partyItem.partyRole === item.partyRoleType.replace('_', ''));

        const party = policy?.parties?.find(partyItem => partyItem.partyId === partyRole?.partyId);

        const phones = party?.phones?.find(partyItem => partyItem.phoneType === PhoneType.HOME);
        const identifications = party?.identifications || [];
        let updatedIdentifications;
        if (item.taxId && policy.carrierId !== Carrier.FLIC) {
            updatedIdentifications = identifications?.map(identification => {
                if (identification.identificationType === IdentificationType.SSN) {
                    return { ...identification, identificationValue: item.taxId };
                }
            });
        } else {
            updatedIdentifications = identifications;
        }

        const formattedAddresses = item.addresses.map((address: any) => {
            const formattedAddress = toAddressPayload(address);
            const isDefault = isEqualObjects(DEFAULT_CONTRACT_ADDRESS, formattedAddress);
            if (!isDefault) {
                return formattedAddress;
            }
        });
        const refinedAddresses = formattedAddresses.filter((element: any) => element);

        const { prefix, firstName, middleName, lastName, suffix } = item;
        const fullName = toTitleCase([prefix, firstName, middleName, lastName, suffix].filter(Boolean).join(' '));

        return {
            partyId: item?.id,
            partyRole: partyRole?.partyRole,
            partyRoleId: partyRole?.partyRoleId,
            firstName: item?.firstName || null,
            middleName: item?.middleName || null,
            lastName: item?.lastName || null,
            fullName: fullName || null,
            prefix: item?.prefix || null,
            dateOfBirth: !isNullEmptyOrUndefined(item?.dob?.text) ? dayjs(item?.dob?.text).format(ZAHARA_API_DATE_FORMAT) : null,
            identifications: updatedIdentifications || [],
            addresses: refinedAddresses || [],
            phones: toPhonePayload(phones, item?.phones?.[0]?.phoneNumber),
            emails: item?.email ? [{ emailType: EmailType.PERSONAL, emailAddress: item?.email || null }] : [],
        };
    });

    return parties;
};

const formatActionRecord = (policy: Policy, item: any, parties: any) => {
    let record;
    const partyId = item?.party?.partyId;
    const party = policy?.parties?.find(partyItem => partyItem.partyId === partyId);

    if (item.action === 'NONE') {
        const identifications = party?.identifications?.find(ids => ids.identificationType === IdentificationType.SSN);
        const selectedParty = parties?.find((selectedItem: any) => selectedItem?.partyRoleIds?.includes(item?.partyRole?.partyRoleId));
        const { emails, addresses, phones, partyType } = selectedParty;
        const currentEmails: Email[] = getPersonalEmails({ emails });
        const currentPhones: EnterprisePhone[] = getPhones({ phones });
        const currentAddresses: EnterpriseAddress[] = getAddresses({ addresses });

        const selectedPartyType = !isNullEmptyOrUndefined(item?.party?.info?.partyType) ? item?.party?.info?.partyType : partyType;
        const { prefix, firstName, middleName, lastName, suffix } = item?.party?.info || {};
        const fullName =
            selectedPartyType === PartyType.INDIVIDUAL
                ? toTitleCase([prefix, firstName, middleName, lastName, suffix].filter(Boolean).join(' '))
                : item?.party?.info?.lastName;

        record = {
            actionType: item.actionType,
            action: item.action,
            partyRole: {
                partyId: item?.partyRole?.partyId || null,
                partyRole: item?.partyRole?.partyRole || null,
                partyRoleId: item?.partyRole?.partyRoleId || null,
                relationshipToInsured: item?.party?.allocation?.relationshipToInsured || null,
            },
            party: {
                partyId: item?.party?.partyId || null,
                partyType: selectedPartyType,
                firstName: item?.party?.info?.firstName || null,
                middleName: item?.party?.info?.middleName || null,
                lastName: item?.party?.info?.lastName || null,
                trustType: selectedPartyType == PartyType.TRUST ? item?.party?.info?.trustType : 'NONE',
                fullName: fullName || null,
                prefix: item?.party?.info?.prefix || null,
                suffix: item?.party?.info?.suffix || null,
                gender: item?.party?.info?.gender || null,
                dateOfBirth: !isNullEmptyOrUndefined(item?.party?.info?.dateOfBirth)
                    ? dayjs(item?.party?.info?.dateOfBirth).format(ZAHARA_API_DATE_FORMAT)
                    : null,
                beneficiaryPercentage: item?.party?.allocation?.beneficiaryPercentage || 0,
                identifications: identifications ? [{ ...identifications }] : [],
                addresses: currentAddresses,
                phones: currentPhones,
                emails: currentEmails,
            },
            isPerStirpes: item?.beneInfo?.isPerStirpes || false,
            isIrrevocable: item?.beneInfo?.isIrrevocable || false,
            isRestrictedBeneficiary: item?.beneInfo?.isRestrictedBeneficiary || false,
        };
    } else if (item.action === 'DELETE') {
        const identifications = party?.identifications?.find(ids => ids.identificationType === IdentificationType.SSN);
        const selectedParty = parties?.find((selectedItem: any) => selectedItem?.partyRoleIds?.includes(item?.partyRole?.partyRoleId));
        const { emails, addresses, phones, partyType } = selectedParty;
        const currentEmails: Email[] = getPersonalEmails({ emails });
        const currentPhones: EnterprisePhone[] = getPhones({ phones });
        const currentAddresses: EnterpriseAddress[] = getAddresses({ addresses });

        const { prefix, firstName, middleName, lastName, suffix } = item?.party?.info || {};
        const selectedPartyType = !isNullEmptyOrUndefined(item?.party?.info?.partyType) ? item?.party?.info?.partyType : partyType;
        const fullName =
            selectedPartyType === PartyType.INDIVIDUAL
                ? toTitleCase([prefix, firstName, middleName, lastName, suffix].filter(Boolean).join(' '))
                : item?.party?.info?.lastName;

        record = {
            actionType: item.actionType,
            action: item.action,
            partyRole: {
                partyId: item?.partyRole?.partyId || null,
                partyRole: item?.partyRole?.partyRole || null,
                partyRoleId: item?.partyRole?.partyRoleId || null,
                relationshipToInsured: item?.partyRole?.relationshipToInsured || null,
            },
            party: {
                partyId: item?.party?.partyId || null,
                partyType: selectedPartyType,
                firstName: item?.party?.info?.firstName || null,
                middleName: item?.party?.info?.middleName || null,
                lastName: item?.party?.info?.lastName || null,
                trustType: selectedPartyType == PartyType.TRUST ? item?.party?.info?.trustType : 'NONE',
                fullName: fullName || null,
                prefix: item?.party?.info?.prefix || null,
                suffix: item?.party?.info?.suffix || null,
                gender: item?.party?.info?.gender || null,
                dateOfBirth: !isNullEmptyOrUndefined(item?.party?.info?.dateOfBirth)
                    ? dayjs(item?.party?.info?.dateOfBirth).format(ZAHARA_API_DATE_FORMAT)
                    : null,
                beneficiaryPercentage: item?.party?.allocation?.beneficiaryPercentage || 0,
                identifications: identifications ? [{ ...identifications }] : [],
                addresses: currentAddresses,
                phones: currentPhones,
                emails: currentEmails,
            },
            isPerStirpes: item?.beneInfo?.isPerStirpes || false,
            isIrrevocable: item?.beneInfo?.isIrrevocable || false,
            isRestrictedBeneficiary: item?.beneInfo?.isRestrictedBeneficiary || false,
        };
    } else if (item.action === 'UPDATE') {
        // at the time of add it will be null
        const identifications = party?.identifications?.find(ids => ids?.identificationType === IdentificationType?.SSN);
        const formattedAddresses = item?.party?.addresses.map((address: any) => {
            return { ...address, country: address?.country === 'US' ? 'USA' : address?.country };
        });
        const formattedPhones = item?.party?.phones;
        /*const formattedPhones = item?.party?.phones.map((phone: any) => {
            return { ...phone, phoneType: 'HP' };
        });*/

        const selectedPartyType = !isNullEmptyOrUndefined(item?.party?.info?.partyType) ? item?.party?.info?.partyType : null;
        const { prefix, firstName, middleName, lastName, suffix } = item?.party.info || {};
        const fullName =
            selectedPartyType === PartyType.INDIVIDUAL
                ? toTitleCase([prefix, firstName, middleName, lastName, suffix].filter(Boolean).join(' '))
                : item?.party?.info?.lastName;

        record = {
            actionType: item.actionType,
            action: item.action,
            partyRole: {
                partyId: item?.partyRole?.partyId || null,
                partyRole: item?.partyRole?.partyRole || null,
                partyRoleId: item?.partyRole?.partyRoleId || null,
                relationshipToInsured: item?.party?.allocation?.relationshipToInsured || null,
            },
            party: {
                partyId: item?.party?.partyId,
                partyType: selectedPartyType || null,
                firstName: item?.party?.info?.firstName || null,
                middleName: item?.party?.info?.middleName || null,
                lastName: item?.party?.info?.lastName || null,
                trustType: selectedPartyType == PartyType.TRUST ? item?.party?.info?.trustType : 'NONE',
                fullName: fullName || '',
                prefix: item?.party?.info?.prefix || null,
                suffix: item?.party?.info?.suffix || null,
                gender: item?.party?.info?.gender || null,
                dateOfBirth: !isNullEmptyOrUndefined(item?.party?.info?.dateOfBirth)
                    ? dayjs(item?.party?.info?.dateOfBirth).format(ZAHARA_API_DATE_FORMAT)
                    : null,
                beneficiaryPercentage: item?.party?.allocation?.beneficiaryPercentage || 0,
                identifications: [{ ...identifications, identificationValue: item?.party?.info?.ssn || '', identificationType: 'SSN' }],
                addresses: formattedAddresses || [],
                emails: item?.party?.emails || [],
                phones: formattedPhones || [],
            },
            isPerStirpes: item?.beneInfo?.isPerStirpes || false,
            isIrrevocable: item?.beneInfo?.isIrrevocable || false,
            isRestrictedBeneficiary: item?.beneInfo?.isRestrictedBeneficiary || false,
        };
    } else if (item.action === 'ADD') {
        const partyRoleInfo = policy?.partyRoles?.find(partyItem => partyItem?.partyRole === item?.partyRole?.partyRole);
        const formattedAddresses = item?.party?.addresses.map((address: any) => {
            return { ...address, country: address?.country === 'US' ? 'USA' : address?.country };
        });
        const formattedPhones = item?.party?.phones;
        /*const formattedPhones = item?.party?.phones.map((phone: any) => {
            return { ...phone, phoneType: 'HP' };
        });*/

        const { prefix, firstName, middleName, lastName, suffix } = item?.party.info || {};
        const fullName =
            item?.party?.info?.partyType == PartyType.INDIVIDUAL
                ? toTitleCase([prefix, firstName, middleName, lastName, suffix].filter(Boolean).join(' '))
                : item?.party?.info?.lastName;

        // for add action party id party role id should be null
        record = {
            actionType: item?.actionType,
            action: item?.action,
            partyRole: {
                partyId: null,
                partyRole: partyRoleInfo?.partyRole || item?.partyRole?.partyRole,
                partyRoleId: null,
                relationshipToInsured: item?.party?.allocation?.relationshipToInsured || null,
            },
            party: {
                partyId: null,
                partyType: item?.party?.info?.partyType || null,
                firstName: item?.party?.info?.firstName || null,
                middleName: item?.party?.info?.middleName || null,
                lastName: item?.party?.info?.lastName || null,
                trustType: item?.party?.info?.trustType ?? TrustType.Individual,
                fullName: fullName || '',
                prefix: item?.party?.info?.prefix || null,
                suffix: item?.party?.info?.suffix || null,
                gender: item?.party?.info?.gender || null,
                dateOfBirth: !isNullEmptyOrUndefined(item?.party?.info?.dateOfBirth)
                    ? dayjs(item?.party?.info?.dateOfBirth).format(ZAHARA_API_DATE_FORMAT)
                    : null,
                beneficiaryPercentage: item?.party?.allocation?.beneficiaryPercentage || 0,
                identifications: [{ identificationValue: item?.party?.info?.ssn || '', identificationType: 'SSN' }],
                addresses: formattedAddresses || [],
                emails: item?.party?.emails || [],
                phones: formattedPhones || [],
            },
            isPerStirpes: item?.beneInfo?.isPerStirpes || false,
            isIrrevocable: item?.beneInfo?.isIrrevocable || false,
            isRestrictedBeneficiary: item?.beneInfo?.isRestrictedBeneficiary || false,
        };
    }
    return record;
};

export const buildReRegRequestBody = ({
    formData,
    beneData,
    ownerInfo,
    signatureData,
    document,
    policy,
    selectedDocument,
    parties,
}: any) => {
    const { policyNumber, policyStatus, product, carrierId } = policy;

    const records = beneData.map((item: any) => formatActionRecord(policy, item, parties));

    let data;
    if (selectedDocument) {
        data = {
            ...DEFAULT_PAYLOAD,
            businessKey: selectedDocument?.documentNumber,
            correlationid: uuid4(),
            onbaseCaseId: selectedDocument?.caseId,
            caseId: formData.caseId,
            documentDate: selectedDocument ? dayjs(selectedDocument?.documentDate).format(ZAHARA_API_DATE_FORMAT) : null,
            carrierId: carrierId,
            planCode: product?.planCode,
            policyNumber: policyNumber,
            policyStatus: policyStatus,
            channel: getChannel(selectedDocument?.documentNumber || ''),
            contractInfo: {
                parties: getContractInfo(ownerInfo, policy),
            },
            actionData: [...records],
            signatureData: transformSignatureStateToPayload(signatureData),
            isPrimaryBeneInfoOnFile: formData.isPrimaryBeneInfoOnFile,
            isContingentBeneInfoOnFile: formData.isContingentBeneInfoOnFile,
        };
    } else {
        data = {
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
            channel: getChannel(document?.documentNumber || ''),
            contractInfo: {
                parties: getContractInfo(ownerInfo, policy),
            },
            actionData: [...records],
            signatureData: transformSignatureStateToPayload(signatureData),
            isPrimaryBeneInfoOnFile: formData.isPrimaryBeneInfoOnFile,
            isContingentBeneInfoOnFile: formData.isContingentBeneInfoOnFile,
        };
    }

    return data;
};
