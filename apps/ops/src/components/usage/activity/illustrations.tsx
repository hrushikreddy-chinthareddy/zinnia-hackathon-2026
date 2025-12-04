import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
    calculateTickInterval,
    xAxisLabelFormatter,
} from '@deps/components/dashboard/charts/date-time-chart/dateTimeChartUtils';
import { Legend } from '@deps/components/dashboard/charts/date-time-chart/legend-for-date-time-chart/legend';
import { DateTimeLineChart } from '@deps/components/dashboard/charts/line-charts/date-time-line-chart';
import {
    ErrorMessage,
    NoDataMessage,
} from '@deps/components/dashboard/components/errors';
import { TimeFilter } from '@deps/components/dashboard/filters/time-filter/time-filter';
import { useTimeRangeFilter } from '@deps/components/dashboard/filters/time-filter/useTimeRangeFilter';
import { defaultDateFormat } from '@deps/components/dashboard/utils';
import { FieldSize } from '@deps/components/fields/field';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import SelectComponent from '@deps/components/select/select';
import { TotalCount } from '@deps/components/usage//total-count';
import UsageHeaderLayout from '@deps/components/usage/usage-common-header';
import {
    ActivityType,
    colors,
    generateIllustrationsCSVFileName,
    PRODUCT_TYPE_OPTIONS,
    ProductType,
    startDates,
    TimeframeFilterOptions,
} from '@deps/components/usage/utils';
import { getUserIllustrationActivityCountQuery } from '@deps/queries/tanstack/usage/usageQueries';
import { startOfTomorrowLocalIso } from '@deps/utils/dates';
import { UserIllustrationActivityGroupByEnum } from '@zinnia/api-types/types/analytics';

import styles from './Activity.module.css';
import {
    IllustrationsActivityTooltip,
    tooltipFormatter,
} from './illustrations-tooltip';
import {
    generateSeries,
    mergeDuplicatedIntoCreated,
    prepareIllustrationsActivityCSV,
} from './utils';

type ProductTypeOption = (typeof ProductType)[keyof typeof ProductType];

export const IllustrationsActivity = () => {
    const { t } = useTranslation();
    const [productType, setProductType] = useState<ProductTypeOption>(
        ProductType.Term
    );
    const [productName, setProductName] =
        useState<keyof typeof ProductType>('Term');

    const {
        timeframeRadio,
        timerange,
        handleTimeframeRadioChange,
        handleRangeChange,
    } = useTimeRangeFilter<TimeframeFilterOptions>({
        startDates,
        defaultOption: TimeframeFilterOptions.Last1Month,
        dateFormat: defaultDateFormat,
    });

    const getProductKey = (value: string) => {
        return Object.entries(ProductType).find(
            ([_, v]) => v === value
        )?.[0] as keyof typeof ProductType;
    };

    const isProductTypeOption = (value: string): value is ProductTypeOption => {
        return Object.values(ProductType).includes(value as ProductTypeOption);
    };

    const handleProductTypeChange = (productType: string) => {
        if (isProductTypeOption(productType)) {
            setProductName(getProductKey(productType));
            setProductType(productType);
        }
    };

    const filter = {
        activityType: [
            ActivityType.Created,
            ActivityType.Duplicated,
            ActivityType.Selected,
        ],
        productName: [productName],
        productType: [productType],
        dateStart: timerange.from,
        dateEnd: startOfTomorrowLocalIso(timerange.to) || undefined,
    };

    const {
        data: illustrationsActivityData,
        isFetching: illustrationsActivityDataFetching,
        isError: illustrationsActivityDataError,
    } = useQuery({
        queryKey: ['illustrationsActivityData', filter],
        placeholderData: (previousData) => previousData,
        queryFn: () =>
            getUserIllustrationActivityCountQuery(filter, [
                UserIllustrationActivityGroupByEnum.ACTIVITY_TYPE,
                UserIllustrationActivityGroupByEnum.ACTIVITY_DAY,
            ]),
    });

    const normalizedIllustrationsActivityData = useMemo(() => {
        return mergeDuplicatedIntoCreated(
            illustrationsActivityData?.data ?? []
        );
    }, [illustrationsActivityData]);

    const series = generateSeries(
        normalizedIllustrationsActivityData,
        timerange,
        colors
    );

    const tickInterval = calculateTickInterval(timerange);
    const chartNotRenderable =
        illustrationsActivityDataError || !series?.length;
    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <UsageHeaderLayout
                    title={String(t('allFields.illustrationsActivityTitle'))}
                    description={String(
                        t('allFields.illustrationsActivityDescription')
                    )}
                    titleToolTip={<IllustrationsActivityTooltip />}
                    data={normalizedIllustrationsActivityData}
                    csvFileName={generateIllustrationsCSVFileName(
                        t('allFields.illustrationsActivityTitle'),
                        productName,
                        timerange
                    )}
                    csvFunction={prepareIllustrationsActivityCSV}
                />
                <div className="flex items-center justify-between gap-4 w-full">
                    <div className="mb-4 md:mb-0 md:w-1/3">
                        <SelectComponent
                            label="Product"
                            options={PRODUCT_TYPE_OPTIONS}
                            size={FieldSize.XS}
                            name="role-type-dropdown-btn"
                            onChange={handleProductTypeChange}
                            value={productType}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <TotalCount
                            isDataFetching={illustrationsActivityDataFetching}
                            data={
                                illustrationsActivityData ?? {
                                    data: [],
                                    totalElements: 0,
                                }
                            }
                        />

                        <TimeFilter
                            defaultValue={timeframeRadio}
                            onRadioChange={(val) =>
                                handleTimeframeRadioChange(
                                    val as TimeframeFilterOptions
                                )
                            }
                            controlledTimeValue={timeframeRadio}
                            timerange={timerange}
                            handleTimerangeChange={handleRangeChange}
                            timeframeOptions={TimeframeFilterOptions}
                        />
                    </div>
                </div>

                <BlurOverlayLoader loading={illustrationsActivityDataFetching}>
                    <div className="w-full flex-grow">
                        {chartNotRenderable ? (
                            illustrationsActivityDataError ? (
                                <ErrorMessage />
                            ) : (
                                <NoDataMessage />
                            )
                        ) : (
                            <DateTimeLineChart
                                series={series}
                                yAxisTitle={'Total'}
                                xAxisTitle={'Date'}
                                xAxisLabelFormatter={xAxisLabelFormatter}
                                tickInterval={tickInterval}
                                tooltipFormatter={tooltipFormatter}
                                yAxisOpposite={false}
                            />
                        )}
                    </div>
                    <div className="w-full pl-2">
                        {series?.length !== 0 && (
                            <Legend
                                title={''}
                                colors={series.map((item) => item.color)}
                                labels={series.map((item) => item.name)}
                            />
                        )}
                    </div>
                </BlurOverlayLoader>
            </div>
        </div>
    );
};
