import { useTranslation } from 'next-i18next';
import { useContext, useEffect, useState } from 'react';

import AmountDetails from '@deps/components/otp-withdrawal-form/amount-details';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import ESignatureValidation from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation';
import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
import FormDisbursementV2 from '@deps/components/otp-withdrawal-form/form-disbursement-V2/form-disbursement-v2';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import IrsWithholding from '@deps/components/otp-withdrawal-form/irs-withholdings';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import SystematicWithdrawalProgram, {
    SSWProgramOptions,
} from '@deps/components/otp-withdrawal-form/ssw-program/ssw-program';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helpers';
import {
    Carrier,
    Frequency,
    PartyRoles,
    PaymentMethod,
} from '@deps/models/case/withdrawal/case';
import { isAllowedStateSSW } from '@deps/utils/renderStateW4';

import SswEditSelection from '../ssw-edit-selection';
import getDlicConfig from './dlic-ssw-from-helpers';

interface DlicSSWFormProps {
    readonly planCode?: string;
}

export function DlicSSWForm({ planCode = '' }: DlicSSWFormProps) {
    const { t } = useTranslation(undefined, {
        keyPrefix: 'caseWithdrawal.request',
    });
    const [_, setSswProgramFrequency] = useState('' as Frequency);

    const {
        formParty,
        setFormValidator,
        formData,
        setFormData,
        initialForm,
        isFormStateReadOnly,
        setFormDisbursement,
        ownerStateOfResidence,
        setOwnerStateOfResidence,
        formProgram,
        formESignatureData,
        setFormESignatureData,
        formErrors,
        isLC,
    } = useContext(FormDataContext);

    const {
        formValidation,
        w4pSignaturesConfig,
        formPartyConfigs,
        fundWithdrawnMethodOptions,
        systematicWithdrawalOptions,
        disbursementOptions,
        signaturesConfig,
        signaturesNotaryConfig,
        additionalWithholdingAmountConfig,
        irsSignatureConfig,
        eSignatureFieldConfig,
        sswUpdateFastOptions,
    } = getDlicConfig(t, isLC ?? false);

    useEffect(() => {
        setFormValidator(() => formValidation);

        setFormData({
            ...formData,
            formExtName: `${
                initialForm?.carrier || Carrier.DLIC
            }_SSW_DIGITAL_FORM`, //get client code & withdrawal type from index
            metaData: {
                formType: `${
                    initialForm?.carrier || Carrier.DLIC
                }_SSW_DIGITAL_FORM`,
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
        setFormDisbursement((ogFormDisbusement) => ({
            ...ogFormDisbusement,
            paymentMethod: {
                text:
                    frequency === Frequency.Monthly
                        ? PaymentMethod.EFT
                        : ogFormDisbusement?.paymentMethod?.text,
            },
        }));
        setSswProgramFrequency(frequency);
    };
    const shouldStateW4pRender = isAllowedStateSSW(ownerStateOfResidence ?? '');
    const isJointOwnerAvailable = !!formParty?.parties?.find(
        (item) => item.partyRoleType === PartyRoles.JOINT_OWNER
    );

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <SswEditSelection isLC={isLC} fastOptions={sswUpdateFastOptions} />
            <FormParties
                isFormStateReadOnly={isFormStateReadOnly}
                configs={formPartyConfigs}
            />
            <AmountDetails
                isFormStateReadOnly={isFormStateReadOnly}
                isOnlyWithdrawalTypeControls={true}
            />
            <SystematicWithdrawalProgram
                isReadOnly={isFormStateReadOnly}
                options={
                    systematicWithdrawalOptions(
                        planCode,
                        isLC ?? false
                    ) as SSWProgramOptions[]
                }
                onSswProgramFrequencyChange={handleSswProgramFrequency}
                singleLifePersonApplicable={isJointOwnerAvailable}
                jointCoveredPersonApplicable={false}
                isLC={isLC}
            />
            <FormDistribution
                isFormStateReadOnly={isFormStateReadOnly}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions(
                    formProgram?.programSubType?.text || '',
                    isLC ?? false
                )}
                title={
                    t(
                        'distributionInstruction.investmentSelectionForDistribution'
                    ) as string
                }
            />
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

            <FormDisbursementV2
                isFormStateReadOnly={isFormStateReadOnly}
                options={disbursementOptions}
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
}
