import { ButtonGroup } from '@zinnia/bloom/components';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { useRetentionAttrition } from '@deps/components/dashboard/sections/retention-attrition/context/retention-attrition-context';
import { CaseMetricType } from '@deps/models/case/case';

import { RetentionAttritionTimeRange, isTimeFrameFilterOption } from '../utils';
import styles from './retention-attrition-filters.module.css';

export const RetentionAttritionFilters: FC = () => {
    const { t } = useTranslation();
    const {
        timeframeRadio,
        handleTimeframeRadioChange,
        timerange,
        handleRangeChange,
        selectedMetricType,
        setSelectedMetricType,
    } = useRetentionAttrition();

    const radioItems = [
        {
            id: CaseMetricType.Retention,
            children: <span>{t('allFields.retentionLabel')}</span>,
            value: CaseMetricType.Retention,
        },
        {
            id: CaseMetricType.Attrition,
            children: <span>{t('allFields.attritionLabel')}</span>,
            value: CaseMetricType.Attrition,
        },
    ];

    const isCaseMetricType = (value: unknown): value is CaseMetricType => {
        return (
            value === CaseMetricType.Attrition ||
            value === CaseMetricType.Retention
        );
    };

    const handleOnClick = (option: unknown) => {
        if (isCaseMetricType(option)) {
            setSelectedMetricType(option);
        }
    };

    const handleOnRadioChange = (val: string) => {
        if (isTimeFrameFilterOption(val)) {
            handleTimeframeRadioChange(val);
        }
    };

    return (
        <div className={styles.container}>
            <ButtonGroup
                type="radio"
                defaultValue={selectedMetricType}
                items={radioItems}
                onClick={handleOnClick}
            />
            <TimeFilter
                defaultValue={timeframeRadio}
                onRadioChange={(val) => {
                    handleOnRadioChange(val);
                }}
                controlledTimeValue={timeframeRadio}
                timerange={timerange}
                handleTimerangeChange={handleRangeChange}
                timeframeOptions={RetentionAttritionTimeRange}
            />
        </div>
    );
};
