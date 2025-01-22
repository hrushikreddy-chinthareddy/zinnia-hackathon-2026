import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { getOwnerStateOfResidence } from '@deps/helpers/otp-withdrawal.helper';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { TaskStatus } from '@deps/models/case/task-instance';
import {
    ActiveWithdrawalCase,
    Carrier,
    CaseStatus,
    FormComment,
    FormIrsData,
    FormParts,
    FormValidationErrors,
    FundWithdrawnMethod,
    ProgramSubType,
} from '@deps/models/case/withdrawal/case';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

import { FormSubtype } from '../flic-withdrawal-form.helper';

const StatusesForSaveAsDraftAction: string[] = [CaseStatus.Pending, TaskStatus.New, TaskStatus.InProgress];

type FormProviderProps = {
    children: React.ReactNode;
    form: ActiveWithdrawalCase;
    initialForm: ActiveWithdrawalCase;
    issueState: string;
    isOpenNigo?: boolean;
    featureFlagDecisions?: FeatureFlags;
    parties?: LifeCadParty[];
};

const getFundWithdrawnMethod = (form: ActiveWithdrawalCase) => {
    const { formProgram } = form.data.formRequest;

    if ([Carrier.NASU, Carrier.RSLN, Carrier.GDMN, Carrier.MASS, Carrier.DLIC].includes(form.data.clientCode as Carrier)) {
        const filterdFunds = form.data.formRequest.formDistribution.funds.filter(fund => !isNullEmptyOrUndefined(fund.amount?.text || ''));

        if (filterdFunds.length > 0) {
            return FundWithdrawnMethod.SpecifyFunds;
        }
        return FundWithdrawnMethod.Prorata;
    }

    if ([Carrier.SBGC, Carrier.FLIC].includes(form.data.clientCode as Carrier)) {
        const filterdFunds = form.data.formRequest.formDistribution.funds.filter(fund => !isNullEmptyOrUndefined(fund.amount?.text || ''));
        if (filterdFunds.length > 0) {
            return FundWithdrawnMethod.SpecifyFunds;
        }
        return FundWithdrawnMethod.Default;
    }

    return [ProgramSubType.Dollar, ProgramSubType.Percentage].includes(formProgram?.programSubType?.text as ProgramSubType)
        ? FundWithdrawnMethod.SpecifyFunds
        : formProgram?.programSubType?.text;
};

export const FormProvider = ({
    children,
    form,
    initialForm,
    issueState = '',
    parties,
    isOpenNigo,
    featureFlagDecisions,
}: FormProviderProps) => {
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState(form?.data?.formRequest?.formData);
    const [formDisbursement, setFormDisbursement] = useState(form.data.formRequest.formDisbursement);
    const [formDistribution, setFormDistribution] = useState(form.data.formRequest.formDistribution);
    const [formFullSurrenderAck, setFormFullSurrenderAck] = useState(form.data.formRequest.formFullSurrenderAck);
    const [formIrsData, setFormIrsData] = useState(
        form.data.formRequest.formIrsData
            ? Array.isArray(form.data.formRequest.formIrsData)
                ? form.data.formRequest.formIrsData
                : ([form.data.formRequest.formIrsData] as FormIrsData[])
            : []
    );
    const [formOL4753Data, setFormOL4753Data] = useState(form.data.formRequest.formOL4753Data || null);
    const [formLoan, setFormLoan] = useState(form.data.formRequest.formLoan);
    const [formParty, setFormParty] = useState(form.data.formRequest.formParty);
    const [formProgram, setFormProgram] = useState(form.data.formRequest.formProgram);
    const [formRestriction, setFormRestriction] = useState(form.data.formRequest.formRestriction);
    const [formSignature, setFormSignature] = useState(form.data.formRequest.formSignature);
    const [formSource, setFormSource] = useState(form.data.formRequest.formSource);
    const [formTaxWithholding, setFormTaxWithholding] = useState(form.data.formRequest.formTaxWithholding);
    const [formTpaAuthorization, setFormTpaAuthorization] = useState(form.data.formRequest.formTpaAuthorization);
    const [formSurrenderingCompany, setFormSurrenderingCompany] = useState(form.data.formRequest.formSurrenderingCompany || null);
    const [formAdditionalWaivers, setFormAdditionalWaivers] = useState(form.data.formRequest.formAdditionalWaivers || null);
    const [formNigos, setFormNigos] = useState(form.data.formRequest.formNigos || null);
    const [formReindexingData, setFormReindexingData] = useState(form.data.formRequest.formReindexingData || null);
    const [currentFormState, setCurrentFormState] = useState(form.status);
    const [formComment, setFormComment] = useState(form?.data?.formRequest?.formComment || ({} as FormComment));
    const shouldShowNewExperience = featureFlagDecisions?.[FEATURE_FLAGS.NEW_EXP];
    const isFormStateReadOnly = shouldShowNewExperience
        ? searchParams.get('action') === 'readonly' ||
          (!StatusesForSaveAsDraftAction.includes(currentFormState) && searchParams.get('action') !== 'duplicate') ||
          isOpenNigo === true
        : false;

    const [formSpecialInstruction, setFormSpecialInstruction] = useState(form.data.formRequest.formSpecialInstruction);
    const [ownerAcknowledgement, setOwnerAcknowledgement] = useState(form.data.formRequest.ownerAcknowledgement);
    // Derived states from form data
    const [fundWithdrawnMethod, setFundWithdrawnMethod] = useState(getFundWithdrawnMethod(form) || null);
    const [ownerStateOfResidence, setOwnerStateOfResidence] = useState(getOwnerStateOfResidence(form.data.formRequest.formParty));
    const [contractIssueState, setContractIssueState] = useState(issueState);

    // Meta info
    const selectedFormSubType = formData?.formExtName?.includes(FormSubtype.FullWithdrawal.toUpperCase())
        ? FormSubtype.FullWithdrawal
        : FormSubtype.PartialWithdrawal;
    const [formSubtype, setFormSubtype] = useState(selectedFormSubType);

    const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
    const [formWarnings, setFormWarnings] = useState<FormValidationErrors>({});
    const [formValidator, setFormValidator] = useState<(val?: FormParts) => FormValidationErrors>(() => () => {
        return {};
    });
    const [formBeneInfo, setFormBeneInfo] = useState(form.data.formRequest?.formBeneInfo || null);

    // Update contract issue state when issue state changes
    useEffect(() => {
        setContractIssueState(issueState);
    }, [issueState]);

    useEffect(() => {
        if (Array.isArray(formIrsData)) {
            const updatedFormIrsData = formIrsData.map(data => {
                if (!Array.isArray(data.irsTaxWithholding)) {
                    return {
                        ...data,
                        irsTaxWithholding: data.irsTaxWithholding ? [data.irsTaxWithholding] : [],
                    };
                }
                return data;
            });
            setFormIrsData(updatedFormIrsData);
        }
    }, []);
    return (
        <FormDataContext.Provider
            value={{
                formSubtype,
                formData,
                formDisbursement,
                formDistribution,
                formErrors,
                formFullSurrenderAck,
                formIrsData,
                formOL4753Data,
                formLoan,
                formParty,
                formProgram,
                formRestriction,
                formSignature,
                formSource,
                formTaxWithholding,
                formTpaAuthorization,
                formSurrenderingCompany,
                formAdditionalWaivers,
                currentFormState,
                isFormStateReadOnly,
                featureFlagDecisions,
                formSpecialInstruction,
                formValidator,
                fundWithdrawnMethod,
                ownerAcknowledgement,
                initialForm,
                ownerStateOfResidence,
                contractIssueState,
                formWarnings,
                parties,
                formNigos,
                formComment,
                formReindexingData,
                formBeneInfo,
                setFormSubtype,
                setCurrentFormState,
                setFormWarnings,
                setFormData,
                setFormDisbursement,
                setFormDistribution,
                setFormErrors,
                setFormFullSurrenderAck,
                setFormIrsData,
                setFormOL4753Data,
                setFormLoan,
                setFormParty,
                setFormProgram,
                setFormRestriction,
                setFormSignature,
                setFormSource,
                setFormTaxWithholding,
                setFormTpaAuthorization,
                setFormValidator,
                setFundWithdrawnMethod,
                setOwnerStateOfResidence,
                setFormSurrenderingCompany,
                setFormAdditionalWaivers,
                setFormSpecialInstruction,
                setOwnerAcknowledgement,
                setFormNigos,
                setFormReindexingData,
                setFormComment,
                setFormBeneInfo,
            }}
        >
            {children}
        </FormDataContext.Provider>
    );
};
