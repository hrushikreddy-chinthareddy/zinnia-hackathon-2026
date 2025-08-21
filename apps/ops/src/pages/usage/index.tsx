import { getAccessToken } from '@auth0/nextjs-auth0';
import { TabContent } from '@zinnia/bloom/components';
import { FgaRoles } from '@zinnia/utils';
import Highcharts from 'highcharts';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect } from 'react';

import { PageHead } from '@deps/components/page-title';
import { Logins } from '@deps/components/usage/logins/logins';
import { UsageResponsiveLayout } from '@deps/components/usage/logins/usage-responsive-layout';
import { PageViews } from '@deps/components/usage/page-views/page-views';
import UsageHeader from '@deps/components/usage/usage-header/header';
import { UsageTabNav, UsageTabs } from '@deps/components/usage/usage-nav-links';
import { TranslationFiles } from '@deps/config/translations';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import { FgaRelation } from '@deps/types/fga';
import {
    SegmentPageName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
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

import styles from './Usage.module.css';

interface UsagePageProps extends SegmentTrackedPageProps {
    authorizedCarriers: string[];
}
const UsagePage = ({ user }: UsagePageProps) => {
    useSegmentPageTracker(user, SegmentPageName.Usage);

    useEffect(() => {
        Highcharts.setOptions({
            lang: {
                thousandsSep: ',',
            },
        });
    }, []);

    return (
        <>
            <PageHead titleKey="usage" />
            <UsageResponsiveLayout>
                <UsageHeader />
                <UsageTabNav>
                    <div className={styles.tabContent}>
                        <TabContent value={UsageTabs.LOGINS}>
                            <Logins />
                        </TabContent>
                        <TabContent value={UsageTabs.PAGE_VIEWS}>
                            <PageViews />
                        </TabContent>
                        {/*
                        NOTE: This is disabled as the data provided is inaccurate: DEPU-6502 - MR
                        <TabContent value={UsageTabs.ACTIVITY}>
                            <Activity />
                        </TabContent> */}
                    </div>
                </UsageTabNav>
            </UsageResponsiveLayout>
        </>
    );
};

export default UsagePage;

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
                logWarn('usage/index:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            const featureFlagDecisions: FeatureFlags =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    loggingContext
                );
            const doesUserHavePagePermission = await checkTuplePage(
                context,
                FgaRelation.UiAccess,
                FgaRoles.USAGE_DASHBOARD_ENTITY,
                loggingContext
            );

            if (
                !doesUserHavePagePermission ||
                !featureFlagDecisions[FEATURE_FLAGS.USAGE_STATS_DASHBOARD]
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

            return {
                props: {
                    locale,
                    user,
                    ...translations,
                },
            };
        },
    },
    { file: 'usage/index', function: 'getServerSideProps', page: 'usage' }
);
