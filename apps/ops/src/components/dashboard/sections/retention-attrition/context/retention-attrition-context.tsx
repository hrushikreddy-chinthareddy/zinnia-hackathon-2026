import { createContext, useContext } from 'react';

import { CaseMetricType } from '@deps/models/case/case';
import { browserLogError } from '@deps/utils/browser-logging';
import { CompletedTaskTimeInputFilter } from '@zinnia/api-types/types/analytics';

import { RetentionAttritionData, RetentionAttritionTimeRange } from '../utils';

interface RetentionAttritionContextTypes {
    timeframeRadio: RetentionAttritionTimeRange | undefined;
    handleTimeframeRadioChange: (value: RetentionAttritionTimeRange) => void;
    timerange: { from: string; to: string };
    handleRangeChange: (value: { from: string; to: string }) => void;
    selectedMetricType: CaseMetricType;
    setSelectedMetricType: (value: CaseMetricType) => void;
    filter: CompletedTaskTimeInputFilter;
    retentionAttritionData: RetentionAttritionData[] | undefined;
    retentionAttritionDataLoading: boolean;
    retentionAttritionDataError: boolean;
    retentionAttritionDataFetching: boolean;
    pieSeries: {
        name: string;
        data: {
            name: string;
            y: number;
        }[];
    }[];
    retentionAttritionPieDataFetching: boolean;
    pieInformation: { title: string; description: string };
}

const defaultState: RetentionAttritionContextTypes = {
    timeframeRadio: RetentionAttritionTimeRange.Trailing12Months,
    handleTimeframeRadioChange: () => {},
    timerange: { from: '', to: '' },
    handleRangeChange: () => {},
    selectedMetricType: CaseMetricType.Retention,
    setSelectedMetricType: () => {},
    filter: {},
    retentionAttritionData: undefined,
    retentionAttritionDataLoading: false,
    retentionAttritionDataError: false,
    retentionAttritionDataFetching: false,
    pieSeries: [],
    retentionAttritionPieDataFetching: false,
    pieInformation: { title: '', description: '' },
};

export const RetentionAttritionContext =
    createContext<RetentionAttritionContextTypes>(defaultState);

export const useRetentionAttrition = (): RetentionAttritionContextTypes => {
    const context = useContext(RetentionAttritionContext);

    if (!context) {
        const errorMessage =
            'useRetentionAttrition must be used within a RetentionAttritionProvider';
        browserLogError(errorMessage, { hook: 'useRetentionAttrition' });
    }

    return context;
};
