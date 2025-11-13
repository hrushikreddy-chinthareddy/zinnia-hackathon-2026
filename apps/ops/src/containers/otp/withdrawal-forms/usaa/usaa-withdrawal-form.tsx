import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import AmountDetails from '@deps/components/otp-withdrawal-form/amount-details';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import FormDisbursementV2 from '@deps/components/otp-withdrawal-form/form-disbursement-V2/form-disbursement-v2';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import FormProgramPartialWithdrawal from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import DistributionReason from '@deps/components/otp-withdrawal-form/form-restriction/distribution-reason';
import IrsWithholding from '@deps/components/otp-withdrawal-form/irs-withholdings';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helpers';
import { Carrier } from '@deps/models/case/withdrawal/case';

import getUsaaConfig from './usaa-withdrawal-form-helpers';

export default function UsaaWithdrawalForm() {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });
    const {
        identifySelectedFormProgramOption,
        formValidation,
        irsSignatureConfig,
        fundWithdrawnMethodOptions,
        signaturesConfig,
        disbursementOptions,
        formPartyConfigs,
        selectOneOptions,
        eSignatureFieldConfig,
        reasonOptions,
        surrenderingInstructionsOptions,
    } = getUsaaConfig(t);

    const {
        formSubtype,
        formParty,
        setFormData,
        formData,
        initialForm,
        setFormValidator,
        ownerStateOfResidence,
        setOwnerStateOfResidence,
        isFormStateReadOnly,
        formESignatureData,
        setFormESignatureData,
        formErrors,
    } = useContext(FormDataContext);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, []);

    useEffect(() => {
        setFormData({
            ...formData,
            formExtName: `${
                initialForm?.carrier || Carrier.USAA
            }_REDEMPTION_DIGITAL_FORM`,
            metaData: {
                formType: `${
                    initialForm?.carrier || Carrier.USAA
                }_REDEMPTION_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
    }, [formSubtype]);

    useEffect(() => {
        const newOwnerStateOfResidence = getOwnerStateOfResidence(formParty);
        if (newOwnerStateOfResidence !== ownerStateOfResidence) {
            setOwnerStateOfResidence(newOwnerStateOfResidence);
        }
    }, [formParty]);

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormParties
                isFormStateReadOnly={isFormStateReadOnly}
                configs={formPartyConfigs}
            />
            <AmountDetails
                isFormStateReadOnly={isFormStateReadOnly}
                isOnlyWithdrawalTypeControls={true}
            />
            <FormProgramPartialWithdrawal
                isFormStateReadOnly={isFormStateReadOnly}
                options={surrenderingInstructionsOptions}
                title={
                    t('amountDetails.surrenderingInstructions.title') as string
                }
                selectionIdentifier={identifySelectedFormProgramOption}
                selectOneOptions={selectOneOptions}
            />
            <DistributionReason
                reasonOptions={reasonOptions}
                isFormStateReadOnly={isFormStateReadOnly}
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
            <TaxWithholdings
                isFormStateReadOnly={isFormStateReadOnly}
                ownerStateOfResidence={ownerStateOfResidence}
            />
            <IrsWithholding
                isFormStateReadOnly={isFormStateReadOnly}
                signatureFields={irsSignatureConfig}
            />
            <FormDisbursementV2
                isFormStateReadOnly={isFormStateReadOnly}
                options={disbursementOptions as any}
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
