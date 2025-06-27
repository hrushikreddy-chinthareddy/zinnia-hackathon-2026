import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import EmployerTpaAuthorization from '@deps/components/otp-withdrawal-form/employer-tpa-authorization';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import IrsWithholding from '@deps/components/otp-withdrawal-form/irs-withholdings';
import RMDMethod from '@deps/components/otp-withdrawal-form/rmd-method/rmd-method';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import {
    Carrier,
    FundWithdrawnMethod,
} from '@deps/models/case/withdrawal/case';

import getUsaaWithdrawalConfig from './usaa-rmd-from.helpers';

const UsaaRmdWithdrawalForm = () => {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });
    const {
        formValidation,
        formPartyConfigs,
        disbursementOptions,
        fundWithdrawnMethodOptions,
        irsSignatureConfig,
        signaturesConfig,
        eSignatureFieldConfig,
    } = getUsaaWithdrawalConfig(t);
    const {
        formParty,
        setFormValidator,
        setFormData,
        formSubtype,
        initialForm,
        isFormStateReadOnly,
        formTpaAuthorization,
        formErrors,
        formESignatureData,
        setFormESignatureData,
    } = useContext(FormDataContext);

    useEffect(() => {
        if (formSubtype) {
            setFormData((fs) => ({
                ...fs,
                formExtName: `${
                    initialForm?.carrier || Carrier.USAA
                }_RMD_DIGITAL_FORM`,
                metaData: {
                    formType: `${
                        initialForm?.carrier || Carrier.USAA
                    }_RMD_DIGITAL_FORM`,
                    formId: null,
                    formNumber: '',
                },
            }));
        }
    }, [setFormData, initialForm, formSubtype]);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, [setFormValidator]);

    const ownerStateOfResidence =
        formParty?.parties?.[0]?.addresses?.[0]?.state;

    const hasTpaAuthorization =
        formTpaAuthorization &&
        !Object.values(formTpaAuthorization).every((val) => val === null);
    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormParties
                isFormStateReadOnly={isFormStateReadOnly}
                configs={formPartyConfigs}
            />

            <RMDMethod isFormStateReadOnly={isFormStateReadOnly} />
            <FormDistribution
                isFormStateReadOnly={isFormStateReadOnly}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={
                    t(
                        'distributionInstruction.distributionInstruction'
                    ) as string
                }
                defaultMethod={FundWithdrawnMethod.Default}
            />
            <TaxWithholdings
                isFormStateReadOnly={isFormStateReadOnly}
                ownerStateOfResidence={ownerStateOfResidence}
            />
            <IrsWithholding
                signatureFields={irsSignatureConfig}
                isFormStateReadOnly={isFormStateReadOnly}
            />
            <FormDisbursement
                isFormStateReadOnly={isFormStateReadOnly}
                options={disbursementOptions}
            />
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
};

export default UsaaRmdWithdrawalForm;
