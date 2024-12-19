import * as RadioGroup from '@radix-ui/react-radio-group';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_ERROR_STRING, toTitleCase } from '@zinnia/utils';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { FC, useMemo, useState } from 'react';

import { CaseTimeseries } from '@deps/components/dashboard/case-timeseries/case-timeseries';
import FieldData, { FieldDataVariant } from '@deps/components/fields/field-data/field-data';
import Label, { LabelVariant } from '@deps/components/label/label';
import PageLoader from '@deps/components/page-loader/page-loader';
import Select from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { dashboardChartTitleFormat, splitAndSentenceCase } from '@deps/helpers/dashboard/dashboard-helpers';
import { convertToQueryString } from '@deps/helpers/routing.helper';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { getCaseDashboardStatsQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { useDashboardStore } from '@deps/store/store';

import { ExceptionInsights } from '../../../components/dashboard/exception-insights';

export interface CarrierListItem {
    [key: string]: string;
}

const timeFrameFilterOptions = ['trailing 12 months', 'last 6 months', 'last 90 days', 'last 60 days', 'last month'];

export const IssuedBusiness: FC<{ authorizedCarriers: string[] }> = ({ authorizedCarriers }) => {
    const [timeframe, setTimeframe] = useState<string>(timeFrameFilterOptions[0]);
    const [selectedSubprocess, setSelectedSubprocess] = useState<string>('');
    const [selectedProcessType] = useState<Processes>(Processes.NewBusiness);
    const [selectedException, setSelectedException] = useState<string | undefined>();

    const handleSelectedSubprocess = (subprocess: string) => {
        setSelectedException(undefined);
        setSelectedSubprocess(subprocess);
    };
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

    const handleTimeFrameChange = (value: string) => {
        setTimeframe(value);
    };

    const createdDateStart = useMemo(() => {
        let startDate = dayjs().subtract(1, 'year').format('YYYY-MM-DD');
        switch (timeframe) {
            case 'trailing 12 months':
                startDate = dayjs().subtract(12, 'month').format('YYYY-MM-DD');
                break;
            case 'last 6 months':
                startDate = dayjs().subtract(6, 'month').format('YYYY-MM-DD');
                break;
            case 'last 90 days':
                startDate = dayjs().subtract(90, 'day').format('YYYY-MM-DD');
                break;
            case 'last 60 days':
                startDate = dayjs().subtract(60, 'day').format('YYYY-MM-DD');
                break;
            case 'last month':
                startDate = dayjs().subtract(1, 'month').format('YYYY-MM-DD');
                break;
        }
        return startDate;
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

    const { data: caseDashboardStatsData, isLoading } = useQuery({
        queryKey: ['getCases', baseDashboardQueryFilter],
        queryFn: () =>
            getCaseDashboardStatsQuery(baseDashboardQueryFilter, [GroupByOptions.ProcessSubType, GroupByOptions.ExceptionCategory]),
        select: ({ data }) => {
            if (!selectedSubprocess) {
                setSelectedSubprocess(data?.[0]?.name || '');
            }
            return {
                exceptionData: data?.slice(0, 5) || [],
            };
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

    return (
        <CardContainer
            classNames="relative !p-0 flex flex-col flex-1 !border-none"
            containerClassNames="mt-none !p-0  border-t-2 border-[--color-base-border-border-light]"
        >
            <div className=" bg-white p-8 mb-8 flex flex-col gap-4 rounded">
                <div className="w-52">
                    <Select
                        options={timeFrameFilterOptions.map(option => ({
                            label: toTitleCase(option),
                            value: option,
                            displayText: toTitleCase(option),
                        }))}
                        value={timeframe}
                        onChange={handleTimeFrameChange}
                    />
                </div>
                <Typography className="py-4" variant={TypographyVariant.H2}>
                    Top 5 Processes by Volume
                </Typography>
                <RadioGroup.Root asChild onValueChange={handleSelectedSubprocess} value={selectedSubprocess}>
                    <div className=" grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 !items-stretch !border-b-0 !after:content-none [& .indicator]">
                        {caseDashboardStatsData?.exceptionData.map((element, index) => {
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
                                    {isLoading ? (
                                        <>
                                            <PageLoader />
                                            <Typography variant={TypographyVariant.BodyBold}>Loading...</Typography>
                                        </>
                                    ) : (
                                        <>
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
                                                <FieldData variant={FieldDataVariant.Large} label="Avg days to close">
                                                    {DEFAULT_ERROR_STRING}
                                                </FieldData>
                                            </div>
                                        </>
                                    )}
                                </RadioGroup.Item>
                            );
                        })}
                    </div>
                </RadioGroup.Root>
            </div>
            <div className="bg-white flex flex-col lg:flex-row gap-4 lg:gap-8 mb-8 lg:px-8">
                {selectedSubprocess && (
                    <CaseTimeseries
                        selectedSubprocess={selectedSubprocess}
                        legendLabel={splitAndSentenceCase(carrierOrBrokerDealer)}
                        groupByOptions={[carrierOrBrokerDealer, GroupByOptions.UpdatedAt]}
                        filters={caseVolumeTimeseriesFilters}
                        title={`${toTitleCase(selectedSubprocess)} Application Volume`}
                        selectedProcess={selectedProcessType}
                        linkQueryFormat={`/cases${convertToQueryString({
                            ...caseVolumeTimeseriesFilters,
                            [carrierOrBrokerDealer]: 'replaceme',
                        } as any)}`}
                    />
                )}
            </div>
            <div className="bg-white flex flex-col lg:flex-row gap-4 lg:gap-8 mb-8 lg:px-8">
                {selectedSubprocess && (
                    <CaseTimeseries
                        selectedSubprocess={selectedSubprocess}
                        legendLabel={splitAndSentenceCase(GroupByOptions.ProductName)}
                        groupByOptions={[GroupByOptions.ProductName, GroupByOptions.UpdatedAt]}
                        filters={caseVolumeTimeseriesFilters}
                        title={`${toTitleCase(selectedSubprocess)} Top 5 Products`}
                        selectedProcess={selectedProcessType}
                        linkQueryFormat={`/cases${convertToQueryString({
                            ...caseVolumeTimeseriesFilters,
                            productName: 'replaceme',
                        } as any)}`}
                    />
                )}
            </div>
            <div className="bg-white flex flex-col gap-4 lg:gap-8 mb-8 lg:px-8">
                {isLoading ? (
                    <>
                        <div className="min-h-[600px] grid gap-4 h-full mb-4 w-full place-content-center bg-[--color-base-surface-surface-tertiary]">
                            <PageLoader />
                        </div>
                    </>
                ) : (
                    <ExceptionInsights
                        timeframe={timeframe}
                        completedCasesByProcessSubType={caseDashboardStatsData?.exceptionData}
                        selectedSubprocess={selectedSubprocess}
                        selectedException={selectedException}
                        carrierOrBrokerDealer={undefined}
                    />
                )}
            </div>
        </CardContainer>
    );
};

export default IssuedBusiness;
