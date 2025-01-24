import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import AmountDetails from '@deps/components/otp-withdrawal-form/amount-details';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import EmployerTpaAuthorization from '@deps/components/otp-withdrawal-form/employer-tpa-authorization';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import SystematicWithdrawalProgram from '@deps/components/otp-withdrawal-form/ssw-program/ssw-program';
import StateW4Form from '@deps/components/otp-withdrawal-form/state-w4-form';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Carrier, FundWithdrawnMethod } from '@deps/models/case/withdrawal/case';
import { isAllowedState } from '@deps/utils/renderStateW4';

import SswEditSelection from '../ssw-edit-selection';
import getGlcoConfig from './glco-ssw-form-helper';

interface GlcoSSWFormProps {
    planCode?: string;
}

export function GlcoSSWForm({ planCode }: GlcoSSWFormProps) {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });
    const {
        formValidation,
        signaturesConfig,
        formPartyConfigs,
        disbursementOptions,
        fundWithdrawnMethodOptions,
        systematicWithdrawalOptions,
        w4pSignaturesConfig,
        jointCoveredPlanCodes
    } = getGlcoConfig(t);
    const {
        formParty,
        formTpaAuthorization,
        setFormValidator,
        formData,
        setFormData,
        initialForm,
        isFormStateReadOnly,
        contractIssueState,
    } = useContext(FormDataContext);

    useEffect(() => {
        setFormValidator(() => formValidation);

        setFormData({
            ...formData,
            formExtName: `${initialForm?.carrier || Carrier.GLCO}_SSW_DIGITAL_FORM`, //get client code & withdrawal type from index
            metaData: {
                formType: `${initialForm?.carrier || Carrier.GLCO}_SSW_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        });
    }, []);
    const hasTpaAuthorization = formTpaAuthorization && !Object.values(formTpaAuthorization).every(val => val === null);
    const shouldStateW4pRender = isAllowedState(contractIssueState);
    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <SswEditSelection />
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <AmountDetails isFormStateReadOnly={isFormStateReadOnly} isOnlyWithdrawalTypeControls={true} />
            <SystematicWithdrawalProgram
                isReadOnly={isFormStateReadOnly}
                options={systematicWithdrawalOptions}
                planCode={planCode}
                jointCoveredPlanCodes={jointCoveredPlanCodes}
            />
            <FormDistribution
                isDerivedMethodFromFunds={true}
                isFormStateReadOnly={isFormStateReadOnly}
                defaultMethod={FundWithdrawnMethod.Prorata}
                fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                title={t('distributionInstruction.investmentSelectionForDistribution') as string}
            />
            <TaxWithholdings isFormStateReadOnly={isFormStateReadOnly} />
            {shouldStateW4pRender && <StateW4Form isFormStateReadOnly={isFormStateReadOnly} w4pSignaturesConfig={w4pSignaturesConfig} />}
            <FormDisbursement isFormStateReadOnly={isFormStateReadOnly} options={disbursementOptions} />
            <SignatureValidations isFormStateReadOnly={isFormStateReadOnly} config={signaturesConfig} />
            {hasTpaAuthorization && <EmployerTpaAuthorization isFormStateReadOnly={isFormStateReadOnly} />}
        </>
    );
}
