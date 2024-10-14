import { createContext, Dispatch, PropsWithChildren, useContext, useMemo, useReducer } from 'react';

import { Correspondence, CorrespondenceAction, CorrespondenceActions, CorrespondenceFormParts } from '@deps/models/case/correspondence';
import { Confirm } from '@deps/models/case/send-document';

const initialState = {
    correspondence: {} as Correspondence,
    confirm: {} as Confirm,
};

const noop = (() => {}) as React.Dispatch<React.SetStateAction<any>>;
export const defaultCorrespondenceState = {
    state: { ...initialState },
    dispatch: noop,
};

type CorrespondenceContextProps = {
    state: CorrespondenceFormParts;
    dispatch: Dispatch<CorrespondenceActions>;
};
export const CorrespondenceContext = createContext<CorrespondenceContextProps | undefined>(defaultCorrespondenceState);

function reducer(state: CorrespondenceFormParts, action: CorrespondenceActions) {
    switch (action.type) {
        case CorrespondenceAction.Correspondence: {
            return { ...state, correspondence: { ...action.payload } };
        }
        case CorrespondenceAction.Confirm: {
            return { ...state, confirm: { ...action.payload } };
        }
        case CorrespondenceAction.Reset: {
            return { ...state, ...initialState };
        }
        default: {
            return state;
        }
    }
}

export const CorrespondenceProvider = ({ children }: PropsWithChildren) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    const contextValue = useMemo(() => {
        return { state, dispatch };
    }, [state, dispatch]);

    return <CorrespondenceContext.Provider value={contextValue}>{children}</CorrespondenceContext.Provider>;
};

export const useCorrespondence = () => {
    const context = useContext(CorrespondenceContext);

    if (!context) {
        throw new Error('useCorrespondence must be used within a CorrespondenceProvider');
    }
    return context;
};
