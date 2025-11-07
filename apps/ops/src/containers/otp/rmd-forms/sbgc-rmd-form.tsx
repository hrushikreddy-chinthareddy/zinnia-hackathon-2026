import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import EmployerTpaAuthorization from '@deps/components/otp-withdrawal-form/employer-tpa-authorization';
import FinancialProfessionalSignature from '@deps/components/otp-withdrawal-form/financial-professional-signature';
import FormDisbursementV2 from '@deps/components/otp-withdrawal-form/form-disbursement-V2/form-disbursement-v2';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import JointLifeExpectancy from '@deps/components/otp-withdrawal-form/rmd-method/joint-life-expectancy';
import RMDMethod from '@deps/components/otp-withdrawal-form/rmd-method/rmd-method';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { USStates } from '@deps/constants/geography/us-states';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Processes } from '@deps/models/case/case';
import { RmdFormType } from '@deps/models/case/enums';
import { Carrier, RMDType } from '@deps/models/case/withdrawal/case';
import { isAllowedStateRMD } from '@deps/utils/renderStateW4';

import DistributionMethodQcd from './qcd/qcd-distribution-method';
import SelectFormType from './rmd-form-type';
import getSbgcRmdConfig from './sbgc-rmd-form.helpers';

export default function SbgcRmdWithdrawalForm() {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });
    const {
        signaturesConfig,
        formPartyConfigs,
        formValidation,
        disbursementOptions,
        jointLifeExpectancyConfigs,
        fundWithdrawnMethodOptions,
        w4pSignaturesConfig,
        eSignatureFieldConfig,
    } = getSbgcRmdConfig(t);

    const {
        formParty,
        setFormData,
        formData,
        formProgram,
        setFormProgram,
        initialForm,
        setFormValidator,
        formTpaAuthorization,
        isFormStateReadOnly,
        contractIssueState,
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
            formExtName: `${Carrier.SBGC}_${rmdFormType}_DIGITAL_FORM`,
            metaData: {
                formType: `${Carrier.SBGC}_${rmdFormType}_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });

        const newRMDFormType = {
            ...formProgram,
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
            qcd: formProgram.qcd ? [...formProgram.qcd] : [],
        };

        setFormProgram(newRMDFormType);
    }, [initialForm, rmdFormType]);

    const hasTpaAuthorization =
        formTpaAuthorization &&
        !Object.values(formTpaAuthorization).every((val) => val === null);
    const ownerStateOfResidence =
        formParty?.parties?.[0]?.addresses?.[0]?.state;
    const ownerIsVirginiaResident = ownerStateOfResidence === USStates.VIRGINIA;
    const shouldStateW4pRender = isAllowedStateRMD(contractIssueState ?? '');
    const isRmdForm = rmdFormType === RmdFormType.RMD;

    const rmdComponents = isRmdForm && (
        <>
            <JointLifeExpectancy
                isFormStateReadOnly={isFormStateReadOnly}
                configs={jointLifeExpectancyConfigs}
            />
            <RMDMethod isFormStateReadOnly={isFormStateReadOnly} />
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
            <FormDisbursementV2
                isFormStateReadOnly={isFormStateReadOnly}
                options={disbursementOptions as any}
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
            <FormDistribution
                isFormStateReadOnly={isFormStateReadOnly}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={
                    t(
                        'distributionInstruction.distributionInstruction'
                    ) as string
                }
            />
            {isRmdForm ? rmdComponents : qcdComponents}
            {ownerIsVirginiaResident && (
                <FinancialProfessionalSignature
                    isFormStateReadOnly={isFormStateReadOnly}
                />
            )}
            <SignatureValidations
                isFormStateReadOnly={isFormStateReadOnly}
                config={signaturesConfig}
            />
            {hasTpaAuthorization && (
                <EmployerTpaAuthorization
                    isFormStateReadOnly={isFormStateReadOnly}
                />
            )}
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
