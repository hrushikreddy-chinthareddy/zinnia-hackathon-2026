import { useTranslation } from 'next-i18next';
import { useContext, useEffect } from 'react';

import CslnCheck from '@deps/components/otp-withdrawal-form/csln-check';
import FormDistribution from '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution';
import EmployerTpaAuthorization from '@deps/components/otp-withdrawal-form/employer-tpa-authorization';
import FormDisbursement from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement';
import FormParties from '@deps/components/otp-withdrawal-form/form-party/form-party';
import FormProgramFullWithdrawal from '@deps/components/otp-withdrawal-form/form-program/form-program-full-withdrawal';
import FormProgramPartialWithdrawal from '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal';
import DistributionReason from '@deps/components/otp-withdrawal-form/form-restriction/distribution-reason';
import FormType from '@deps/components/otp-withdrawal-form/form-type';
import SignatureValidations from '@deps/components/otp-withdrawal-form/signature-validation/signature-validations';
import TaxOL4753Attachment from '@deps/components/otp-withdrawal-form/tax-ol4753-attachment';
import TaxWithholdings from '@deps/components/otp-withdrawal-form/tax-withholdings';
import DiaryNotesWarning from '@deps/components/side-sheet/diary-notes/diary-notes-alert';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Carrier } from '@deps/models/case/withdrawal/case';

import useNasuConfig from './nasu-withdrawal-form-helper';
import { FormSubtype } from '../flic-withdrawal-form.helper';

export default function NasuWithdrawalForm() {
    const { t } = useTranslation(undefined, { keyPrefix: 'caseWithdrawal.request' });

    const {
        formValidation,
        identifySelectedFormProgramOption,
        formSubtypeOptions,
        partialWithdrawalOptions,
        signaturesConfig,
        signaturesNotaryConfig,
        formPartyConfigs,
        disbursementOptions,
        fundWithdrawnMethodOptions,
        selectOneOptions,
        cslnCheckStates,
        fullWithdrawalOptions,
        reasonOptions,
        defaultValues,
        handleShouldShowDOBInOl4573,
    } = useNasuConfig(t);
    const {
        formParty,
        formSubtype,
        formTpaAuthorization,
        setFormValidator,
        setFormData,
        initialForm,
        contractIssueState,
        isFormStateReadOnly,
        parties,
    } = useContext(FormDataContext);

    useEffect(() => {
        setFormData(fs => ({
            ...fs,
            formExtName: `${initialForm?.carrier || Carrier.NASU}_WD_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`, //get client code & withdrawal type from index
            metaData: {
                formType: `${initialForm?.carrier || Carrier.NASU}_WD_REDEMPTION_${formSubtype?.toUpperCase()}_DIGITAL_FORM`,
                formId: null,
                formNumber: '',
            },
        }));
    }, [setFormData, formSubtype, initialForm]);

    useEffect(() => {
        setFormValidator(() => formValidation);
    }, [setFormValidator]);

    const ownerStateOfResidence = formParty?.parties?.[0]?.addresses?.[0]?.state;
    const hasTpaAuthorization = formTpaAuthorization && !Object.values(formTpaAuthorization).every(val => val === null);
    const shouldShowDOBInOl4573 = handleShouldShowDOBInOl4573(parties);

    return (
        <>
            {!isFormStateReadOnly && <DiaryNotesWarning />}
            <FormType isFormStateReadOnly={isFormStateReadOnly} formSubtypeOptions={formSubtypeOptions} />
            <FormParties isFormStateReadOnly={isFormStateReadOnly} configs={formPartyConfigs} />
            <DistributionReason reasonOptions={reasonOptions} isFormStateReadOnly={isFormStateReadOnly} />
            {formSubtype === FormSubtype.FullWithdrawal ? (
                <FormProgramFullWithdrawal
                    selectOneOptions={selectOneOptions}
                    fullWithdrawalOptions={fullWithdrawalOptions}
                    isFormStateReadOnly={isFormStateReadOnly}
                />
            ) : (
                <>
                    <FormProgramPartialWithdrawal
                        isFormStateReadOnly={isFormStateReadOnly}
                        options={partialWithdrawalOptions}
                        selectionIdentifier={identifySelectedFormProgramOption}
                        selectOneOptions={selectOneOptions}
                    />
                    <FormDistribution
                        isFormStateReadOnly={isFormStateReadOnly}
                        fundWithdrawnMethodOptions={fundWithdrawnMethodOptions}
                        title={t('distributionInstruction.investmentSelectionForDistribution') as string}
                    />
                </>
            )}
            <FormDisbursement
                isFormStateReadOnly={isFormStateReadOnly}
                options={disbursementOptions}
                defaultValue={defaultValues.disbursementOption}
            />
            <TaxWithholdings isFormStateReadOnly={isFormStateReadOnly} ownerStateOfResidence={ownerStateOfResidence} />
            <TaxOL4753Attachment
                isFormStateReadOnly={isFormStateReadOnly}
                shouldShowDOBInOl4573={shouldShowDOBInOl4573}
            />
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
            {hasTpaAuthorization && <EmployerTpaAuthorization isFormStateReadOnly={isFormStateReadOnly} />}
        </>
    );
}
