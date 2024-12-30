import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import AmountDetails from '@deps/components/otp-withdrawal-form/amount-details';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import EmployerTpaAuthorization from '@deps/components/otp-withdrawal-form/employer-tpa-authorization';
import FinancialProfessionalSignature from '@deps/components/otp-withdrawal-form/financial-professional-signature';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
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

import getSbgcConfig from './sbgc-withdrawal-form.helper';

export default function SbgcWithdrawalForm() {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });

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
        w4pSignaturesConfig
    } = getSbgcConfig(t);
    const { formParty, formTpaAuthorization, setFormValidator, formData, setFormData, initialForm, isFormStateReadOnly, contractIssueState } =
        useContext(FormDataContext);

    useEffect(() => {
        setFormValidator(() => formValidation);

        setFormData({
            ...formData,
            formExtName: `${initialForm?.carrier || Carrier.FLIC}_WD_REDEMPTION_DIGITAL_FORM`, //get client code & withdrawal type from index
            metaData: {
                formType: `${initialForm?.carrier || Carrier.FLIC}_WD_REDEMPTION_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
    }, []);

    const hasTpaAuthorization = formTpaAuthorization && !Object.values(formTpaAuthorization).every(val => val === null);
    const ownerStateOfResidence = formParty?.parties?.[0]?.addresses?.[0]?.state;
    const ownerIsVirginiaResident = ownerStateOfResidence === USStates.VIRGINIA;
    const shouldStateW4pRender = isAllowedState(contractIssueState ?? '')

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <DistributionReason
                reasonOptions={reasonOptions}
                hardshipOptions={hardshipOptions}
                unforeseenOptions={unforeseeableEmergencyOptions}
                isFormStateReadOnly={isFormStateReadOnly}
            />
            <AmountDetails isFormStateReadOnly={isFormStateReadOnly} />

            <FormDistribution
                moneyTypeOptions={moneyTypeOptions}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={t('distributionInstruction.distributionInstruction') as string}
                isFormStateReadOnly={isFormStateReadOnly}
            />
            {shouldStateW4pRender && <StateW4Form isFormStateReadOnly={isFormStateReadOnly} w4pSignaturesConfig={w4pSignaturesConfig} />}
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
            <TaxWithholdings isFormStateReadOnly={isFormStateReadOnly} ownerStateOfResidence={ownerStateOfResidence} />
            <LoanAcknowledgement isFormStateReadOnly={isFormStateReadOnly} />
            {ownerIsVirginiaResident && <FinancialProfessionalSignature isFormStateReadOnly={isFormStateReadOnly} />}
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
            {hasTpaAuthorization && <EmployerTpaAuthorization isFormStateReadOnly={isFormStateReadOnly} />}
        </>
    );
}
