import { useTranslation } from 'next-i18next';
import { useCallback, useContext, useEffect } from 'react';

import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import EmployerTpaAuthorization from '@deps/components/otp-withdrawal-form/employer-tpa-authorization';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import FormProgramFullWithdrawal from '@deps/components/otp-withdrawal-form/form-program/form-program-full-withdrawal';
import FormProgramPartialWithdrawal from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import DistributionReason from '@deps/components/otp-withdrawal-form/form-restriction/distribution-reason';
import FormType from '@deps/components/otp-withdrawal-form/form-type';
import FormWaivers from '@deps/components/otp-withdrawal-form/form-waivers/form-waivers';
import IrsWithholding from '@deps/components/otp-withdrawal-form/irs-withholdings';
import OwnerAcknowledgementOfTaxInformation from '@deps/components/otp-withdrawal-form/owner-acknowledgement-tax-information';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Carrier, FundWithdrawnMethod, OwnerAcknowledgement } from '@deps/models/case/withdrawal/case';
import { isAllowedState } from '@deps/utils/renderStateW4';

import getRslnConfig, { FormSubtype } from './rsln-withdrawal-form.helper';

export default function RslnWithdrawalForm() {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });

    const {
        formValidation,
        signaturesConfig,
        formPartyConfigs,
        disbursementOptions,
        fundWithdrawnMethodOptions,
        reasonOptions,
        waiverItemsConfig,
        formSubtypeOptions,
        selectOneOptions,
        fullWithdrawalOptions,
        partialWithdrawalOptions,
        identifySelectedFormProgramOption,
        irsSignatureConfig,
        meritalStatusAllowanceConfig,
        w4pSignaturesConfig
    } = getRslnConfig(t);
    const {
        formParty,
        formTpaAuthorization,
        ownerAcknowledgement,
        setFormValidator,
        formData,
        setFormData,
        setOwnerAcknowledgement,
        initialForm,
        isFormStateReadOnly,
        formSubtype,
        contractIssueState
    } = useContext(FormDataContext);

    useEffect(() => {
        setFormValidator(() => formValidation);

        setFormData({
            ...formData,
            formExtName: `${initialForm?.carrier || Carrier.RSLN}_WD_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`, //get client code & withdrawal type from index
            metaData: {
                formType: `${initialForm?.carrier || Carrier.RSLN}_WD_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
    }, [formSubtype]);

    const hasTpaAuthorization = formTpaAuthorization && !Object.values(formTpaAuthorization).every(val => val === null);
    const ownerStateOfResidence = formParty?.parties?.[0]?.addresses?.[0]?.state;

    const handleOwnerAcknowledgementChange = useCallback(
        (ownerAcknowledgementData?: OwnerAcknowledgement): void => {
            if (ownerAcknowledgementData) {
                setOwnerAcknowledgement(ownerAcknowledgementData);
            }
        },
        [setOwnerAcknowledgement]
    );
    const shouldStateW4pRender = isAllowedState(contractIssueState)
    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormType isFormStateReadOnly={isFormStateReadOnly} formSubtypeOptions={formSubtypeOptions} />

            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <DistributionReason reasonOptions={reasonOptions} isFormStateReadOnly={isFormStateReadOnly} />
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
                </>
            )}

            <FormDistribution
                isDerivedMethodFromFunds={true}
                defaultMethod={FundWithdrawnMethod.Default}
                isFormStateReadOnly={isFormStateReadOnly}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={t('distributionInstruction.investmentSelectionForDistribution') as string}
            />

            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
            <TaxWithholdings
                isFormStateReadOnly={isFormStateReadOnly}
                ownerStateOfResidence={ownerStateOfResidence}
                isMaritalStatusAllowances={true}
                meritalStatusAllowanceConfig={meritalStatusAllowanceConfig}
            />
            <IrsWithholding signatureFields={irsSignatureConfig} isFormStateReadOnly={isFormStateReadOnly} />
            {shouldStateW4pRender && <StateW4Form isFormStateReadOnly={isFormStateReadOnly} w4pSignaturesConfig={w4pSignaturesConfig} />}

            <FormWaivers config={waiverItemsConfig} isFormStateReadOnly={isFormStateReadOnly} />

            <OwnerAcknowledgementOfTaxInformation
                isFormStateReadOnly={isFormStateReadOnly}
                onChange={handleOwnerAcknowledgementChange}
                ownerAcknowledgement={ownerAcknowledgement}
            />

            {hasTpaAuthorization && <EmployerTpaAuthorization isFormStateReadOnly={isFormStateReadOnly} />}
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
        </>
    );
}
