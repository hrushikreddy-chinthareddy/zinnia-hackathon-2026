/* eslint-disable import/order */
import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import SystematicWithdrawalProgram from '@deps/components/otp-withdrawal-form/ssw-program/ssw-program';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Carrier } from '@deps/models/case/withdrawal/case';

import AmountDetails from '@deps/components/otp-withdrawal-form/amount-details';
import useNassauConfig from './nasu-ssw-form-helper';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import TaxOL4753Attachment from '@deps/components/otp-withdrawal-form/tax-ol4753-attachment';
import CslnCheck from '@deps/components/otp-withdrawal-form/csln-check';
import SswEditSelection from '../ssw-edit-selection';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import { isAllowedState } from '@deps/utils/renderStateW4';
import W4pTaxForm from '@deps/components/w4p-tax-form/w4p-tax-form';

export function NassauSSWForm() {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const { formParty, parties, setFormValidator, setFormData, initialForm, isFormStateReadOnly, contractIssueState } =
        useContext(FormDataContext);

    const {
        fundWithdrawnMethodOptions,
        formValidation,
        signaturesConfig,
        signaturesNotaryConfig,
        formPartyConfigs,
        disbursementOptions,
        systematicWithdrawalOptions,
        cslnCheckStates,
        defaultValues,
        handleShouldShowDOBInOl4573,
        w4pSignaturesConfig,
    } = useNassauConfig(t);

    useEffect(() => {
        setFormData(fs => ({
            ...fs,
            formExtName: `${initialForm?.carrier || Carrier.NASU}_SSW_DIGITAL_FORM`, //get client code & withdrawal type from index
            metaData: {
                formType: `${initialForm?.carrier || Carrier.NASU}_SSW_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        }));
    }, [setFormData, initialForm]);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, [setFormValidator, formValidation]);

    const ownerStateOfResidence = formParty?.parties?.[0]?.addresses?.[0]?.state;
    const shouldShowDOBInOl4573 = handleShouldShowDOBInOl4573(parties);
    const shouldStateW4pRender = isAllowedState(contractIssueState ?? '');
    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <SswEditSelection />
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <AmountDetails isFormStateReadOnly={isFormStateReadOnly} isOnlyWithdrawalTypeControls={true} />
            <SystematicWithdrawalProgram isReadOnly={isFormStateReadOnly} options={systematicWithdrawalOptions} />
            <FormDistribution
                isFormStateReadOnly={isFormStateReadOnly}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={t('distributionInstruction.investmentSelectionForDistribution') as string}
            />
            <TaxWithholdings isFormStateReadOnly={isFormStateReadOnly} ownerStateOfResidence={ownerStateOfResidence} />
            <TaxOL4753Attachment isFormStateReadOnly={isFormStateReadOnly} shouldShowDOBInOl4573={shouldShowDOBInOl4573} />
            <FormDisbursement
                isFormStateReadOnly={isFormStateReadOnly}
                options={disbursementOptions}
                defaultValue={defaultValues.disbursementOption}
            />
            {shouldStateW4pRender && <StateW4Form isFormStateReadOnly={isFormStateReadOnly} w4pSignaturesConfig={w4pSignaturesConfig} />}
            <W4pTaxForm isFormStateReadOnly={isFormStateReadOnly} w4pSignaturesConfig={w4pSignaturesConfig} />
            {(ownerStateOfResidence || contractIssueState) &&
                [ownerStateOfResidence, contractIssueState].some(state => state && cslnCheckStates.includes(state)) && (
                    <CslnCheck isFormStateReadOnly={isFormStateReadOnly} />
                )}
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
            <SignatureValidations
                isFormStateReadOnly={isFormStateReadOnly}
                headerTranslationKey={'notaryHeader'}
                config={signaturesNotaryConfig}
            />
        </>
    );
}
