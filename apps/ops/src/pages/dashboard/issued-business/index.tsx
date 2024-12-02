import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { DEFAULT_ERROR_STRING, FgaRoles, toTitleCase } from '@zinnia/utils';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MultiselectOption } from '@deps/components/autocomplete/autocomplete.types';
import { BrokerDealerFilter } from '@deps/components/dashboard/broker-dealer-filter/broker-dealer-filter';
import { DashboardNavLinks } from '@deps/components/dashboard/dashboard-nav-links';
import { ExceptionSummary } from '@deps/components/dashboard/exception-summary';
import { FieldSize } from '@deps/components/fields/field';
import FieldData, { FieldDataVariant } from '@deps/components/fields/field-data/field-data';
import Label, { LabelVariant } from '@deps/components/label/label';
import NoNavLayout from '@deps/components/no-nav-layout';
import PageLoader from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import Select from '@deps/components/select/select';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import CardContainer from '@deps/containers/card-container/card-container';
import { DashboardResponsiveLayout } from '@deps/containers/dashboard/dashboard-responsive-layout';
import { dashboardChartTitleFormat } from '@deps/helpers/dashboard/dashboard-helpers';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { useIntersectionObserver } from '@deps/hooks/useIntersectionObserver';
import { Processes, Statuses } from '@deps/models/case/case';
import { GroupByOptions } from '@deps/models/case/enums';
import { UserPermission } from '@deps/models/user-profile';
import { getCaseDashboardStats } from '@deps/queries/api/cases';
import { DashboardResponseData, fetchAgentsSSR, fetchCompletedCasesByProcessSubTypeSSR } from '@deps/queries/api/dashboard';
import { checkTupleSsr, getCarrierListServerSSR } from '@deps/queries/api/fga';
import { FgaRelation } from '@deps/types/fga';
import { getCarrierListItem, getCarrierNameByClientId, getClientIdsByCarrierName } from '@deps/utils/carriers';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import { ExceptionInsights } from '../../../components/dashboard/exception-insights';
import styles from '../Dashboard.module.css';

export interface CarrierListItem {
    [key: string]: string;
}

const timeFrameFilterOptions = ['trailing 12 months', 'last 6 months', 'last 90 days', 'last 60 days', 'last month'];
type IssuedBusinessPageProps = {
    authorizedCarriers: string[];
    brokerDealersSSR: DashboardResponseData[];
    completedCasesByProcessSubType: DashboardResponseData[];
};

// opacity 100 - 10
// step evenly
// 0.1 0.2 0.3 0.4 0.5 0.6 0.7 0.8 0.9

export const IssuedBusinessPage = ({ authorizedCarriers, brokerDealersSSR, completedCasesByProcessSubType }: IssuedBusinessPageProps) => {
    const carrierHeaderRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(false);
    const [exceptionData, setExceptiondata] = useState<DashboardResponseData[]>(completedCasesByProcessSubType);
    const [selectedException, setSelectedException] = useState<string | undefined>();
    const [timeframe, setTimeframe] = useState<string>(timeFrameFilterOptions[0]);
    const {
        isIntersecting: carrierHeaderIsIntersecting,
        ref: cardContainerRef,
        entry: carrierHeaderEntry,
    } = useIntersectionObserver({
        threshold: 0,
        rootMargin: `${-64}px 0px -100% 0px`,
    });

    const { t } = useTranslation(TranslationFiles.COMMON);
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

    const [selectedSubprocess, setSelectedSubprocess] = useState<string>('');

    const handleSelectedSubprocess = (subprocess: string) => {
        setSelectedException(undefined);
        setSelectedSubprocess(subprocess);
    };

    const carrierOrBrokerDealer = useMemo(() => {
        if (selectedCarriers) {
            return GroupByOptions.Carrier;
        }
        if (selectedBrokerDealers) {
            return GroupByOptions.BrokerDealerName;
        }
        return undefined;
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

    useEffect(() => {
        const getCases = async () =>
            await getCaseDashboardStats({
                filter: {
                    createdDateStart: createdDateStart,
                    process: [Processes.NewBusiness],
                    caseStatus: [Statuses.Completed],
                },
                groupBy: [GroupByOptions.ProcessSubType, GroupByOptions.ExceptionCategory],
            });

        setLoading(true);
        getCases()
            .then(response => {
                if (!!response.data && Array.isArray(response.data)) {
                    setSelectedSubprocess(response.data[0].name);
                    setExceptiondata(response.data.slice(0, 5));
                } else {
                    setExceptiondata([]);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [createdDateStart]);

    return (
        <DashboardResponsiveLayout>
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
                                    disabled={loading || carrierFilterItems.length === 1}
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
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <DashboardNavLinks />
                <CardContainer
                    ref={cardContainerRef}
                    classNames="relative !p-0 flex flex-col flex-1 gap-4 !border-none  bg-[--color-base-surface-surface-tertiary]"
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
                        <RadioGroup.Root asChild onValueChange={handleSelectedSubprocess} value={selectedSubprocess}>
                            <div className=" grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 !items-stretch !border-b-0 !after:content-none [& .indicator]">
                                {exceptionData.map((element, index) => {
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
                                            {loading ? (
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
                                                            {element.count}
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
                        {loading ? (
                            <>
                                <div className="min-h-[600px] grid gap-4 h-full mb-4 w-full place-content-center bg-[--color-base-surface-surface-tertiary]">
                                    <PageLoader />
                                </div>
                            </>
                        ) : (
                            <ExceptionInsights
                                timeframe={timeframe}
                                completedCasesByProcessSubType={exceptionData}
                                selectedSubprocess={selectedSubprocess}
                                selectedException={selectedException}
                                carrierOrBrokerDealer={undefined}
                            />
                        )}
                    </div>
                    <div className="bg-white p-8 flex flex-col gap-8">
                        <ExceptionSummary
                            carrierOrBrokerDealer={carrierOrBrokerDealer}
                            startDate={createdDateStart}
                            selectedSubprocess={selectedSubprocess}
                        />
                    </div>
                </CardContainer>
            </NoNavLayout>
        </DashboardResponsiveLayout>
    );
};

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

        // TODO: Movve this up so we don't exceed page data limit
        // https://nextjs.org/docs/messages/large-page-data
        const translations = await serverSideTranslations(
            locale,
            [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
            nextI18nextConfig,
            ALL_LOCALES
        );
        const brokerDealersSSR = await fetchAgentsSSR(accessToken || '');

        const authorizedCarriers = await getCarrierListServerSSR(accessToken || '', user.partyId, UserPermission.AllowReadCaseManagement);
        const completedCasesByProcessSubType = (await fetchCompletedCasesByProcessSubTypeSSR(accessToken || '')).slice(0, 5);
        return {
            props: {
                locale,
                authorizedCarriers,
                brokerDealersSSR,
                ...translations,
                completedCasesByProcessSubType,
            },
        };
    },
});

export default IssuedBusinessPage;
