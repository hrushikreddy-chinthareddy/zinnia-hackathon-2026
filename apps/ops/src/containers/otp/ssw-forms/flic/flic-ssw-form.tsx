import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import AmountDetails from '@deps/components/otp-withdrawal-form/amount-details';
import CslnCheck from '@deps/components/otp-withdrawal-form/csln-check';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import IrsWithholding from '@deps/components/otp-withdrawal-form/irs-withholdings';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import SystematicWithdrawalProgram from '@deps/components/otp-withdrawal-form/ssw-program/ssw-program';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helper';
import { Carrier, Frequency, FundWithdrawnMethod, PaymentMethod, QualTypes } from '@deps/models/case/withdrawal/case';

import getFlicConfig from './flic-ssw-form-helper';
import SswEditSelection from '../ssw-edit-selection';

type SswFormProps = {
    qualType: QualTypes | '';
};

export function FlicSSWForm({ qualType }: SswFormProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const [sswProgramFrequency, setSswProgramFrequency] = useState('' as Frequency);

    const {
        formValidation,
        formPartyConfigs,
        fundWithdrawnMethodOptions,
        systematicWithdrawalOptions,
        irsSignatureConfig,
        disbursementOptions,
        signaturesConfig,
        cslnCheckStates,
    } = getFlicConfig(t);
    const {
        formParty,
        setFormValidator,
        formData,
        setFormData,
        initialForm,
        isFormStateReadOnly,
        setFormDisbursement,
        ownerStateOfResidence,
        contractIssueState,
        setOwnerStateOfResidence,
        formProgram,
    } = useContext(FormDataContext);

    useEffect(() => {
        setFormValidator(() => formValidation);

        setFormData({
            ...formData,
            formExtName: `${initialForm?.carrier || Carrier.FLIC}_SSW_DIGITAL_FORM`, //get client code & withdrawal type from index
            metaData: {
                formType: `${initialForm?.carrier || Carrier.FLIC}_SSW_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
    }, []);

    useEffect(() => {
        const newOwnerStateOfResidence = getOwnerStateOfResidence(formParty);
        if (newOwnerStateOfResidence !== ownerStateOfResidence) {
            setOwnerStateOfResidence(newOwnerStateOfResidence);
        }
    }, [formParty]);

    const handleSswProgramFrequency = (frequency: Frequency) => {
        setFormDisbursement(ogFormDisbusement => ({
            ...ogFormDisbusement,
            paymentMethod: {
                text: frequency === Frequency.Monthly ? PaymentMethod.EFT : ogFormDisbusement?.paymentMethod?.text,
            },
        }));
        setSswProgramFrequency(frequency);
    };

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <SswEditSelection />
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <AmountDetails isFormStateReadOnly={isFormStateReadOnly} isOnlyWithdrawalTypeControls={true} />
            <SystematicWithdrawalProgram
                isReadOnly={isFormStateReadOnly}
                options={systematicWithdrawalOptions}
                onSswProgramFrequencyChange={handleSswProgramFrequency}
            />
            <FormDistribution
                isDerivedMethodFromFunds={true}
                isFormStateReadOnly={isFormStateReadOnly}
                defaultMethod={FundWithdrawnMethod.Prorata}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions(formProgram?.programSubType?.text || '')}
                title={t('distributionInstruction.investmentSelectionForDistribution') as string}
            />
            <TaxWithholdings isFormStateReadOnly={isFormStateReadOnly} ownerStateOfResidence={ownerStateOfResidence} />
            <IrsWithholding isFormStateReadOnly={isFormStateReadOnly} signatureFields={irsSignatureConfig} />
            <FormDisbursement
                isFormStateReadOnly={isFormStateReadOnly}
                options={disbursementOptions(sswProgramFrequency, qualType)}
                defaultValue={sswProgramFrequency === Frequency.Monthly ? PaymentMethod.EFT : ('' as PaymentMethod)}
                key={sswProgramFrequency}
            />
            {(ownerStateOfResidence || contractIssueState) &&
                [ownerStateOfResidence, contractIssueState].some(state => state && cslnCheckStates.includes(state)) && (
                    <CslnCheck isFormStateReadOnly={isFormStateReadOnly} />
                )}
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
        </>
    );
}
