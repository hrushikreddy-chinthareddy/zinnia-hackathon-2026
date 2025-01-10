import { createContext } from 'react';

import { SimpleOption } from '@deps/components/autocomplete/autocomplete.types';
import { CallCenterElement } from '@deps/models/case/send-document';
import { FormMetadata } from '@deps/models/case/task';
import { ManagementTask } from '@deps/models/case/task-instance';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
export type TaskState = {
    taskMetadata: FormMetadata;
    task: ManagementTask;
    correlationId: string;
    isReadyForDataEntry: boolean;
    exceptions: string[];
    messages: { [key: string]: { [key: string]: string } };
    transactionType: CallCenterElement<string, SimpleOption>;
    transactionSubType: CallCenterElement<string, SimpleOption>;
    formErrors: FormValidationErrors;
    submitFailed: boolean;
    setTask: React.Dispatch<React.SetStateAction<ManagementTask>>;
    setIsReadyForDataEntry: React.Dispatch<React.SetStateAction<boolean>>;
    setExceptions: React.Dispatch<React.SetStateAction<string[]>>;
    setMessages: React.Dispatch<React.SetStateAction<string[]>>;
    setTransactionType: React.Dispatch<React.SetStateAction<CallCenterElement<string, SimpleOption>>>;
    setTransactionSubType: React.Dispatch<React.SetStateAction<CallCenterElement<string, SimpleOption>>>;
    setFormErrors: React.Dispatch<React.SetStateAction<FormValidationErrors>>;
    setSubmitFailed: React.Dispatch<React.SetStateAction<boolean>>;
    setTaskMetadata: React.Dispatch<React.SetStateAction<FormMetadata>>;
};

const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;
export const taskDefaultValues = {
    taskMetadata: {} as FormMetadata,
    task: {} as ManagementTask,
    correlationId: '',
    isReadyForDataEntry: false,
    exceptions: [] as any,
    messages: [] as any,
    transactionType: {} as CallCenterElement<string, SimpleOption>,
    transactionSubType: {} as CallCenterElement<string, SimpleOption>,
    formErrors: {} as FormValidationErrors,
    submitFailed: false,
    setTask: noop,
    setIsReadyForDataEntry: noop,
    setExceptions: noop,
    setMessages: noop,
    setTransactionType: noop,
    setTransactionSubType: noop,
    setFormErrors: noop,
    setSubmitFailed: noop,
    setTaskMetadata: noop,
};

export const TaskDataContext = createContext<TaskState>(taskDefaultValues);
