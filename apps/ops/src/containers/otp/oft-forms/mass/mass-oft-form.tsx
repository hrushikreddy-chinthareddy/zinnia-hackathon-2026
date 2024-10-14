import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import CedingCompanyDistribution from '@deps/components/otp-withdrawal-form/ceding-company-distribution';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import FormProgramPartialWithdrawal from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helper';
import { Carrier, ProgramType } from '@deps/models/case/withdrawal/case';

import getMassOftConfig from './mass-oft-form.helper';

export default function MassOftWithdrawalForm() {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const {
        signaturesConfig,
        formPartyConfigs,
        formValidation,
        disbursementOptions,
        surrenderingInstructionsOptions,
        identifySelectedFormProgramOption,
        selectOneOptions,
        fundWithdrawnMethodOptions,
        defaultValues,
        qualificationOptions
    } = getMassOftConfig(t);

    const {
        formProgram,
        formParty,
        setFormData,
        formData,
        initialForm,
        setFormValidator,
        ownerStateOfResidence,
        setOwnerStateOfResidence,
        isFormStateReadOnly,
    } = useContext(FormDataContext);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, []);

    useEffect(() => {
        setFormData({
            ...formData,
            formExtName: `${initialForm?.carrier || Carrier.MASS}_OFT_DIGITAL_FORM`,
            metaData: {
                formType: `${initialForm?.carrier || Carrier.MASS}_OFT_DIGITAL_FORM`,
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
            <FormParties configs={formPartyConfigs} isFormStateReadOnly={isFormStateReadOnly} />
            <FormProgramPartialWithdrawal
                options={surrenderingInstructionsOptions}
                title={t('amountDetails.surrenderingInstructions.title') as string}
                selectionIdentifier={identifySelectedFormProgramOption}
                selectOneOptions={selectOneOptions}
                isFormStateReadOnly={isFormStateReadOnly}
            />
            {formProgram?.programType?.text === ProgramType.Withdrawal && (
                <FormDistribution
                    fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                    title={t('distributionInstruction.investmentSelectionForDistribution') as string}
                    isFormStateReadOnly={isFormStateReadOnly}
                />
            )}
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
            <CedingCompanyDistribution
                qualificationOptions={qualificationOptions}
                isFormStateReadOnly={isFormStateReadOnly}
                renderCorporateResolution={false}
                renderIsTitlePresent={true}
            />
            <FormDisbursement
                isFormStateReadOnly={isFormStateReadOnly}
                options={disbursementOptions}
                title={t('distributionMethod.cedingCompanyDistribution') as string}
                defaultValue={defaultValues.disbursementOption}
            />
        </>
    );
}
