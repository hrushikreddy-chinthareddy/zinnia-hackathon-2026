import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import AmountDetails, {
    determineProgramType,
} from '@deps/components/otp-withdrawal-form/amount-details';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import EmployerTpaAuthorization from '@deps/components/otp-withdrawal-form/employer-tpa-authorization';
import FinancialProfessionalSignature from '@deps/components/otp-withdrawal-form/financial-professional-signature';
import FormDisbursementV2 from '@deps/components/otp-withdrawal-form/form-disbursement-V2/form-disbursement-v2';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import DistributionReason from '@deps/components/otp-withdrawal-form/form-restriction/distribution-reason';
import LoanAcknowledgement from '@deps/components/otp-withdrawal-form/loan-acknowledgement';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { USStates } from '@deps/constants/geography/us-states';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Carrier } from '@deps/models/case/withdrawal/case';
import { isAllowedState } from '@deps/utils/renderStateW4';

import getSbgcConfig from './sbgc-withdrawal-form.helpers';

export default function SbgcWithdrawalForm() {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });
    const {
        formParty,
        formTpaAuthorization,
        setFormValidator,
        formData,
        setFormData,
        initialForm,
        isFormStateReadOnly,
        formProgram,
        formESignatureData,
        setFormESignatureData,
        formErrors,
    } = useContext(FormDataContext);

    const withdrawalType = determineProgramType(formProgram);

    const {
        formValidation,
        signaturesConfig,
        formPartyConfigs,
        disbursementOptions,
        fundWithdrawnMethodOptions,
        moneyTypeOptions,
        unforeseeableEmergencyOptions,
        hardshipOptions,
        reasonOptions,
        w4pSignaturesConfig,
        programTypes,
        eSignatureFieldConfig,
    } = getSbgcConfig(t);

    useEffect(() => {
        setFormValidator(() => formValidation);

        setFormData({
            ...formData,
            formExtName: `${
                initialForm?.carrier || Carrier.FLIC
            }_WD_REDEMPTION_DIGITAL_FORM`, //get client code & withdrawal type from index
            metaData: {
                formType: `${
                    initialForm?.carrier || Carrier.FLIC
                }_WD_REDEMPTION_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
    }, []);

    const hasTpaAuthorization =
        formTpaAuthorization &&
        !Object.values(formTpaAuthorization).every((val) => val === null);
    const ownerStateOfResidence =
        formParty?.parties?.[0]?.addresses?.[0]?.state;
    const ownerIsVirginiaResident = ownerStateOfResidence === USStates.VIRGINIA;
    const shouldStateW4pRender = isAllowedState(ownerStateOfResidence ?? '');

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormParties
                isFormStateReadOnly={isFormStateReadOnly}
                configs={formPartyConfigs}
            />
            <DistributionReason
                reasonOptions={reasonOptions}
                hardshipOptions={hardshipOptions}
                unforeseenOptions={unforeseeableEmergencyOptions}
                isFormStateReadOnly={isFormStateReadOnly}
            />
            <AmountDetails
                isFormStateReadOnly={isFormStateReadOnly}
                programTypes={programTypes}
            />
            <FormDistribution
                moneyTypeOptions={moneyTypeOptions}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={
                    t(
                        'distributionInstruction.distributionInstruction'
                    ) as string
                }
                isFormStateReadOnly={isFormStateReadOnly}
            />
            <FormDisbursementV2
                isFormStateReadOnly={isFormStateReadOnly}
                options={disbursementOptions(withdrawalType) as any}
            />
            <TaxWithholdings
                isFormStateReadOnly={isFormStateReadOnly}
                ownerStateOfResidence={ownerStateOfResidence}
            />
            {shouldStateW4pRender && (
                <StateW4Form
                    isFormStateReadOnly={isFormStateReadOnly}
                    w4pSignaturesConfig={w4pSignaturesConfig}
                />
            )}
            <LoanAcknowledgement isFormStateReadOnly={isFormStateReadOnly} />
            {ownerIsVirginiaResident && (
                <FinancialProfessionalSignature
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
            {hasTpaAuthorization && (
                <EmployerTpaAuthorization
                    isFormStateReadOnly={isFormStateReadOnly}
                />
            )}
        </>
    );
}
