import { FieldSize } from '@zinnia/bloom/components';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FieldType } from '@deps/components/fields/field';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import {
    EventFilterKeys,
    PeopleFilters,
    PolicyFilters,
    TransactionFilters,
    useHistoryFiltersContext,
} from '@deps/contexts/HistoryFiltersContext';

import { filterEventFilters, getFilterEnumKey } from './filter.helpers';
import styles from './transaction-type-select.module.css';

export const TransactionTypeSelect = () => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.history.filter',
    });
    const options = {
        ...TransactionFilters,
        ...PeopleFilters,
        ...PolicyFilters,
    };

    const typeOptions = Object.values(options)
        .filter((option) => option !== 'all')
        .map((type, index) => ({
            value: type,
            label: <span id={`${type}-${index}`}>{t(`${type}`) || type}</span>,
            displayText: t(`${type}`) || type,
        }));
    const { setHistoryFilters } = useHistoryFiltersContext();

    const [selections, setSelections] = useState<{ [key: string]: string }>({});
    const updateSelection = (value: string, displayText: string) => {
        const newSelections = { ...selections };
        if (newSelections[value]) {
            delete newSelections[value];
        } else {
            newSelections[value] = displayText;
        }

        setSelections(newSelections);
        setHistoryFilters((prevState) => {
            return {
                ...prevState,
                eventFilter: filterEventFilters(
                    prevState.eventFilter,
                    getFilterEnumKey(value) as EventFilterKeys,
                    value
                ),
            };
        });
    };

    return (
        <SelectSimple
            className={styles.selectContainer}
            label={t('byTransactionType') as string}
            onChange={(value, displayText) => {
                updateSelection(value, displayText);
            }}
            defaultValue={EventFilterKeys.All}
            isMultiselect
            options={typeOptions}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={selections}
        />
    );
};
