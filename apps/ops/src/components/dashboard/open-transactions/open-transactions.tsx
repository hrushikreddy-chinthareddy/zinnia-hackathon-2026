import { useQuery } from '@tanstack/react-query';
import { IconType, Button, Icon } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { t } from 'i18next';
import { FC, CSSProperties } from 'react';

import { MultiselectOption, SimpleOption } from '@deps/components/autocomplete/autocomplete.types';
import { ButtonSize } from '@deps/components/button/button';
import { FieldSize } from '@deps/components/fields/field';
import { BlurOverlayLoader } from '@deps/components/overlay-loader/overlay-loader';
import Select from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import CardContainer from '@deps/containers/card-container/card-container';
import { getStartAndEndDates } from '@deps/containers/case-redesign-sub-page/case-helpers';
import { dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import { useIntersectionObserver } from '@deps/hooks/useIntersectionObserver';
import { DashboardStatsElementResponse, Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import styles from '@deps/pages/dashboard/Dashboard.module.css';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { getCaseDashboardStatsQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { useDashboardStore } from '@deps/store/store';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

import ActiveAging from '../active-aging/active-aging';
import CaseStatBlock from '../stat-blocks/case-stat-block';
import { SubmissionType } from '../submission-type/submission-type';
import { TreeMapInsights } from '../tree-map-insights';

interface OpenTransactionsProps {
    carrierHeaderHeight?: number;
    baseDashboardQueryFilter: DashboardSearchFilter;
    authorizedCarriers: string[];
}

const formatProcessListOptions = (data: DashboardStatsElementResponse[] | undefined) => {
    if (!data || !data.length) throw new Error('No data');
    return (
        data
            .reduce<SimpleOption[]>((prev, curr) => {
                if (curr.name && !prev.some(item => item.value === curr.name)) {
                    prev.push({ value: curr.name, label: `${dashboardChartTitleFormat(curr.name, 16)} (${curr.count})` });
                }
                return prev;
            }, [])
            // alphabetize
            .sort((item1, item2) => item1.label.localeCompare(item2.label))
    );
};
const createBaseQuery = async (baseInsightQueryFilter: DashboardSearchFilter, groupBy: GroupByOptions[]) => {
    const response = await getCaseDashboardStatsQuery(baseInsightQueryFilter, groupBy);
    if (!response?.data) {
        console.error(
            'createBaseQuery::An error occurred while getting case dashboard stats results',
            response?.data?.length,
            JSON.stringify(response)
        );
        throw response;
    } else {
        return response;
    }
};

export const OpenTransactions: FC<OpenTransactionsProps> = ({ carrierHeaderHeight, baseDashboardQueryFilter, authorizedCarriers }) => {
    const { createdDateStart, createdDateEnd } = getStartAndEndDates('All');
    const {
        selectedCarriers,
        selectedBrokerDealers,
        selectedSubProcess,
        selectedProcess,
        updateSelectedSubprocess,
        updateSelectedProcess,
    } = useDashboardStore(state => state);

    const {
        isIntersecting: footerIsIntersecting,
        ref: insightChartRef,
        entry: insightChartEntry,
    } = useIntersectionObserver({
        rootMargin: `-${carrierHeaderHeight || 0}px 0px -100% 0px`,
        threshold: 0,
    });

    const filter: DashboardSearchFilter = {
        caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
        createdDateStart: createdDateStart,
    };

    const carriers = Object.keys(selectedCarriers);
    const brokers = Object.keys(selectedBrokerDealers);
    filter.carrier = carriers;
    filter.brokerDealerName = brokers;
    filter.process = [selectedProcess];
    filter.requestSubType = selectedSubProcess;

    const { data: insightGroupingCountByCarrierStats, isFetching: insightGroupingCountByCarrierStatsFetching } = useQuery({
        queryKey: ['countByCarrierInsights', filter],
        queryFn: () => createBaseQuery(filter, [GroupByOptions.Carrier]),
        enabled: Object.keys(filter).length > 0,
    });

    const { data: insightGroupingCountByBrokerStats, isFetching: insightGroupingCountByBrokerStatsFetching } = useQuery({
        queryKey: ['countByBrokerInsights', filter],
        queryFn: () => createBaseQuery(filter, [GroupByOptions.BrokerDealerName]),
        enabled: Object.keys(filter).length > 0,
    });

    const { data: insightGroupingCountBySubProcessStats, isFetching: insightGroupingCountBySubProcessStatsFetching } = useQuery({
        queryKey: ['countBySubProcessInsights', filter],
        queryFn: () => createBaseQuery(filter, [GroupByOptions.ProcessSubType]),
        enabled: Object.keys(filter).length > 0,
    });

    const {
        data: insightCreatedBySubProcess,
        isFetching: insightCreatedBySubProcessFetching,
        isError: insightCreatedBySubProcessError,
    } = useQuery({
        queryKey: ['createdBySubProcessInsights', filter],
        placeholderData: previousData => previousData,
        queryFn: () => createBaseQuery(filter, [GroupByOptions.ProcessSubType, GroupByOptions.CreatedAt]),
        enabled: Object.keys(filter).length > 0,
    });

    const {
        data: insightActiveAgingPiesByCreated,
        isLoading: insightActiveAgingPiesByCreatedLoading,
        isFetching: insightActiveAgingPiesByCreatedFetching,
        isError: insightActiveAgingPiesByCreatedError,
    } = useQuery({
        queryKey: ['activeAgingPieChartKeys', filter],
        queryFn: () => createBaseQuery(filter, [GroupByOptions.CreatedAt, GroupByOptions.ProductName]),
        placeholderData: previousData => previousData,
        enabled: Object.keys(filter).length > 0,
    });

    const { data: insightExceptionStats, isFetching: insightExceptionStatsFetching } = useQuery({
        queryKey: ['exceptionStats', filter],
        queryFn: async () => {
            const response = await createBaseQuery(filter, [GroupByOptions.ExceptionCategory]);
            if (response?.data?.length) {
                response.data = response?.data?.filter(item => item.name !== '');
            }

            return response;
        },
        placeholderData: previousData => previousData,
        enabled: Object.keys(filter).length > 0,
    });

    const { data: processListOptions } = useQuery({
        queryKey: ['processListOptions', baseDashboardQueryFilter],
        placeholderData: previousData => previousData,
        queryFn: () => createBaseQuery(baseDashboardQueryFilter, [GroupByOptions.Process]),
        select: ({ data }) => formatProcessListOptions(data),
        enabled: Object.keys(baseDashboardQueryFilter).length > 0,
    });

    const { data: subprocessListOptions } = useQuery({
        queryKey: ['subprocessListOptions', createdDateStart, filter],
        placeholderData: previousData => previousData,
        queryFn: () =>
            createBaseQuery({ ...filter, createdDateStart: createdDateStart }, [GroupByOptions.ProcessSubType, GroupByOptions.Process]),
        select: ({ data }) => {
            const options: MultiselectOption[] = [];
            if (!data) return options;
            data.forEach(item => {
                options.push({
                    value: item.name,
                    label: `${dashboardChartTitleFormat(item.name, 15)} (${item.count})`,
                    displayText: `${item.name} (${item.count})`,
                });
            });

            return options;
        },
        enabled: Object.keys(filter).length > 0,
    });

    const updateProcessFilter = (processType: Processes) => {
        updateSelectedProcess(processType);
        updateSelectedSubprocess([]);
    };

    const updateSubprocessFilter = (processType: string) => {
        if (processType === ('All' as Processes)) {
            updateSelectedSubprocess([]);
        } else {
            const isAlreadyInArray = selectedSubProcess.includes(processType);
            const updatedState = isAlreadyInArray
                ? selectedSubProcess.filter(item => item !== processType)
                : [...selectedSubProcess, processType];
            updateSelectedSubprocess(updatedState);
        }
    };

    const clearFilters = () => {
        updateSelectedProcess(Processes.NewBusiness);
        updateSelectedSubprocess([]);
    };

    const clearFiltersDisabled = selectedProcess?.includes(Processes.NewBusiness) && !selectedSubProcess?.length;
    const subProcessValue = selectedSubProcess.length
        ? {
              [selectedSubProcess[0]]: dashboardChartTitleFormat(selectedSubProcess[0], 15),
          }
        : {};

    return (
        <>
            {/* Open Transactions select dropdown */}
            <div
                className={clsx(styles.insightsHeader, {
                    [styles.pinned as string]: footerIsIntersecting || Number(insightChartEntry?.boundingClientRect.bottom) < 0,
                })}
                style={
                    {
                        '--pinned-height': carrierHeaderHeight + 'px',
                    } as CSSProperties
                }
            >
                <Typography className="flex items-center" variant={TypographyVariant.H2} data-testid="header-text">
                    {'Open Transactions'}
                </Typography>
                <div className={`${styles.insightsHeaderDropdownContainer}`}>
                    <div className="w-52">
                        <Select
                            className={styles.insightsHeaderDropdownItem}
                            options={processListOptions || []}
                            size={FieldSize.Small}
                            name="process-type-dropdown-btn"
                            placeholder={t('selectProcessType') || ''}
                            value={selectedProcess || ''}
                            onChange={value => updateProcessFilter(value as Processes)}
                        />
                    </div>
                    <div className="w-52">
                        <Select
                            isMultiselect
                            className={styles.insightsHeaderDropdownItem}
                            options={subprocessListOptions || []}
                            size={FieldSize.Small}
                            name="subprocess-type-dropdown-btn"
                            placeholder={`All Case Subtypes (${insightGroupingCountBySubProcessStats?.totalElements || 0})`}
                            value={subProcessValue}
                            onChange={updateSubprocessFilter}
                        />
                    </div>
                    <Button
                        className="flex items-center align-middle flex-row"
                        mode="link"
                        disabled={insightGroupingCountBySubProcessStatsFetching || clearFiltersDisabled}
                        size={ButtonSize.Small}
                        onClick={clearFilters}
                    >
                        reset <Icon width={16} height={16} type={IconType.REFRESH} />
                    </Button>
                </div>
            </div>
            {/**** Open Transaction Charts ******/}
            <div ref={insightChartRef}>
                <div className={styles.container}>
                    {insightCreatedBySubProcessError ||
                    insightActiveAgingPiesByCreatedError ||
                    !insightActiveAgingPiesByCreated?.data?.length ? (
                        <div className="grid place-content-center h-full w-full min-h-[400px]">
                            <Typography variant={TypographyVariant.BodyBold} className="mt-4 flex flex-row gap-2">
                                <ChartBarsIcon height={'24px'} width={'24px'} />
                                {'Something went wrong fetching insights, please try again by refreshing the page'}
                            </Typography>
                        </div>
                    ) : (
                        <BlurOverlayLoader loading={insightCreatedBySubProcessFetching}>
                            <ActiveAging
                                createdBySubProcess={insightCreatedBySubProcess}
                                activeAgingPieChartByCreated={insightActiveAgingPiesByCreated}
                                loading={insightCreatedBySubProcessError || insightActiveAgingPiesByCreatedLoading}
                                selectedProcess={selectedProcess || Processes.NewBusiness}
                                carriers={Object.keys(selectedCarriers)}
                            />
                        </BlurOverlayLoader>
                    )}
                    <div className="mt-1">
                        <SubmissionType />
                    </div>
                    <div className="mt-1">
                        {/* this is the Exception Distribution by Category tree map chart */}
                        <CardContainer fullWidth={false} classNames="relative">
                            <BlurOverlayLoader loading={insightExceptionStatsFetching}>
                                <TreeMapInsights dashboardStatsData={insightExceptionStats} heading="NIGO Distribution by Category" />
                            </BlurOverlayLoader>
                        </CardContainer>
                    </div>
                    <BlurOverlayLoader
                        loading={
                            insightGroupingCountByCarrierStatsFetching ||
                            insightGroupingCountByBrokerStatsFetching ||
                            insightGroupingCountBySubProcessStatsFetching
                        }
                    >
                        <div className="flex flex-col gap-1 mt-1">
                            <div className="flex gap-1">
                                {authorizedCarriers?.length > 1 && (
                                    <CaseStatBlock
                                        dashboardStatsResponse={insightGroupingCountByCarrierStats}
                                        blockLabel="Carrier"
                                        timeFrameLabel={`All time`}
                                        statMeasurementLabel="active case"
                                        variant="double"
                                        showViewMore={true}
                                        filterParams={{
                                            createdDateEnd,
                                            createdDateStart,
                                            process: selectedProcess?.[0] || '',
                                            carrier: Object.keys(selectedCarriers)?.length ? Object.keys(selectedCarriers) : '',
                                        }}
                                    />
                                )}
                                {authorizedCarriers.length === 1 && (
                                    <CaseStatBlock
                                        dashboardStatsResponse={insightGroupingCountByBrokerStats}
                                        blockLabel="Broker Dealers"
                                        timeFrameLabel={`All time`}
                                        statMeasurementLabel="active case"
                                        variant="double"
                                        showViewMore={true}
                                        filterParams={{
                                            createdDateEnd,
                                            createdDateStart,
                                            process: selectedProcess?.[0] || '',
                                            brokerDealerName: Object.keys(selectedBrokerDealers)?.length
                                                ? Object.keys(selectedBrokerDealers)
                                                : '',
                                        }}
                                    />
                                )}
                                <CaseStatBlock
                                    dashboardStatsResponse={insightGroupingCountBySubProcessStats}
                                    blockLabel="Case Type"
                                    timeFrameLabel={`All time`}
                                    statMeasurementLabel="active case"
                                    variant="double"
                                />
                            </div>
                        </div>
                    </BlurOverlayLoader>
                </div>
            </div>
        </>
    );
};
