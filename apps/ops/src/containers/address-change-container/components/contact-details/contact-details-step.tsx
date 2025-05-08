import { AssistiveText, AssistiveTextVariant } from '@zinnia/bloom/components';
import { countries } from 'countries-list';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import AddressEntry from '@deps/components/otp-withdrawal-form/address-entry';
import TransactionNavigationButtons, { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';

import VerifyAddress from './address-validator';
import { formatAddress, validateContractStep } from './contact-details.helpers';
import { ContactDetailsProps, ContactTypes } from './contact-details.types';
import PhoneNumber from './phone-number';
import { useAddressChange } from '../../address-change-provider';

export const ContactDetailsStep = ({ policy }: ContactDetailsProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'addressChange.contactDetails' });
    const { goToNext } = useWorkflow();
    const { formErrors, setFormErrors, phone, setPhone, address, setAddress, setFormData, formData, submitSuccess } = useAddressChange();
    const [country, setCountry] = useState('US' as keyof typeof countries);
    const carrierId = policy?.carrierId || '';
    const [enteredAddress, setEnteredAddress] = useState<any>();

    const handleContinue = useCallback(() => {
        const formErrors = validateContractStep(address, formData, phone, t, formData.isValidAddress, formData.selectedId);
        if (Object.keys(formErrors).length > 0) {
            setFormErrors(formErrors);
        } else {
            setFormErrors({});
            goToNext();
        }
    }, [goToNext, address, phone, formData, t]);

    useEffect(() => {
        if (address) {
            const userEnteredAddress = formatAddress(address);
            setEnteredAddress({
                Address: [userEnteredAddress],
            });
        }
    }, [address]);

    const contactTypes = [
        {
            label: t('fieldLabels.address'),
            value: ContactTypes.Address,
            isChecked: formData.isAddressChangeRequire,
        },
        {
            label: t('fieldLabels.phone'),
            value: ContactTypes.Phone,
            isChecked: formData.isPhoneChangeRequire,
        },
    ];

    const toggleContactSelection = (value: ContactTypes) => {
        if (value === ContactTypes.Address) {
            setFormData((prevState: any) => ({ ...prevState, isAddressChangeRequire: !prevState.isAddressChangeRequire }));
        }
        if (value === ContactTypes.Phone) {
            setFormData((prevState: any) => ({ ...prevState, isPhoneChangeRequire: !prevState.isPhoneChangeRequire }));
        }
    };

    const setIsValidAddress = (value: boolean | null) => {
        setFormData((prevState: any) => ({ ...prevState, isValidAddress: value }));
    };

    const setAddresessData = (key: string, data: any) => {
        setFormData((prevState: any) => ({ ...prevState, addresses: { ...prevState.addresses, [key]: data } }));
    };

    const setSelectedId = (value: string | undefined) => {
        setFormData((prevState: any) => ({ ...prevState, selectedId: value }));
    };

    return (
        <WorkflowCard
            title={t('label')}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleContinue}
                    parentPage={ParentPage.CreateCase}
                    planCode={policy.product?.planCode}
                    policyNumber={policy.policyNumber}
                    leaveTransactionLink="/create-case"
                    disableContinue={submitSuccess}
                />
            }
        >
            <div className="flex flex-col gap-10">
                <div className="flex flex-col gap-4">
                    <Typography variant={TypographyVariant.LabelLg}>{t('title')}</Typography>
                    <div className="flex flex-col gap-4">
                        {contactTypes.map(({ label, value, isChecked }) => {
                            return (
                                <CheckboxText
                                    key={`contact-type-${value}`}
                                    label={label}
                                    checked={isChecked}
                                    onChange={() => toggleContactSelection(value)}
                                />
                            );
                        })}
                    </div>
                </div>
                {formData.isAddressChangeRequire && (
                    <>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col">
                                <Typography variant={TypographyVariant.LabelLg}>{t('address.title')}</Typography>
                            </div>
                            <div className={'col-span-4'}>
                                <AddressEntry
                                    onDataChange={val => setAddress(val)}
                                    initialAddress={address}
                                    isPayeeAddress={true}
                                    showAddressLines={true}
                                    errors={{
                                        addressLine1: formErrors['addressLine1'],
                                        city: formErrors['city'],
                                        state: formErrors['state'],
                                        zip: formErrors['zip'],
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <VerifyAddress
                                clientCode={carrierId}
                                address={enteredAddress}
                                isValidAddress={formData.isValidAddress}
                                setIsValidAddress={setIsValidAddress}
                                selectedId={formData.selectedId}
                                addresses={formData.addresses}
                                setAddresses={setAddresessData}
                                setSelectedId={setSelectedId}
                            />
                        </div>
                    </>
                )}

                {formData.isPhoneChangeRequire && (
                    <div className="flex flex-col gap-4">
                        <PhoneNumber country={country} phone={phone} setCountry={setCountry} setPhone={setPhone} />
                    </div>
                )}
                {formErrors.contactSelection ? (
                    <AssistiveText text={formErrors.contactSelection} variant={AssistiveTextVariant.Error} className="mt-2" />
                ) : null}
                {formErrors.noSelection ? (
                    <AssistiveText text={formErrors.noSelection} variant={AssistiveTextVariant.Error} className="mt-2" />
                ) : null}
            </div>
        </WorkflowCard>
    );
};
