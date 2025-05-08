import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import AmountDetails from '@deps/components/otp-withdrawal-form/amount-details';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import DistributionReason from '@deps/components/otp-withdrawal-form/form-restriction/distribution-reason';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import SystematicWithdrawalProgram from '@deps/components/otp-withdrawal-form/ssw-program/ssw-program';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helpers';
import { Carrier, FundWithdrawnMethod } from '@deps/models/case/withdrawal/case';
import { isAllowedState } from '@deps/utils/renderStateW4';

import SswEditSelection from '../ssw-edit-selection';
import getPrdnConfig from './prdn-ssw-from-helpers';

export function PrdnSSWForm() {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });

    const {
        reasonOptions,
        formValidation,
        formPartyConfigs,
        systematicWithdrawalOptions,
        disbursementOptions,
        signaturesConfig,
        fundWithdrawnMethodOptions,
        w4pSignaturesConfig,
        eSignatureFieldConfig,
    } = getPrdnConfig(t);
    const {
        formParty,
        setFormValidator,
        formData,
        setFormData,
        initialForm,
        isFormStateReadOnly,
        ownerStateOfResidence,
        setOwnerStateOfResidence,
        contractIssueState,
        formESignatureData,
        setFormESignatureData,
        formErrors,
    } = useContext(FormDataContext);

    useEffect(() => {
        setFormValidator(() => formValidation);

        setFormData({
            ...formData,
            formExtName: `${initialForm?.carrier || Carrier.PRDN}_SSW_DIGITAL_FORM`, //get client code & withdrawal type from index
            metaData: {
                formType: `${initialForm?.carrier || Carrier.PRDN}_SSW_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
    }, []);

    useEffect(() => {
        const newOwnerStateOfResidence = getOwnerStateOfResidence(formParty);
        if (newOwnerStateOfResidence !== ownerStateOfResidence) {
            setOwnerStateOfResidence(newOwnerStateOfResidence);
        }
    }, [formParty]);

    const shouldStateW4pRender = isAllowedState(contractIssueState ?? '');

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <SswEditSelection />
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <DistributionReason isFormStateReadOnly={isFormStateReadOnly} reasonOptions={reasonOptions} />
            <AmountDetails isFormStateReadOnly={isFormStateReadOnly} isOnlyWithdrawalTypeControls={true} />
            <FormDistribution
                isDerivedMethodFromFunds={true}
                isFormStateReadOnly={isFormStateReadOnly}
                defaultMethod={FundWithdrawnMethod.Prorata}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={t('distributionInstruction.investmentSelectionForDistribution') as string}
            />
            <SystematicWithdrawalProgram isReadOnly={isFormStateReadOnly} options={systematicWithdrawalOptions} />
            <TaxWithholdings isFormStateReadOnly={isFormStateReadOnly} ownerStateOfResidence={ownerStateOfResidence} />
            {shouldStateW4pRender && <StateW4Form isFormStateReadOnly={isFormStateReadOnly} w4pSignaturesConfig={w4pSignaturesConfig} />}
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
            <ESignatureValidation
                formESignatureData={formESignatureData || ({} as FormEsignatureData)}
                setFormESignatureData={setFormESignatureData}
                fieldConfig={eSignatureFieldConfig}
                formErrors={formErrors}
            />
        </>
    );
}
