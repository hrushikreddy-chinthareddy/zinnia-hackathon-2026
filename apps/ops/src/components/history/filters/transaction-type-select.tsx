import { Label, SelectFilter } from '@zinnia/bloom/components';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useHistoryFiltersContext } from '@deps/contexts/HistoryFiltersContext';
import { TransactionType } from '@deps/types/transactionTypes';
import { Transaction } from '@zinnia/api-types/types/sor';

import styles from './transaction-type-select.module.css';

interface TransactionTypeSelectProps {
    // Count of transactions per type in the current result set
    transactionCounts?: Record<string, number>;
    // Called when the user selects InterestCredit in the filter
    onInterestCreditSelected?: () => void;
}

export const TransactionTypeSelect = ({
    transactionCounts,
    onInterestCreditSelected,
}: TransactionTypeSelectProps) => {
    const { t } = useTranslation();
    const { setHistoryFilters } = useHistoryFiltersContext();
    const [selections, setSelections] = useState<string[]>([]);

    const INTEREST_CREDIT_TYPE = Transaction.transactionType.INTEREST_CREDIT;

    /**
     * Remove selected types that no longer have results when counts change
    useEffect(() => {
        if (!transactionCounts) {
            return;
        }
        setSelections((prev) => {
            const pruned = prev.filter((type) => !!transactionCounts[type]);
            if (pruned.length !== prev.length) {
                setHistoryFilters((prevState) => ({
                    ...prevState,
                    transactionTypes: pruned,
                }));
            }
            return pruned;
        });
    }, [transactionCounts, setHistoryFilters]);
     */

    // Return filter options with counts for each option
    const typeOptions = useMemo(() => {
        return Object.values(TransactionType)
            .map((type) => {
                const baseLabel = t(`enums.${type}`) || type;
                const count = transactionCounts?.[type] ?? 0;
                return {
                    value: type,
                    label: transactionCounts
                        ? `${baseLabel} (${count})` // FIXME: should be aria-safe
                        : baseLabel,
                    ariaLabel: transactionCounts
                        ? `${baseLabel}, ${count} results`
                        : baseLabel,
                    count,
                };
            })
            .sort(
                (a, b) =>
                    (b.count && 1) - (a.count && 1) ||
                    a.label.localeCompare(b.label)
            );
    }, [transactionCounts, t]);

    const updateSelections = (value: string[]) => {
        setSelections(value);
        setHistoryFilters((prevState) => ({
            ...prevState,
            transactionTypes: value,
        }));

        // Auto-off the hide-daily-interest toggle when InterestCredit is selected
        if (value.includes(INTEREST_CREDIT_TYPE) && onInterestCreditSelected) {
            onInterestCreditSelected();
        }
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
