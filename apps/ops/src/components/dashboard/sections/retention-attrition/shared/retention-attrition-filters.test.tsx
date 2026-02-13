import { render } from '@testing-library/react';

import { RetentionAttritionFilters } from './retention-attrition-filters';

const mockUseRetentionAttrition = jest.fn();
const mockButtonGroup = jest.fn((_props: unknown) => null);
const mockTimeFilter = jest.fn((_props: unknown) => null);

jest.mock(
    '@deps/components/dashboard/sections/retention-attrition/context/retention-attrition-context',
    () => ({
        useRetentionAttrition: () => mockUseRetentionAttrition(),
    })
);

jest.mock('@zinnia/bloom/components', () => ({
    ButtonGroup: (props: unknown) => mockButtonGroup(props),
}));

jest.mock('@deps/components/dashboard/filters/time-filter/time-filter', () => ({
    TimeFilter: (props: unknown) => mockTimeFilter(props),
}));

const mockT = jest.fn((key: string) => {
    if (key === 'allFields.retentionLabel') return 'Retention';
    if (key === 'allFields.attritionLabel') return 'Attrition';
    return key;
});

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
    }),
}));

describe('RetentionAttritionFilters', () => {
    beforeEach(() => {
        mockButtonGroup.mockClear();
        mockTimeFilter.mockClear();
        mockUseRetentionAttrition.mockReturnValue({
            timeframeRadio: '12M',
            handleTimeframeRadioChange: jest.fn(),
            timerange: { from: '2024-01-01', to: '2024-12-31' },
            handleRangeChange: jest.fn(),
            selectedMetricType: 'Retention',
            setSelectedMetricType: jest.fn(),
        });
    });

    it('should render TimeFilter with context values', () => {
        render(<RetentionAttritionFilters />);

        expect(mockTimeFilter).toHaveBeenCalledWith(
            expect.objectContaining({
                defaultValue: '12M',
                timerange: { from: '2024-01-01', to: '2024-12-31' },
                handleTimerangeChange: expect.any(Function),
            })
        );
    });

    it('should render ButtonGroup with Retention and Attrition options', () => {
        render(<RetentionAttritionFilters />);

        expect(mockButtonGroup).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'radio',
                defaultValue: 'Retention',
                items: expect.arrayContaining([
                    expect.objectContaining({
                        id: 'Retention',
                        value: 'Retention',
                    }),
                    expect.objectContaining({
                        id: 'Attrition',
                        value: 'Attrition',
                    }),
                ]),
            })
        );
    });
});
