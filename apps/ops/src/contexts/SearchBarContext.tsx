import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react';

import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { SearchViewQuery } from '@deps/types/search';

interface SearchBarProps {
    showFieldErrorMessage: boolean;
    setShowFieldErrorMessage: (v: boolean) => void;
    validateValueToSearch: (v: SearchViewQuery) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const SearchBarContext = createContext<SearchBarProps>({
    setShowFieldErrorMessage: noop,
    showFieldErrorMessage: false,
    validateValueToSearch: noop,
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

    const validateValueToSearch = useCallback((value: SearchViewQuery) => {
        Object.keys(value).forEach((key) => {
            const trimmedValue = value[key as keyof typeof value]?.trim();
            value[key as keyof typeof value] = trimmedValue;

            if (isNullEmptyOrUndefined(value[key as keyof typeof value])) {
                delete value[key as keyof typeof value];
            }
        });

        const hasSearchValue =
            value &&
            !!Object.keys(value).length &&
            !(value.ssn && !/\d/.test(value.ssn));

        // Show the field error message if the search button is clicked and nothing have been entered into the field
        if (!hasSearchValue) {
            setShowFieldErrorMessage(true);
        } else {
            setShowFieldErrorMessage(false);
        }
    }, []);

    const memoizedValues = useMemo(
        () => ({
            showFieldErrorMessage,
            setShowFieldErrorMessage,
            validateValueToSearch,
        }),
        [showFieldErrorMessage, setShowFieldErrorMessage, validateValueToSearch]
    );

    return (
        <SearchBarContext.Provider value={memoizedValues}>
            {children}
        </SearchBarContext.Provider>
    );
};
