import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import EmployerTpaAuthorization from '@deps/components/otp-withdrawal-form/employer-tpa-authorization';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import IrsWithholding from '@deps/components/otp-withdrawal-form/irs-withholdings';
import JointLifeExpectancy from '@deps/components/otp-withdrawal-form/rmd-method/joint-life-expectancy';
import RMDMethod from '@deps/components/otp-withdrawal-form/rmd-method/rmd-method';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helper';
import { Carrier, FundWithdrawnMethod } from '@deps/models/case/withdrawal/case';

import getPrdnWithdrawalConfig from './prdn-rmd-form.helper';

const PrdnRmdWithdrawalForm = () => {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const {
        formValidation,
        formPartyConfigs,
        disbursementOptions,
        fundWithdrawnMethodOptions,
        jointLifeExpectancyConfigs,
        irsSignatureConfig,
        signaturesConfig,
    } = getPrdnWithdrawalConfig(t);
    const {
        formParty,
        setFormValidator,
        setFormData,
        formSubtype,
        initialForm,
        isFormStateReadOnly,
        formTpaAuthorization,
        ownerStateOfResidence,
        setOwnerStateOfResidence,
    } = useContext(FormDataContext);

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

    useEffect(() => {
        const newOwnerStateOfResidence = getOwnerStateOfResidence(formParty);
        if (newOwnerStateOfResidence !== ownerStateOfResidence) {
            setOwnerStateOfResidence(newOwnerStateOfResidence);
        }
    }, [formParty]);

    const hasTpaAuthorization = formTpaAuthorization && !Object.values(formTpaAuthorization).every(val => val === null);

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <JointLifeExpectancy isFormStateReadOnly={isFormStateReadOnly} configs={jointLifeExpectancyConfigs} />
            <RMDMethod isFormStateReadOnly={isFormStateReadOnly} />
            <FormDistribution
                isFormStateReadOnly={isFormStateReadOnly}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={t('distributionInstruction.distributionInstruction') as string}
                defaultMethod={FundWithdrawnMethod.Default}
            />
            <TaxWithholdings isFormStateReadOnly={isFormStateReadOnly} ownerStateOfResidence={ownerStateOfResidence} />

            <IrsWithholding signatureFields={irsSignatureConfig} isFormStateReadOnly={isFormStateReadOnly} />
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
            {hasTpaAuthorization && <EmployerTpaAuthorization isFormStateReadOnly={isFormStateReadOnly} />}
        </>
    );
};

export default PrdnRmdWithdrawalForm;
