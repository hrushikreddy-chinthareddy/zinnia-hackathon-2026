import { createContext, useContext, useMemo, useState } from 'react';

interface SearchBarProps {
    showFieldErrorMessage: boolean;
    setShowFieldErrorMessage: (v: boolean) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const SearchBarContext = createContext<SearchBarProps>({
    setShowFieldErrorMessage: noop,
    showFieldErrorMessage: false,
});

export const useSearchBarcontext = () => {
    const context = useContext(SearchBarContext);

    if (!context) {
        throw new Error(
            'useSearchBarContext must be used within a SearchBarProvider'
        );
    }

    return context;
};

export const SearchBarProvider = ({ children }: any) => {
    const [showFieldErrorMessage, setShowFieldErrorMessage] = useState(false);

    const memoizedValues = useMemo(
        () => ({
            showFieldErrorMessage,
            setShowFieldErrorMessage,
        }),
        [showFieldErrorMessage, setShowFieldErrorMessage]
    );

    return (
        <SearchBarContext.Provider value={memoizedValues}>
            {children}
        </SearchBarContext.Provider>
    );
};
