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
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Carrier, FundWithdrawnMethod } from '@deps/models/case/withdrawal/case';
import { isAllowedState } from '@deps/utils/renderStateW4';

import getSbgcConfig from './sbgc-ssw-form-helper';
import SswEditSelection from '../ssw-edit-selection';

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
        w4pSignaturesConfig
    } = getSbgcConfig(t);
    const { formParty, formTpaAuthorization, setFormValidator, formData, setFormData, initialForm, isFormStateReadOnly, contractIssueState } =
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
    const shouldStateW4pRender = isAllowedState(contractIssueState ?? '')
    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <SswEditSelection />
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
            {shouldStateW4pRender && <StateW4Form isFormStateReadOnly={isFormStateReadOnly} w4pSignaturesConfig={w4pSignaturesConfig} />}
            <TaxWithholdings isFormStateReadOnly={isFormStateReadOnly} ownerStateOfResidence={ownerStateOfResidence} />
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
            {hasTpaAuthorization && <EmployerTpaAuthorization isFormStateReadOnly={isFormStateReadOnly} />}
        </>
    );
}
