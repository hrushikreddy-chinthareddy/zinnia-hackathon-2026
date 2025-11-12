import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import CedingCompanyDistribution from '@deps/components/otp-withdrawal-form/ceding-company-distribution';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import FormProgramPartialWithdrawal from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helpers';
import { Carrier } from '@deps/models/case/withdrawal/case';

import getUsaaOftConfig from './usaa-oft-form-helpers';

export default function UsaaOftWithdrawalForm() {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });
    const {
        signaturesConfig,
        formPartyConfigs,
        formValidation,
        disbursementOptions,
        surrenderingInstructionsOptions,
        identifySelectedFormProgramOption,
        selectOneOptions,
        defaultValues,
        qualificationOptions,
        fundWithdrawnMethodOptions,
        eSignatureFieldConfig,
    } = getUsaaOftConfig(t);

    const {
        formParty,
        setFormData,
        formData,
        initialForm,
        setFormValidator,
        ownerStateOfResidence,
        isFormStateReadOnly,
        setOwnerStateOfResidence,
        formErrors,
        formESignatureData,
        setFormESignatureData,
    } = useContext(FormDataContext);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, []);

    useEffect(() => {
        setFormData({
            ...formData,
            formExtName: `${
                initialForm?.carrier || Carrier.USAA
            }_OFT_DIGITAL_FORM`,
            metaData: {
                formType: `${
                    initialForm?.carrier || Carrier.USAA
                }_OFT_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
    }, [initialForm]);

    useEffect(() => {
        const newOwnerStateOfResidence = getOwnerStateOfResidence(formParty);
        if (newOwnerStateOfResidence !== ownerStateOfResidence) {
            setOwnerStateOfResidence(newOwnerStateOfResidence);
        }
    }, [formParty, ownerStateOfResidence]);
    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormParties
                isFormStateReadOnly={isFormStateReadOnly}
                configs={formPartyConfigs}
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
            <FormDistribution
                isFormStateReadOnly={isFormStateReadOnly}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={
                    t(
                        'distributionInstruction.investmentSelectionForDistribution'
                    ) as string
                }
            />
            <CedingCompanyDistribution
                qualificationOptions={qualificationOptions}
                isFormStateReadOnly={isFormStateReadOnly}
                renderLoaDate={true}
            />
            <FormDisbursement
                options={disbursementOptions}
                isFormStateReadOnly={isFormStateReadOnly}
                title={
                    t('distributionMethod.cedingCompanyDistribution') as string
                }
                defaultValue={defaultValues.disbursementOption}
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
