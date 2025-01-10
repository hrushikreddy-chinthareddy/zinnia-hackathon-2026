import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { FC, CSSProperties, useState, useEffect, RefObject, SetStateAction, Dispatch, useMemo } from 'react';

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
import { useIntersectionObserver } from '@deps/hooks/useIntersectionObserver';
import { useResizeObserver } from '@deps/hooks/useResizeObserver';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import styles from '@deps/pages/dashboard/Dashboard.module.css';
import { DashboardResponseData } from '@deps/queries/api/dashboard';
import { DashboardSearchFilter } from '@deps/queries/cases';
import { getProcessListOptions, getCaseDashboardStatsQuery } from '@deps/queries/tanstack/dashboard/dashboardQueries';
import { useDashboardStore } from '@deps/store/store';
import { ReactComponent as ChartBarsIcon } from '@deps/styles/elements/icons/illustrations/chart-bars.svg';

interface ActiveApplicationsProps {
    loading: boolean;
    carrierHeaderRef: RefObject<HTMLElement>;
    brokerDealersSSR: DashboardResponseData[];
    authorizedCarriers: string[];
    handleSetLoading: Dispatch<SetStateAction<boolean>>;
}

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

    const brokerDealerOptions = useMemo(() => {
        if (selectedBrokerDealers) {
            const brokerDealers: DashboardResponseData[] = [];
            Object.values(selectedBrokerDealers).forEach(key => {
                const dealer = brokerDealersSSR.find(broker => broker.name.toLowerCase() === key.toLowerCase());
                if (dealer) {
                    brokerDealers.push(dealer);
                }
            });
            return { data: brokerDealers, totalElements: brokerDealers.length };
        }
        return { data: brokerDealersSSR, totalElements: brokerDealersSSR.length };
    }, [brokerDealersSSR, selectedBrokerDealers]);

    const handleInsightChange = (processType: Processes) => {
        setInsightOption(processType);
    };

    const createBaseQuery = async (baseInsightQueryFilter: DashboardSearchFilter, groupBy: GroupByOptions[]) => {
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
        queryKey: ['processListOptions'],
        queryFn: () => getProcessListOptions(),
    });
    const { data: insightGroupingCountByCarrierStats, isLoading: insightGroupingCountByCarrierStatsLoading } = useQuery({
        queryKey: ['countByCarrierInsights', baseInsightQueryFilter],
        queryFn: () => createBaseQuery(baseInsightQueryFilter, [GroupByOptions.Carrier]),
        enabled: Object.keys(baseInsightQueryFilter).length > 0,
    });
    const { data: insightGroupingCountBySubProcessStats, isLoading: insightGroupingCountBySubProcessStatsLoading } = useQuery({
        queryKey: ['countBySubProcessInsights', baseInsightQueryFilter],
        queryFn: () => createBaseQuery(baseInsightQueryFilter, [GroupByOptions.ProcessSubType]),
        enabled: Object.keys(baseInsightQueryFilter).length > 0,
    });
    const {
        data: insightCreatedBySubProcess,
        isLoading: insightCreatedBySubProcessLoading,
        isError: insightCreatedBySubProcessError,
    } = useQuery({
        queryKey: ['createdBySubProcessInsights', baseInsightQueryFilter],
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
    const { data: insightExceptionStats, isLoading: insightExceptionStatsLoading } = useQuery({
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

    useEffect(() => {
        const baseFilter: DashboardSearchFilter = {
            caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
        };
        const insightFilter: DashboardSearchFilter = {
            caseStatus: [Statuses.InProgress, Statuses.Exception, Statuses.NotStarted],
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
    }, [selectedCarriers, insightOption, selectedBrokerDealers]);

    const sankeyChartLoading =
        loading ||
        processListOptionsLoading ||
        insightGroupingCountBySubProcessStatsLoading ||
        insightCreatedBySubProcessLoading ||
        insightActiveAgingPiesByCreatedLoading ||
        insightExceptionStatsLoading ||
        insightGroupingCountByCarrierStatsLoading;

    return (
        <>
            <div className="relative border-t-2 border-[--color-base-border-border-light]">
                <CardContainer classNames="relative !pt-0" containerClassNames="mt-none">
                    {sankeyChartLoading && (
                        <div className="grid gap-4 h-full mb-4 w-full place-content-center bg-[--color-base-surface-surface-tertiary]">
                            <PageLoader />
                        </div>
                    )}
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
                            <TreeMapInsights dashboardStatsData={insightExceptionStats} heading="Exception Distribution by Category" />
                        </CardContainer>
                    </div>
                    <div className="flex flex-col gap-1 mt-1">
                        <div className="flex gap-1">
                            {authorizedCarriers?.length > 1 && (
                                <CaseStatBlock
                                    dashboardStatsResponse={insightGroupingCountByCarrierStats}
                                    blockLabel="Carrier"
                                    timeFrameLabel={`Trailing 12 months`}
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
                            )}
                            {authorizedCarriers.length === 1 && (
                                <CaseStatBlock
                                    dashboardStatsResponse={brokerDealerOptions}
                                    blockLabel="Broker Dealers"
                                    timeFrameLabel={`Trailing 12 months`}
                                    statMeasurementLabel="case"
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
                                timeFrameLabel={`Trailing 12 months`}
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
