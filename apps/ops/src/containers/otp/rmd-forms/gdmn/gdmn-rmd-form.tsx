import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import EmployerTpaAuthorization from '@deps/components/otp-withdrawal-form/employer-tpa-authorization';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import IrsWithholding from '@deps/components/otp-withdrawal-form/irs-withholdings';
import RMDMethod from '@deps/components/otp-withdrawal-form/rmd-method/rmd-method';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Processes } from '@deps/models/case/case';
import { RmdFormType } from '@deps/models/case/enums';
import { Carrier, FundWithdrawnMethod, RMDType } from '@deps/models/case/withdrawal/case';
import { isAllowedState } from '@deps/utils/renderStateW4';

import getGdmnRmdConfig from './gdmn-rmd-form.helper';
import DistributionMethodQcd from '../qcd/qcd-distribution-method';
import SelectFormType from '../rmd-form-type';

export default function GdmnRmdWithdrawalForm() {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const {
        formValidation,
        formPartyConfigs,
        fundWithdrawnMethodOptions,
        irsSignatureConfig,
        w4pSignaturesConfig,
        disbursementOptions,
        signaturesConfig,
        eSignatureFieldConfig,
    } = getGdmnRmdConfig(t);

    const {
        setFormData,
        formData,
        initialForm,
        setFormValidator,
        formTpaAuthorization,
        isFormStateReadOnly,
        contractIssueState,
        formProgram,
        setFormProgram,
        formESignatureData,
        setFormESignatureData,
        formErrors,
    } = useContext(FormDataContext);

    const [rmdFormType, setRmdFormType] = useState((formProgram.programType?.text as RmdFormType) ?? RmdFormType.RMD);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, []);

    useEffect(() => {
        setFormData({
            ...formData,
            formExtName: `${initialForm?.carrier || Carrier.GDMN}_${rmdFormType}_DIGITAL_FORM`,
            metaData: {
                formType: `${initialForm?.carrier || Carrier.GDMN}_${rmdFormType}_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
        setFormProgram(prev => ({
            ...prev,
            program: {
                text: rmdFormType === RmdFormType.QCD ? Processes.QCD : Processes.RequiredMinimumDistribution,
            },
            programType: {
                text: rmdFormType === RmdFormType.QCD ? RmdFormType.QCD : RmdFormType.RMD,
            },
            qcd: prev.qcd ? [...prev.qcd] : [],
        }));
    }, [initialForm, rmdFormType]);

    const hasTpaAuthorization = formTpaAuthorization && !Object.values(formTpaAuthorization).every(val => val === null);
    const shouldStateW4pRender = isAllowedState(contractIssueState);
    const isRmdForm = rmdFormType === RmdFormType.RMD;

    const rmdComponents = isRmdForm && (
        <>
            <RMDMethod isFormStateReadOnly={isFormStateReadOnly} />
            <TaxWithholdings isFormStateReadOnly={isFormStateReadOnly} />
            <IrsWithholding isFormStateReadOnly={isFormStateReadOnly} signatureFields={irsSignatureConfig} />
            {shouldStateW4pRender && <StateW4Form isFormStateReadOnly={isFormStateReadOnly} w4pSignaturesConfig={w4pSignaturesConfig} />}
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
        </>
    );

    const qcdComponents = !isRmdForm && (
        <>
            <RMDMethod
                isFormStateReadOnly={isFormStateReadOnly}
                rmdTypeOptions={[{ label: t('rmdMethod.rmdTypes.calculate'), value: RMDType.CalculateRMD }]}
                isQCD={true}
            />
            <DistributionMethodQcd formProgram={formProgram} setFormProgram={setFormProgram} isFormStateReadOnly={isFormStateReadOnly} />
        </>
    );

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <SelectFormType formType={rmdFormType} onFormTypeChange={setRmdFormType} isFormStateReadOnly={isFormStateReadOnly} />
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            {isRmdForm ? rmdComponents : qcdComponents}
            <FormDistribution
                isFormStateReadOnly={isFormStateReadOnly}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={t('distributionInstruction.distributionInstruction') as string}
                isDerivedMethodFromFunds={true}
                defaultMethod={FundWithdrawnMethod.Prorata}
            />

            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
            {hasTpaAuthorization && <EmployerTpaAuthorization isFormStateReadOnly={isFormStateReadOnly} />}
            <ESignatureValidation
                formESignatureData={formESignatureData || ({} as FormEsignatureData)}
                setFormESignatureData={setFormESignatureData}
                fieldConfig={eSignatureFieldConfig}
                formErrors={formErrors}
            />
        </>
    );
}
