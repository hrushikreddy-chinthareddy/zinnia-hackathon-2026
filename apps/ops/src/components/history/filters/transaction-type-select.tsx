import { SelectFilter } from '@zinnia/bloom/components';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useHistoryFiltersContext } from '@deps/contexts/HistoryFiltersContext';
import { TransactionType } from '@deps/types/transactionTypes';

import styles from './transaction-type-select.module.css';

export const TransactionTypeSelect = () => {
    const { t } = useTranslation();
    const { setHistoryFilters } = useHistoryFiltersContext();
    const [selections, setSelections] = useState<string[]>([]);

    // Return filter options with counts for each option
    const typeOptions = useMemo(() => {
        return Object.values(TransactionType)
            .map((type) => {
                return {
                    value: type,
                    label: t(`enums.${type}`, {defaultValue: null}) || type,
                };
            })
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [t]);

    const updateSelections = (value: string[]) => {
        setSelections(value);
        setHistoryFilters((prevState) => ({
            ...prevState,
            transactionTypes: value,
        }));
    };

    return (
        <SelectFilter
            id="transaction-type"
            className={styles.selectContainer}
            onValueChange={updateSelections}
            options={typeOptions}
            values={selections}
            optionsProps={{
                overscan: 25,
            }}
            placeHolder={`${t('allFields.filterTransactionTypes')}`}
        />
    );
};
