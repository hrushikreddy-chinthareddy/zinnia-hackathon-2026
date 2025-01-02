import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import CslnCheck from '@deps/components/otp-withdrawal-form/csln-check';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import FormProgramFullWithdrawal from '@deps/components/otp-withdrawal-form/form-program/form-program-full-withdrawal';
import FormProgramPartialWithdrawal from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import FormType from '@deps/components/otp-withdrawal-form/form-type';
import IrsWithholding from '@deps/components/otp-withdrawal-form/irs-withholdings';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { USStates } from '@deps/constants/geography/us-states';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helper';
import { Carrier } from '@deps/models/case/withdrawal/case';
import { isAllowedState } from '@deps/utils/renderStateW4';

import getGilicoConfig, { FormSubtype } from './gilico-withdrawal-form.helper';

export default function GilicoWithdrawalForm() {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });

    const {
        formSubtype,
        formParty,
        setFormData,
        formData,
        initialForm,
        setFormValidator,
        ownerStateOfResidence,
        setOwnerStateOfResidence,
        contractIssueState,
        isFormStateReadOnly,
    } = useContext(FormDataContext);

    const {
        cslnCheckStates,
        identifySelectedFormProgramOption,
        irsSignatureConfig,
        formSubtypeOptions,
        formValidation,
        fundWithdrawnMethodOptions,
        partialWithdrawalOptions,
        signaturesConfig,
        disbursementOptions,
        formPartyConfigs,
        selectOneOptions,
        fullWithdrawalOptions,
        validateMaritalStatusAllowances,
        meritalStatusAllowanceConfig,
        w4pSignaturesConfig
    } = getGilicoConfig(t, formSubtype as FormSubtype);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, []);

    useEffect(() => {
        setFormData({
            ...formData,
            formExtName: `${initialForm?.carrier || Carrier.FLIC}_WD_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`, //get client code & withdrawal type from index
            metaData: {
                formType: `${initialForm?.carrier || Carrier.FLIC}_WD_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
    }, [formSubtype]);

    useEffect(() => {
        const newOwnerStateOfResidence = getOwnerStateOfResidence(formParty);
        if (newOwnerStateOfResidence !== ownerStateOfResidence) {
            setOwnerStateOfResidence(newOwnerStateOfResidence);
        }
    }, [formParty]);

    const isMaritalStatusAllowances = contractIssueState ? validateMaritalStatusAllowances(contractIssueState as USStates) : false;
    const shouldStateW4pRender = isAllowedState(contractIssueState)
    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormType isFormStateReadOnly={isFormStateReadOnly} formSubtypeOptions={formSubtypeOptions} />
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />

            {formSubtype === FormSubtype.FullWithdrawal ? (
                <FormProgramFullWithdrawal
                    selectOneOptions={selectOneOptions}
                    fullWithdrawalOptions={fullWithdrawalOptions}
                    isFormStateReadOnly={isFormStateReadOnly}
                />
            ) : (
                <>
                    <FormProgramPartialWithdrawal
                        isFormStateReadOnly={isFormStateReadOnly}
                        options={partialWithdrawalOptions}
                        selectionIdentifier={identifySelectedFormProgramOption}
                        selectOneOptions={selectOneOptions}
                    />
                    <FormDistribution
                        isFormStateReadOnly={isFormStateReadOnly}
                        fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                        title={t('distributionInstruction.investmentSelectionForDistribution') as string}
                    />
                </>
            )}
            <TaxWithholdings
                isFormStateReadOnly={isFormStateReadOnly}
                isMaritalStatusAllowances={isMaritalStatusAllowances}
                ownerStateOfResidence={ownerStateOfResidence}
                meritalStatusAllowanceConfig={meritalStatusAllowanceConfig}
            />
            <IrsWithholding isFormStateReadOnly={isFormStateReadOnly} signatureFields={irsSignatureConfig} />
            {shouldStateW4pRender && <StateW4Form isFormStateReadOnly={isFormStateReadOnly} w4pSignaturesConfig={w4pSignaturesConfig} />}
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
            {(ownerStateOfResidence || contractIssueState) &&
                [ownerStateOfResidence, contractIssueState].some(state => state && cslnCheckStates.includes(state)) && (
                    <CslnCheck isFormStateReadOnly={isFormStateReadOnly} />
                )}
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
        </>
    );
}
