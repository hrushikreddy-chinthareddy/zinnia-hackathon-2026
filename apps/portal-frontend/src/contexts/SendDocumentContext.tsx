import { createContext, Dispatch, PropsWithChildren, useContext, useMemo, useReducer } from 'react';

import { SimpleOption } from '@deps/components/autocomplete/autocomplete.types';
import {
    CallCenterElement,
    Confirm,
    Correspondence,
    FormDetails,
    SendDocumentAction,
    SendDocumentActions,
    SendDocumentFormParts,
} from '@deps/models/case/send-document';

const initialState = {
    transactionType: {} as CallCenterElement<string, SimpleOption>,
    transactionSubType: {} as CallCenterElement<string, SimpleOption>,
    document: {} as CallCenterElement<FormDetails, FormDetails>,
    correspondence: {} as Correspondence,
    confirm: {} as Confirm,
};

const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;
export const defaultSendDocumentState = {
    state: { ...initialState },
    dispatch: noop,
};

type SendDocumentContextProps = {
    state: SendDocumentFormParts;
    dispatch: Dispatch<SendDocumentActions>;
};
export const SendDocumentContext = createContext<SendDocumentContextProps | undefined>(defaultSendDocumentState);

function reducer(state: SendDocumentFormParts, action: SendDocumentActions) {
    switch (action.type) {
        case SendDocumentAction.TransactionType: {
            return { ...state, transactionType: { ...action.payload } };
        }
        case SendDocumentAction.TransactionSubType: {
            return { ...state, transactionSubType: { ...action.payload } };
        }
        case SendDocumentAction.Documents: {
            return { ...state, document: { ...action.payload } };
        }
        case SendDocumentAction.Correspondence: {
            return { ...state, correspondence: { ...action.payload } };
        }
        case SendDocumentAction.Confirm: {
            return { ...state, confirm: { ...action.payload } };
        }
        case SendDocumentAction.Reset: {
            return { ...state, ...initialState };
        }
        default: {
            return state;
        }
    }
}

export const SendDocumentProvider = ({ children }: PropsWithChildren) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const contextValue = useMemo(() => {
        return { state, dispatch };
    }, [state, dispatch]);

    return <SendDocumentContext.Provider value={contextValue}>{children}</SendDocumentContext.Provider>;
};

export const useSendDocument = () => {
    const context = useContext(SendDocumentContext);

    if (!context) {
        throw new Error('useSendDocument must be used within a SendDocumentProvider');
    }
    return context;
};
