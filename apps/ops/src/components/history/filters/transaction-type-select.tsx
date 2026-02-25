import { Label, SelectFilter } from '@zinnia/bloom/components';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useHistoryFiltersContext } from '@deps/contexts/HistoryFiltersContext';
import { TransactionType } from '@deps/types/transactionTypes';
import { TransactionTypeEnum } from '@zinnia/api-types/types/sor';

import styles from './transaction-type-select.module.css';

interface TransactionTypeSelectProps {
    // Called when the user selects InterestCredit in the filter
    onInterestCreditSelected?: () => void;
}

export const TransactionTypeSelect = ({
    onInterestCreditSelected,
}: TransactionTypeSelectProps) => {
    const { t } = useTranslation();
    const { setHistoryFilters } = useHistoryFiltersContext();
    const [selections, setSelections] = useState<string[]>([]);

    const INTEREST_CREDIT_TYPE = TransactionTypeEnum.INTEREST_CREDIT;

    // Return filter options with counts for each option
    const typeOptions = useMemo(() => {
        return Object.values(TransactionType)
            .map((type) => {
                return {
                    value: type,
                    label: t(`enums.${type}`) || type,
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
