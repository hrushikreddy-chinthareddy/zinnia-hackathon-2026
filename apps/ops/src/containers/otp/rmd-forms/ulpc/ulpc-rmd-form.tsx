import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import BeneficiaryInfo from '@deps/components/otp-withdrawal-form/beneficiary-information/beneficiary-info';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import IrsWithholding from '@deps/components/otp-withdrawal-form/irs-withholdings';
import RMDMethod from '@deps/components/otp-withdrawal-form/rmd-method/rmd-method';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helpers';
import { Processes } from '@deps/models/case/case';
import { RmdFormType } from '@deps/models/case/enums';
import { Carrier, RMDType } from '@deps/models/case/withdrawal/case';
import { isAllowedStateRMD } from '@deps/utils/renderStateW4';

import getUlpcRmdConfig from './ulpc-rmd-form.helpers';
import DistributionMethodQcd from '../qcd/qcd-distribution-method';
import SelectFormType from '../rmd-form-type';

export default function UlpcRmdWithdrawalForm() {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });
    const {
        signaturesConfig,
        formPartyConfigs,
        irsSignatureConfig,
        formValidation,
        w4pSignaturesConfig,
        disbursementOptions,
        isBeneSpouseOption,
        fundWithdrawnMethodOptions,
        beneficiaryConfig,
        eSignatureFieldConfig,
    } = getUlpcRmdConfig(t);

    const {
        formParty,
        setFormData,
        formData,
        formProgram,
        setFormProgram,
        initialForm,
        setFormValidator,
        ownerStateOfResidence,
        setOwnerStateOfResidence,
        contractIssueState,
        isFormStateReadOnly,
        formBeneInfo,
        setFormBeneInfo,
        formErrors,
        formESignatureData,
        setFormESignatureData,
    } = useContext(FormDataContext);
    const [rmdFormType, setRmdFormType] = useState(
        (formProgram.programType?.text as RmdFormType) ?? RmdFormType.RMD
    );

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, []);

    useEffect(() => {
        setFormData({
            ...formData,
            formExtName: `${Carrier.ULPC}_${rmdFormType}_DIGITAL_FORM`,
            metaData: {
                formType: `${Carrier.ULPC}_${rmdFormType}_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
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
                rmdFormType === RmdFormType.QCD && prev?.qcd
                    ? [...prev.qcd]
                    : [],
        }));
    }, [initialForm, rmdFormType]);

    useEffect(() => {
        const newOwnerStateOfResidence = getOwnerStateOfResidence(formParty);
        if (newOwnerStateOfResidence !== ownerStateOfResidence) {
            setOwnerStateOfResidence(newOwnerStateOfResidence);
        }
    }, [formParty]);

    const shouldStateW4pRender = isAllowedStateRMD(contractIssueState ?? '');
    const isRmdForm = rmdFormType === RmdFormType.RMD;

    const rmdComponents = isRmdForm && (
        <>
            <RMDMethod isFormStateReadOnly={isFormStateReadOnly} />
            <BeneficiaryInfo
                isFormStateReadOnly={isFormStateReadOnly}
                beneInfo={formBeneInfo}
                onBeneChange={setFormBeneInfo}
                isBeneSpouseOption={isBeneSpouseOption}
                configs={beneficiaryConfig}
            />
            <TaxWithholdings isFormStateReadOnly={isFormStateReadOnly} />
            {shouldStateW4pRender && (
                <StateW4Form
                    isFormStateReadOnly={isFormStateReadOnly}
                    w4pSignaturesConfig={w4pSignaturesConfig}
                />
            )}
            <IrsWithholding
                isFormStateReadOnly={isFormStateReadOnly}
                signatureFields={irsSignatureConfig}
            />
            <FormDisbursement
                isFormStateReadOnly={isFormStateReadOnly}
                options={disbursementOptions}
            />
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
}
