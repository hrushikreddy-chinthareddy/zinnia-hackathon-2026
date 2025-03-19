import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import CardContainer from '@deps/containers/card-container/card-container';
import { PartyRoles } from '@deps/containers/otp/reg60-forms/reg60.types';
import { numberFormat } from '@deps/containers/otp/reg60-forms/utils/reg60-constants';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import { Address, AmountType, maritalStatusType, SignatureWithdrawal } from '@deps/models/case/withdrawal/case';

import IncomeDisclosure from './income-disclosure';
import { maritalStatusOptions, w4pPeriodicPaymentDefault } from './w4p-tax-form.helper';
import CheckboxText from '../checkbox/checkbox-text/checkbox-text';
import Field, { FieldSize, FieldType, FieldVariant } from '../fields/field';
import AddressEntry, { DEFAULT_ADDRESS } from '../otp-withdrawal-form/address-entry';
import FormProgramMaritalStatus from '../otp-withdrawal-form/form-irsData/form-program-marital-status';
import { MaritalStatusAllowances } from '../otp-withdrawal-form/maritial-status-allowance-withholdings';
import SignatureValidation, { SignatureValidationField } from '../otp-withdrawal-form/signature-validation/signature-validation';
import { getDefaultSignature } from '../otp-withdrawal-form/signature-validation/signature-validations';
import Typography, { TypographyVariant } from '../typography/typography';

interface W4pTaxFormProps {
    isFormStateReadOnly: boolean;
    w4pSignaturesConfig: SignatureValidationField[];
}

const W4pTaxForm = ({ isFormStateReadOnly, w4pSignaturesConfig }: W4pTaxFormProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request.w4pPeriodicPayment' });
    const { formSignature, formErrors, formPeriodicPension, setFormPeriodicPension } = useContext(FormDataContext);
    const [isW4pChecked, setIsW4pChecked] = useState<boolean>(false);

    const handleFormPeriodicPensionChange = (key: string, value: any) => {
        setFormPeriodicPension((prev: any) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleMaritialStatusChange = (selected: maritalStatusType) => {
        handleFormPeriodicPensionChange('maritalStatus', { text: selected });
    };

    const handleAddressChange = (addr: Address) => {
        handleFormPeriodicPensionChange('address', addr);
    };

    const handleIncomeDisclosureChange = (key: string, value: string) => {
        handleFormPeriodicPensionChange(key, { text: value, amountType: AmountType.Dollar });
    };

    const handleSignatureChange = (signature: SignatureWithdrawal) => {
        handleFormPeriodicPensionChange('signature', signature);
    };

    useEffect(() => {
        !isW4pChecked && setFormPeriodicPension(null);

        if (isW4pChecked && !formPeriodicPension) {
            setFormPeriodicPension(w4pPeriodicPaymentDefault);
        }
    }, [isW4pChecked]);
    return (
        <CardContainer containerClassNames="border-b-2 border-gray-100" classNames="w-full">
            <div className="flex-1 mt-5">
                <CheckboxText
                    label={t('title')}
                    checked={isW4pChecked}
                    onChange={() => setIsW4pChecked(!isW4pChecked)}
                    isDisabled={isFormStateReadOnly}
                />
            </div>

            {isW4pChecked && (
                <div className={`my-4 flex flex-col gap-4 md:grid md:grid-cols-2 md:grid-rows-2 lg:grid-cols-auto-4 lg:grid-rows-1`}>
                    <AddressEntry
                        errors={{
                            addressLine1: formErrors[`addressLine1${PartyRoles.OWNER}`],
                            city: formErrors[`city${PartyRoles.OWNER}`],
                            state: formErrors[`state${PartyRoles.OWNER}`],
                            zip: formErrors[`zip${PartyRoles.OWNER}`],
                            ssn: formErrors[`ssn${PartyRoles.OWNER}`],
                        }}
                        onDataChange={handleAddressChange}
                        initialAddress={formPeriodicPension?.address || DEFAULT_ADDRESS}
                        className="col-span-4 max-w-lg"
                        isFormStateReadOnly={isFormStateReadOnly}
                    />
                    <div className="grid grid-cols-4 gap-2">
                        <Field
                            formatOptions={numberFormat}
                            label={t('ssn') as string}
                            onChange={e =>
                                setFormPeriodicPension((prev: any) => ({
                                    ...prev,
                                    ssn: e.target.value,
                                }))
                            }
                            size={FieldSize.Small}
                            type={FieldType.BaseActive}
                            value={formPeriodicPension?.ssn as string}
                            name="ssn"
                            variant={isFormStateReadOnly ? FieldVariant.Inactive : FieldVariant.Default}
                        />
                    </div>
                    <div className="col-span-4 mt-4">
                        <FormProgramMaritalStatus
                            options={maritalStatusOptions(t)}
                            selected={formPeriodicPension?.maritalStatus?.text as MaritalStatusAllowances}
                            setSelected={handleMaritialStatusChange}
                            isFormStateReadOnly={isFormStateReadOnly}
                        />
                    </div>
                    <IncomeDisclosure
                        isFormStateReadOnly={false}
                        formPeriodicPension={formPeriodicPension ?? w4pPeriodicPaymentDefault}
                        onDataChange={handleIncomeDisclosureChange}
                    />
                    <div className="col-span-4 mt-4">
                        <Typography variant={TypographyVariant.H3} className="mb-4">
                            {t('signatureValidation')}
                        </Typography>
                        <SignatureValidation
                            className="flex flex-col gap-4 md:grid  lg:grid-cols-4 lg:grid-rows-1"
                            key={`sig-val-owner`}
                            fields={w4pSignaturesConfig}
                            onDataChange={handleSignatureChange}
                            sigProp={
                                formSignature?.signatures.find(val => val.signType?.text === SignatureValidationTypeWithdrawal.Owner) ||
                                getDefaultSignature(SignatureValidationTypeWithdrawal.Owner)
                            }
                            isFormStateReadOnly={isFormStateReadOnly}
                        />
                    </div>
                </div>
            )}
        </CardContainer>
    );
};

export default W4pTaxForm;
