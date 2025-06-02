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
import HasPreviousNigo from '@deps/components/previous-nigo-check/has-previous-nigo-check';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helpers';
import { Carrier, QualTypes } from '@deps/models/case/withdrawal/case';

import getOftDlicConfig from './dlic-oft-form.helpers';

type OftDlicFormProps = {
    qualType: QualTypes | '';
    planCode: string;
};

const OftDlicForm = ({ qualType, planCode }: OftDlicFormProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const {
        signaturesConfig,
        formPartyConfigs,
        formValidation,
        disbursementOptions,
        surrenderingInstructionsOptions,
        identifySelectedFormProgramOption,
        fundWithdrawnMethodOptions,
        selectOneOptions,
        defaultValues,
        qualificationOptions,
        showContractReplacement,
        eSignatureFieldConfig,
        hasPreviousNigoPlanCodes,
    } = getOftDlicConfig(t);

    const {
        formParty,
        setFormData,
        formData,
        initialForm,
        formProgram,
        setFormProgram,
        setFormValidator,
        ownerStateOfResidence,
        isFormStateReadOnly,
        setOwnerStateOfResidence,
        formErrors,
        formESignatureData,
        setFormESignatureData,
    } = useContext(FormDataContext);

    const isNonQualifiedOr403b = [QualTypes.b403, QualTypes.NonQualified].includes(qualType as QualTypes);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, []);

    useEffect(() => {
        setFormData({
            ...formData,
            formExtName: `${initialForm?.carrier || Carrier.DLIC}_OFT_DIGITAL_FORM`,
            metaData: {
                formType: `${initialForm?.carrier || Carrier.DLIC}_OFT_DIGITAL_FORM`,
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

    const showHasPreviousNigo = hasPreviousNigoPlanCodes.includes(planCode);

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <FormProgramPartialWithdrawal
                isFormStateReadOnly={isFormStateReadOnly}
                options={surrenderingInstructionsOptions}
                title={t('amountDetails.surrenderingInstructions.title') as string}
                selectionIdentifier={identifySelectedFormProgramOption}
                selectOneOptions={selectOneOptions}
                showContractReplacement={showContractReplacement}
            />
            {showHasPreviousNigo && (
                <HasPreviousNigo
                    isFormStateReadOnly={isFormStateReadOnly}
                    t={t}
                    isNigoChecked={formProgram?.isPrevNigoChecked ?? false}
                    onIsNigoChange={setFormProgram}
                />
            )}
            <FormDistribution
                isFormStateReadOnly={isFormStateReadOnly}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={t('distributionInstruction.investmentSelectionForDistribution') as string}
            />
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
            <CedingCompanyDistribution
                qualificationOptions={qualificationOptions}
                isFormStateReadOnly={isFormStateReadOnly}
                renderCorporateResolution={isNonQualifiedOr403b}
                renderIsLoaAttached={isNonQualifiedOr403b}
            />
            <FormDisbursement
                options={disbursementOptions}
                isFormStateReadOnly={isFormStateReadOnly}
                title={t('distributionMethod.cedingCompanyDistribution') as string}
                defaultValue={defaultValues.disbursementOption}
            />
            <ESignatureValidation
                isFormStateReadOnly={isFormStateReadOnly}
                formESignatureData={formESignatureData || ({} as FormEsignatureData)}
                setFormESignatureData={setFormESignatureData}
                fieldConfig={eSignatureFieldConfig}
                formErrors={formErrors}
            />
        </>
    );
};

export default OftDlicForm;
