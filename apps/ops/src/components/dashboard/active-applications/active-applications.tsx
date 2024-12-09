import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { FC, CSSProperties, useState, useEffect, RefObject } from 'react';
import { useTranslation } from 'react-i18next';

import { FieldSize } from '@deps/components/fields/field';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
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

import styles from '../../../pages/dashboard/Dashboard.module.css';
import ActiveAging from '../active-aging/active-aging';
import SankeyChart from '../sankey-chart';
import CaseStatBlock from '../stat-blocks/case-stat-block';
import { TreeMapInsights } from '../tree-map-insights';
interface ActiveApplicationsProps {
    sankeyChartRef: (node?: Element | null) => void;
    handleSetLoading: (loading: boolean) => void;
    loading: boolean;
    carrierHeaderRef: RefObject<HTMLElement>;
}

export const ActiveApplications: FC<ActiveApplicationsProps> = ({ sankeyChartRef, loading, handleSetLoading, carrierHeaderRef }) => {
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

    const { data: processListOptions, isLoading: processListOptionsLoading } = useQuery({
        queryKey: ['processListOptions', createdDateStart],
        queryFn: () => getProcessListOptions(createdDateStart),
    });
    const { data: insightGroupingCountByCarrierStats, isLoading: insightGroupingCountByCarrierStatsLoading } = useQuery({
        queryKey: ['countByCarrierInsights', baseInsightQueryFilter],
        queryFn: () => getCaseDashboardStatsQuery(baseInsightQueryFilter, [GroupByOptions.Carrier]),
    });
    const { data: insightGroupingCountBySubProcessStats, isLoading: insightGroupingCountBySubProcessStatsLoading } = useQuery({
        queryKey: ['countBySubProcessInsights', baseInsightQueryFilter],
        queryFn: () => getCaseDashboardStatsQuery(baseInsightQueryFilter, [GroupByOptions.ProcessSubType]),
    });
    const { data: insightCreatedBySubProcess, isLoading: insightCreatedBySubProcessLoading } = useQuery({
        queryKey: ['createdBySubProcessInsights', baseInsightQueryFilter],
        queryFn: () => getCaseDashboardStatsQuery(baseInsightQueryFilter, [GroupByOptions.ProcessSubType, GroupByOptions.CreatedAt]),
    });
    const { data: insightStagesByCreated, isLoading: insightStagesByCreatedLoading } = useQuery({
        queryKey: ['stagesByCreatedInsights', baseInsightQueryFilter],
        queryFn: () => getCaseDashboardStatsQuery(baseInsightQueryFilter, [GroupByOptions.CreatedAt, GroupByOptions.ExceptionCategory]),
    });
    const { data: insightExceptionStats, isLoading: insightExceptionStatsLoading } = useQuery({
        queryKey: ['exceptionStats', baseInsightQueryFilter],
        queryFn: () => getCaseDashboardStatsQuery(baseInsightQueryFilter, [GroupByOptions.ExceptionCategory]),
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
        insightStagesByCreatedLoading ||
        insightExceptionStatsLoading ||
        insightGroupingCountByCarrierStatsLoading;

    useEffect(() => {
        handleSetLoading(sankeyChartLoading);
    }, [handleSetLoading, sankeyChartLoading]);

    return (
        <>
            <div className="relative border-t-2 border-[--color-base-border-border-light]" ref={sankeyChartRef}>
                {sankeyChartLoading && (
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
                        openExceptionCategoriesByCreated={insightStagesByCreated}
                        loading={loading}
                        selectedProcess={insightOption}
                        carriers={Object.keys(selectedCarriers)}
                    />
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
