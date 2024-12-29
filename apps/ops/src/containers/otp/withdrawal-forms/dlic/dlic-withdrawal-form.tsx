import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import CslnCheck from '@deps/components/otp-withdrawal-form/csln-check';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import FormProgramPartialWithdrawal from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Carrier } from '@deps/models/case/withdrawal/case';

import useDlicConfig from './dlic-withdrawal-form-helper';

export default function DlicWithdrawalForm() {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });

    const {
        formValidation,
        identifySelectedFormProgramOption,
        additionalWithholdingAmountConfig,
        partialWithdrawalOptions,
        signaturesConfig,
        signaturesNotaryConfig,
        formPartyConfigs,
        disbursementOptions,
        fundWithdrawnMethodOptions,
        selectOneOptions,
        cslnCheckStates,
        w4pSignaturesConfig
    } = useDlicConfig(t);
    const { formParty, setFormValidator, setFormData, initialForm, contractIssueState, isFormStateReadOnly } = useContext(FormDataContext);

    useEffect(() => {
        setFormData(fs => ({
            ...fs,
            formExtName: `${initialForm?.carrier || Carrier.DLIC}_REDEMPTION_DIGITAL_FORM`, //get client code & withdrawal type from index
            metaData: {
                formType: `${initialForm?.carrier || Carrier.DLIC}_REDEMPTION_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        }));
    }, [setFormData, initialForm]);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, [setFormValidator]);

    const ownerStateOfResidence = formParty?.parties?.[0]?.addresses?.[0]?.state;

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <FormProgramPartialWithdrawal
                isFormStateReadOnly={isFormStateReadOnly}
                options={partialWithdrawalOptions}
                selectionIdentifier={identifySelectedFormProgramOption}
                selectOneOptions={selectOneOptions}
                title={t('amountDetails.partialWithdrawal.withdrawalAmount') as string}
            />
            <FormDistribution
                isFormStateReadOnly={isFormStateReadOnly}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={t('distributionInstruction.investmentSelectionForDistribution') as string}
            />
            <StateW4Form isFormStateReadOnly={isFormStateReadOnly} w4pSignaturesConfig={w4pSignaturesConfig} />
            <TaxWithholdings
                isFormStateReadOnly={isFormStateReadOnly}
                ownerStateOfResidence={ownerStateOfResidence}
                additionalWithHoldingConfig={additionalWithholdingAmountConfig}
            />
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
            {(ownerStateOfResidence || contractIssueState) &&
                [ownerStateOfResidence, contractIssueState].some(state => state && cslnCheckStates.includes(state)) && <CslnCheck isFormStateReadOnly={isFormStateReadOnly} />}
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
            <SignatureValidations
                isFormStateReadOnly={isFormStateReadOnly}
                headerTranslationKey={'notaryHeader'}
                config={signaturesNotaryConfig}
            />
        </>
    );
}
