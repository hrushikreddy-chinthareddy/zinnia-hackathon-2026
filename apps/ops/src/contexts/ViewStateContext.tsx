import { createContext, PropsWithChildren, useContext, useState } from 'react';

interface ViewStateContextType {
    viewState: string;
    setViewState: (viewState: string) => void;
}

const ViewStateContext = createContext<ViewStateContextType | undefined>(
    undefined
);

export const ViewStateProvider = ({
    children,
    initialViewState,
}: PropsWithChildren<{ initialViewState?: string }>) => {
    const [viewState, setViewState] = useState(initialViewState || '');

    return (
        <ViewStateContext.Provider value={{ viewState, setViewState }}>
            {children}
        </ViewStateContext.Provider>
    );
};

export const useViewState = () => {
    const context = useContext(ViewStateContext);

    if (!context) {
        throw new Error('useViewState must be used within a ViewStateProvider');
    }
    return context;
};
