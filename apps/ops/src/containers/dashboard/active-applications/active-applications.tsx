import { useQuery } from '@tanstack/react-query';
import { Button, Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { FC, CSSProperties, useState, useEffect, RefObject, SetStateAction, Dispatch } from 'react';

import { MultiselectOption, SimpleOption } from '@deps/components/autocomplete/autocomplete.types';
import { ButtonSize } from '@deps/components/button/button';
import ActiveAging from '@deps/components/dashboard/active-aging/active-aging';
import SankeyChart from '@deps/components/dashboard/sankey-chart';
import CaseStatBlock from '@deps/components/dashboard/stat-blocks/case-stat-block';
import { TreeMapInsights } from '@deps/components/dashboard/tree-map-insights';
import { FieldSize } from '@deps/components/fields/field';
import PageLoader from '@deps/components/page-loader/page-loader';
import Select from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import { getStartAndEndDates } from '@deps/containers/case-redesign-sub-page/case-helpers';
import { dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import { useIntersectionObserver } from '@deps/hooks/useIntersectionObserver';
import { useResizeObserver } from '@deps/hooks/useResizeObserver';
import { DashboardStatsElementResponse, Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { CarrierListItem } from '@deps/pages/dashboard';
import styles from '@deps/pages/dashboard/Dashboard.module.css';
import { DashboardResponseData } from '@deps/queries/api/dashboard';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { getCaseDashboardStatsQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { useDashboardStore } from '@deps/store/store';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

interface ActiveApplicationsProps {
    loading: boolean;
    carrierHeaderRef: RefObject<HTMLElement>;
    brokerDealersSSR: DashboardResponseData[];
    authorizedCarriers: string[];
    handleSetLoading: Dispatch<SetStateAction<boolean>>;
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

export const ActiveApplications: FC<ActiveApplicationsProps> = ({ loading, carrierHeaderRef, authorizedCarriers, brokerDealersSSR }) => {
    const { createdDateStart, createdDateEnd } = getStartAndEndDates('All');
    const { height: carrierHeaderHeight } = useResizeObserver({ ref: carrierHeaderRef, box: 'border-box' });

    const {
        isIntersecting: footerIsIntersecting,
        ref: insightChartRef,
        entry: insightChartEntry,
    } = useIntersectionObserver({
        rootMargin: `-${carrierHeaderHeight || 0}px 0px -100% 0px`,
        threshold: 0,
    });
    const { t } = useTranslation(TranslationFiles.COMMON);

    const [baseDashboardQueryFilter, setBaseDashboardQueryFilter] = useState<DashboardSearchFilter>({});
    const [baseInsightQueryFilter, setBaseInsightQueryFilter] = useState<DashboardSearchFilter>({});
    const [insightOption, setInsightOption] = useState<Processes>(Processes.NewBusiness);

    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(state => state);

    const handleInsightChange = (processType: Processes) => {
        setSelectedSubprocess({});
        setInsightOption(processType);
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

    const { data: insightGroupingCountByCarrierStats } = useQuery({
        queryKey: ['countByCarrierInsights', baseInsightQueryFilter],
        queryFn: () => createBaseQuery(baseInsightQueryFilter, [GroupByOptions.Carrier]),
        enabled: Object.keys(baseInsightQueryFilter).length > 0,
    });

    const { data: insightGroupingCountByBrokerStats } = useQuery({
        queryKey: ['countByBrokerInsights', baseInsightQueryFilter],
        queryFn: () => createBaseQuery(baseInsightQueryFilter, [GroupByOptions.BrokerDealerName]),
        enabled: Object.keys(baseInsightQueryFilter).length > 0,
    });

    const { data: insightGroupingCountBySubProcessStats } = useQuery({
        queryKey: ['countBySubProcessInsights', baseInsightQueryFilter],
        queryFn: () => createBaseQuery(baseInsightQueryFilter, [GroupByOptions.ProcessSubType]),
        enabled: Object.keys(baseInsightQueryFilter).length > 0,
    });

    const {
        data: insightCreatedBySubProcess,

        isError: insightCreatedBySubProcessError,
    } = useQuery({
        queryKey: ['createdBySubProcessInsights', baseInsightQueryFilter],
        placeholderData: previousData => previousData,
        queryFn: () => createBaseQuery(baseInsightQueryFilter, [GroupByOptions.ProcessSubType, GroupByOptions.CreatedAt]),
        enabled: Object.keys(baseInsightQueryFilter).length > 0,
    });

    const {
        data: insightActiveAgingPiesByCreated,
        isLoading: insightActiveAgingPiesByCreatedLoading,
        isError: insightActiveAgingPiesByCreatedError,
    } = useQuery({
        queryKey: ['activeAgingPieChartKeys', baseInsightQueryFilter],
        queryFn: () => createBaseQuery(baseInsightQueryFilter, [GroupByOptions.CreatedAt, GroupByOptions.ProductName]),
        placeholderData: previousData => previousData,
        enabled: Object.keys(baseInsightQueryFilter).length > 0,
    });

    const { data: insightExceptionStats } = useQuery({
        queryKey: ['exceptionStats', baseInsightQueryFilter],
        queryFn: async () => {
            const response = await createBaseQuery(baseInsightQueryFilter, [GroupByOptions.ExceptionCategory]);
            if (response?.data?.length) {
                response.data = response?.data?.filter(item => item.name !== '');
            }

            return response;
        },
        placeholderData: previousData => previousData,
        enabled: Object.keys(baseInsightQueryFilter).length > 0,
    });

    const { data: processListOptions } = useQuery({
        queryKey: ['processListOptions', baseDashboardQueryFilter],
        placeholderData: previousData => previousData,
        queryFn: () => createBaseQuery(baseDashboardQueryFilter, [GroupByOptions.Process]),
        select: ({ data }) => formatProcessListOptions(data),
        enabled: Object.keys(baseDashboardQueryFilter).length > 0,
    });

    const { data: subprocessListOptions } = useQuery({
        queryKey: ['subprocessListOptions', createdDateStart, baseInsightQueryFilter],
        placeholderData: previousData => previousData,
        queryFn: () =>
            createBaseQuery({ ...baseInsightQueryFilter, createdDateStart: createdDateStart }, [
                GroupByOptions.ProcessSubType,
                GroupByOptions.Process,
            ]),
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
        enabled: Object.keys(baseDashboardQueryFilter).length > 0,
    });

    const [selectedSubprocess, setSelectedSubprocess] = useState<CarrierListItem>(
        subprocessListOptions?.length === 1 ? { [subprocessListOptions[0].value]: subprocessListOptions[0].displayText } : {}
    );

    const updateSubprocessFilter = (processType: string) => {
        if (processType === ('All' as Processes)) {
            setSelectedSubprocess({});
        } else {
            setSelectedSubprocess(oldProcesses => {
                delete oldProcesses['All'];
                if (oldProcesses[processType]) {
                    delete oldProcesses[processType];
                    return { ...oldProcesses };
                } else {
                    return { ...oldProcesses, [processType]: dashboardChartTitleFormat(processType, 15) };
                }
            });
        }
    };

    // set base filter
    useEffect(() => {
        const baseFilter: DashboardSearchFilter = {
            caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
        };

        const carriers = Object.keys(selectedCarriers);
        if (selectedCarriers && carriers.length) {
            baseFilter.carrier = carriers;
        }

        const brokers = Object.keys(selectedBrokerDealers);
        if (selectedBrokerDealers && brokers.length) {
            baseFilter.brokerDealerName = brokers;
        }

        setBaseDashboardQueryFilter(baseFilter);
    }, [selectedCarriers, insightOption, selectedBrokerDealers, selectedSubprocess]);

    //set insight filter
    useEffect(() => {
        const insightFilter: DashboardSearchFilter = {
            caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
        };

        const carriers = Object.keys(selectedCarriers);
        if (selectedCarriers && carriers.length) {
            insightFilter.carrier = carriers;
        }

        const brokers = Object.keys(selectedBrokerDealers);
        if (selectedBrokerDealers && brokers.length) {
            insightFilter.brokerDealerName = brokers;
        }

        if (insightOption) {
            insightFilter.process = [insightOption];
        }

        if (Object.keys(selectedSubprocess).length) {
            insightFilter.requestSubType = Object.keys(selectedSubprocess);
        }
        setBaseInsightQueryFilter(insightFilter);
    }, [insightOption, selectedBrokerDealers, selectedCarriers, selectedSubprocess]);

    const clearFilters = () => {
        setInsightOption(Processes.NewBusiness);
        setSelectedSubprocess({});
    };

    const clearFiltersDisabled = insightOption === Processes.NewBusiness && !Object.keys(selectedSubprocess).length;

    return (
        <>
            <div className="relative border-t-2 border-[--color-base-border-border-light]">
                <CardContainer classNames="relative !pt-0" containerClassNames="mt-none">
                    <SankeyChart key={JSON.stringify(baseDashboardQueryFilter)} baseDashboardQueryFilter={baseDashboardQueryFilter} />
                </CardContainer>
            </div>
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
                            value={insightOption}
                            onChange={value => handleInsightChange(value as Processes)}
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
                            value={selectedSubprocess}
                            onChange={updateSubprocessFilter}
                        />
                    </div>
                    <Button
                        className="flex items-center align-middle flex-row"
                        mode="link"
                        disabled={loading || clearFiltersDisabled}
                        size={ButtonSize.Small}
                        onClick={clearFilters}
                    >
                        reset <Icon width={16} height={16} type={IconType.REFRESH} />
                    </Button>
                </div>
            </div>
            <div ref={insightChartRef}>
                <div className={styles.container}>
                    {loading ? (
                        <div className="grid place-content-center h-full w-full min-h-[400px]">
                            <PageLoader />
                        </div>
                    ) : insightCreatedBySubProcessError ||
                      insightActiveAgingPiesByCreatedError ||
                      !insightActiveAgingPiesByCreated?.data?.length ? (
                        <div className="grid place-content-center h-full w-full min-h-[400px]">
                            <Typography variant={TypographyVariant.BodyBold} className="mt-4 flex flex-row gap-2">
                                <ChartBarsIcon height={'24px'} width={'24px'} />
                                {'Something went wrong fetching insights, please try again by refreshing the page'}
                            </Typography>
                        </div>
                    ) : (
                        <ActiveAging
                            createdBySubProcess={insightCreatedBySubProcess}
                            activeAgingPieChartByCreated={insightActiveAgingPiesByCreated}
                            loading={insightCreatedBySubProcessError || insightActiveAgingPiesByCreatedLoading}
                            selectedProcess={insightOption}
                            carriers={Object.keys(selectedCarriers)}
                        />
                    )}
                    <div className="mt-1">
                        {/* this is the Exception Distribution by Category tree map chart */}
                        <CardContainer fullWidth={false}>
                            <TreeMapInsights dashboardStatsData={insightExceptionStats} heading="NIGO Distribution by Category" />
                        </CardContainer>
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                        <div className="flex gap-1">
                            {authorizedCarriers?.length > 1 && (
                                <CaseStatBlock
                                    dashboardStatsResponse={insightGroupingCountByCarrierStats}
                                    blockLabel="Carrier"
                                    timeFrameLabel={`All time`}
                                    statMeasurementLabel="active case"
                                    variant="double"
                                    loading={loading}
                                    showViewMore={true}
                                    filterParams={{
                                        createdDateEnd,
                                        createdDateStart,
                                        process: insightOption,
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
                                    loading={loading}
                                    showViewMore={true}
                                    filterParams={{
                                        createdDateEnd,
                                        createdDateStart,
                                        process: insightOption,
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
                                loading={loading}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
