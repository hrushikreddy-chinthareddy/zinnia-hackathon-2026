import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import FormProgramFullWithdrawal from '@deps/components/otp-withdrawal-form/form-program/form-program-full-withdrawal';
import FormProgramPartialWithdrawal from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import DistributionReason from '@deps/components/otp-withdrawal-form/form-restriction/distribution-reason';
import FormType from '@deps/components/otp-withdrawal-form/form-type';
import FormWaivers from '@deps/components/otp-withdrawal-form/form-waivers/form-waivers';
import IrsWithholding from '@deps/components/otp-withdrawal-form/irs-withholdings';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import SignatureVerificationReasons from '@deps/components/otp-withdrawal-form/signature-validation/signature-verification-reason';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { USStates } from '@deps/constants/geography/us-states';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Carrier, FASTQualTypes, QualTypes } from '@deps/models/case/withdrawal/case';
import { isFastFeatureEnabled } from '@deps/utils/optimizely/utils';

import useMassWithdrawalConfig from './mass-withdrawal-form-helpers';
import { FormSubtype } from '../flic-withdrawal-form.helpers';

type MassWithdrawalFormProps = {
    qualType: QualTypes | FASTQualTypes | '';
};
const MassWithdrawalForm = ({ qualType }: MassWithdrawalFormProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });

    const {
        formValidation,
        identifySelectedFormProgramOption,
        partialWithdrawalOptions,
        getSignaturesConfig,
        formPartyConfigs,
        disbursementOptions,
        fundWithdrawnMethodOptions,
        selectOneOptions,
        formSubtypeOptions,
        irsSignatureConfig,
        signVerificationReasonConfig,
        validateMaritalStatusAllowances,
        distributionReasonOptions,
        waiverItemsConfig,
        eSignatureFieldConfig,
    } = useMassWithdrawalConfig(t);
    const {
        setFormValidator,
        setFormData,
        formSubtype,
        initialForm,
        contractIssueState,
        isFormStateReadOnly,
        formSignature,
        formESignatureData,
        setFormESignatureData,
        formErrors,
        featureFlagDecisions
    } = useContext(FormDataContext);

    useEffect(() => {
        if (formSubtype) {
            setFormData(fs => ({
                ...fs,
                formExtName: `${initialForm?.carrier || Carrier.MASS}_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`, //get client code & withdrawal type from index
                metaData: {
                    formType: `${initialForm?.carrier || Carrier.MASS}_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`,
                    formId: null,
                    formNumber: '',
                },
            }));
        }
    }, [setFormData, initialForm, formSubtype]);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, [setFormValidator]);

    const isLC = !isFastFeatureEnabled(initialForm?.taskType, featureFlagDecisions);
    const verificationReason = formSignature?.signVerificationReason ?? [];
    // Fast mapping for  QualTypes.KEOGHHR10 is FASTQualTypes.QUALIFIED
    const isKeogh = isLC ? qualType === QualTypes.KEOGHHR10 : qualType === FASTQualTypes.QUALIFIED;
    const signaturesConfig = getSignaturesConfig(isKeogh);
    const isMaritalStatusAllowances = contractIssueState ? validateMaritalStatusAllowances(contractIssueState as USStates) : false;
    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormType isFormStateReadOnly={isFormStateReadOnly} formSubtypeOptions={formSubtypeOptions} />
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            {isKeogh && <DistributionReason isFormStateReadOnly={isFormStateReadOnly} reasonOptions={distributionReasonOptions} />}
            {formSubtype === FormSubtype.FullWithdrawal ? (
                <>
                    <FormProgramFullWithdrawal isFormStateReadOnly={isFormStateReadOnly} selectOneOptions={selectOneOptions} />
                </>
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
                isMaritalStatusAllowances={isMaritalStatusAllowances && formSubtype === FormSubtype.PartialWithdrawal}
                specifiedView={true}
            />
            {formSubtype === FormSubtype.FullWithdrawal && (
                <FormWaivers config={waiverItemsConfig} isFormStateReadOnly={isFormStateReadOnly} />
            )}
            <IrsWithholding signatureFields={irsSignatureConfig} isFormStateReadOnly={isFormStateReadOnly} />
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
            <SignatureValidations config={signaturesConfig} isFormStateReadOnly={isFormStateReadOnly}>
                {isKeogh ? (
                    <SignatureVerificationReasons
                        isFormStateReadOnly={isFormStateReadOnly}
                        config={signVerificationReasonConfig}
                        checkedItems={verificationReason.length ? verificationReason.map(signReason => signReason.text) : []}
                    ></SignatureVerificationReasons>
                ) : null}
            </SignatureValidations>

            <ESignatureValidation
                isFormStateReadOnly={isFormStateReadOnly}
                formESignatureData={formESignatureData || ({} as FormEsignatureData)}
                setFormESignatureData={setFormESignatureData}
                fieldConfig={eSignatureFieldConfig}
                formErrors={formErrors}
            />
        </>
    );
};

export default MassWithdrawalForm;
