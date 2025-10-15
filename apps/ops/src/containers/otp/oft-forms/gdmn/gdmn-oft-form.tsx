import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import CedingCompanyDistribution from '@deps/components/otp-withdrawal-form/ceding-company-distribution';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import EmployerTpaAuthorization from '@deps/components/otp-withdrawal-form/employer-tpa-authorization';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import FormProgramPartialWithdrawal from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import DistributionReason from '@deps/components/otp-withdrawal-form/form-restriction/distribution-reason';
import LoanAcknowledgement from '@deps/components/otp-withdrawal-form/loan-acknowledgement';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helpers';
import { ProcessType } from '@deps/models/case/enums';
import {
    Carrier,
    FASTQualTypes,
    ProgramType,
    QualTypes,
} from '@deps/models/case/withdrawal/case';

import useGdmnOftConfig from './gdmn-oft-form.helpers';

type GdmnOftWithdrawalFormProps = {
    qualType: QualTypes | FASTQualTypes | '';
};

export default function GdmnOftWithdrawalForm({
    qualType,
}: GdmnOftWithdrawalFormProps) {
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
        reasonOptions,
        qualificationOptions,
        defaultValues,
        eSignatureFieldConfig,
    } = useGdmnOftConfig(t);

    const {
        formParty,
        setFormData,
        initialForm,
        setFormValidator,
        ownerStateOfResidence,
        isFormStateReadOnly,
        setOwnerStateOfResidence,
        formProgram,
        formErrors,
        formESignatureData,
        setFormESignatureData,
    } = useContext(FormDataContext);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, []);

    useEffect(() => {
        setFormData((fs) => ({
            ...fs,
            formExtName: `${initialForm?.carrier || Carrier.GDMN}_${
                ProcessType.OFT
            }_DIGITAL_FORM`,
            metaData: {
                formType: `${initialForm?.carrier || Carrier.GDMN}_${
                    ProcessType.OFT
                }_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        }));
    }, [setFormData, initialForm]);

    useEffect(() => {
        const newOwnerStateOfResidence = getOwnerStateOfResidence(formParty);
        if (newOwnerStateOfResidence !== ownerStateOfResidence) {
            setOwnerStateOfResidence(newOwnerStateOfResidence);
        }
    }, [formParty, ownerStateOfResidence]);

    const is403b = [QualTypes.b403].includes(qualType as QualTypes);
    const { selectedOption } = identifySelectedFormProgramOption(formProgram);

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormParties
                isFormStateReadOnly={isFormStateReadOnly}
                configs={formPartyConfigs}
            />
            {is403b && (
                <DistributionReason
                    reasonOptions={reasonOptions}
                    isFormStateReadOnly={isFormStateReadOnly}
                />
            )}
            <FormProgramPartialWithdrawal
                isFormStateReadOnly={isFormStateReadOnly}
                options={surrenderingInstructionsOptions}
                title={
                    t('amountDetails.surrenderingInstructions.title') as string
                }
                selectionIdentifier={identifySelectedFormProgramOption}
                selectOneOptions={selectOneOptions}
            />
            {selectedOption === ProgramType.FullSurrender && (
                <LoanAcknowledgement
                    isFormStateReadOnly={isFormStateReadOnly}
                    isLoanRepayment={true}
                />
            )}
            {is403b && (
                <EmployerTpaAuthorization
                    isFormStateReadOnly={isFormStateReadOnly}
                />
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
            <CedingCompanyDistribution
                qualificationOptions={qualificationOptions}
                isFormStateReadOnly={isFormStateReadOnly}
            />
            <FormDisbursement
                options={disbursementOptions}
                isFormStateReadOnly={isFormStateReadOnly}
                title={
                    t('distributionMethod.cedingCompanyDistribution') as string
                }
                defaultValue={defaultValues.disbursementOption}
            />
        </>
    );
}
