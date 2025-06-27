import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import CedingCompanyDistribution from '@deps/components/otp-withdrawal-form/ceding-company-distribution';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import EmployerTpaAuthorization from '@deps/components/otp-withdrawal-form/employer-tpa-authorization';
import FinancialProfessionalSignature from '@deps/components/otp-withdrawal-form/financial-professional-signature';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import FormProgramPartialWithdrawal from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import NeaBenefits from '@deps/components/otp-withdrawal-form/nea-benefits';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { NEA_PLAN_CODES } from '@deps/constants/case';
import { USStates } from '@deps/constants/geography/us-states';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helpers';
import { ProcessType } from '@deps/models/case/enums';
import { Carrier } from '@deps/models/case/withdrawal/case';

import useSbgcOftConfig from './sbgc-oft-form-helpers';

type SbgcOftWithdrawalFormProps = {
    planCode: string | '';
};

export default function SbgcOftWithdrawalForm({
    planCode,
}: SbgcOftWithdrawalFormProps) {
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
        qualTypeOptions,
        showContractReplacement,
        eSignatureFieldConfig,
    } = useSbgcOftConfig(t);

    const {
        formParty,
        setFormData,
        initialForm,
        setFormValidator,
        ownerStateOfResidence,
        formTpaAuthorization,
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
        setFormData((fs) => ({
            ...fs,
            formExtName: `${initialForm?.carrier || Carrier.SBGC}_${
                ProcessType.OFT
            }_DIGITAL_FORM`,
            metaData: {
                formType: `${initialForm?.carrier || Carrier.SBGC}_${
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

    const hasTpaAuthorization =
        formTpaAuthorization &&
        !Object.values(formTpaAuthorization).every((val) => val === null);
    const ownerIsVirginiaResident = ownerStateOfResidence === USStates.VIRGINIA;
    const isNEAPlanCode = NEA_PLAN_CODES.includes(planCode);
    const isInvalidContractReplacementState = [
        USStates['NORTH DAKOTA'],
        USStates.MICHIGAN,
        USStates['DISTRICT OF COLUMBIA'],
    ].includes(ownerStateOfResidence as USStates);

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormParties
                isFormStateReadOnly={isFormStateReadOnly}
                configs={formPartyConfigs}
            />
            {isNEAPlanCode && <NeaBenefits />}
            <FormProgramPartialWithdrawal
                isFormStateReadOnly={isFormStateReadOnly}
                options={surrenderingInstructionsOptions}
                title={
                    t('amountDetails.surrenderingInstructions.title') as string
                }
                selectionIdentifier={identifySelectedFormProgramOption}
                selectOneOptions={selectOneOptions}
                showContractReplacement={
                    showContractReplacement &&
                    !isInvalidContractReplacementState
                }
            />
            {ownerIsVirginiaResident && isNEAPlanCode && (
                <FinancialProfessionalSignature
                    isFormStateReadOnly={isFormStateReadOnly}
                />
            )}
            <SignatureValidations
                isFormStateReadOnly={isFormStateReadOnly}
                config={signaturesConfig}
            />
            {hasTpaAuthorization && (
                <EmployerTpaAuthorization
                    isFormStateReadOnly={isFormStateReadOnly}
                />
            )}
            <CedingCompanyDistribution
                qualificationOptions={qualTypeOptions}
                isFormStateReadOnly={isFormStateReadOnly}
                renderLoaDate={true}
                authorizedSignatureLabel={
                    t(
                        'oftProcess.cedingCompanySignature.isSignatureAuthorized'
                    ) as string
                }
            />
            <FormDisbursement
                options={disbursementOptions}
                isFormStateReadOnly={isFormStateReadOnly}
                title={
                    t('distributionMethod.cedingCompanyDistribution') as string
                }
                defaultValue={defaultValues.disbursementOption}
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
