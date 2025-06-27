import { TransactionStatus } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';

import { FieldSize, FieldType } from '@deps/components/fields/field';
import {
    hasFilter,
    setStatusFilter,
} from '@deps/components/history/filters/filter.helpers';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import { useHistoryFiltersContext } from '@deps/contexts/HistoryFiltersContext';

export default function TransactionStatusFilter() {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.history.filter',
    });
    const { historyFilters, setHistoryFilters } = useHistoryFiltersContext();

    const { statusFilter } = historyFilters;

    const statusOptions = [
        {
            label: t('completed') as string,
            value: TransactionStatus.COMPLETED,
        },
        {
            label: t('pending') as string,
            value: TransactionStatus.PENDING,
        },
        {
            label: t('canceled') as string,
            value: TransactionStatus.CANCELED,
        },
        {
            label: t('failed') as string,
            value: TransactionStatus.FAILED,
        },
        {
            label: t('reversed') as string,
            value: TransactionStatus.REVERSED,
        },
    ];

    return (
        <SelectSimple
            className="max-w-[200px]"
            label={t('byStatus') as string}
            onChange={(status) => {
                setStatusFilter(setHistoryFilters, status as TransactionStatus);
            }}
            options={statusOptions}
            placeholder={t('byStatus') as string}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={
                hasFilter(statusFilter) ? (statusFilter as string) : 'completed'
            }
        />
    );
}
