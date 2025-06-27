import { Address, AddressType, State } from '@zinnia/api-types/types/sor';
import { TFunction } from 'i18next';
import { useCallback, useState } from 'react';

import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { validateAddress } from '@deps/queries/api/validation';

import { PolicyAddress } from './contact-details.types';

export const useVerifyAddress = (
    clientCode: string,
    address: Address
): [boolean, () => void, any] => {
    const [loading, setLoading] = useState(false);
    const [verifiedAddress, setVerifiedAddress] = useState<null>(null);
    const getVerifiedAddress = useCallback(async () => {
        if (loading) return;

        try {
            setLoading(true);

            const response = await validateAddress(clientCode, address);
            if (response?.[0]) {
                setVerifiedAddress(response?.[0]);
            }
            setLoading(false);
        } catch (e) {
            console.error('useVerifyAddress::error validating address', e);
            setLoading(false);
        }
    }, [verifiedAddress, loading, clientCode, address]);

    return [loading, getVerifiedAddress, verifiedAddress];
};

export const generateId = () => {
    const uuid = Math.floor(Math.random() * (10 - 1 + 1) + 1);
    return uuid;
};

export const formatAddress = (address: any): PolicyAddress => {
    return {
        ID: generateId(),
        AddressLine1: address.addressLine1 || '',
        AddressLine2: address.addressLine2 || '',
        AddressLine3: address.addressLine3 || '',
        City: address.city || '',
        State: address.state as State,
        Zip: address.zip || '',
        ZipPlusFour: address.zipPlusFour || '',
    };
};

export const getAddressCardDetails = (address: any, id: number) => {
    const formattedAddress = {
        addressId: id,
        addressType: AddressType.RESIDENCE,
        addressLine1: address?.AddressLine1?.toUpperCase() || '',
        addressLine2: address?.AddressLine2?.toUpperCase() || '',
        addressLine3: address?.AddressLine3?.toUpperCase() || '',
        city: address?.City?.toUpperCase() || '',
        state: address?.State?.toUpperCase() || '',
        zipCode: address?.Zip || '',
        zipCodeExtension: address?.ZipPlusFour || '',
        country: address?.Country?.toUpperCase() || '',
    };
    return formattedAddress;
};

export const validateAddressFields = (
    address: any,
    t: TFunction,
    isValidAddress: boolean,
    selectAddress: any
) => {
    const errors = {} as FormValidationErrors;

    if (!address.AddressLine1 && !address.addressLine1) {
        errors['addressLine1'] = t(
            'formErrors.formValidation.addressLine1IsRequired'
        );
    }
    if (!address.city && !address.City) {
        errors['city'] = t('formErrors.formValidation.cityIsRequired');
    }
    if (!address.state && !address.State) {
        errors['state'] = t('formErrors.formValidation.stateIsRequired');
    }
    if (!address.zip && !address.Zip) {
        errors['zip'] = t('formErrors.formValidation.zipIsRequired');
    }
    if (isValidAddress === null) {
        errors['isValid'] = t('formErrors.formValidation.verifyAddress');
    }
    if (!selectAddress) {
        errors['noSelection'] = t(
            'formErrors.formValidation.noAddressSelection'
        );
    }
    return errors;
};

const validatePhoneNumber = (phone: any, t: TFunction) => {
    const errors = {} as FormValidationErrors;
    const { areaCode, dialNumber } = phone;
    const phoneNumber = `${areaCode}${dialNumber}`;
    const phoneRegex = /^\d{10}$/;

    if (!areaCode) {
        errors['phoneNumber'] = t('formErrors.formValidation.phoneIsMissing');
    } else if (!phoneRegex.test(phoneNumber)) {
        errors['phoneNumber'] = t('formErrors.formValidation.phoneIsInvalid');
    }
    return errors;
};

export const validateContractStep = (
    address: any,
    contactSelection: any,
    phone: any,
    t: TFunction,
    isValidAddress: boolean,
    selectAddress: any
) => {
    let errors = {} as FormValidationErrors;

    if (contactSelection.isAddressChangeRequire) {
        const addressErrors = validateAddressFields(
            address,
            t,
            isValidAddress,
            selectAddress
        );
        errors = {
            ...errors,
            ...addressErrors,
        };
    }
    if (contactSelection.isPhoneChangeRequire) {
        const phoneErrors = validatePhoneNumber(phone, t);
        errors = {
            ...errors,
            ...phoneErrors,
        };
    }
    return errors;
};
