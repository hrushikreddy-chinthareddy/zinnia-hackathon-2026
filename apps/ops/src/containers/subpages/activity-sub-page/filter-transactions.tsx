import { HistoryFiltersProvider } from '@deps/contexts/HistoryFiltersContext';

import { TransactionsWrapper } from './transactions-wrapper';

export const FilterTransactions = () => {
    return (
        <HistoryFiltersProvider>
            <TransactionsWrapper />
        </HistoryFiltersProvider>
    );
};
