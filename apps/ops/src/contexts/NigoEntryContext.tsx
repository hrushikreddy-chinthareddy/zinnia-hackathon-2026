import React, { createContext } from 'react';

import { SimpleOption } from '@deps/components/autocomplete/autocomplete.types';
import { SelOptionType } from '@deps/containers/nigo-entry-container/components/steps/service-form-review/service-form-review';
import { FormDetails, CallCenterElement } from '@deps/models/case/send-document';
import { FormComment, FormValidationErrors } from '@deps/models/case/withdrawal/case';

export interface DocumentIndexingInfo {
    docTypeToReindex: string | null;
    notes: string | null;
};

export type NigoEntryFormState = {
    formData: any;
    sectionOption: SelOptionType;
    documentIndexingInfo: DocumentIndexingInfo;
    exceptions: string[];
    messages:  {[key: string]: {[key: string]: string}};
    transactionType: CallCenterElement<string, SimpleOption>;
    transactionSubType: CallCenterElement<string, SimpleOption>;
    document: CallCenterElement<FormDetails, FormDetails>;
    formErrors: FormValidationErrors;
    submitFailed: boolean;
    formComment?: FormComment;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    setSectionOption: React.Dispatch<React.SetStateAction<SelOptionType>>;
    setDocumentIndexingInfo: React.Dispatch<React.SetStateAction<DocumentIndexingInfo>>;
    setExceptions: React.Dispatch<React.SetStateAction<string[]>>;
    setMessages: React.Dispatch<React.SetStateAction<string[]>>;
    setTransactionType: React.Dispatch<React.SetStateAction<CallCenterElement<string, SimpleOption>>>;
    setTransactionSubType: React.Dispatch<React.SetStateAction<CallCenterElement<string, SimpleOption>>>;
    setDocument:React.Dispatch<React.SetStateAction<CallCenterElement<FormDetails, FormDetails>>>;
    setFormErrors: React.Dispatch<React.SetStateAction<FormValidationErrors>>;
    setSubmitFailed: React.Dispatch<React.SetStateAction<boolean>>;
    setFormComment: React.Dispatch<React.SetStateAction<FormComment>>;
};

const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;

export const nigoEntryDefaultValues = {
    formData: {} as any,
    setFormData: noop,
    sectionOption: SelOptionType.DATA_ENTRY,
    documentIndexingInfo: {} as DocumentIndexingInfo,
    exceptions: [] as any,
    messages: [] as any,
    transactionType: {} as CallCenterElement<string, SimpleOption>,
    transactionSubType: {} as CallCenterElement<string, SimpleOption>,
    document: {} as CallCenterElement<FormDetails, FormDetails>,
    formErrors: {} as FormValidationErrors,
    formComment: {} as FormComment,
    submitFailed: false,
    setSectionOption: noop,
    setDocumentIndexingInfo: noop,
    setExceptions: noop,
    setMessages: noop,
    setTransactionType: noop,
    setTransactionSubType: noop,
    setDocument: noop,
    setFormErrors: noop,
    setSubmitFailed: noop,
    setFormComment: noop,
};

export const NigoEntryContext = createContext<NigoEntryFormState>(nigoEntryDefaultValues);
