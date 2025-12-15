import { getAccessToken } from '@auth0/nextjs-auth0';
import { ButtonGroup, TabContent, TabGroup } from '@zinnia/bloom/components';
import Highcharts from 'highcharts';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FiltersHeader from '@deps/components/dashboard/header-components/filters-header/filters-header';
import { AnalyticsTabs, TabTitles } from '@deps/components/dashboard/types';
import { PageHead } from '@deps/components/page-title';
import { TranslationFiles } from '@deps/config/translations';
import { ActiveApplications } from '@deps/containers/dashboard/active-applications/active-applications';
import { ClosedTransactions } from '@deps/containers/dashboard/closed-transactions/closed-transactions';
import { DashboardResponsiveLayout } from '@deps/containers/dashboard/dashboard-responsive-layout';
import { NIGOAnalysis } from '@deps/containers/dashboard/nigo-analysis/nigo-analysis';
import { TasksAnalysis } from '@deps/containers/dashboard/tasks-analysis/tasks-analysis';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useIntersectionObserver } from '@deps/hooks/useIntersectionObserver';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { UserPermission } from '@deps/models/user-profile';
import {
    DashboardResponseData,
    fetchAgentsSSR,
} from '@deps/queries/api/dashboard';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import { listCarriersPage } from '@deps/queries/api/server/fga/listCarriers';
import { FgaRelation } from '@deps/types/fga';
import {
    SegmentPageName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
import { FgaRoles } from '@deps/utils/auth';
import {
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

import styles from './Dashboard.module.css';

interface DashboardPageProps extends SegmentTrackedPageProps {
    authorizedCarriers: string[];
    brokerDealersSSR: DashboardResponseData[];
}

const DashboardPage = ({
    authorizedCarriers,
    brokerDealersSSR,
    user,
}: DashboardPageProps) => {
    useSegmentPageTracker(user, SegmentPageName.Dashboard);
    const { t } = useTranslation();
    const [selectedTab, setSelectedTab] = useState<string>(
        AnalyticsTabs.ACTIVE_APPLICATIONS
    );
    const carrierHeaderRef = useRef<HTMLDivElement>(null);
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

    const radioItems = [
        {
            id: `analytics-tab-${TabTitles.OPEN}`,
            children: <span>{t(`enums.${TabTitles.OPEN}`)}</span>,
            value: AnalyticsTabs.ACTIVE_APPLICATIONS,
        },
        {
            id: `analytics-tab-${TabTitles.CLOSED}`,
            children: <span>{t(`enums.${TabTitles.CLOSED}`)}</span>,
            value: AnalyticsTabs.CLOSED_TRANSACTIONS,
        },
        {
            id: `analytics-tab-${TabTitles.ISSUES}`,
            children: <span>{t(`enums.${TabTitles.ISSUES}`)}</span>,
            value: AnalyticsTabs.NIGO_ANALYSIS,
        },
        {
            id: `analytics-tab-${TabTitles.TASKS}`,
            children: <span>{t(`enums.${TabTitles.TASKS}`)}</span>,
            value: AnalyticsTabs.TASKS_VOLUME,
        },
    ];

    return (
        <>
            <PageHead titleKey="analytics" />
            <DashboardResponsiveLayout>
                <FiltersHeader
                    carrierHeaderIsIntersecting={carrierHeaderIsIntersecting}
                    carrierHeaderEntry={carrierHeaderEntry}
                    authorizedCarriers={authorizedCarriers}
                    brokerDealersSSR={brokerDealersSSR}
                    ref={carrierHeaderRef}
                />
                <ButtonGroup
                    className={styles.buttonGroup}
                    ariaLabel="analytics-sub-nav"
                    items={radioItems}
                    onClick={(value) => setSelectedTab(value as string)}
                />
                <TabGroup
                    defaultValue={AnalyticsTabs.ACTIVE_APPLICATIONS}
                    value={selectedTab}
                >
                    <div ref={tabContentRef} className={styles.tabContent}>
                        <TabContent value={AnalyticsTabs.ACTIVE_APPLICATIONS}>
                            <ActiveApplications />
                        </TabContent>
                        <TabContent value={AnalyticsTabs.CLOSED_TRANSACTIONS}>
                            <ClosedTransactions />
                        </TabContent>
                        <TabContent value={AnalyticsTabs.NIGO_ANALYSIS}>
                            <NIGOAnalysis />
                        </TabContent>
                        <TabContent value={AnalyticsTabs.TASKS_VOLUME}>
                            <TasksAnalysis />
                        </TabContent>
                    </div>
                </TabGroup>
            </DashboardResponsiveLayout>
        </>
    );
};

export default DashboardPage;

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            // Get the user object from the Auth0 Session
            const user = await getUserData(context);
            const { locale = DEFAULT_LOCALE, res, req } = context;
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
                    authorizedCarriers,
                    brokerDealersSSR: filteredBrokerDealers,
                    user,
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
