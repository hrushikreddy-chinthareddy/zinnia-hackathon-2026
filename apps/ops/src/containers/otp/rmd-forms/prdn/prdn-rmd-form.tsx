import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import EmployerTpaAuthorization from '@deps/components/otp-withdrawal-form/employer-tpa-authorization';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import IrsWithholding from '@deps/components/otp-withdrawal-form/irs-withholdings';
import RMDMethod from '@deps/components/otp-withdrawal-form/rmd-method/rmd-method';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { USStates } from '@deps/constants/geography/us-states';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Carrier } from '@deps/models/case/withdrawal/case';

import getPrdnWithdrawalConfig from './prdn-rmd-form.helper';
import { FormSubtype } from '../../withdrawal-forms/flic-withdrawal-form.helper';

const PrdnRmdWithdrawalForm = () => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const {
        formValidation,
        formPartyConfigs,
        disbursementOptions,
        fundWithdrawnMethodOptions,
        irsSignatureConfig,
        signaturesConfig,
        validateMaritalStatusAllowances,
    } = getPrdnWithdrawalConfig(t);
    const { setFormValidator, setFormData, formSubtype, initialForm, contractIssueState, isFormStateReadOnly, formTpaAuthorization } =
        useContext(FormDataContext);

    useEffect(() => {
        if (formSubtype) {
            setFormData(fs => ({
                ...fs,
                formExtName: `${initialForm?.carrier || Carrier.PRDN}_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`, //get client code & withdrawal type from index
                metaData: {
                    formType: `${initialForm?.carrier || Carrier.PRDN}_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`,
                    formId: null,
                    formNumber: '',
                },
            }));
        }
    }, [setFormData, initialForm, formSubtype]);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, [setFormValidator]);

    const hasTpaAuthorization = formTpaAuthorization && !Object.values(formTpaAuthorization).every(val => val === null);
    const isMaritalStatusAllowances = contractIssueState ? validateMaritalStatusAllowances(contractIssueState as USStates) : false;
    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <RMDMethod isFormStateReadOnly={isFormStateReadOnly} />
            <FormDistribution
                isFormStateReadOnly={isFormStateReadOnly}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={t('distributionInstruction.distributionInstruction') as string}
            />
            <TaxWithholdings
                isFormStateReadOnly={isFormStateReadOnly}
                isMaritalStatusAllowances={isMaritalStatusAllowances && formSubtype === FormSubtype.PartialWithdrawal}
                specifiedView={true}
            />

            <IrsWithholding signatureFields={irsSignatureConfig} isFormStateReadOnly={isFormStateReadOnly} />
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
            {hasTpaAuthorization && <EmployerTpaAuthorization isFormStateReadOnly={isFormStateReadOnly} />}
        </>
    );
};

export default PrdnRmdWithdrawalForm;
