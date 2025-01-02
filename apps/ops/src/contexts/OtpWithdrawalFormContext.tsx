import { createContext } from 'react';

import { FormSubtype } from '@deps/containers/otp/withdrawal-forms/flic-withdrawal-form.helper';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { TaskStatus } from '@deps/models/case/task-instance';
import {
    ActiveWithdrawalCase,
    FormDisbursement,
    FormDistribution,
    FormFullSurrenderAck,
    FormIrsData,
    FormLoan,
    FormParty,
    FormProgram,
    FormRestriction,
    FormSignature,
    FormSource,
    FormTaxWithholding,
    FormTpaAuthorization,
    FormValidationErrors,
    FormData,
    FormParts,
    FormSurrenderingCompany,
    FormAdditionalWaiver,
    CaseStatus,
    FormOL4753Data,
    FormSpecialInstruction,
    OwnerAcknowledgement,
    FormNigos,
    FormReIndexingData,
    FormComment,
} from '@deps/models/case/withdrawal/case';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

export type WithdrawalTaskStatus = CaseStatus | TaskStatus;
export interface OtpWithdrawalFormState {
    formSubtype?: FormSubtype;
    formData: FormData;
    formDisbursement: FormDisbursement;
    formDistribution: FormDistribution;
    formErrors: FormValidationErrors;
    formWarnings: FormValidationErrors;
    formFullSurrenderAck: FormFullSurrenderAck;
    formIrsData: FormIrsData[];
    formOL4753Data: FormOL4753Data | null;
    formLoan: FormLoan;
    formParty: FormParty;
    formProgram: FormProgram;
    formRestriction: FormRestriction;
    formSignature: FormSignature;
    formSource: FormSource;
    formTaxWithholding: FormTaxWithholding;
    formTpaAuthorization: FormTpaAuthorization;
    formAdditionalWaivers: FormAdditionalWaiver[];
    formNigos: FormNigos | null;
    formReindexingData: FormReIndexingData | null;
    formValidator: (val?: FormParts) => FormValidationErrors;
    fundWithdrawnMethod: string | null;
    initialForm: ActiveWithdrawalCase;
    ownerStateOfResidence: string | null;
    formSurrenderingCompany: FormSurrenderingCompany | null;
    contractIssueState?: string;
    parties?: LifeCadParty[];
    currentFormState: WithdrawalTaskStatus;
    isFormStateReadOnly: boolean;
    formSpecialInstruction: FormSpecialInstruction;
    featureFlagDecisions?: FeatureFlags;
    ownerAcknowledgement?: OwnerAcknowledgement;
    formComment?: FormComment;
    setCurrentFormState: React.Dispatch<React.SetStateAction<WithdrawalTaskStatus>>;
    setFormSubtype?: React.Dispatch<React.SetStateAction<FormSubtype>>;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    setFormDisbursement: React.Dispatch<React.SetStateAction<FormDisbursement>>;
    setFormDistribution: React.Dispatch<React.SetStateAction<FormDistribution>>;
    setFormErrors: React.Dispatch<React.SetStateAction<FormValidationErrors>>;
    setFormWarnings: React.Dispatch<React.SetStateAction<FormValidationErrors>>;
    setFormFullSurrenderAck: React.Dispatch<React.SetStateAction<FormFullSurrenderAck>>;
    setFormIrsData: React.Dispatch<React.SetStateAction<FormIrsData[]>>;
    setFormOL4753Data: React.Dispatch<React.SetStateAction<FormOL4753Data | null>>;
    setFormLoan: React.Dispatch<React.SetStateAction<FormLoan>>;
    setFormParty: React.Dispatch<React.SetStateAction<FormParty>>;
    setFormProgram: React.Dispatch<React.SetStateAction<FormProgram>>;
    setFormRestriction: React.Dispatch<React.SetStateAction<FormRestriction>>;
    setFormSignature: React.Dispatch<React.SetStateAction<FormSignature>>;
    setFormSource: React.Dispatch<React.SetStateAction<FormSource>>;
    setFormTaxWithholding: React.Dispatch<React.SetStateAction<FormTaxWithholding>>;
    setFormTpaAuthorization: React.Dispatch<React.SetStateAction<FormTpaAuthorization>>;
    setFormAdditionalWaivers: React.Dispatch<React.SetStateAction<FormAdditionalWaiver[]>>;
    setFormValidator: React.Dispatch<React.SetStateAction<(val?: FormParts) => FormValidationErrors>>;
    setFundWithdrawnMethod: React.Dispatch<React.SetStateAction<string | null>>;
    setOwnerStateOfResidence: React.Dispatch<React.SetStateAction<string | null>>;
    setFormSurrenderingCompany: React.Dispatch<React.SetStateAction<FormSurrenderingCompany | null>>;
    setFormSpecialInstruction: React.Dispatch<React.SetStateAction<FormSpecialInstruction>>;
    setOwnerAcknowledgement: React.Dispatch<React.SetStateAction<OwnerAcknowledgement | undefined>>;
    setFormNigos: React.Dispatch<React.SetStateAction<FormNigos | null>>;
    setFormReindexingData: React.Dispatch<React.SetStateAction<FormReIndexingData | null>>;
    setFormComment: React.Dispatch<React.SetStateAction<FormComment>>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (() => { }) as React.Dispatch<React.SetStateAction<any>>;

export const defaultFormDataContext = {
    formData: {} as FormData,
    formDisbursement: {} as FormDisbursement,
    formDistribution: {} as FormDistribution,
    formErrors: {} as FormValidationErrors,
    formFullSurrenderAck: {} as FormFullSurrenderAck,
    formIrsData: [] as FormIrsData[],
    formOL4753Data: {} as FormOL4753Data,
    formLoan: {} as FormLoan,
    formParty: {} as FormParty,
    formProgram: {} as FormProgram,
    formWarnings: {} as FormValidationErrors,
    formRestriction: {} as FormRestriction,
    formSignature: {} as FormSignature,
    formSource: {} as FormSource,
    formTaxWithholding: {} as FormTaxWithholding,
    formTpaAuthorization: {} as FormTpaAuthorization,
    formAdditionalWaivers: [] as FormAdditionalWaiver[],
    formSpecialInstruction: {} as FormSpecialInstruction,
    formNigos: {} as FormNigos,
    formReindexingData: {} as FormReIndexingData,
    formComment: {} as FormComment,
    formValidator: () => {
        return {} as FormValidationErrors;
    },
    fundWithdrawnMethod: '',
    initialForm: {} as ActiveWithdrawalCase,
    ownerStateOfResidence: '',
    formSurrenderingCompany: {} as FormSurrenderingCompany,
    contractIssueState: '',
    parties: [],
    currentFormState: CaseStatus.Draft,
    isFormStateReadOnly: false,
    setCurrentFormState: noop,
    setFormAdditionalWaivers: noop,
    setFormData: noop,
    setFormDisbursement: noop,
    setFormDistribution: noop,
    setFormErrors: noop,
    setFormWarnings: noop,
    setFormFullSurrenderAck: noop,
    setFormIrsData: noop,
    setFormLoan: noop,
    setFormParty: noop,
    setFormProgram: noop,
    setFormRestriction: noop,
    setFormSignature: noop,
    setFormSource: noop,
    setFormTaxWithholding: noop,
    setFormTpaAuthorization: noop,
    setFormValidator: noop,
    setFundWithdrawnMethod: noop,
    setOwnerStateOfResidence: noop,
    setFormSurrenderingCompany: noop,
    setFormOL4753Data: noop,
    setFormSpecialInstruction: noop,
    setOwnerAcknowledgement: noop,
    setFormNigos: noop,
    setFormReindexingData: noop,
    setFormComment: noop,
};

export const FormDataContext = createContext<OtpWithdrawalFormState>(defaultFormDataContext as OtpWithdrawalFormState);
