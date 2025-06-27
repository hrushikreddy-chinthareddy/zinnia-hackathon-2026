import { useTranslation } from 'next-i18next';
import React, { useContext } from 'react';

import { FieldSize, FieldType } from '@deps/components/fields/field';
import {
    getYearOptions,
    hasFilter,
    removeYearFilter,
    setYearFilter,
} from '@deps/components/history/filters/filter.helpers';
import SelectSimple from '@deps/components/select/select';
import { TranslationFiles } from '@deps/config/translations';
import { useHistoryFiltersContext } from '@deps/contexts/HistoryFiltersContext';
import { PolicyData } from '@deps/contexts/PolicyDataContext';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

export default function TransactionsYearFilter() {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'policy.history.filter',
    });
    const { policy } = useContext(PolicyData);
    const { historyFilters, setHistoryFilters } = useHistoryFiltersContext();

    const { yearFilter } = historyFilters;

    const yearOptions = getYearOptions(policy?.policyDates?.issueDate);

    return (
        <SelectSimple
            className="max-w-[200px]"
            label={t('byYear') as string}
            onChange={(year) => {
                if (year === DEFAULT_ERROR_STRING) {
                    removeYearFilter(setHistoryFilters);
                } else {
                    setYearFilter(setHistoryFilters, year);
                }
            }}
            options={yearOptions}
            placeholder={t('byYear') as string}
            size={FieldSize.Small}
            type={FieldType.BaseActive}
            value={
                hasFilter(yearFilter)
                    ? (yearFilter as string)
                    : DEFAULT_ERROR_STRING
            }
        />
    );
}
