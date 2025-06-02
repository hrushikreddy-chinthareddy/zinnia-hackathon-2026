import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import CslnCheck from '@deps/components/otp-withdrawal-form/csln-check';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import FormProgramPartialWithdrawal from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import HasPreviousNigo from '@deps/components/previous-nigo-check/has-previous-nigo-check';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Carrier } from '@deps/models/case/withdrawal/case';
import { isAllowedState } from '@deps/utils/renderStateW4';

import useDlicConfig from './dlic-withdrawal-form-helpers';

export default function DlicWithdrawalForm({ planCode }: { planCode: string }) {
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
        w4pSignaturesConfig,
        eSignatureFieldConfig,
        hasPreviousNigoPlanCodes,
    } = useDlicConfig(t);
    const {
        formProgram,
        setFormProgram,
        formParty,
        setFormValidator,
        setFormData,
        initialForm,
        contractIssueState,
        isFormStateReadOnly,
        formESignatureData,
        setFormESignatureData,
        formErrors,
    } = useContext(FormDataContext);

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
    const shouldStateW4pRender = isAllowedState(contractIssueState);
    const showHasPreviousNigo = hasPreviousNigoPlanCodes.includes(planCode);
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

            <TaxWithholdings
                isFormStateReadOnly={isFormStateReadOnly}
                ownerStateOfResidence={ownerStateOfResidence}
                additionalWithHoldingConfig={additionalWithholdingAmountConfig}
            />
            {shouldStateW4pRender && <StateW4Form isFormStateReadOnly={isFormStateReadOnly} w4pSignaturesConfig={w4pSignaturesConfig} />}
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
            {(ownerStateOfResidence || contractIssueState) &&
                [ownerStateOfResidence, contractIssueState].some(state => state && cslnCheckStates.includes(state)) && (
                    <CslnCheck isFormStateReadOnly={isFormStateReadOnly} />
                )}

            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
            <SignatureValidations
                isFormStateReadOnly={isFormStateReadOnly}
                headerTranslationKey={'notaryHeader'}
                config={signaturesNotaryConfig}
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
}
