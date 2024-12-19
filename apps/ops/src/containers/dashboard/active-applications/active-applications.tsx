import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { FC, CSSProperties, useState, useEffect, RefObject } from 'react';
import { useTranslation } from 'react-i18next';

import { FieldSize } from '@deps/components/fields/field';
import PageLoader from '@deps/components/page-loader/page-loader';
import Select from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import { getStartAndEndDates } from '@deps/containers/case-redesign-sub-page/case-helpers';
import { useIntersectionObserver } from '@deps/hooks/useIntersectionObserver';
import { useResizeObserver } from '@deps/hooks/useResizeObserver';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { getProcessListOptions, getCaseDashboardStatsQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { useDashboardStore } from '@deps/store/store';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

import ActiveAging from '../../../components/dashboard/active-aging/active-aging';
import SankeyChart from '../../../components/dashboard/sankey-chart';
import CaseStatBlock from '../../../components/dashboard/stat-blocks/case-stat-block';
import { TreeMapInsights } from '../../../components/dashboard/tree-map-insights';
import styles from '../../../pages/dashboard/Dashboard.module.css';
interface ActiveApplicationsProps {
    handleSetLoading: (loading: boolean) => void;
    loading: boolean;
    carrierHeaderRef: RefObject<HTMLElement>;
}

export const ActiveApplications: FC<ActiveApplicationsProps> = ({ loading, handleSetLoading, carrierHeaderRef }) => {
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

    const { selectedCarriers, selectedBrokerDealers } = useDashboardStore(state => state);

    const handleInsightChange = (processType: Processes) => {
        setInsightOption(processType);
    };

    const createBaseQuery = async (groupBy: GroupByOptions[]) => {
        const response = await getCaseDashboardStatsQuery(baseInsightQueryFilter, groupBy);
        if (!response?.data?.length) {
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

    const { data: processListOptions, isLoading: processListOptionsLoading } = useQuery({
        queryKey: ['processListOptions', createdDateStart],
        queryFn: () => getProcessListOptions(createdDateStart),
    });
    const { data: insightGroupingCountByCarrierStats, isLoading: insightGroupingCountByCarrierStatsLoading } = useQuery({
        queryKey: ['countByCarrierInsights', baseInsightQueryFilter],
        queryFn: () => createBaseQuery([GroupByOptions.Carrier]),
    });
    const { data: insightGroupingCountBySubProcessStats, isLoading: insightGroupingCountBySubProcessStatsLoading } = useQuery({
        queryKey: ['countBySubProcessInsights', baseInsightQueryFilter],
        queryFn: () => createBaseQuery([GroupByOptions.ProcessSubType]),
    });
    const {
        data: insightCreatedBySubProcess,
        isLoading: insightCreatedBySubProcessLoading,
        isError: insightCreatedBySubProcessError,
    } = useQuery({
        queryKey: ['createdBySubProcessInsights', baseInsightQueryFilter],
        queryFn: () => createBaseQuery([GroupByOptions.ProcessSubType, GroupByOptions.CreatedAt]),
    });
    const {
        data: insightActiveAgingPiesByCreated,
        isLoading: insightActiveAgingPiesByCreatedLoading,
        isError: insightActiveAgingPiesByCreatedError,
    } = useQuery({
        queryKey: ['activeAgingPieChartKeys', baseInsightQueryFilter],
        queryFn: () => createBaseQuery([GroupByOptions.CreatedAt, GroupByOptions.ProductName]),
        placeholderData: previousData => previousData,
    });
    const { data: insightExceptionStats, isLoading: insightExceptionStatsLoading } = useQuery({
        queryKey: ['exceptionStats', baseInsightQueryFilter],
        queryFn: async () => {
            const response = await createBaseQuery([GroupByOptions.ExceptionCategory]);
            if (response?.data?.length) {
                response.data = response?.data?.filter(item => item.name !== '');
            }

            return response;
        },
        placeholderData: previousData => previousData,
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

    const sankeyChartLoading =
        processListOptionsLoading ||
        insightGroupingCountBySubProcessStatsLoading ||
        insightCreatedBySubProcessLoading ||
        insightActiveAgingPiesByCreatedLoading ||
        insightExceptionStatsLoading ||
        insightGroupingCountByCarrierStatsLoading;

    useEffect(() => {
        handleSetLoading(sankeyChartLoading);
    }, [handleSetLoading, sankeyChartLoading]);

    return (
        <>
            <div className="relative border-t-2 border-[--color-base-border-border-light]">
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
                            <TreeMapInsights
                                dashboardStatsData={insightExceptionStats}
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
