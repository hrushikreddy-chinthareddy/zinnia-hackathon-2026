import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import EmployerTpaAuthorization from '@deps/components/otp-withdrawal-form/employer-tpa-authorization';
import FinancialProfessionalSignature from '@deps/components/otp-withdrawal-form/financial-professional-signature';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import JointLifeExpectancy from '@deps/components/otp-withdrawal-form/rmd-method/joint-life-expectancy';
import RMDMethod from '@deps/components/otp-withdrawal-form/rmd-method/rmd-method';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { USStates } from '@deps/constants/geography/us-states';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Carrier } from '@deps/models/case/withdrawal/case';

import getSbgcRmdConfig from './sbgc-rmd-form.helper';

export default function SbgcRmdWithdrawalForm() {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const {
        signaturesConfig,
        formPartyConfigs,
        formValidation,
        disbursementOptions,
        jointLifeExpectancyConfigs,
        fundWithdrawnMethodOptions,
        w4pSignaturesConfig
    } = getSbgcRmdConfig(t);

    const { formParty, setFormData, formData, initialForm, setFormValidator, formTpaAuthorization, isFormStateReadOnly } =
        useContext(FormDataContext);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, []);

    useEffect(() => {
        setFormData({
            ...formData,
            formExtName: `${initialForm?.carrier || Carrier.SBGC}_RMD_DIGITAL_FORM`,
            metaData: {
                formType: `${initialForm?.carrier || Carrier.SBGC}_RMD_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
    }, [initialForm]);

    const hasTpaAuthorization = formTpaAuthorization && !Object.values(formTpaAuthorization).every(val => val === null);
    const ownerStateOfResidence = formParty?.parties?.[0]?.addresses?.[0]?.state;
    const ownerIsVirginiaResident = ownerStateOfResidence === USStates.VIRGINIA;

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <JointLifeExpectancy isFormStateReadOnly={isFormStateReadOnly} configs={jointLifeExpectancyConfigs} />
            <RMDMethod isFormStateReadOnly={isFormStateReadOnly} />
            <FormDistribution
                isFormStateReadOnly={isFormStateReadOnly}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={t('distributionInstruction.distributionInstruction') as string}
            />
            <TaxWithholdings isFormStateReadOnly={isFormStateReadOnly} ownerStateOfResidence={ownerStateOfResidence} />
            <StateW4Form isFormStateReadOnly={isFormStateReadOnly} w4pSignaturesConfig={w4pSignaturesConfig} />
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
            {ownerIsVirginiaResident && <FinancialProfessionalSignature isFormStateReadOnly={isFormStateReadOnly} />}
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
            {hasTpaAuthorization && <EmployerTpaAuthorization isFormStateReadOnly={isFormStateReadOnly} />}
        </>
    );
}
