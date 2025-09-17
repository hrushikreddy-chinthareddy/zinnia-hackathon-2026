import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import BeneficiaryInfo from '@deps/components/otp-withdrawal-form/beneficiary-information/beneficiary-info';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import RMDMethod from '@deps/components/otp-withdrawal-form/rmd-method/rmd-method';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxOL4753Attachment from '@deps/components/otp-withdrawal-form/tax-ol4753-attachment';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helpers';
import { Processes } from '@deps/models/case/case';
import { RmdFormType } from '@deps/models/case/enums';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { Carrier, RMDType } from '@deps/models/case/withdrawal/case';
import { isAllowedStateRMD } from '@deps/utils/renderStateW4';

import getNasuRmdConfig from './nasu-rmd-form.helpers';
import DistributionMethodQcd from '../qcd/qcd-distribution-method';
import SelectFormType from '../rmd-form-type';

export default function NasuRmdWithdrawalForm() {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });
    const {
        formPartyConfigs,
        signaturesConfig,
        signaturesNotaryConfig,
        formValidation,
        w4pSignaturesConfig,
        disbursementOptions,
        isBeneSpouseOption,
        handleShouldShowDOBInOl4573,
        beneficiaryConfig,
        eSignatureFieldConfig,
    } = getNasuRmdConfig(t);

    const {
        formParty,
        setFormData,
        formData,
        initialForm,
        setFormValidator,
        ownerStateOfResidence,
        setOwnerStateOfResidence,
        contractIssueState,
        isFormStateReadOnly,
        formBeneInfo,
        formProgram,
        setFormProgram,
        setFormBeneInfo,
        parties,
        formESignatureData,
        setFormESignatureData,
        formErrors,
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
            formExtName: `${Carrier.NASU}_${rmdFormType}_DIGITAL_FORM`,
            metaData: {
                formType: `${Carrier.NASU}_${rmdFormType}_DIGITAL_FORM`,
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
            qcd: prev.qcd ? [...prev.qcd] : [],
        }));
    }, [initialForm, rmdFormType]);

    useEffect(() => {
        const newOwnerStateOfResidence = getOwnerStateOfResidence(formParty);
        if (newOwnerStateOfResidence !== ownerStateOfResidence) {
            setOwnerStateOfResidence(newOwnerStateOfResidence);
        }
    }, [formParty]);

    const shouldShowDOBInOl4573 = handleShouldShowDOBInOl4573(
        parties as LifeCadParty[]
    );
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
            <TaxWithholdings
                isFormStateReadOnly={isFormStateReadOnly}
                ownerStateOfResidence={ownerStateOfResidence}
            />
            {shouldStateW4pRender && (
                <StateW4Form
                    isFormStateReadOnly={isFormStateReadOnly}
                    w4pSignaturesConfig={w4pSignaturesConfig}
                />
            )}
            <TaxOL4753Attachment
                isFormStateReadOnly={isFormStateReadOnly}
                shouldShowDOBInOl4573={shouldShowDOBInOl4573}
            />
            <FormDisbursement
                isFormStateReadOnly={isFormStateReadOnly}
                options={disbursementOptions}
            />
        </>
    );
    const qcdComponents = !isRmdForm && (
        <>
            <DistributionMethodQcd
                formProgram={formProgram}
                setFormProgram={setFormProgram}
                isFormStateReadOnly={isFormStateReadOnly}
            />
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
}
