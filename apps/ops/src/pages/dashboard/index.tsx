import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { IconType, Link } from '@zinnia/bloom/components';
import { FgaRoles } from '@zinnia/utils';
import clsx from 'clsx';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MultiselectOption, SimpleOption } from '@deps/components/autocomplete/autocomplete.types';
import ActiveAging from '@deps/components/dashboard/active-aging/active-aging';
import { BrokerDealerFilter } from '@deps/components/dashboard/broker-dealer-filter/broker-dealer-filter';
import SankeyChart from '@deps/components/dashboard/sankey-chart';
import CaseStatBlock from '@deps/components/dashboard/stat-blocks/case-stat-block';
import { FieldSize } from '@deps/components/fields/field';
import NoNavLayout from '@deps/components/no-nav-layout';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import Select from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import { getStartAndEndDates } from '@deps/containers/case-redesign-sub-page/case-helpers';
import { sankeyTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { toTitleCase } from '@deps/helpers/string.helper';
import { useIntersectionObserver } from '@deps/hooks/useIntersectionObserver';
import { useResizeObserver } from '@deps/hooks/useResizeObserver';
import { CaseDashboardStatsResponse, Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { UserPermission } from '@deps/models/user-profile';
import { getCaseDashboardStats } from '@deps/queries/api/cases';
import { DashboardResponseData, fetchAgentsSSR } from '@deps/queries/api/dashboard';
import { checkTupleSsr, getCarrierListServerSSR } from '@deps/queries/api/fga';
import { CaseDashboardStatsQuery, DashboardSearchFilter } from '@deps/queries/cases';
import { FgaRelation } from '@deps/types/fga';
import { getCarrierListItem, getCarrierNameByClientId, getClientIdsByCarrierName } from '@deps/utils/carriers';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import styles from './Dashboard.module.css';

export interface CarrierListItem {
    [key: string]: string;
}

const DashboardPage = ({
    authorizedCarriers,
    brokerDealersSSR,
}: {
    authorizedCarriers: string[];
    brokerDealersSSR: DashboardResponseData[];
}) => {
    const router = useRouter();
    const carrierHeaderRef = useRef<HTMLDivElement>(null);
    const { createdDateStart, createdDateEnd } = getStartAndEndDates('All');
    const { height: carrierHeaderHeight } = useResizeObserver({ ref: carrierHeaderRef, box: 'border-box' });
    const {
        isIntersecting: carrierHeaderIsIntersecting,
        ref: sankeyChartRef,
        entry: carrierHeaderEntry,
    } = useIntersectionObserver({
        threshold: 0,
        rootMargin: `${-64}px 0px -100% 0px`,
    });
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
    const [insightGroupingCountByCarrierStats, setInsightGroupingCountByCarrierStats] = useState<CaseDashboardStatsResponse>({
        data: [],
        totalElements: 0,
    });
    const [insightGroupingCountBySubProcessStats, setInsightGroupingCountBySubProcessStats] = useState<CaseDashboardStatsResponse>({
        data: [],
        totalElements: 0,
    });
    const [insightCreatedBySubProcess, setInsightCreatedBySubProcess] = useState<CaseDashboardStatsResponse>({
        data: [],
        totalElements: 0,
    });
    const [insightStagesByCreated, setInsightStagesByCreated] = useState<CaseDashboardStatsResponse>({
        data: [],
        totalElements: 0,
    });
    const [baseDashboardQueryFilter, setBaseDashboardQueryFilter] = useState<DashboardSearchFilter>({});
    const [baseInsightQueryFilter, setBaseInsightQueryFilter] = useState<DashboardSearchFilter>({});
    const [insightOption, setInsightOption] = useState<Processes>(Processes.NewBusiness);
    const [loading, setLoading] = useState<boolean>(false);
    const [processListOptions, setProcessListOptions] = useState<SimpleOption[]>([]);
    const [brokerDealers, setBrokerDealers] = useState<DashboardResponseData[]>(brokerDealersSSR || []);

    const carrierFilterItems = useMemo(
        () =>
            authorizedCarriers.map((carrierCode: string) => {
                const valueAndDisplay = getCarrierNameByClientId(carrierCode) || carrierCode.toUpperCase();

                return {
                    value: getClientIdsByCarrierName(authorizedCarriers, valueAndDisplay) || carrierCode.toUpperCase(),
                    displayText: valueAndDisplay,
                    label: getCarrierListItem(carrierCode),
                };
            }),
        [authorizedCarriers]
    );

    const [selectedCarriers, setSelectedCarriers] = useState<CarrierListItem>(
        carrierFilterItems.length === 1 ? { [carrierFilterItems[0].value]: carrierFilterItems[0].displayText } : {}
    );
    const [placeholderSelectedCarriers, setPlaceholderSelectedCarriers] = useState<CarrierListItem>(
        carrierFilterItems.length === 1 ? { [carrierFilterItems[0].value]: carrierFilterItems[0].displayText } : {}
    );
    const [selectedBrokerDealers, setSelectedBrokerDealers] = useState<CarrierListItem>(
        brokerDealers?.length === 1 ? { [brokerDealers[0].key]: brokerDealers[0].name } : {}
    );

    const getUniqueCarrierFilterItems = (): MultiselectOption[] => {
        const carrierLabels = new Set();

        const uniqueCarrierFilterItems = (
            carrierFilterItems.filter(item => {
                if (carrierLabels.has(item.displayText)) {
                    return false;
                }

                carrierLabels.add(item.displayText);
                return true;
            }) as typeof carrierFilterItems
        ).sort((item1, item2) => item1.displayText.localeCompare(item2.displayText));
        return uniqueCarrierFilterItems;
    };

    const getProcessListOptions = async (baseDashboardQueryFilter: DashboardSearchFilter) => {
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

        setProcessListOptions(listOptions);
    };

    const updateCarrierFilters = (value: string, displayText: string) => {
        setPlaceholderSelectedCarriers(prevSelectedCarriers => {
            if (prevSelectedCarriers[value]) {
                delete prevSelectedCarriers[value];
                return { ...prevSelectedCarriers };
            } else {
                return { ...prevSelectedCarriers, [value]: displayText };
            }
        });
    };

    const updateBrokerDealerFilters = (value: string, displayText: string) => {
        setSelectedBrokerDealers(prevSelectedAgents => {
            if (prevSelectedAgents[value]) {
                delete prevSelectedAgents[value];
                return { ...prevSelectedAgents };
            } else {
                return { ...prevSelectedAgents, [value]: displayText };
            }
        });
    };

    const handleOnOpenChange = (open: boolean) => {
        if (!open) {
            setSelectedCarriers(placeholderSelectedCarriers);
        }
    };

    const handleInsightChange = (processType: Processes) => {
        setInsightOption(processType);
    };

    const getCountByCarrierInsightStats = async (baseInsightQueryFilter: DashboardSearchFilter) => {
        const query: CaseDashboardStatsQuery = {
            filter: baseInsightQueryFilter,
            groupBy: [GroupByOptions.Carrier],
        };
        return getCaseDashboardStats(query);
    };

    const getCountBySubProcessInsightStats = async (baseInsightQueryFilter: DashboardSearchFilter) => {
        const query: CaseDashboardStatsQuery = {
            filter: baseInsightQueryFilter,
            groupBy: [GroupByOptions.ProcessSubType],
        };
        return getCaseDashboardStats(query);
    };

    const getCreatedBySubProcessInsightStats = async (baseInsightQueryFilter: DashboardSearchFilter) => {
        const query: CaseDashboardStatsQuery = {
            filter: baseInsightQueryFilter,
            groupBy: [GroupByOptions.ProcessSubType, GroupByOptions.CreatedAt],
        };
        return getCaseDashboardStats(query);
    };

    const getOpenStagesByCreatedInsightStats = async (baseInsightQueryFilter: DashboardSearchFilter) => {
        const query: CaseDashboardStatsQuery = {
            filter: baseInsightQueryFilter,
            groupBy: [GroupByOptions.CreatedAt, GroupByOptions.OpenStages],
        };
        return getCaseDashboardStats(query);
    };

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
        getProcessListOptions(baseFilter);
        setBaseInsightQueryFilter(insightFilter);
    }, [selectedCarriers, insightOption, selectedBrokerDealers, createdDateEnd, createdDateStart]);

    useEffect(() => {
        const getPageData = async () => {
            setLoading(true);
            try {
                if (Object.keys(baseDashboardQueryFilter).length === 0 || Object.keys(baseInsightQueryFilter).length === 0) {
                    return;
                }
                const [insightCountByCarrierStats, insightCountBySubProcessStats, insightCreatedBySubProcess, insightOpenStagesByCreated] =
                    await Promise.all([
                        getCountByCarrierInsightStats(baseInsightQueryFilter),
                        getCountBySubProcessInsightStats(baseInsightQueryFilter),
                        getCreatedBySubProcessInsightStats(baseInsightQueryFilter),
                        getOpenStagesByCreatedInsightStats(baseInsightQueryFilter),
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
                        element.name = sankeyTitleFormat(element.name);
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
            } catch (error) {
                console.error('an error occurred fetching dashboard insight stats', error);
            } finally {
                setLoading(false);
            }
        };
        getPageData();
    }, [baseDashboardQueryFilter, baseInsightQueryFilter]);

    return (
        <div>
            <PageHead titleKey="dashboard" />
            <NoNavLayout fullHeight={true} displayTopNavBar={true} size="large">
                <div
                    id="carrier-header"
                    ref={carrierHeaderRef}
                    className={clsx('flex-wrap', styles.filtersHeader, {
                        [styles.pinned as string]:
                            carrierHeaderIsIntersecting || Number(carrierHeaderEntry?.boundingClientRect.bottom) < 64,
                    })}
                >
                    <Typography className="flex items-center" variant={TypographyVariant.H1} data-testid="header-text">
                        {t('caseStatsDashboardTitle')}
                    </Typography>
                    <div className="flex justify-between items-center">
                        <div className="flex nowrap gap-4">
                            <div className="w-52">
                                <Select
                                    isMultiselect
                                    options={getUniqueCarrierFilterItems()}
                                    value={placeholderSelectedCarriers}
                                    onChange={updateCarrierFilters}
                                    size={FieldSize.Small}
                                    placeholder={t('allCarriers') || ''}
                                    disabled={carrierFilterItems.length === 1}
                                    name="carrier-dropdown-btn"
                                    onOpenChange={handleOnOpenChange}
                                />
                            </div>
                            <div className="w-52">
                                <BrokerDealerFilter
                                    brokerDealers={brokerDealers}
                                    selectedBrokerDealers={selectedBrokerDealers}
                                    selectedCarriers={Object.keys(placeholderSelectedCarriers)}
                                    setSelectedBrokerDealers={setBrokerDealers}
                                    updateBrokerDealerFilters={updateBrokerDealerFilters}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <nav className="flex basis-full no-wrap gap-4 bg-white px-8 pb-0">
                    <Link
                        iconType={IconType.DOCUMENT_TEXT}
                        href="/dashboard"
                        text={toTitleCase('active applications')}
                        style={{ paddingBottom: 'var(--measure-dimension-padding-lg)' }}
                        className={clsx(
                            'border-b-4',
                            router.pathname === '/dashboard'
                                ? 'border-[--color-base-border-border-secondary-color]'
                                : 'border-transparent !text-[--color-base-text-text-secondary]'
                        )}
                    />
                    <Link
                        iconType={IconType.SHIELD_CHECKMARK}
                        href="/dashboard/issued-business"
                        text={toTitleCase('issued business')}
                        style={{ paddingBottom: 'var(--measure-dimension-padding-lg)' }}
                        className={clsx(
                            'border-b-4',
                            router.pathname === '/dashboard/issued-business'
                                ? 'border-[--color-base-border-border-secondary-color]'
                                : 'border-transparent !text-[--color-base-text-text-secondary]'
                        )}
                    />
                </nav>
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
                            options={processListOptions}
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
                            openStagesByCreated={insightStagesByCreated}
                            loading={loading}
                            selectedProcess={insightOption}
                            carriers={Object.keys(selectedCarriers)}
                        />
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
            </NoNavLayout>
        </div>
    );
};

export default DashboardPage;

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        // Get the user object from the Auth0 Session
        const user = await getUserData(context);
        const { locale = DEFAULT_LOCALE, res, req } = context;
        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('dashboard/index:: Access token expired', {
                ...parseErrorInformation(e),
                file: 'dashboard/index',
                function: 'getServerSideProps',
            });
            return serverSidePropsLogout();
        }

        const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub);
        const doesUserHavePagePermission = await checkTupleSsr(
            `${accessToken}`,
            user.partyId,
            FgaRelation.Party,
            FgaRoles.CASE_STATS_DASHBOARD_ROLE
        );
        if (!doesUserHavePagePermission || !featureFlagDecisions['case-management-case_stats_dashboard']) {
            return {
                redirect: {
                    destination: '/403',
                    permanent: false,
                },
            };
        }

        const translations = await serverSideTranslations(
            locale,
            [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
            nextI18nextConfig,
            ALL_LOCALES
        );
        const brokerDealersSSR = await fetchAgentsSSR(accessToken || '');

        const authorizedCarriers = await getCarrierListServerSSR(accessToken || '', user.partyId, UserPermission.AllowReadCaseManagement);
        return {
            props: {
                locale,
                authorizedCarriers,
                brokerDealersSSR,
                ...translations,
            },
        };
    },
});
