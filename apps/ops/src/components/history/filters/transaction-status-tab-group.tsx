import { TabGroup, TabList, TabTrigger } from '@zinnia/bloom/components';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { useHistoryFiltersContext } from '@deps/contexts/HistoryFiltersContext';
import { Transaction, TransactionStatus } from '@zinnia/api-types/types/sor';

export const TransactionStatusTabGroup = ({
    transactions,
    children,
}: {
    transactions: { [key: string]: Transaction[] };
    children: React.ReactNode;
}) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: undefined,
    });
    const { historyFilters, setHistoryFilters } = useHistoryFiltersContext();
    const { statusFilter } = historyFilters;

    const transactionStatuses = Object.values([
        TransactionStatus.COMPLETED,
        TransactionStatus.PENDING,
        TransactionStatus.CANCELED,
        TransactionStatus.FAILED,
        TransactionStatus.REVERSED,
    ]).map((status) => (
        <TabTrigger key={`${status}-trigger`} value={status}>
            {`${t(`${status}`)} ${`(${transactions?.[status].length || 0})`}`}
        </TabTrigger>
    ));
    return (
        <TabGroup
            defaultValue={statusFilter}
            value={statusFilter}
            onValueChange={(tab) =>
                setHistoryFilters((prevState) => ({
                    ...prevState,
                    statusFilter: tab as TransactionStatus,
                }))
            }
            className="px-8"
        >
            <TabList>{transactionStatuses}</TabList>
            {children}
        </TabGroup>
    );
};
