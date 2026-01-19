import { Label, SelectFilter } from '@zinnia/bloom/components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useHistoryFiltersContext } from '@deps/contexts/HistoryFiltersContext';
import { TransactionType } from '@deps/types/transactionTypes';

import styles from './transaction-type-select.module.css';

export const TransactionTypeSelect = () => {
    const { t } = useTranslation();

    const typeOptions = Object.values(TransactionType)
        .map((type) => ({
            value: type,
            label: t(`enums.${type}`) || type,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    const { setHistoryFilters } = useHistoryFiltersContext();

    const [selections, setSelections] = useState<string[]>([]);
    const updateSelections = (value: string[]) => {
        setSelections(value);
        setHistoryFilters((prevState) => {
            return {
                ...prevState,
                transactionTypes: value,
            };
        });
    };

    return (
        <SelectFilter
            id="transaction-type"
            className={styles.selectContainer}
            label={
                <Label labelFor="transaction-type">
                    {t('allFields.byTransactionType')}
                </Label>
            }
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
