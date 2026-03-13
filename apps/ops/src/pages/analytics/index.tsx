import { getAccessToken } from '@auth0/nextjs-auth0';
import { TabContent, TabGroup } from '@zinnia/bloom/components';
import { AnalyticsDashboard } from '@zinnia/xd-analytics-dashboard';
import Highcharts from 'highcharts';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { SelectFiltersHeader } from '@deps/components/dashboard/header-components/filters-header/select-filters-header';
import { AnalyticsTabs, UsageTabs } from '@deps/components/dashboard/types';
import { PageHead } from '@deps/components/page-title';
import { TranslationFiles } from '@deps/config/translations';
import { DashboardResponsiveLayout } from '@deps/containers/dashboard/dashboard-responsive-layout';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useIntersectionObserver } from '@deps/hooks/useIntersectionObserver';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { useZEmbedInit } from '@deps/hooks/useZEmbedInit';
import { UserPermission } from '@deps/models/user-profile';
import {
    DashboardResponseData,
    fetchAgentsSSR,
} from '@deps/queries/api/dashboard';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import { listCarriersPage } from '@deps/queries/api/server/fga/listCarriers';
import { AnalyticsRouteValues } from '@deps/types/constants';
import { FgaRelation } from '@deps/types/fga';
import {
    SegmentPageName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
import { FgaRoles } from '@deps/utils/auth';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import {
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import Cases from './content/cases';
import PoliciesAndContracts from './content/politics-and-contracts';
import Usage from './content/usage';

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace JSX {
        interface IntrinsicElements {
            'zen-analytics-dashboard': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            >;
        }
    }
}

interface AnalyticsPageProps extends SegmentTrackedPageProps {
    accessToken: string;
    authorizedCarriers: string[];
    brokerDealersSSR: DashboardResponseData[];
    path: string;
    usageTabEnabled: boolean;
}

const EmbeddedAnalyticsDashboard = ({
    accessToken,
}: {
    accessToken: string;
}) => {
    const getAccessTokenCallback = useCallback(async () => {
        return accessToken;
    }, [accessToken]);

    const zembedConfig = useMemo(
        () => ({
            modules: ['analytics-dashboard'],
            debug: process.env.NODE_ENV === 'development',
            accessToken: getAccessTokenCallback,
        }),
        [getAccessTokenCallback]
    );

    const { success, error } = useZEmbedInit(zembedConfig);

    if (!success && error) {
        return <div>Error: {error?.message}</div>;
    }

    return (
        <div>
            <zen-analytics-dashboard id="analytics-dashboard" />
        </div>
    );
};

const AnalyticsPage = ({
    accessToken,
    authorizedCarriers,
    brokerDealersSSR,
    user,
    path,
    usageTabEnabled,
}: AnalyticsPageProps) => {
    useSegmentPageTracker(user, SegmentPageName.Dashboard);

    const { featureFlags } = useOptimizely();
    //feature flags to determine which dashboard to use
    const usePackage =
        featureFlags[FEATURE_FLAGS.USE_ANALYTICS_DASHBOARD_PACKAGE];
    const useEmbeddable =
        featureFlags[FEATURE_FLAGS.USE_ANALYTICS_DASHBOARD_EMBEDDABLE];
    const useNewDashboardRepo = usePackage || useEmbeddable;

    const [slug, setSlug] = useState(path.split('?')[0].split('/').at(-1));
    const [tab, setTab] = useState(
        path.split('?')[1]?.split('=')?.at(-1) ?? undefined
    );
    const router = useRouter();

    const {
        isIntersecting: carrierHeaderIsIntersecting,
        ref: tabContentRef,
        entry: carrierHeaderEntry,
    } = useIntersectionObserver({
        threshold: 0,
        rootMargin: `${0}px 0px -100% 0px`,
    });

    useEffect(() => {
        Highcharts.setOptions({
            lang: {
                thousandsSep: ',',
            },
        });
    }, []);

    useEffect(() => {
        const url = router.asPath.split('?');
        const tab = url?.[1]?.split('=')?.at(-1);
        const slug = url?.[0]?.split('/')?.at(-1);

        if (!tab) {
            if (slug === AnalyticsRouteValues.cases) {
                setTab(AnalyticsTabs.ACTIVE_APPLICATIONS);
            }
            if (slug === AnalyticsRouteValues.usage) {
                setTab(UsageTabs.LOGINS);
            }
        }
        setSlug(slug);
    }, [router.asPath]);
    useEffect(() => {
        const handleNavigate = (
            event: CustomEvent<{
                path: string;
                tab: string;
                options: { isExternal: boolean };
            }>
        ) => {
            const { path, tab, options } = event.detail;

            // Full-path navigation (e.g. /cases?params) — open in new window
            if (options?.isExternal) {
                window.open(path, '_blank', 'noopener,noreferrer');
                return;
            }

            // Tab switch within analytics (e.g. cases/active-applications)
            const url = tab
                ? `/analytics/${path}?tab=${tab}`
                : `/analytics/${path}`;
            router.replace(url, undefined, { shallow: true });
        };

        window.addEventListener(
            'zembed:analytics-navigate',
            handleNavigate as EventListener
        );

        return () => {
            window.removeEventListener(
                'zembed:analytics-navigate',
                handleNavigate as EventListener
            );
        };
    }, [router]);

    if (useNewDashboardRepo) {
        if (useEmbeddable) {
            return (
                <>
                    <PageHead titleKey="analytics" />
                    <EmbeddedAnalyticsDashboard accessToken={accessToken} />
                </>
            );
        }

        return (
            <>
                <PageHead titleKey="analytics" />
                <AnalyticsDashboard
                    onNavigate={(
                        path: string,
                        tab: string,
                        options?: { isExternal?: boolean }
                    ) => {
                        window.dispatchEvent(
                            new CustomEvent('zembed:analytics-navigate', {
                                detail: { path, tab, options },
                            })
                        );
                    }}
                />
            </>
        );
    }

    return (
        <>
            <PageHead titleKey="analytics" />
            <DashboardResponsiveLayout>
                <SelectFiltersHeader
                    carrierHeaderIsIntersecting={carrierHeaderIsIntersecting}
                    authorizedCarriers={authorizedCarriers}
                    brokerDealersSSR={brokerDealersSSR}
                    carrierHeaderEntry={carrierHeaderEntry}
                    path={slug}
                    usageTabEnabled={usageTabEnabled}
                />
                <TabGroup defaultValue={slug} value={slug} ref={tabContentRef}>
                    <TabContent value={AnalyticsRouteValues.cases}>
                        <Cases tab={tab} />
                    </TabContent>
                    <TabContent value={AnalyticsRouteValues.policies}>
                        <PoliciesAndContracts tab={tab} />
                    </TabContent>
                    <TabContent value={AnalyticsRouteValues.usage}>
                        <Usage tab={tab} />
                    </TabContent>
                </TabGroup>
            </DashboardResponsiveLayout>
        </>
    );
};

export default AnalyticsPage;

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            // Get the user object from the Auth0 Session
            const user = await getUserData(context);
            const { locale = DEFAULT_LOCALE, res, req, resolvedUrl } = context;

            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('analytics/index:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            if (
                !(
                    resolvedUrl.includes(AnalyticsRouteValues.usage) ||
                    resolvedUrl.includes(AnalyticsRouteValues.cases)
                )
            ) {
                return {
                    redirect: {
                        destination: `/analytics/${AnalyticsRouteValues.cases}`,
                        permanent: false,
                    },
                };
            }

            const doesUserHavePagePermission = await checkTuplePage(
                context,
                FgaRelation.UiAccess,
                FgaRoles.CASE_STATS_DASHBOARD_ENTITY,
                loggingContext
            );
            if (!doesUserHavePagePermission) {
                return {
                    redirect: {
                        destination: '/403',
                        permanent: false,
                    },
                };
            }

            const featureFlagDecisions: FeatureFlags =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    loggingContext
                );
            const doesUserHaveUsagePermission = await checkTuplePage(
                context,
                FgaRelation.UiAccess,
                FgaRoles.USAGE_DASHBOARD_ENTITY,
                loggingContext
            );

            const usageTabEnabled =
                doesUserHaveUsagePermission &&
                featureFlagDecisions[FEATURE_FLAGS.USAGE_STATS_DASHBOARD];

            if (
                !usageTabEnabled &&
                resolvedUrl.includes(AnalyticsRouteValues.usage)
            ) {
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

            const brokerDealersSSR = await fetchAgentsSSR(
                accessToken || '',
                loggingContext
            );
            const filteredBrokerDealers = brokerDealersSSR.filter(
                (brokerDealer) =>
                    brokerDealer.name !== 'NOT_APPLICABLE' &&
                    brokerDealer.name !== ''
            );

            const authorizedCarriers = await listCarriersPage(
                context,
                UserPermission.AllowReadCaseManagement,
                loggingContext
            );

            return {
                props: {
                    locale,
                    accessToken,
                    authorizedCarriers,
                    brokerDealersSSR: filteredBrokerDealers,
                    path: resolvedUrl,
                    user,
                    usageTabEnabled,
                    ...translations,
                },
            };
        },
    },
    {
        file: 'analytics/index',
        function: 'getServerSideProps',
        page: 'analytics',
    }
);
