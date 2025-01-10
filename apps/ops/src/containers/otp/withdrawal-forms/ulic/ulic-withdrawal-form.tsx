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
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { USStates } from '@deps/constants/geography/us-states';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helper';
import { Carrier } from '@deps/models/case/withdrawal/case';

import getUlpcConfig, { FormSubtype } from './ulic-withdrawal-form.helper';

export default function UlpcWithdrawalForm() {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
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
        maritalStatusAllowanceConfig,
        validateMaritalStatusAllowances
    } = getUlpcConfig(t);

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

    const isMaritalStatusAllowances = contractIssueState ? validateMaritalStatusAllowances(contractIssueState as USStates) : false;

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, []);

    useEffect(() => {
        setFormData({
            ...formData,
            formExtName: `${initialForm?.carrier || Carrier.ULPC}_WD_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`,
            metaData: {
                formType: `${initialForm?.carrier || Carrier.ULPC}_WD_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`,
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
                <FormProgramPartialWithdrawal
                    isFormStateReadOnly={isFormStateReadOnly}
                    options={partialWithdrawalOptions}
                    selectionIdentifier={identifySelectedFormProgramOption}
                    selectOneOptions={selectOneOptions}
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
                isMaritalStatusAllowances={isMaritalStatusAllowances}
                meritalStatusAllowanceConfig={maritalStatusAllowanceConfig}
            />
            <IrsWithholding isFormStateReadOnly={isFormStateReadOnly} signatureFields={irsSignatureConfig} />
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
            {(ownerStateOfResidence || contractIssueState) &&
                [ownerStateOfResidence, contractIssueState].some(state => state && cslnCheckStates.includes(state)) && (
                    <CslnCheck isFormStateReadOnly={isFormStateReadOnly} />
                )}
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
        </>
    );
}
