import * as RadioGroup from '@radix-ui/react-radio-group';
import { useQuery } from '@tanstack/react-query';
import { DEFAULT_ERROR_STRING, toTitleCase } from '@zinnia/utils';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { FC, useMemo, useState } from 'react';

import { ExceptionSummary } from '@deps/components/dashboard/exception-summary/exception-summary';
import { Top5SubprocessByVolume } from '@deps/components/dashboard/top-5-subprocesses-by-volume/top-5-subprocess-by-volume';
import FieldData, { FieldDataVariant } from '@deps/components/fields/field-data/field-data';
import Label, { LabelVariant } from '@deps/components/label/label';
import PageLoader from '@deps/components/page-loader/page-loader';
import Select from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
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

export const IssuedBusiness: FC = () => {
    const [timeframe, setTimeframe] = useState<string>(timeFrameFilterOptions[0]);
    const [selectedSubprocess, setSelectedSubprocess] = useState<string>('');
    const [selectedException, setSelectedException] = useState<string | undefined>();

    const handleSelectedSubprocess = (subprocess: string) => {
        setSelectedException(undefined);
        setSelectedSubprocess(subprocess);
    };
    const { selectedBrokerDealers, selectedCarriers } = useDashboardStore(state => state);
    const carrierOrBrokerDealer = useMemo(() => {
        if (selectedCarriers) {
            return GroupByOptions.Carrier;
        }
        if (selectedBrokerDealers) {
            return GroupByOptions.BrokerDealerName;
        }
        return GroupByOptions.Carrier;
    }, [selectedBrokerDealers, selectedCarriers]);

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
            return {
                selectedSubprocess: data?.[0]?.name || '',
                exceptionData: data?.slice(0, 5) || [],
            };
        },
    });

    console.log('caseData', caseDashboardStatsData?.exceptionData);

    return (
        <CardContainer
            classNames="relative !p-0 flex flex-col flex-1 !border-none  bg-[--color-base-surface-surface-tertiary]"
            containerClassNames="mt-none !p-0  border-t-2 border-[--color-base-border-border-light]"
        >
            <div className=" bg-white p-8 flex flex-col gap-4 rounded">
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
                <RadioGroup.Root
                    asChild
                    onValueChange={handleSelectedSubprocess}
                    value={selectedSubprocess || caseDashboardStatsData?.selectedSubprocess}
                >
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
                        selectedSubprocess={selectedSubprocess || caseDashboardStatsData?.selectedSubprocess || ''}
                        selectedException={selectedException}
                        carrierOrBrokerDealer={undefined}
                    />
                )}
            </div>
            <div className="bg-white p-8 flex flex-col gap-8">
                {(selectedSubprocess || caseDashboardStatsData?.selectedSubprocess) && (
                    <ExceptionSummary
                        carrierOrBrokerDealer={carrierOrBrokerDealer}
                        startDate={createdDateStart}
                        selectedSubprocess={selectedSubprocess || caseDashboardStatsData?.selectedSubprocess || ''}
                    />
                )}
            </div>
            <div className="bg-white p-8 flex flex-col gap-8">
                {(selectedSubprocess || caseDashboardStatsData?.selectedSubprocess) && (
                    <Top5SubprocessByVolume
                        createdDateStart={createdDateStart}
                        requestSubType={selectedSubprocess || caseDashboardStatsData?.selectedSubprocess || ''}
                    />
                )}
            </div>
        </CardContainer>
    );
};

export default IssuedBusiness;
