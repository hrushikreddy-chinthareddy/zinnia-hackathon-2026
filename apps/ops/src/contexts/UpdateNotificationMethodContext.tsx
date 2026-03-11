import React, { createContext, useContext, useState } from 'react';

import {
    AddressNotificationMethod,
    EmailNotificationMethod,
    FaxNotificationMethod,
} from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab/bene-notification-tab.types';
import { ClaimCommunicationTypes } from '@deps/containers/death-claim-container/death-claim.types';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

export type UpdateNotificationFormState = {
    formData: any;
    formErrors: FormValidationErrors;
    submitFailed: boolean;
    caseId: string;
    emailData: EmailNotificationMethod;
    faxData: FaxNotificationMethod;
    addressData: AddressNotificationMethod;
    notificationMethodSelected: ClaimCommunicationTypes | string;
    taskActions: TaskActions[];
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    setFormErrors: React.Dispatch<React.SetStateAction<FormValidationErrors>>;
    setSubmitFailed: React.Dispatch<React.SetStateAction<boolean>>;
    setCaseId: React.Dispatch<React.SetStateAction<string>>;
    setEmailData: React.Dispatch<React.SetStateAction<EmailNotificationMethod>>;
    setFaxData: React.Dispatch<React.SetStateAction<FaxNotificationMethod>>;
    setAddressData: React.Dispatch<
        React.SetStateAction<AddressNotificationMethod>
    >;
    setNotificationMethodSelected: React.Dispatch<
        React.SetStateAction<ClaimCommunicationTypes | ''>
    >;
    setTaskActions: React.Dispatch<React.SetStateAction<TaskActions[]>>;
};

const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;

export const UpdateNotificationMethodDefaultValues = {
    formData: {} as any,
    formErrors: {} as FormValidationErrors,
    submitFailed: false,
    caseId: '' as string,
    emailData: {} as EmailNotificationMethod,
    faxData: {} as FaxNotificationMethod,
    addressData: {} as AddressNotificationMethod,
    notificationMethodSelected: '' as string,
    taskActions: [] as TaskActions[],
    setFormData: noop,
    setFormErrors: noop,
    setSubmitFailed: noop,
    setCaseId: noop,
    setEmailData: noop,
    setFaxData: noop,
    setAddressData: noop,
    setNotificationMethodSelected: noop,
    setContactEstablished: noop,
    setTaskActions: noop,
};

export const UpdateNotificationMethodContext =
    createContext<UpdateNotificationFormState>(
        UpdateNotificationMethodDefaultValues
    );

type UpdateNotificationMethodProviderProps = {
    children: React.ReactNode;
};

const INITIAL_FORM_DATA: any = {};

export enum TaskActions {
    RESEND_PACKET = 'RESEND_PACKET',
    CONTACT_ESTABLISHED = 'CONTACT_ESTABLISHED',
    UPDATE_NOTIFICATION_METHOD = 'UPDATE_NOTIFICATION_METHOD',
}

export const UpdateNotificationMethodProvider = ({
    children,
}: UpdateNotificationMethodProviderProps) => {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
    const [submitFailed, setSubmitFailed] = useState<boolean>(false);
    const [caseId, setCaseId] = useState<string>('');
    const [emailData, setEmailData] = useState<EmailNotificationMethod>(
        {} as EmailNotificationMethod
    );
    const [faxData, setFaxData] = useState<FaxNotificationMethod>(
        {} as FaxNotificationMethod
    );
    const [addressData, setAddressData] = useState<AddressNotificationMethod>(
        {} as AddressNotificationMethod
    );
    const [notificationMethodSelected, setNotificationMethodSelected] =
        useState<ClaimCommunicationTypes | ''>('');
    const [taskActions, setTaskActions] = useState<TaskActions[]>([]);

    return (
        <UpdateNotificationMethodContext.Provider
            value={{
                formData,
                formErrors,
                submitFailed,
                caseId,
                emailData,
                faxData,
                addressData,
                notificationMethodSelected,
                taskActions,
                setFormData,
                setFormErrors,
                setSubmitFailed,
                setCaseId,
                setEmailData,
                setFaxData,
                setAddressData,
                setNotificationMethodSelected,
                setTaskActions,
            }}
        >
            {children}
        </UpdateNotificationMethodContext.Provider>
    );
};

export const useUpdateNotificationMethod = () => {
    const context = useContext(UpdateNotificationMethodContext);

    if (!context) {
        throw new Error(
            'useUpdateNotificationMethod must be used within a UpdateNotificationMethodProvider'
        );
    }
    return context;
};
