import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { CASE_STATS_DASHBOARD_ROLE } from '@zinnia/utils';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MultiselectOption, SimpleOption } from '@deps/components/autocomplete/autocomplete.types';
import ActiveAging from '@deps/components/dashboard/active-aging/active-aging';
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
import { getStatusSummaryDumbText } from '@deps/helpers/dashboard/dashboard-dumb-text';
import { getAllGroupings } from '@deps/helpers/dashboard/dashboard-helpers';
import { StatGroupingOptions, StatGroupingResponse } from '@deps/helpers/dashboard/types';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { wholePercentFormatify } from '@deps/helpers/numbers.helper';
import { getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { Case, Processes, Statuses } from '@deps/models/case/case';
import { UserPermission } from '@deps/models/user-profile';
import { getCases, getCaseStats } from '@deps/queries/api/cases';
import { checkTupleSsr, getCarrierListServerSSR } from '@deps/queries/api/fga';
import { CaseStatsQuery } from '@deps/queries/cases';
import { FgaRelation } from '@deps/types/fga';
import { CaseSearchBody, CaseSearchErrorResponse, CaseSearchResponse } from '@deps/types/search';
import { getCarrierListItem, getCarrierNameByClientId, getClientIdsByCarrierName, getSelectedCarriers } from '@deps/utils/carriers';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import styles from './Dashboard.module.css';

interface CarrierListItem {
    [key: string]: string;
}

const DashboardPage = ({ authorizedCarriers }: { authorizedCarriers: string[] }) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const [timeFrameLabel] = useState<string>('Year to Date');
    const [cases, setCases] = useState<Case[]>([]);

    const [caseGroupings, setCaseGroupings] = useState<{ [key: string]: StatGroupingResponse }>({});
    const [insightOption, setInsightOption] = useState<Processes>(Processes.NewBusiness);
    const [insightCases, setInsightCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loaderLabel, setLoaderLabel] = useState<string>('Loading Cases...');
    const caseCacheRef = useRef<Case[]>([]);

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

    const getProcessListOptions = (cases: Case[]): SimpleOption[] => {
        return cases
            .reduce<SimpleOption[]>((acc, curr) => {
                const processType = curr.process;
                if (processType && !acc.some(item => item.value === processType)) {
                    acc.push({ value: processType, label: processType });
                }
                return acc;
            }, [])
            .sort((item1, item2) => item1.label.localeCompare(item2.label));
    };

    const getCarriers = useCallback(() => {
        const carriers = getSelectedCarriers(selectedCarriers);
        return carriers.length > 0 ? carriers : undefined;
    }, [selectedCarriers]);

    const fetchAllCasesThisYear = useCallback(async () => {
        const createdStartDate = new Date(`01/01/${new Date().getFullYear()}`);
        const createdStartDateIso = createdStartDate.toISOString();
        const caseStatsQuery: CaseStatsQuery = {
            caseStatus: [Statuses.InProgress, Statuses.Exception],
            carrier: getCarriers(),
            groupBy: ['caseStatus'],
            createdDateStart: createdStartDateIso,
        };

        const caseStats = await getCaseStats(caseStatsQuery);
        //CaseStatsResponse, CaseStatsErrorResponse
        if (!caseStats || 'status' in caseStats) {
            console.error('fetchAllCases::Failed to fetch case stats');
            return;
        }

        const casePromises = [];
        const baseCaseSearchInputs: CaseSearchBody = {
            sortBy: 'createdAt',
            sortDirection: 'asc',
            caseStatus: [Statuses.InProgress, Statuses.Exception],
            offset: 0,
            limit: 10000,
            carrier: getCarriers(),
            // @ts-expect-error Need to check types
            createdDateStart: createdStartDate,
        };

        // get cases increments at a time, but there's a bug with case search so we need to search monthly data
        // because they put the entire query in the context window during pagination
        for (let i = 0; i < 12; i++) {
            const searchDateStart = new Date(`${createdStartDate.getFullYear()}-${createdStartDate.getMonth() + 1 + i}-01`);
            const searchDateEnd = new Date(`${createdStartDate.getFullYear()}-${createdStartDate.getMonth() + 2 + i}-01`);
            const casesInput: CaseSearchBody = {
                ...baseCaseSearchInputs,
                offset: 0,
                // @ts-expect-error Need to check types
                createdDateStart: searchDateStart,
                // @ts-expect-error Need to check types
                createdDateEnd: searchDateEnd,
            };
            casePromises.push(getCases(casesInput));
        }

        casePromises.forEach((casePromise: Promise<CaseSearchResponse | CaseSearchErrorResponse>) => {
            casePromise.then((caseResponse: CaseSearchResponse | CaseSearchErrorResponse) => {
                if ('data' in caseResponse && 'total' in caseResponse) {
                    // caseResponse is a CaseSearchResponse
                    caseCacheRef.current = caseCacheRef.current.concat(caseResponse.data);
                    setLoaderLabel(`Loaded ${wholePercentFormatify(caseCacheRef.current.length / caseStats.count)} cases`);
                    setCases(caseCacheRef.current);
                } else {
                    // caseResponse is a CaseSearchErrorResponse
                    console.error('Error fetching cases:', caseResponse);
                }
            });
        });

        return Promise.all(casePromises);
    }, [getCarriers]);

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

    const handleOnOpenChange = (open: boolean) => {
        if (!open) {
            setSelectedCarriers(placeholderSelectedCarriers);
        }
    };

    const handleInsightChange = (processType: Processes) => {
        setInsightOption(processType);
    };

    const fetchAllCases = useCallback(async () => {
        setLoading(true);
        const allCasesThisYear = await fetchAllCasesThisYear();
        try {
            if (allCasesThisYear && allCasesThisYear && Array.isArray(allCasesThisYear) && allCasesThisYear.length > 0) {
                // we already handle each fetch independently
                caseCacheRef.current = [];
                setLoaderLabel('Loading Cases...');
            } else {
                throw new Error('getAllCassesThisYear::An error occurred while getting case search results');
            }
        } catch (error) {
            console.error('getCases::An error occurred while getting case search results', error);
            setCases([]);
        }
        console.log('set loading to false');
        setLoading(false);
    }, [fetchAllCasesThisYear]);

    useEffect(() => {
        fetchAllCases();
    }, [fetchAllCases]);

    useEffect(() => {
        if (cases) {
            const insightCases = cases.filter(caseItem => caseItem.process.toLowerCase() === insightOption.toLocaleLowerCase());
            setInsightCases(insightCases);
            setCaseGroupings(getAllGroupings(insightCases));
        }
    }, [cases, insightOption]);

    return (
        <div>
            <PageHead titleKey="dashboard" />
            <NoNavLayout fullHeight={true} displayTopNavBar={true} size="large">
                <div className={`${styles.container}`}>
                    {loading && (
                        <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex h-full justify-center bg-gray-800 opacity-80">
                            <div className="mt-4">
                                <PageLoader variant={PageLoaderVariant.CenterWhiteText} textKey={loaderLabel} showText={true} />
                            </div>
                        </div>
                    )}
                    <CardContainer>
                        <div className="flex justify-between items-center">
                            <Typography className="flex items-center" variant={TypographyVariant.H1} data-testid="header-text">
                                {t('caseStatsDashboardTitle')}
                            </Typography>
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
                        </div>
                        <div>
                            <SankeyChart cases={cases} />
                        </div>
                    </CardContainer>
                    <div>
                        <div className={`${styles.insightsHeader}`}>
                            <Typography className="flex items-center" variant={TypographyVariant.H2} data-testid="header-text">
                                {t('insights')}
                            </Typography>
                            <div className={`${styles.insightsHeaderDropdown}`}>
                                <Select
                                    options={getProcessListOptions(cases)}
                                    size={FieldSize.Small}
                                    name="process-type-dropdown-btn"
                                    placeholder={t('selectProcessType') || ''}
                                    value={insightOption}
                                    onChange={value => handleInsightChange(value as Processes)}
                                />
                            </div>
                        </div>
                        <ActiveAging cases={insightCases} />
                        <div className="flex flex-col gap-1 mt-1">
                            <div className="flex gap-1">
                                <CaseStatBlock
                                    caseStats={caseGroupings[StatGroupingOptions.Carrier]}
                                    blockLabel="Carrier"
                                    timeFrameLabel={timeFrameLabel}
                                    statMeasurementLabel="case"
                                    summaryBlockFormatter={getStatusSummaryDumbText}
                                    variant="double"
                                />
                                <CaseStatBlock
                                    caseStats={caseGroupings[StatGroupingOptions.OpenStages]}
                                    blockLabel="Stages"
                                    timeFrameLabel={timeFrameLabel}
                                    statMeasurementLabel="case"
                                    summaryBlockFormatter={getStatusSummaryDumbText}
                                    variant="double"
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
            CASE_STATS_DASHBOARD_ROLE
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

        const authorizedCarriers = await getCarrierListServerSSR(accessToken || '', user.partyId, UserPermission.AllowReadCaseManagement);
        return {
            props: {
                locale,
                authorizedCarriers,
                ...translations,
            },
        };
    },
});
