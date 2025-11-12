import { FieldSize } from '@zinnia/bloom/components';
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

import { getFilter, getFilterEnumKey, setFilter } from './filter.helpers';
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
    const typeOptions = Object.values(options).map((type) => ({
        value: type,
        label: t(`${type}`) || type,
    }));
    const { historyFilters, setHistoryFilters } = useHistoryFiltersContext();
    const { eventFilter } = historyFilters;
    const { subfilterName } = getFilter(eventFilter);

    return (
        <SelectSimple
            className={styles.selectContainer}
            label={t('byTransactionType') as string}
            onChange={(filter) => {
                setFilter(
                    setHistoryFilters,
                    getFilterEnumKey(filter) as EventFilterKeys,
                    filter as EventFilterKeys
                );
            }}
            defaultValue={EventFilterKeys.All}
            options={typeOptions}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={subfilterName ?? EventFilterKeys.All}
        />
    );
};
