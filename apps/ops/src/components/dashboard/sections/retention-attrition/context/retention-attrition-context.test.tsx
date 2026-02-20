import { renderHook } from '@testing-library/react';
import React from 'react';

import { CaseMetricType } from '@deps/models/case/case';
import { browserLogError } from '@deps/utils/browser-logging';

import {
    RetentionAttritionContext,
    useRetentionAttrition,
} from './retention-attrition-context';
import { RetentionAttritionTimeRange } from '../utils';

jest.mock('@deps/utils/browser-logging', () => ({
    browserLogError: jest.fn(),
}));

describe('useRetentionAttrition', () => {
    it('should return default state when used without provider', () => {
        const { result } = renderHook(() => useRetentionAttrition());

        expect(result.current).toEqual(
            expect.objectContaining({
                timeframeRadio: RetentionAttritionTimeRange.Trailing12Months,
                selectedMetricType: CaseMetricType.Retention,
                retentionAttritionData: undefined,
                retentionAttritionDataLoading: false,
                retentionAttritionDataError: false,
                pieSeries: [],
                pieInformation: { title: '', description: '' },
            })
        );
    });

    it('should return provider value when used within RetentionAttritionProvider', () => {
        const mockValue = {
            timeframeRadio: RetentionAttritionTimeRange.Last6Months,
            handleTimeframeRadioChange: jest.fn(),
            timerange: { from: '2024-01-01', to: '2024-06-30' },
            handleRangeChange: jest.fn(),
            selectedMetricType: CaseMetricType.Attrition,
            setSelectedMetricType: jest.fn(),
            filter: {},
            retentionAttritionData: [],
            retentionAttritionDataLoading: false,
            retentionAttritionDataError: false,
            retentionAttritionDataFetching: false,
            pieSeries: [],
            retentionAttritionPieDataFetching: false,
            pieInformation: {
                title: '40 %',
                description: 'Attrition past 6 months',
            },
        };

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <RetentionAttritionContext.Provider value={mockValue}>
                {children}
            </RetentionAttritionContext.Provider>
        );

        const { result } = renderHook(() => useRetentionAttrition(), {
            wrapper,
        });

        expect(result.current.timeframeRadio).toBe(
            RetentionAttritionTimeRange.Last6Months
        );
        expect(result.current.selectedMetricType).toBe(
            CaseMetricType.Attrition
        );
        expect(result.current.pieInformation.title).toBe('40 %');
        expect(result.current.timerange).toEqual({
            from: '2024-01-01',
            to: '2024-06-30',
        });
    });

    it('should call browserLogError when context is null', () => {
        const NullProvider = ({ children }: { children: React.ReactNode }) => (
            <RetentionAttritionContext.Provider value={null as any}>
                {children}
            </RetentionAttritionContext.Provider>
        );

        renderHook(() => useRetentionAttrition(), { wrapper: NullProvider });

        expect(browserLogError).toHaveBeenCalledWith(
            'useRetentionAttrition must be used within a RetentionAttritionProvider',
            { hook: 'useRetentionAttrition' }
        );
    });
});
