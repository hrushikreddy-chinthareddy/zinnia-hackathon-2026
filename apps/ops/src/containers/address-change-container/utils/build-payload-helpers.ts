import dayjs from 'dayjs';
import { v4 as uuid4 } from 'uuid';

import { buildFullName } from '@deps/helpers/string.helpers';
import { SignValidated } from '@deps/models/case/renewal/signature-validation';
import { SignatureWithdrawal } from '@deps/models/case/withdrawal/case';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { Party } from '@zinnia/api-types/types/sor';

import { getChannel } from './address-change-helpers';
import {
    AddressChangePayload,
    SignatureState,
} from '../types/address-change-types';

export const transformSignatureStateToPayload = (
    data: SignatureState | null
) => {
    if (!data) return {};

    const signature = data.signatures.map((item: SignatureWithdrawal) => ({
        signType: item.signType.text?.toUpperCase().replace(' ', '_'),
        isSignedPresent: item.isSigned || null,
        signDate: item.signDate.text || null,
        signPrintName: item.signName || null,
        signDesignation:
            item.signTitle.text == SignValidated.Unselected
                ? null
                : item.signTitle.text || null,
    }));

    return {
        signatures: signature,
    };
};

const DEFAULT_PAYLOAD = {
    businessKey: null,
    correlationid: null,
    onbaseCaseId: null,
    caseId: null,
    sorSystem: 'LifeCad',
    sourceSystem: 'ONBASE',
    documentDate: null,
    carrierId: null,
    planCode: null,
    policyNumber: null,
    policyStatus: null,
    channel: 'MAIL',
    type: 'addressChangeProcessRequest',
    transactionType: 'Address Change',
    contractInfo: null,
    actionData: {},
    signatureData: {},
};

const DEFAULT_ACTION = {
    actionType: 'ADDRESS_CHANGE',
    action: 'ADD',
    roleIdentifier: {},
    party: {},
    isPhoneChangeRequire: false,
    isAddressChangeRequire: false,
    applyToRoles: {},
};

const DEFAULT_PARTY: any = {
    partyId: '',
    firstName: null,
    middleName: null,
    lastName: null,
    fullName: null,
    prefix: null,
    suffix: null,
    identifications: [],
    phones: [],
    addresses: [],
};

const transformPartyToPayload = (params: any) => {
    const {
        isPhoneChangeRequire,
        isAddressChangeRequire,
        phone,
        address,
        partyDetails,
    } = params;

    const formattedPartyDetails = partyDetails
        ? toPartyPayload(partyDetails)
        : DEFAULT_PARTY;
    const party = formattedPartyDetails;

    if (isPhoneChangeRequire && phone) {
        party.phones = [{ ...toPhonePayload(phone) }];
    }
    if (isAddressChangeRequire && address) {
        party.addresses = [{ ...toAddressPayload(address) }];
    }

    return party;
};

const toPartyPayload = ({
    firstName,
    middleName,
    lastName,
    suffix,
    prefix,
    identifications,
    partyId,
}: Party) => ({
    partyId: partyId,
    firstName: firstName,
    middleName: middleName,
    lastName: lastName,
    fullName: buildFullName(firstName, middleName, lastName, suffix),
    prefix: prefix,
    suffix: suffix,
    identifications: identifications,
});

const toAddressPayload = (address: any) => ({
    addressLine1: address?.addressLine1 || null,
    addressLine2: address?.addressLine2 || null,
    addressLine3: address?.addressLine3 || null,
    addressType: 'H',
    city: address?.city || null,
    country: 'USA',
    state: address?.state || null,
    zipCode: address?.zipCode || null,
    zipCodeExtension: address?.zipCodeExtension || null,
});

const toPhonePayload = (phone: any) => ({
    countryCode: phone.countryCode,
    phoneType: 'HP',
    areaCode: phone.areaCode,
    dialNumber: phone.dialNumber,
});

export const buildAddressChangeRequestBody = ({
    applyToRoles,
    signatureData,
    formData,
    document,
    policy,
    phone,
    roleIdentifier,
    selectedDocument,
}: AddressChangePayload) => {
    const { policyNumber, policyStatus, product, carrierId, parties } = policy;

    const addresses = [
        { ...formData.addresses['entered'] },
        { ...formData.addresses['validated'] },
    ];
    const newAddress = addresses.find(
        (a) => a.addressId === formData.selectedId
    );

    const partyDetails = parties?.find(
        (party) => party.partyId === roleIdentifier.partyId
    );
    const party = transformPartyToPayload({
        partyId: partyDetails?.partyId,
        isPhoneChangeRequire: formData.isPhoneChangeRequire,
        isAddressChangeRequire: formData.isAddressChangeRequire,
        phone,
        address: newAddress,
        partyDetails,
    });

    let data;
    if (selectedDocument) {
        data = {
            ...DEFAULT_PAYLOAD,
            businessKey: selectedDocument?.documentNumber,
            correlationid: uuid4(),
            onbaseCaseId: selectedDocument?.caseId,
            caseId: formData.caseId,
            documentDate: selectedDocument
                ? dayjs(selectedDocument?.documentDate).format(
                      ZAHARA_API_DATE_FORMAT
                  )
                : null,
            carrierId: carrierId,
            planCode: product?.planCode,
            policyNumber: policyNumber,
            policyStatus: policyStatus,
            channel: getChannel(selectedDocument?.documentNumber || ''),
            actionData: [
                {
                    ...DEFAULT_ACTION,
                    roleIdentifier,
                    party: party,
                    isPhoneChangeRequire: formData.isPhoneChangeRequire,
                    isAddressChangeRequire: formData.isAddressChangeRequire,
                    applyToRoles: applyToRoles,
                },
            ],
            signatureData: transformSignatureStateToPayload(signatureData),
        };
    } else {
        data = {
            ...DEFAULT_PAYLOAD,
            businessKey: document?.documentNumber,
            correlationid: uuid4(),
            onbaseCaseId: document?.caseId,
            caseId: null,
            documentDate: document
                ? dayjs(document?.documentDate).format(ZAHARA_API_DATE_FORMAT)
                : null,
            carrierId: carrierId,
            planCode: product?.planCode,
            policyNumber: policyNumber,
            policyStatus: policyStatus,
            channel: getChannel(document?.documentNumber || ''),
            actionData: [
                {
                    ...DEFAULT_ACTION,
                    roleIdentifier,
                    party: party,
                    isPhoneChangeRequire: formData.isPhoneChangeRequire,
                    isAddressChangeRequire: formData.isAddressChangeRequire,
                    applyToRoles: applyToRoles,
                },
            ],
            signatureData: transformSignatureStateToPayload(signatureData),
        };
    }

    return data;
};
