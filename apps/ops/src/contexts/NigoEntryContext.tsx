import React, { createContext } from 'react';

import { SimpleOption } from '@deps/components/autocomplete/autocomplete.types';
import { FormDetails, CallCenterElement } from '@deps/models/case/send-document';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

export type NigoEntryFormState = {
    formData: any;
    isReadyForDataEntry: boolean,
    exceptions: string[],
    messages:  {[key: string]: {[key: string]: string}},
    transactionType: CallCenterElement<string, SimpleOption>;
    transactionSubType: CallCenterElement<string, SimpleOption>;
    document: CallCenterElement<FormDetails, FormDetails>;
    formErrors: FormValidationErrors;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    setIsReadyForDataEntry: React.Dispatch<React.SetStateAction<boolean>>;
    setExceptions: React.Dispatch<React.SetStateAction<string[]>>;
    setMessages: React.Dispatch<React.SetStateAction<string[]>>;
    setTransactionType: React.Dispatch<React.SetStateAction<CallCenterElement<string, SimpleOption>>>;
    setTransactionSubType: React.Dispatch<React.SetStateAction<CallCenterElement<string, SimpleOption>>>;
    setDocument:React.Dispatch<React.SetStateAction<CallCenterElement<FormDetails, FormDetails>>>;
    setFormErrors: React.Dispatch<React.SetStateAction<FormValidationErrors>>;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;
export const nigoEntryDefaultValues = {
    formData: {} as any,
    setFormData: noop,
    isReadyForDataEntry: false,
    exceptions: [] as any,
    messages: [] as any,
    transactionType: {} as CallCenterElement<string, SimpleOption>,
    transactionSubType: {} as CallCenterElement<string, SimpleOption>,
    document: {} as CallCenterElement<FormDetails, FormDetails>,
    formErrors: {} as FormValidationErrors,
    setIsReadyForDataEntry: noop,
    setExceptions: noop,
    setMessages: noop,
    setTransactionType: noop,
    setTransactionSubType: noop,
    setDocument: noop,
    setFormErrors: noop,
};

export const NigoEntryContext = createContext<NigoEntryFormState>(nigoEntryDefaultValues);
