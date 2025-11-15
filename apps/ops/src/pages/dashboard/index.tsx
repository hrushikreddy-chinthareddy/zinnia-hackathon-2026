import { getAccessToken } from '@auth0/nextjs-auth0';
import { TabContent } from '@zinnia/bloom/components';
import { FgaRoles } from '@zinnia/utils';
import Highcharts from 'highcharts';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useRef } from 'react';

import {
    DashboardTabNav,
    DashboardTabs,
} from '@deps/components/dashboard/dashboard-nav-links';
import FiltersHeader from '@deps/components/dashboard/header-components/filters-header/filters-header';
import { PageHead } from '@deps/components/page-title';
import { TranslationFiles } from '@deps/config/translations';
import { ActiveApplications } from '@deps/containers/dashboard/active-applications/active-applications';
import { ClosedTransactions } from '@deps/containers/dashboard/closed-transactions/closed-transactions';
import { DashboardResponsiveLayout } from '@deps/containers/dashboard/dashboard-responsive-layout';
import { NIGOAnalysis } from '@deps/containers/dashboard/nigo-analysis/nigo-analysis';
import { TasksVolumeContainer } from '@deps/containers/dashboard/tasks-volume/tasks-volume';
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

    return (
        <>
            <PageHead titleKey="dashboard" />
            <DashboardResponsiveLayout>
                <FiltersHeader
                    carrierHeaderIsIntersecting={carrierHeaderIsIntersecting}
                    carrierHeaderEntry={carrierHeaderEntry}
                    authorizedCarriers={authorizedCarriers}
                    brokerDealersSSR={brokerDealersSSR}
                    ref={carrierHeaderRef}
                />
                <DashboardTabNav>
                    <div ref={tabContentRef} className={styles.tabContent}>
                        <TabContent value={DashboardTabs.ACTIVE_APPLICATIONS}>
                            <ActiveApplications />
                        </TabContent>
                        <TabContent value={DashboardTabs.CLOSED_TRANSACTIONS}>
                            <ClosedTransactions />
                        </TabContent>
                        <TabContent value={DashboardTabs.NIGO_ANALYSIS}>
                            <NIGOAnalysis />
                        </TabContent>
                        <TabContent value={DashboardTabs.TASKS_VOLUME}>
                            <TasksVolumeContainer />
                        </TabContent>
                    </div>
                </DashboardTabNav>
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
                logWarn('dashboard/index:: Access token expired', {
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
        file: 'dashboard/index',
        function: 'getServerSideProps',
        page: 'dashboard',
    }
);
