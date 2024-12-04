import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { FC, CSSProperties, useState, useEffect, RefObject } from 'react';
import { useTranslation } from 'react-i18next';

import { SimpleOption } from '@deps/components/autocomplete/autocomplete.types';
import { FieldSize } from '@deps/components/fields/field';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import Select from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import { getStartAndEndDates } from '@deps/containers/case-redesign-sub-page/case-helpers';
import { useIntersectionObserver } from '@deps/hooks/useIntersectionObserver';
import { useResizeObserver } from '@deps/hooks/useResizeObserver';
import { CaseDashboardStatsResponse, Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { getCaseDashboardStats } from '@deps/queries/api/cases';
import { DashboardSearchFilter, CaseDashboardStatsQuery } from '@deps/queries/cases';

import styles from '../../../pages/dashboard/Dashboard.module.css';
import ActiveAging from '../active-aging/active-aging';
import { CarrierListItem } from '../issued-business/issued-business';
import SankeyChart from '../sankey-chart';
import CaseStatBlock from '../stat-blocks/case-stat-block';
import { TreeMapInsights } from '../tree-map-insights';
interface ActiveApplicationsProps {
    sankeyChartRef: (node?: Element | null) => void;
    selectedCarriers: CarrierListItem;
    selectedBrokerDealers: CarrierListItem;
    handleSetLoading: (loading: boolean) => void;
    loading: boolean;
    carrierHeaderRef: RefObject<HTMLElement>;
}

export const ActiveApplications: FC<ActiveApplicationsProps> = ({
    sankeyChartRef,
    selectedCarriers,
    selectedBrokerDealers,
    loading,
    carrierHeaderRef,
}) => {
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
    const [timeFrameLabel] = useState<string>('Year to Date');

    const [baseDashboardQueryFilter, setBaseDashboardQueryFilter] = useState<DashboardSearchFilter>({});
    const [baseInsightQueryFilter, setBaseInsightQueryFilter] = useState<DashboardSearchFilter>({});
    const [insightOption, setInsightOption] = useState<Processes>(Processes.NewBusiness);

    const getProcessListOptions = async () => {
        const baseDashboardQueryFilter: DashboardSearchFilter = {
            caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
            createdDateStart,
        };
        const query: CaseDashboardStatsQuery = {
            filter: baseDashboardQueryFilter,
            groupBy: [GroupByOptions.Process],
        };
        const statsResponse = await getCaseDashboardStats(query);
        if (!statsResponse || 'status' in statsResponse) {
            return [];
        }
        const listOptions = statsResponse.data
            .reduce<SimpleOption[]>((prev, curr) => {
                if (curr.name && !prev.some(item => item.value === curr.name)) {
                    prev.push({ value: curr.name, label: curr.name });
                }
                return prev;
            }, [])
            .sort((item1, item2) => item1.label.localeCompare(item2.label));

        return listOptions;
    };
    const handleInsightChange = (processType: Processes) => {
        setInsightOption(processType);
    };

    const getCountByCarrierInsightStats = async (baseInsightQueryFilter: DashboardSearchFilter) => {
        const query = {
            filter: baseInsightQueryFilter,
            groupBy: [GroupByOptions.Carrier],
        };
        const statsResponse = await getCaseDashboardStats(query);
        if (!statsResponse || 'status' in statsResponse) {
            throw statsResponse;
        }
        return statsResponse;
    };

    const getCountBySubProcessInsightStats = async (baseInsightQueryFilter: DashboardSearchFilter) => {
        const query = {
            filter: baseInsightQueryFilter,
            groupBy: [GroupByOptions.ProcessSubType],
        };
        const statsResponse = await getCaseDashboardStats(query);
        if (!statsResponse || 'status' in statsResponse) {
            throw statsResponse;
        }
        return statsResponse;
    };

    const getCreatedBySubProcessInsightStats = async (baseInsightQueryFilter: DashboardSearchFilter) => {
        const query = {
            filter: baseInsightQueryFilter,
            groupBy: [GroupByOptions.ProcessSubType, GroupByOptions.CreatedAt],
        };
        const statsResponse = await getCaseDashboardStats(query);
        if (!statsResponse || 'status' in statsResponse) {
            throw statsResponse;
        }
        return statsResponse;
    };

    const getOpenExceptionCategoriesByCreatedInsightStats = async (baseInsightQueryFilter: DashboardSearchFilter) => {
        const query = {
            filter: baseInsightQueryFilter,
            groupBy: [GroupByOptions.CreatedAt, GroupByOptions.ExceptionCategory],
        };
        const statsResponse = await getCaseDashboardStats(query);
        if (!statsResponse || 'status' in statsResponse) {
            throw statsResponse;
        }
        return statsResponse;
    };

    const getExceptionCategoryStats = async (baseInsightQueryFilter: DashboardSearchFilter) => {
        const query = {
            filter: baseInsightQueryFilter,
            groupBy: [GroupByOptions.ExceptionCategory],
        };
        const statsResponse = await getCaseDashboardStats(query);
        if (!statsResponse || 'status' in statsResponse) {
            throw statsResponse;
        }
        return statsResponse;
    };

    const { data: processListOptions, isLoading: processListOptionsLoading } = useQuery({
        queryKey: ['processListOptions'],
        queryFn: getProcessListOptions,
    });
    const { data: insightGroupingCountByCarrierStats } = useQuery({
        queryKey: ['countByCarrierInsights', baseInsightQueryFilter],
        queryFn: () => getCountByCarrierInsightStats(baseInsightQueryFilter),
    });
    const { data: insightGroupingCountBySubProcessStats, isLoading: insightGroupingCountBySubProcessStatsLoading } = useQuery({
        queryKey: ['countBySubProcessInsights', baseInsightQueryFilter],
        queryFn: () => getCountBySubProcessInsightStats(baseInsightQueryFilter),
    });
    const { data: insightCreatedBySubProcess, isLoading: insightCreatedBySubProcessLoading } = useQuery({
        queryKey: ['createdBySubProcessInsights', baseInsightQueryFilter],
        queryFn: () => getCreatedBySubProcessInsightStats(baseInsightQueryFilter),
    });
    const { data: insightStagesByCreated, isLoading: insightStagesByCreatedLoading } = useQuery({
        queryKey: ['stagesByCreatedInsights', baseInsightQueryFilter],
        queryFn: () => getOpenExceptionCategoriesByCreatedInsightStats(baseInsightQueryFilter),
    });
    const { data: insightExceptionStats, isLoading: insightExceptionStatsLoading } = useQuery({
        queryKey: ['exceptionStats', baseInsightQueryFilter],
        queryFn: () => getExceptionCategoryStats(baseInsightQueryFilter),
    });

    useEffect(() => {
        const baseFilter: DashboardSearchFilter = {
            caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
            createdDateStart,
        };
        const insightFilter: DashboardSearchFilter = {
            caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
            createdDateStart,
        };

        const carriers = Object.keys(selectedCarriers);
        if (selectedCarriers && carriers.length) {
            baseFilter.carrier = carriers;
            insightFilter.carrier = carriers;
        }

        const brokers = Object.keys(selectedBrokerDealers);
        if (selectedBrokerDealers && brokers.length) {
            baseFilter.brokerDealerName = brokers;
            insightFilter.brokerDealerName = brokers;
        }

        if (insightOption) {
            insightFilter.process = [insightOption];
        }

        setBaseDashboardQueryFilter(baseFilter);
        setBaseInsightQueryFilter(insightFilter);
    }, [selectedCarriers, insightOption, selectedBrokerDealers, createdDateEnd, createdDateStart]);

<<<<<<< HEAD
    useEffect(() => {
        const getPageData = async () => {
            handleSetLoading(true);
            try {
                if (Object.keys(baseDashboardQueryFilter).length === 0 || Object.keys(baseInsightQueryFilter).length === 0) {
                    return;
                }
                const [
                    insightCountByCarrierStats,
                    insightCountBySubProcessStats,
                    insightCreatedBySubProcess,
                    insightOpenStagesByCreated,
                    insightExceptionCategoryStats,
                ] = await Promise.all([
                    getCountByCarrierInsightStats(baseInsightQueryFilter),
                    getCountBySubProcessInsightStats(baseInsightQueryFilter),
                    getCreatedBySubProcessInsightStats(baseInsightQueryFilter),
                    getOpenExceptionCategoriesByCreatedInsightStats(baseInsightQueryFilter),
                    getExceptionCategoryStats(baseInsightQueryFilter),
                ]);
                if (!insightCountByCarrierStats || 'status' in insightCountByCarrierStats) {
                    console.error('getCountByCarrierInsightStats::Failed to fetch carrier count insight stats');
                } else {
                    setInsightGroupingCountByCarrierStats(insightCountByCarrierStats);
                }
                if (!insightCountBySubProcessStats || 'status' in insightCountBySubProcessStats) {
                    console.error('getCountByProcessInsightStats::Failed to fetch carrier count insight stats');
                } else {
                    insightCountBySubProcessStats.data.forEach(element => {
                        element.name = dashboardChartTitleFormat(element.name);
                    });
                    setInsightGroupingCountBySubProcessStats(insightCountBySubProcessStats);
                }
                if (!insightCreatedBySubProcess || 'status' in insightCreatedBySubProcess) {
                    console.error('getSubProcessByCreatedInsightStats::Failed to fetch carrier count insight stats');
                } else {
                    setInsightCreatedBySubProcess(insightCreatedBySubProcess);
                }
                if (!insightOpenStagesByCreated || 'status' in insightOpenStagesByCreated) {
                    console.error('getOpenStagesByCreatedStats::Failed to fetch carrier count insight stats');
                } else {
                    setInsightStagesByCreated(insightOpenStagesByCreated);
                }

                if (!insightExceptionCategoryStats || 'status' in insightExceptionCategoryStats) {
                    console.error('getExceptionCategoryStats::Failed to fetch carrier count insight stats');
                } else {
                    setInsightExceptionStats(insightExceptionCategoryStats);
                }
            } catch (error) {
                console.error('an error occurred fetching dashboard insight stats', error);
            } finally {
                handleSetLoading(false);
            }
        };
        getPageData();
<<<<<<< HEAD
<<<<<<< HEAD
    }, [baseDashboardQueryFilter, baseInsightQueryFilter, handleSetLoading]);
=======
    }, [baseDashboardQueryFilter, baseInsightQueryFilter]);
>>>>>>> f35eef3df (move charts into their own components)
=======
    }, [baseDashboardQueryFilter, baseInsightQueryFilter, handleSetLoading]);
>>>>>>> 0cab77e15 (fix use effect)
=======
    if (
        processListOptionsLoading ||
        loading ||
        insightGroupingCountBySubProcessStatsLoading ||
        insightGroupingCountBySubProcessStatsLoading ||
        insightCreatedBySubProcessLoading ||
        insightStagesByCreatedLoading ||
        insightExceptionStatsLoading
    ) {
        return (
            <div className="relative border-t-2 border-[--color-base-border-border-light]">
                <CardContainer classNames="relative !pt-0" containerClassNames="mt-none">
                    <PageLoader variant={PageLoaderVariant.CenterWhiteText} showText={true} />
                </CardContainer>
            </div>
        );
    }
>>>>>>> c69e24ce8 (pull in tanstack and test out doing the data calls that way)

    return (
        <>
            <div className="relative border-t-2 border-[--color-base-border-border-light]" ref={sankeyChartRef}>
                {loading && (
                    <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex h-full justify-center bg-gray-800 opacity-80">
                        <div className="mt-4">
                            <PageLoader variant={PageLoaderVariant.CenterWhiteText} showText={true} />
                        </div>
                    </div>
                )}
                <CardContainer classNames="relative !pt-0" containerClassNames="mt-none">
                    <SankeyChart baseDashboardQueryFilter={baseDashboardQueryFilter} />
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
                    {t('insights')}
                </Typography>
                <div className={`${styles.insightsHeaderDropdown}`}>
                    <Select
                        options={processListOptions || []}
                        size={FieldSize.Small}
                        name="process-type-dropdown-btn"
                        placeholder={t('selectProcessType') || ''}
                        value={insightOption}
                        onChange={value => handleInsightChange(value as Processes)}
                    />
                </div>
            </div>
            <div ref={insightChartRef}>
                <div className={styles.container}>
                    <ActiveAging
                        createdBySubProcess={insightCreatedBySubProcess}
                        openExceptionCategoriesByCreated={insightStagesByCreated as CaseDashboardStatsResponse}
                        loading={loading}
                        selectedProcess={insightOption}
                        carriers={Object.keys(selectedCarriers)}
                    />
                    <div className="mt-1">
                        {/* this is the Exception Distribution by Category tree map chart */}
                        <CardContainer fullWidth={false}>
                            <TreeMapInsights
                                dashboardStatsData={insightExceptionStats as CaseDashboardStatsResponse}
                                heading="Exception Distribution by Category"
                            ></TreeMapInsights>
                        </CardContainer>
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                        <div className="flex gap-1">
                            <CaseStatBlock
                                dashboardStatsResponse={insightGroupingCountByCarrierStats}
                                blockLabel="Carrier"
                                timeFrameLabel={timeFrameLabel}
                                statMeasurementLabel="case"
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
                            <CaseStatBlock
                                dashboardStatsResponse={insightGroupingCountBySubProcessStats}
                                blockLabel="Case Type"
                                timeFrameLabel={timeFrameLabel}
                                statMeasurementLabel="case"
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
