import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';

import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import Field, { FieldSize, FieldType } from '@deps/components/fields/field';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import AddressEntry from '@deps/components/otp-withdrawal-form/address-entry';
import { selectVarientByConfig } from '@deps/components/otp-withdrawal-form/form-party/form-party';
import VerifyAddress from '@deps/containers/address-change-container/components/contact-details/address-validator';
import { formatAddress } from '@deps/containers/address-change-container/components/contact-details/contact-details.helper';
import CardContainer from '@deps/containers/card-container/card-container';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

type DifferentAddressProps = {
    carrierId: string;
    handleClose: (selectedAddress: any) => void;
};

const DifferentAddress = ({ carrierId, handleClose }: DifferentAddressProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'sendDocument' });

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [enteredAddress, setEnteredAddress] = useState<any>();
    const [isValidAddress, setIsValidAddress] = useState<boolean | null>(null);
    const [selectedId, setSelectedId] = useState<string | undefined>('');
    const [addresses, setAddressesData] = useState<any | null>({ entered: {}, validated: {} });
    const [addressValidator, setAddressValidator] = useState<FormValidationErrors>();
    const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
    function formatAndSetEnteredAddress(address: any): void {
        const userEnteredAddress = formatAddress(address);

        setEnteredAddress({
            Address: [userEnteredAddress],
        });
    }

    function handleSetAddresses(key: string, data: any): void {
        setAddressesData((prevState: any) => ({ ...prevState, [key]: data }));
    }

    const validateAddress = () => {
        const errors: FormValidationErrors = {};
        if (!firstName) {
            errors['firstName'] = t('errors.firstName');
        }
        if (!lastName) {
            errors['lastName'] = t('errors.lastName');
        }
        if (!selectedId) {
            errors['address'] = t('errors.address');
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    function handleContinue() {
        if (validateAddress()) {
            const mergeAddress = [{ ...addresses['entered'] }, { ...addresses['validated'] }];
            const newAddress = mergeAddress.find(a => a.addressId === selectedId);
            handleClose({ ...newAddress, firstName, lastName });
        }
    }

    function handleCancelClick(event: any) {
        event.preventDefault();
        handleClose({});
    }

    return (
        <CardContainer classNames={'w-full'} containerClassNames="w-full content-divider">
            <div className="grid w-full grid-cols-2 gap-4">
                <Field
                    label={t(`correspondence.mailDetails.firstName`) as string}
                    onChange={e => setFirstName(e.target.value)}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={firstName}
                    message={formErrors?.firstName}
                    variant={selectVarientByConfig({ value: firstName, isFormStateReadOnly: false, error: formErrors?.name })}
                />
                <Field
                    label={t(`correspondence.mailDetails.lastName`) as string}
                    onChange={e => setLastName(e.target.value)}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={lastName}
                    message={formErrors?.lastName}
                    variant={selectVarientByConfig({ value: lastName, isFormStateReadOnly: false, error: formErrors?.name })}
                />
            </div>

            <div className="col-span-4 py-4">
                <AddressEntry
                    isPayeeAddress={true}
                    showAddressLines={true}
                    onDataChange={formatAndSetEnteredAddress}
                    errors={addressValidator}
                />
            </div>
            <div className="flex flex-col gap-4">
                <VerifyAddress
                    clientCode={carrierId}
                    address={enteredAddress}
                    isValidAddress={isValidAddress}
                    setIsValidAddress={setIsValidAddress}
                    selectedId={selectedId}
                    addresses={addresses}
                    setAddresses={handleSetAddresses}
                    setSelectedId={setSelectedId}
                    setAddressValidator={setAddressValidator}
                    isAddressValidationRequired={true}
                />
            </div>
            {formErrors?.address && <AssistiveText text={formErrors?.address} variant={AssistiveTextVariant.Error} className="my-4" />}

            <div className="mt-4 flex ">
                <Button className="mr-4" onClick={handleContinue} size={ButtonSize.Small} type={ButtonType.Primary}>
                    {t('formActions.continue')}
                </Button>
                <NavElement
                    aria-label={t('cancel') as string}
                    onClick={handleCancelClick}
                    size={NavElementSize.Small}
                    type={NavElementType.Button}
                    variant={NavElementVariant.Default}
                >
                    {t('formActions.cancel')}
                </NavElement>
            </div>
        </CardContainer>
    );
};

export default DifferentAddress;
