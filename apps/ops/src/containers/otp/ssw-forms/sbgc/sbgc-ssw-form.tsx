import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import AmountDetails from '@deps/components/otp-withdrawal-form/amount-details';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import EmployerTpaAuthorization from '@deps/components/otp-withdrawal-form/employer-tpa-authorization';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import DistributionReason from '@deps/components/otp-withdrawal-form/form-restriction/distribution-reason';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import SystematicWithdrawalProgram from '@deps/components/otp-withdrawal-form/ssw-program/ssw-program';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Carrier, FundWithdrawnMethod } from '@deps/models/case/withdrawal/case';

import getSbgcConfig from './sbgc-ssw-form-helper';

export function SbgcSSWForm() {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });

    const {
        reasonOptions,
        formValidation,
        signaturesConfig,
        formPartyConfigs,
        disbursementOptions,
        fundWithdrawnMethodOptions,
        systematicWithdrawalOptions,
    } = getSbgcConfig(t);
    const { formParty, formTpaAuthorization, setFormValidator, formData, setFormData, initialForm, isFormStateReadOnly } =
        useContext(FormDataContext);

    useEffect(() => {
        setFormValidator(() => formValidation);

        setFormData({
            ...formData,
            formExtName: `${initialForm?.carrier || Carrier.SBGC}_SSW_DIGITAL_FORM`, //get client code & withdrawal type from index
            metaData: {
                formType: `${initialForm?.carrier || Carrier.SBGC}_SSW_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
    }, []);
    const hasTpaAuthorization = formTpaAuthorization && !Object.values(formTpaAuthorization).every(val => val === null);
    const ownerStateOfResidence = formParty?.parties?.[0]?.addresses?.[0]?.state;
    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <DistributionReason isFormStateReadOnly={isFormStateReadOnly} reasonOptions={reasonOptions} />
            <AmountDetails isFormStateReadOnly={isFormStateReadOnly} isOnlyWithdrawalTypeControls={true} />

            <SystematicWithdrawalProgram isReadOnly={isFormStateReadOnly} options={systematicWithdrawalOptions} />

            <FormDistribution
                isDerivedMethodFromFunds={true}
                isFormStateReadOnly={isFormStateReadOnly}
                defaultMethod={FundWithdrawnMethod.Prorata}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={t('distributionInstruction.investmentSelectionForDistribution') as string}
            />
            <TaxWithholdings isFormStateReadOnly={isFormStateReadOnly} ownerStateOfResidence={ownerStateOfResidence} />
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
            {hasTpaAuthorization && <EmployerTpaAuthorization isFormStateReadOnly={isFormStateReadOnly} />}
        </>
    );
}
