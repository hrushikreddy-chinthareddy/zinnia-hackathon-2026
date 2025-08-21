import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import AmountDetails from '@deps/components/otp-withdrawal-form/amount-details';
import CslnCheck from '@deps/components/otp-withdrawal-form/csln-check';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import IrsWithholding from '@deps/components/otp-withdrawal-form/irs-withholdings';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import SystematicWithdrawalProgram from '@deps/components/otp-withdrawal-form/ssw-program/ssw-program';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helpers';
import {
    Carrier,
    FASTQualTypes,
    Frequency,
    FundWithdrawnMethod,
    PaymentMethod,
    QualTypes,
} from '@deps/models/case/withdrawal/case';
import { isAllowedStateSSW } from '@deps/utils/renderStateW4';

import getFlicConfig from './flic-ssw-form-helpers';
import SswEditSelection from '../ssw-edit-selection';

type SswFormProps = {
    qualType: QualTypes | FASTQualTypes | '';
    productLine?: string;
};

export function FlicSSWForm({ qualType, productLine = '' }: SswFormProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });
    const [sswProgramFrequency, setSswProgramFrequency] = useState(
        '' as Frequency
    );

    const {
        formValidation,
        w4pSignaturesConfig,
        formPartyConfigs,
        fundWithdrawnMethodOptions,
        systematicWithdrawalOptions,
        irsSignatureConfig,
        disbursementOptions,
        signaturesConfig,
        cslnCheckStates,
        eSignatureFieldConfig,
        productLineOptions,
    } = getFlicConfig(t);
    const {
        formParty,
        setFormValidator,
        formData,
        setFormData,
        initialForm,
        isFormStateReadOnly,
        setFormDisbursement,
        ownerStateOfResidence,
        contractIssueState,
        setOwnerStateOfResidence,
        formProgram,
        formESignatureData,
        setFormESignatureData,
        formErrors,
    } = useContext(FormDataContext);

    useEffect(() => {
        setFormValidator(() => formValidation);

        setFormData({
            ...formData,
            formExtName: `${
                initialForm?.carrier || Carrier.FLIC
            }_SSW_DIGITAL_FORM`, //get client code & withdrawal type from index
            metaData: {
                formType: `${
                    initialForm?.carrier || Carrier.FLIC
                }_SSW_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
    }, []);

    useEffect(() => {
        const newOwnerStateOfResidence = getOwnerStateOfResidence(formParty);
        if (newOwnerStateOfResidence !== ownerStateOfResidence) {
            setOwnerStateOfResidence(newOwnerStateOfResidence);
        }
    }, [formParty]);

    const handleSswProgramFrequency = (frequency: Frequency) => {
        setFormDisbursement((ogFormDisbusement) => ({
            ...ogFormDisbusement,
            paymentMethod: {
                text:
                    frequency === Frequency.Monthly
                        ? PaymentMethod.EFT
                        : ogFormDisbusement?.paymentMethod?.text,
            },
        }));
        setSswProgramFrequency(frequency);
    };
    const shouldStateW4pRender = isAllowedStateSSW(ownerStateOfResidence ?? '');
    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <SswEditSelection />
            <FormParties
                isFormStateReadOnly={isFormStateReadOnly}
                configs={formPartyConfigs}
            />
            <AmountDetails
                isFormStateReadOnly={isFormStateReadOnly}
                isOnlyWithdrawalTypeControls={true}
            />
            <SystematicWithdrawalProgram
                isReadOnly={isFormStateReadOnly}
                options={systematicWithdrawalOptions}
                onSswProgramFrequencyChange={handleSswProgramFrequency}
                glwbApplicable={true}
            />
            <FormDistribution
                isDerivedMethodFromFunds={true}
                isFormStateReadOnly={isFormStateReadOnly}
                defaultMethod={FundWithdrawnMethod.Prorata}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions(
                    formProgram?.programSubType?.text || ''
                )}
                title={
                    t(
                        'distributionInstruction.investmentSelectionForDistribution'
                    ) as string
                }
            />
            <TaxWithholdings
                isFormStateReadOnly={isFormStateReadOnly}
                ownerStateOfResidence={ownerStateOfResidence}
            />
            <IrsWithholding
                isFormStateReadOnly={isFormStateReadOnly}
                signatureFields={irsSignatureConfig}
            />
            {shouldStateW4pRender && (
                <StateW4Form
                    isFormStateReadOnly={isFormStateReadOnly}
                    w4pSignaturesConfig={w4pSignaturesConfig}
                />
            )}
            <FormDisbursement
                isFormStateReadOnly={isFormStateReadOnly}
                options={disbursementOptions(sswProgramFrequency, qualType)}
                defaultValue={
                    sswProgramFrequency === Frequency.Monthly
                        ? PaymentMethod.EFT
                        : ('' as PaymentMethod)
                }
                key={sswProgramFrequency}
            />
            {(ownerStateOfResidence || contractIssueState) &&
                [ownerStateOfResidence, contractIssueState].some(
                    (state) => state && cslnCheckStates.includes(state)
                ) &&
                productLineOptions.includes(productLine) && (
                    <CslnCheck isFormStateReadOnly={isFormStateReadOnly} />
                )}
            <SignatureValidations
                isFormStateReadOnly={isFormStateReadOnly}
                config={signaturesConfig}
            />
            <ESignatureValidation
                isFormStateReadOnly={isFormStateReadOnly}
                formESignatureData={
                    formESignatureData || ({} as FormEsignatureData)
                }
                setFormESignatureData={setFormESignatureData}
                fieldConfig={eSignatureFieldConfig}
                formErrors={formErrors}
            />
        </>
    );
}
