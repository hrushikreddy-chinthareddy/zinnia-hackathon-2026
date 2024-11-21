import { useContext, useState } from 'react';

import { SimpleOption } from '@deps/components/autocomplete/autocomplete.types';
import { NigoEntryContext } from '@deps/contexts/NigoEntryContext';
import { CallCenterElement, FormDetails } from '@deps/models/case/send-document';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

type NigoEntryProviderProps = {
    children: React.ReactNode;
};

const INITIAL_FORM_DATA: any = {
};

export const NigoEntryProvider = ({ children }: NigoEntryProviderProps) => {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    //const [isReadyForDataEntry, setIsReadyForDataEntry] = useState<boolean>(false);
    const [sectionOption, setSectionOption] = useState<any>(null);
    const [messages, setMessages] = useState<any>([]);
    const [exceptions, setExceptions] = useState<string[]>([]);
    const [transactionType, setTransactionType] = useState<CallCenterElement<string, SimpleOption>>({} as CallCenterElement<string, SimpleOption>);
    const [transactionSubType, setTransactionSubType] = useState<CallCenterElement<string, SimpleOption>>({} as CallCenterElement<string, SimpleOption>);
    const [document, setDocument] = useState<CallCenterElement<FormDetails, FormDetails>>({} as CallCenterElement<FormDetails, FormDetails>);
    const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
    const [submitFailed, setSubmitFailed] = useState(false);

    return (
        <NigoEntryContext.Provider
            value={{
                formData,
                //isReadyForDataEntry,
                sectionOption,
                exceptions,
                messages,
                transactionType,
                transactionSubType,
                document,
                formErrors,
                submitFailed,
                setFormData,
                //setIsReadyForDataEntry,
                setSectionOption,
                setExceptions,
                setMessages,
                setTransactionType,
                setTransactionSubType,
                setDocument,
                setFormErrors,
                setSubmitFailed,
            }}
        >
            {children}
        </NigoEntryContext.Provider>
    );
};

export const useNigoEntry = () => {
    const context = useContext(NigoEntryContext);

    if (!context) {
        throw new Error('useNigoEntry must be used within a NigoEntryProvider');
    }
    return context;
};
