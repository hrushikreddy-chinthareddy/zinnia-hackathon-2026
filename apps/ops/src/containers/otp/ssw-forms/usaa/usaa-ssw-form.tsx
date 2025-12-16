import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import AmountDetails from '@deps/components/otp-withdrawal-form/amount-details';
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
import { Carrier } from '@deps/models/case/withdrawal/case';
import { isAllowedStateSSW } from '@deps/utils/renderStateW4';

import SswEditSelection from '../ssw-edit-selection';
import getUsaaConfig from './usaa-ssw-form-helpers';

export function UsaaSSWForm() {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });

    const {
        formValidation,
        formPartyConfigs,
        irsSignatureConfig,
        w4pSignaturesConfig,
        disbursementOptions,
        signaturesConfig,
        fundWithdrawnMethodOptions,
        systematicWithdrawalOptions,
        eSignatureFieldConfig,
    } = getUsaaConfig(t);
    const {
        setFormValidator,
        formData,
        setFormData,
        initialForm,
        isFormStateReadOnly,
        ownerStateOfResidence,
        formParty,
        setOwnerStateOfResidence,
        formESignatureData,
        setFormESignatureData,
        formErrors,
    } = useContext(FormDataContext);

    useEffect(() => {
        setFormValidator(() => formValidation);

        setFormData({
            ...formData,
            formExtName: `${
                initialForm?.carrier || Carrier.USAA
            }_SSW_DIGITAL_FORM`,
            metaData: {
                formType: `${
                    initialForm?.carrier || Carrier.USAA
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
            />
            <FormDistribution
                isFormStateReadOnly={isFormStateReadOnly}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={
                    t(
                        'distributionInstruction.investmentSelectionForDistribution'
                    ) as string
                }
            />
            <TaxWithholdings isFormStateReadOnly={isFormStateReadOnly} />
            {shouldStateW4pRender && (
                <StateW4Form
                    isFormStateReadOnly={isFormStateReadOnly}
                    w4pSignaturesConfig={w4pSignaturesConfig}
                />
            )}
            <IrsWithholding
                isFormStateReadOnly={isFormStateReadOnly}
                signatureFields={irsSignatureConfig}
            />
            <FormDisbursement
                isFormStateReadOnly={isFormStateReadOnly}
                options={disbursementOptions}
            />

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
