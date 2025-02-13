import * as RadioGroup from '@radix-ui/react-radio-group';
import { Skeleton } from '@radix-ui/themes';
import { useQuery } from '@tanstack/react-query';
import { toTitleCase } from '@zinnia/utils';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { FC, useMemo, useState } from 'react';

import { CaseTimeseries } from '@deps/components/dashboard/case-timeseries/case-timeseries';
import { CaseToCloseTimeChart } from '@deps/components/dashboard/case-to-close-time-chart/case-to-close-time-chart';
import FieldData, { FieldDataVariant } from '@deps/components/fields/field-data/field-data';
import Label, { LabelVariant } from '@deps/components/label/label';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Select from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { dashboardChartTitleFormat, splitAndSentenceCase } from '@deps/helpers/dashboard/dashboard-helpers';
import { convertToQueryString } from '@deps/helpers/routing.helper';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { getCaseDashboardStatsQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { useDashboardStore } from '@deps/store/store';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { ExceptionInsights } from '../../../components/dashboard/exception-insights';

export interface CarrierListItem {
    [key: string]: string;
}

export enum TimeframeFilterOptions {
    Trailing12Months = 'trailing 12 months',
    Last6Months = 'last 6 months',
    Last90Days = 'last 90 days',
    Last60Days = 'last 60 days',
    LastMonth = 'last month',
}

const defaultDateFormat = 'YYYY-MM-DD';

export const IssuedBusiness: FC<{ authorizedCarriers: string[] }> = ({ authorizedCarriers }) => {
    const [timeframe, setTimeframe] = useState<TimeframeFilterOptions>(TimeframeFilterOptions.Trailing12Months);
    const [selectedSubprocess, setSelectedSubprocess] = useState<string>('');
    const [selectedProcessType] = useState<Processes>(Processes.NewBusiness);
    const [selectedException, setSelectedException] = useState<string | undefined>();
    const { featureFlags } = useOptimizely();
    const { selectedBrokerDealers, selectedCarriers } = useDashboardStore(state => state);
    const carrierOrBrokerDealer = useMemo(() => {
        if (selectedCarriers && authorizedCarriers.length > 1) {
            return GroupByOptions.Carrier;
        }

        if (selectedBrokerDealers || authorizedCarriers.length === 1) {
            return GroupByOptions.BrokerDealerName;
        }
        return GroupByOptions.Carrier;
    }, [authorizedCarriers, selectedBrokerDealers, selectedCarriers]);

    const createdDateStart = useMemo(() => {
        const startDates: Record<TimeframeFilterOptions, string> = {
            [TimeframeFilterOptions.Trailing12Months]: dayjs().subtract(12, 'month').format(defaultDateFormat),
            [TimeframeFilterOptions.Last6Months]: dayjs().subtract(6, 'month').format(defaultDateFormat),
            [TimeframeFilterOptions.Last90Days]: dayjs().subtract(90, 'day').format(defaultDateFormat),
            [TimeframeFilterOptions.Last60Days]: dayjs().subtract(60, 'day').format(defaultDateFormat),
            [TimeframeFilterOptions.LastMonth]: dayjs().subtract(1, 'month').format(defaultDateFormat),
        };
        return startDates[timeframe];
    }, [timeframe]);

    const baseDashboardQueryFilter = useMemo(() => {
        const baseFilter: DashboardSearchFilter = {
            createdDateStart: createdDateStart,
            process: [Processes.NewBusiness],
            caseStatus: [Statuses.Completed],
            carrier: Object.keys(selectedCarriers),
            brokerDealerName: Object.keys(selectedBrokerDealers),
        };

        return baseFilter;
    }, [selectedCarriers, createdDateStart, selectedBrokerDealers]);

    const {
        data: caseDashboardStatsData,
        isFetching,
        isLoading,
    } = useQuery({
        queryKey: ['getCases', baseDashboardQueryFilter],
        placeholderData: previousData => previousData,
        queryFn: () =>
            getCaseDashboardStatsQuery(baseDashboardQueryFilter, [GroupByOptions.ProcessSubType, GroupByOptions.ExceptionCategory]),
        select: ({ data }) => {
            if (data && !selectedSubprocess && data?.length > 0) {
                setSelectedSubprocess(data?.[0]?.name || '');
            }
            return data?.slice(0, 5) || [];
        },
    });

    const caseVolumeTimeseriesFilters = useMemo(() => {
        const baseFilter: DashboardSearchFilter = {
            createdDateStart: createdDateStart,
            process: [selectedProcessType],
            caseStatus: [Statuses.Completed],
            carrier: Object.keys(selectedCarriers),
            brokerDealerName: Object.keys(selectedBrokerDealers),
            ...(selectedSubprocess ? { requestSubType: [selectedSubprocess] } : {}),
        };

        return baseFilter;
    }, [selectedBrokerDealers, selectedCarriers, selectedProcessType, selectedSubprocess, createdDateStart]);

    const timeframeOptions = Object.values(TimeframeFilterOptions).map(option => ({
        label: toTitleCase(option),
        value: option,
        displayText: toTitleCase(option),
    }));

    const handleTimeFrameChange = (value: string) => {
        setTimeframe(value as TimeframeFilterOptions);
    };
    const handleSelectedSubprocess = (subprocess: string) => {
        setSelectedException(undefined);
        setSelectedSubprocess(subprocess);
    };

    return (
        <CardContainer
            classNames={clsx('relative !p-0 flex flex-col flex-1 !border-none ')}
            containerClassNames="mt-none !p-0  border-t-2 border-[--color-base-border-border-light]"
        >
            {featureFlags[FEATURE_FLAGS.DASHBOARD_CASE_TIMING_CHART] && <CaseToCloseTimeChart />}

            <div className=" bg-white flex flex-col gap-8 pt-8 rounded relative py-12">
                <div className="w-52">
                    <Select options={timeframeOptions} value={timeframe} onChange={handleTimeFrameChange} />
                </div>
                <Typography variant={TypographyVariant.H2}>Top Processes by Volume</Typography>
                <BlurOverlayLoader loading={isFetching}>
                    <RadioGroup.Root asChild onValueChange={handleSelectedSubprocess} value={selectedSubprocess}>
                        <div className=" grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-8  lg:px-12 xl:px-16 !items-stretch !border-b-0 !after:content-none [& .indicator]">
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, index) => (
                                      <Skeleton key={index} className="h-40 w-full border-2 border-[--color-base-border-border-subtle]" />
                                  ))
                                : caseDashboardStatsData?.map((element, index) => {
                                      return (
                                          <RadioGroup.Item
                                              defaultChecked={index === 0}
                                              value={element.name}
                                              key={index}
                                              className={clsx(
                                                  'p-4',
                                                  'flex',
                                                  'flex-col',
                                                  'rounded',
                                                  'gap-4',
                                                  'border-2',
                                                  '!after:content-none',
                                                  '!mb-0',
                                                  'border-[--color-base-border-border-subtle]',
                                                  'data-[state=checked]:border-[--color-base-border-border-primary-color]',
                                                  'data-[state=checked]:[& .indicator]:height-0',
                                                  'hover:border-[--color-base-border-border-secondary-color]',
                                                  'items-start justify-between'
                                              )}
                                          >
                                              <div className="flex flex-row justify-between items-center align-middle self-stretch text-ellipsis overflow-hidden">
                                                  <div className="text-ellipsis text-left">
                                                      <Label
                                                          variant={LabelVariant.LabelLg}
                                                          label={dashboardChartTitleFormat(element.name, false)}
                                                      />
                                                  </div>
                                              </div>
                                              <div className="flex flex-row flex-wrap gap-4">
                                                  <FieldData variant={FieldDataVariant.Large} label="cases">
                                                      {element.count.toLocaleString('en-US')}
                                                  </FieldData>
                                              </div>
                                          </RadioGroup.Item>
                                      );
                                  })}
                        </div>
                    </RadioGroup.Root>
                </BlurOverlayLoader>
            </div>
            {selectedSubprocess && (
                <>
                    <div className="lg:px-8 py-8">
                        <CaseTimeseries
                            timeframe={timeframe}
                            selectedSubprocess={selectedSubprocess}
                            legendLabel={splitAndSentenceCase(carrierOrBrokerDealer)}
                            groupByOptions={[carrierOrBrokerDealer, GroupByOptions.UpdatedAt]}
                            filters={caseVolumeTimeseriesFilters}
                            title={`${dashboardChartTitleFormat(selectedSubprocess)} Trends`}
                            selectedProcess={selectedProcessType}
                            linkQueryFormat={`/cases${convertToQueryString({
                                ...caseVolumeTimeseriesFilters,
                                [carrierOrBrokerDealer]: 'replaceme',
                            } as any)}`}
                            showSubtitle={false}
                        />
                    </div>
                    <div className="lg:px-8 py-8">
                        <CaseTimeseries
                            timeframe={timeframe}
                            selectedSubprocess={selectedSubprocess}
                            legendLabel={splitAndSentenceCase(GroupByOptions.ProductName)}
                            groupByOptions={[GroupByOptions.ProductName, GroupByOptions.UpdatedAt]}
                            filters={caseVolumeTimeseriesFilters}
                            title={`Top 5 Products`}
                            selectedProcess={selectedProcessType}
                            linkQueryFormat={`/cases${convertToQueryString({
                                ...caseVolumeTimeseriesFilters,
                                productName: 'replaceme',
                            })}`}
                        />
                    </div>
                </>
            )}
            <div className="lg:px-8 py-8">
                <ExceptionInsights
                    timeframe={timeframe}
                    completedCasesByProcessSubType={caseDashboardStatsData}
                    selectedSubprocess={selectedSubprocess}
                    selectedException={selectedException}
                    carrierOrBrokerDealer={undefined}
                />
            </div>
        </CardContainer>
    );
};

export default IssuedBusiness;
