import { createContext, ReactNode, useContext } from 'react';
import { createStore } from 'zustand';

import { IllustrationAgentDetails } from '@deps/types/illustrations';

import { AgentOption } from './types';

type AgentFieldContextType = {
    agentDetails?: IllustrationAgentDetails;
    agentOptions: AgentOption[] | undefined;
    selectAgent: (option: AgentOption) => void;
    search: (query: string) => void;
    searchQuery: string;
    isLoading: boolean;
    isFetching: boolean;
    error?: string;
};

const agentFieldContext = createContext<AgentFieldContextType | null>(null);

export const useAgentFieldContext = () => {
    const context = useContext(agentFieldContext);

    if (!context) {
        throw new Error('Context was not provided');
    }

    return context;
};

type AgentFieldContextProvider = {
    value: AgentFieldContextType;
    children: ReactNode;
};

export const AgentFieldContextProvider = ({
    value,
    children,
}: AgentFieldContextProvider) => {
    return (
        <agentFieldContext.Provider value={value}>
            {children}
        </agentFieldContext.Provider>
    );
};
