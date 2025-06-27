import React, { createContext, useContext, useState } from 'react';

import { DEFAULT_NOTIFIER_PARTY } from '@deps/containers/death-claim-container/death-claim.helpers';
import {
    DeceasedParty,
    NotificationMethod,
    NotifierParty,
} from '@deps/containers/death-claim-container/death-claim.types';
import { Correspondence } from '@deps/models/case/correspondence';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

export type DeathClaimFormState = {
    formData: any;
    formErrors: FormValidationErrors;
    submitFailed: boolean;
    correspondence: Correspondence;
    notifiers: NotifierParty;
    owners: DeceasedParty[];
    beneficiaries: NotificationMethod[];
    caseId: string;
    onbaseCaseId: string;
    onbaseDocumentNumber: string;
    isDocumentSelected: boolean;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    setFormErrors: React.Dispatch<React.SetStateAction<FormValidationErrors>>;
    setSubmitFailed: React.Dispatch<React.SetStateAction<boolean>>;
    setCorrespondence: React.Dispatch<React.SetStateAction<Correspondence>>;
    setNotifiers: React.Dispatch<React.SetStateAction<NotifierParty>>;
    setOwners: React.Dispatch<React.SetStateAction<DeceasedParty[]>>;
    setBeneficiaries: React.Dispatch<
        React.SetStateAction<NotificationMethod[]>
    >;
    setCaseId: React.Dispatch<React.SetStateAction<string>>;
    setOnbaseCaseId: React.Dispatch<React.SetStateAction<string>>;
    setOnbaseDocumentNumber: React.Dispatch<React.SetStateAction<string>>;
    setIsDocumentSelected: React.Dispatch<React.SetStateAction<boolean>>;
};

const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;

export const DeathClaimDefaultValues = {
    formData: {} as any,
    formErrors: {} as FormValidationErrors,
    submitFailed: false,
    correspondence: {} as Correspondence,
    notifiers: {} as NotifierParty,
    owners: [] as DeceasedParty[],
    beneficiaries: [] as NotificationMethod[],
    caseId: '' as string,
    onbaseCaseId: '' as string,
    onbaseDocumentNumber: '' as string,
    isDocumentSelected: false,
    setFormData: noop,
    setFormErrors: noop,
    setSubmitFailed: noop,
    setCorrespondence: noop,
    setNotifiers: noop,
    setOwners: noop,
    setBeneficiaries: noop,
    setCaseId: noop,
    setOnbaseCaseId: noop,
    setOnbaseDocumentNumber: noop,
    setIsDocumentSelected: noop,
};

export const DeathClaimContext = createContext<DeathClaimFormState>(
    DeathClaimDefaultValues
);

type DeathClaimProviderProps = {
    children: React.ReactNode;
};

const INITIAL_FORM_DATA: any = {};

export const DeathClaimProvider = ({ children }: DeathClaimProviderProps) => {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
    const [submitFailed, setSubmitFailed] = useState<boolean>(false);
    const [correspondence, setCorrespondence] = useState<Correspondence>(
        {} as Correspondence
    );
    const [notifiers, setNotifiers] = useState<NotifierParty>(
        DEFAULT_NOTIFIER_PARTY as NotifierParty
    );
    const [owners, setOwners] = useState<DeceasedParty[]>([]);
    const [beneficiaries, setBeneficiaries] = useState<NotificationMethod[]>(
        []
    );
    const [caseId, setCaseId] = useState<string>('');
    const [onbaseCaseId, setOnbaseCaseId] = useState<string>('');
    const [onbaseDocumentNumber, setOnbaseDocumentNumber] =
        useState<string>('');
    const [isDocumentSelected, setIsDocumentSelected] =
        useState<boolean>(false);

    return (
        <DeathClaimContext.Provider
            value={{
                formData,
                formErrors,
                submitFailed,
                correspondence,
                notifiers,
                owners,
                beneficiaries,
                caseId,
                onbaseCaseId,
                onbaseDocumentNumber,
                isDocumentSelected,
                setFormData,
                setFormErrors,
                setSubmitFailed,
                setCorrespondence,
                setNotifiers,
                setOwners,
                setBeneficiaries,
                setCaseId,
                setOnbaseCaseId,
                setOnbaseDocumentNumber,
                setIsDocumentSelected,
            }}
        >
            {children}
        </DeathClaimContext.Provider>
    );
};

export const useDeathClaim = () => {
    const context = useContext(DeathClaimContext);

    if (!context) {
        throw new Error(
            'useDeathClaim must be used within a DeathClaimProvider'
        );
    }
    return context;
};
