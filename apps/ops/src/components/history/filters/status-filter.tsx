import { useTranslation } from 'next-i18next';

import { FieldSize, FieldType } from '@deps/components/fields/field';
import { hasFilter, removeStatusFilter, setStatusFilter } from '@deps/components/history/filters/filter.helpers';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import { TransactionStatus } from '@deps/models/policy/sor-policy';
import { useHistoryFiltersContext } from '@deps/contexts/HistoryFiltersContext';

export default function TransactionStatusFilter() {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'policy.history.filter' });
    const { historyFilters, setHistoryFilters } = useHistoryFiltersContext();

    const { statusFilter } = historyFilters;

    const statusOptions = [
        {
            label: t('all') as string,
            value: 'all',
        },
        {
            label: t('pending') as string,
            value: TransactionStatus.Pending,
        },
        {
            label: t('completed') as string,
            value: TransactionStatus.Completed,
        },
        {
            label: t('canceled') as string,
            value: TransactionStatus.Canceled,
        },
        {
            label: t('reversed') as string,
            value: TransactionStatus.Reversed,
        },
        {
            label: t('pendingReversal') as string,
            value: TransactionStatus.PendingReversal,
        },
        {
            label: t('failed') as string,
            value: TransactionStatus.Failed,
        },
    ];

    return (
        <SelectSimple
            className="max-w-[200px]"
            label={t('byStatus') as string}
            onChange={status => {
                if (status === 'all') {
                    removeStatusFilter(setHistoryFilters);
                } else {
                    setStatusFilter(setHistoryFilters, status as TransactionStatus);
                }
            }}
            options={statusOptions}
            placeholder={t('byStatus') as string}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={hasFilter(statusFilter) ? (statusFilter as string) : 'all'}
        />
    );
}
