import { createContext, ReactNode, useContext } from 'react';

import { QuickQuoteParams } from '@deps/types/quickQuote';

const QuickQuoteParamsContext = createContext<QuickQuoteParams | null>(null);

type QuickQuoteParamsProviderProps = {
    children: ReactNode;
    value: QuickQuoteParams;
};

export const QuickQuoteParamsProvider = ({
    children,
    value,
}: QuickQuoteParamsProviderProps) => (
    <QuickQuoteParamsContext.Provider value={value}>
        {children}
    </QuickQuoteParamsContext.Provider>
);

export const useQuickQuoteParams = () => {
    const context = useContext(QuickQuoteParamsContext);

    if (!context) {
        throw new Error(
            'useQuickQuoteParams must be used within a QuickQuoteParamsProvider'
        );
    }

    return context;
};
