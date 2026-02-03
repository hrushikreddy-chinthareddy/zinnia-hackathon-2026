import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormDisbursementV2 from '@deps/components/otp-withdrawal-form/form-disbursement-V2/form-disbursement-v2';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import IrsWithholding from '@deps/components/otp-withdrawal-form/irs-withholdings';
import RMDMethod from '@deps/components/otp-withdrawal-form/rmd-method/rmd-method';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Processes } from '@deps/models/case/case';
import { RmdFormType } from '@deps/models/case/enums';
import { Carrier, RMDType } from '@deps/models/case/withdrawal/case';
import { PaymentMethodOption } from '@deps/models/case/withdrawal/disbursement-types';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { isAllowedStateRMD } from '@deps/utils/renderStateW4';

import getDlicWithdrawalConfig from './dlic-rmd-form.helpers';
import DistributionMethodQcd from '../qcd/qcd-distribution-method';
import SelectFormType from '../rmd-form-type';

const DlicRmdWithdrawalForm = () => {
    const { featureFlags } = useOptimizely();
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });

    const isDelawareBankSecFeatsEnabled =
        featureFlags[FEATURE_FLAGS.DELAWARE_BANK_SEC_FEATS];

    const isDlic3pDisbursementChangesEnabled =
        featureFlags[FEATURE_FLAGS.DLIC_3P_DISBURSEMENT_CHANGES];

    const {
        formValidation,
        formPartyConfigs,
        disbursementOptions,
        disbursementOptionsV2,
        fundWithdrawnMethodOptions,
        irsSignatureConfig,
        signaturesConfig,
        additionalWithholdingAmountConfig,
        signaturesNotaryConfig,
        eSignatureFieldConfig,
        w4pSignaturesConfig,
    } = getDlicWithdrawalConfig(t, isDlic3pDisbursementChangesEnabled);
    const {
        formParty,
        setFormValidator,
        setFormData,
        formSubtype,
        initialForm,
        isFormStateReadOnly,
        contractIssueState,
        formProgram,
        setFormProgram,
        formErrors,
        formESignatureData,
        setFormESignatureData,
        isLC,
    } = useContext(FormDataContext);

    const [rmdFormType, setRmdFormType] = useState(
        (formProgram.programType?.text as RmdFormType) ?? RmdFormType.RMD
    );

    useEffect(() => {
        if (formSubtype) {
            setFormData((fs) => ({
                ...fs,
                formExtName: `${
                    initialForm?.carrier || Carrier.DLIC
                }_${rmdFormType}_DIGITAL_FORM`,
                metaData: {
                    formType: `${
                        initialForm?.carrier || Carrier.DLIC
                    }_${rmdFormType}_DIGITAL_FORM`,
                    formId: null,
                    formNumber: '',
                },
            }));
        }
        setFormProgram((prev) => ({
            ...prev,
            program: {
                text:
                    rmdFormType === RmdFormType.QCD
                        ? Processes.QCD
                        : Processes.RequiredMinimumDistribution,
            },
            programType: {
                text:
                    rmdFormType === RmdFormType.QCD
                        ? RmdFormType.QCD
                        : RmdFormType.RMD,
            },
            qcd:
                rmdFormType === RmdFormType.QCD && prev.qcd
                    ? [...prev.qcd]
                    : [],
        }));
    }, [initialForm, formSubtype, rmdFormType]);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, [setFormValidator]);

    const ownerStateOfResidence =
        formParty?.parties?.[0]?.addresses?.[0]?.state;
    const isRmdForm = rmdFormType === RmdFormType.RMD;

    const fastRmdOptions = [
        { label: t(`rmdMethod.rmdTypes.auto`), value: RMDType.AutoRMD },
        { label: t('rmdMethod.rmdTypes.oneTime'), value: RMDType.OneTimeRMD },
    ];

    const shouldStateW4pRender = isAllowedStateRMD(contractIssueState ?? '');

    const rmdComponents = isRmdForm && (
        <>
            {isLC ? (
                <RMDMethod isFormStateReadOnly={isFormStateReadOnly} />
            ) : (
                <RMDMethod
                    isFormStateReadOnly={isFormStateReadOnly}
                    rmdTypeOptions={fastRmdOptions}
                    isLC={false}
                />
            )}
            <TaxWithholdings
                isFormStateReadOnly={isFormStateReadOnly}
                ownerStateOfResidence={ownerStateOfResidence}
                additionalWithHoldingConfig={additionalWithholdingAmountConfig}
            />
            {shouldStateW4pRender && (
                <StateW4Form
                    isFormStateReadOnly={isFormStateReadOnly}
                    w4pSignaturesConfig={w4pSignaturesConfig}
                />
            )}
            <IrsWithholding
                signatureFields={irsSignatureConfig}
                isFormStateReadOnly={isFormStateReadOnly}
            />
            {isDelawareBankSecFeatsEnabled ? (
                <FormDisbursementV2
                    isFormStateReadOnly={isFormStateReadOnly}
                    options={disbursementOptionsV2}
                />
            ) : (
                <FormDisbursement
                    isFormStateReadOnly={isFormStateReadOnly}
                    options={
                        disbursementOptions(
                            formParty,
                            formProgram
                        ) as PaymentMethodOption[]
                    }
                />
            )}
        </>
    );

    const qcdComponents = !isRmdForm && (
        <>
            <RMDMethod
                isFormStateReadOnly={isFormStateReadOnly}
                rmdTypeOptions={[
                    {
                        label: t('rmdMethod.rmdTypes.calculate'),
                        value: RMDType.CalculateRMD,
                    },
                ]}
                isQCD={true}
            />
            <DistributionMethodQcd
                formProgram={formProgram}
                setFormProgram={setFormProgram}
                isFormStateReadOnly={isFormStateReadOnly}
            />
        </>
    );

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <SelectFormType
                formType={rmdFormType}
                onFormTypeChange={setRmdFormType}
                isFormStateReadOnly={isFormStateReadOnly}
            />
            <FormParties
                isFormStateReadOnly={isFormStateReadOnly}
                configs={formPartyConfigs}
            />
            {isRmdForm ? rmdComponents : qcdComponents}

            <FormDistribution
                isFormStateReadOnly={isFormStateReadOnly}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={
                    t(
                        'distributionInstruction.distributionInstruction'
                    ) as string
                }
            />

            <SignatureValidations
                isFormStateReadOnly={isFormStateReadOnly}
                config={signaturesConfig}
            />
            <SignatureValidations
                isFormStateReadOnly={isFormStateReadOnly}
                headerTranslationKey={'notaryHeader'}
                config={signaturesNotaryConfig}
            />
            <ESignatureValidation
                isFormStateReadOnly={isFormStateReadOnly}
                formESignatureData={
                    formESignatureData || ({} as FormEsignatureData)
                }
                setFormESignatureData={setFormESignatureData}
                fieldConfig={eSignatureFieldConfig}
                formErrors={formErrors}
            />
        </>
    );
};

export default DlicRmdWithdrawalForm;
