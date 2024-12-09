import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { TabContent } from '@zinnia/bloom/components';
import { FgaRoles } from '@zinnia/utils';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback, useRef, useState } from 'react';

import { ActiveApplications } from '@deps/components/dashboard/active-applications/active-applications';
import { DashboardTabNav } from '@deps/components/dashboard/dashboard-nav-links';
import IssuedBusiness from '@deps/components/dashboard/issued-business/issued-business';
import NoNavLayout from '@deps/components/no-nav-layout';
import { PageHead } from '@deps/components/page-title';
import { TranslationFiles } from '@deps/config/translations';
import { DashboardResponsiveLayout } from '@deps/containers/dashboard/dashboard-responsive-layout';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { useIntersectionObserver } from '@deps/hooks/useIntersectionObserver';
import { UserPermission } from '@deps/models/user-profile';
import { DashboardResponseData, fetchAgentsSSR } from '@deps/queries/api/dashboard';
import { checkTupleSsr, getCarrierListServerSSR } from '@deps/queries/api/fga';
import { FgaRelation } from '@deps/types/fga';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

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
    const carrierHeaderRef = useRef<HTMLDivElement>(null);
    const {
        isIntersecting: carrierHeaderIsIntersecting,
        ref: tabContentRef,
        entry: carrierHeaderEntry,
    } = useIntersectionObserver({
        threshold: 0,
        rootMargin: `${-64}px 0px -100% 0px`,
    });

    const [loading, setLoading] = useState<boolean>(false);

    const handleSetLoading = useCallback((bool: boolean) => {
        setLoading(bool);
    }, []);

    return (
        <DashboardResponsiveLayout>
            <PageHead titleKey="dashboard" />
            <NoNavLayout fullHeight={true} displayTopNavBar={true} size="large">
                <FiltersHeader
                    carrierHeaderIsIntersecting={carrierHeaderIsIntersecting}
                    carrierHeaderEntry={carrierHeaderEntry}
                    authorizedCarriers={authorizedCarriers}
                    brokerDealersSSR={brokerDealersSSR}
                    ref={carrierHeaderRef}
                    loading={loading}
                />

                <DashboardTabNav>
                    <TabContent className="w-full" value={'active-applications'}>
                        <ActiveApplications
                            sankeyChartRef={sankeyChartRef}
                            handleSetLoading={handleSetLoading}
                            loading={loading}
                            carrierHeaderRef={carrierHeaderRef}
                        />
                    </TabContent>
                    <TabContent className="w-full" value={'issued-business'}>
                        <IssuedBusiness />
                    </TabContent>
                </DashboardTabNav>
            </NoNavLayout>
        </DashboardResponsiveLayout>
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
