import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import IrsWithholding from '@deps/components/otp-withdrawal-form/irs-withholdings';
import JointLifeExpectancy from '@deps/components/otp-withdrawal-form/rmd-method/joint-life-expectancy';
import RMDMethod from '@deps/components/otp-withdrawal-form/rmd-method/rmd-method';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import SignatureVerificationReasons from '@deps/components/otp-withdrawal-form/signature-validation/signature-verification-reason';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { USStates } from '@deps/constants/geography/us-states';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helpers';
import { QualTypes } from '@deps/models/case/withdrawal/case';
import { isAllowedState } from '@deps/utils/renderStateW4';

import useMassMutualRmdConfig from './mm-rmd-form.helpers';

type MassMutualRmdWithdrawalFormProps = {
    qualType: QualTypes | '';
};

export default function MassMutualRmdWithdrawalForm({ qualType }: MassMutualRmdWithdrawalFormProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const {
        getSignaturesConfig,
        formPartyConfigs,
        irsSignatureConfig,
        formValidation,
        w4pSignaturesConfig,
        fundWithdrawnMethodOptions,
        disbursementOptions,
        jointLifeExpectancyConfigs,
        signVerificationReasonConfig,
        validateMaritalStatusAllowances,
        eSignatureFieldConfig,
    } = useMassMutualRmdConfig(t);

    const {
        formParty,
        setFormData,
        formData,
        initialForm,
        setFormValidator,
        ownerStateOfResidence,
        setOwnerStateOfResidence,
        formSignature,
        contractIssueState,
        isFormStateReadOnly,
        formESignatureData,
        setFormESignatureData,
        formErrors,
    } = useContext(FormDataContext);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, []);

    useEffect(() => {
        setFormData({
            ...formData,
            formExtName: `${initialForm?.carrier}_RMD_DIGITAL_FORM`, //get client code & withdrawal type from index
            metaData: {
                formType: `${initialForm?.carrier}_RMD_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
    }, [initialForm]);

    useEffect(() => {
        const newOwnerStateOfResidence = getOwnerStateOfResidence(formParty);
        if (newOwnerStateOfResidence !== ownerStateOfResidence) {
            setOwnerStateOfResidence(newOwnerStateOfResidence);
        }
    }, [formParty]);

    const verificationReason = formSignature?.signVerificationReason ?? [];
    const isKeogh = qualType === QualTypes.KEOGHHR10;
    const signaturesConfig = getSignaturesConfig(isKeogh);
    const isMaritalStatusAllowances = contractIssueState ? validateMaritalStatusAllowances(contractIssueState as USStates) : false;
    const shouldStateW4pRender = isAllowedState(contractIssueState);
    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <RMDMethod isFormStateReadOnly={isFormStateReadOnly} />
            <JointLifeExpectancy isFormStateReadOnly={isFormStateReadOnly} configs={jointLifeExpectancyConfigs} />
            <FormDistribution
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={t('distributionInstruction.investmentSelectionForDistribution') as string}
                isFormStateReadOnly={isFormStateReadOnly}
            />
            <TaxWithholdings
                isFormStateReadOnly={isFormStateReadOnly}
                isMaritalStatusAllowances={isMaritalStatusAllowances}
                specifiedView={true}
            />
            <IrsWithholding isFormStateReadOnly={isFormStateReadOnly} signatureFields={irsSignatureConfig} />
            {shouldStateW4pRender && <StateW4Form isFormStateReadOnly={isFormStateReadOnly} w4pSignaturesConfig={w4pSignaturesConfig} />}
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />

            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig}>
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
}
