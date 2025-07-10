import { useContext, useState } from 'react';

import { SimpleOption } from '@deps/components/autocomplete/autocomplete.types';
import { NigoEntryContext } from '@deps/contexts/NigoEntryContext';
import {
    CallCenterElement,
    FormDetails,
} from '@deps/models/case/send-document';
import {
    FormComment,
    FormValidationErrors,
} from '@deps/models/case/withdrawal/case';

import { SelOptionType } from './steps/service-form-review/service-form-review';

type NigoEntryProviderProps = {
    children: React.ReactNode;
    relatedDocCount: number;
};

const INITIAL_FORM_DATA: any = {};

export const NigoEntryProvider = ({
    children,
    relatedDocCount,
}: NigoEntryProviderProps) => {
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [sectionOption, setSectionOption] = useState<SelOptionType>(
        SelOptionType.DATA_ENTRY
    );
    const [documentIndexingInfo, setDocumentIndexingInfo] = useState<any>(null);
    const [messages, setMessages] = useState<any>([]);
    const [exceptions, setExceptions] = useState<string[]>([]);
    const [transactionType, setTransactionType] = useState<
        CallCenterElement<string, SimpleOption>
    >({} as CallCenterElement<string, SimpleOption>);
    const [transactionSubType, setTransactionSubType] = useState<
        CallCenterElement<string, SimpleOption>
    >({} as CallCenterElement<string, SimpleOption>);
    const [document, setDocument] = useState<
        CallCenterElement<FormDetails, FormDetails>
    >({} as CallCenterElement<FormDetails, FormDetails>);
    const [formErrors, setFormErrors] = useState<FormValidationErrors>({});
    const [submitFailed, setSubmitFailed] = useState(false);
    const [formComment, setFormComment] = useState({} as FormComment);
    const [initRelatedDocCount, _] = useState(relatedDocCount);
    const [areAttachmentsViewed, setAreAttachmentsViewed] = useState(false);

    return (
        <NigoEntryContext.Provider
            value={{
                formData,
                sectionOption,
                documentIndexingInfo,
                exceptions,
                messages,
                transactionType,
                transactionSubType,
                document,
                formErrors,
                submitFailed,
                formComment,
                initRelatedDocCount,
                areAttachmentsViewed,
                setAreAttachmentsViewed,
                setFormData,
                setSectionOption,
                setDocumentIndexingInfo,
                setExceptions,
                setMessages,
                setTransactionType,
                setTransactionSubType,
                setDocument,
                setFormErrors,
                setSubmitFailed,
                setFormComment,
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
