/* eslint-disable import/order */
import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import DistributionReason from '@deps/components/otp-withdrawal-form/form-restriction/distribution-reason';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import SystematicWithdrawalProgram from '@deps/components/otp-withdrawal-form/ssw-program/ssw-program';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Carrier, QualTypes } from '@deps/models/case/withdrawal/case';

import AmountDetails from '@deps/components/otp-withdrawal-form/amount-details';
import IrsWithholding from '@deps/components/otp-withdrawal-form/irs-withholdings';
import useMassWithdrawalConfig from './mass-ssw-form-helper';
import SignatureVerificationReasons from '@deps/components/otp-withdrawal-form/signature-validation/signature-verification-reason';
import { USStates } from '@deps/constants/geography/us-states';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import SswEditSelection from '../ssw-edit-selection';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
type MassWithdrawalFormProps = {
    qualType: QualTypes | '';
};

export function MassMutualSSWForm({ qualType }: MassWithdrawalFormProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const {
        formSignature,
        formParty,
        setFormValidator,
        setFormData,
        initialForm,
        isFormStateReadOnly,
        contractIssueState,
        formErrors,
        formESignatureData,
        setFormESignatureData,
    } = useContext(FormDataContext);

    const {
        reasonOptions,
        formValidation,
        getSignaturesConfig,
        formPartyConfigs,
        disbursementOptions,
        systematicWithdrawalOptions,
        validateMaritalStatusAllowances,
        irsSignatureConfig,
        signVerificationReasonConfig,
        eSignatureFieldConfig,
    } = useMassWithdrawalConfig(t);

    useEffect(() => {
        setFormData(fs => ({
            ...fs,
            formExtName: `${initialForm?.carrier || Carrier.MASS}_SSW_DIGITAL_FORM`, //get client code & withdrawal type from index
            metaData: {
                formType: `${initialForm?.carrier || Carrier.MASS}_SSW_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        }));
    }, [setFormData, initialForm]);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, [setFormValidator]);

    const verificationReason = formSignature?.signVerificationReason ?? [];
    const isKeogh = qualType === QualTypes.KEOGHHR10;
    const signaturesConfig = getSignaturesConfig(isKeogh);
    const ownerStateOfResidence = formParty?.parties?.[0]?.addresses?.[0]?.state;
    const isMaritalStatusAllowances = contractIssueState ? validateMaritalStatusAllowances(contractIssueState as USStates) : false;
    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <SswEditSelection />
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <DistributionReason isFormStateReadOnly={isFormStateReadOnly} reasonOptions={reasonOptions} />
            <AmountDetails isFormStateReadOnly={isFormStateReadOnly} isOnlyWithdrawalTypeControls={true} />
            <SystematicWithdrawalProgram isReadOnly={isFormStateReadOnly} options={systematicWithdrawalOptions} />

            <TaxWithholdings
                specifiedView={true}
                isFormStateReadOnly={isFormStateReadOnly}
                ownerStateOfResidence={ownerStateOfResidence}
                isMaritalStatusAllowances={isMaritalStatusAllowances}
            />
            <IrsWithholding isFormStateReadOnly={isFormStateReadOnly} signatureFields={irsSignatureConfig} />
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig}>
                {isKeogh ? (
                    <SignatureVerificationReasons
                        config={signVerificationReasonConfig}
                        checkedItems={verificationReason.length ? verificationReason.map(signReason => signReason.text) : []}
                    ></SignatureVerificationReasons>
                ) : null}
            </SignatureValidations>
            <ESignatureValidation
                formESignatureData={formESignatureData || ({} as FormEsignatureData)}
                setFormESignatureData={setFormESignatureData}
                fieldConfig={eSignatureFieldConfig}
                formErrors={formErrors}
            />
        </>
    );
}
