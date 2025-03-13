import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';

import TaskManagementQueue from '@deps/containers/task-management-queue/task-management-queue-container';
import NoNavLayout from '@deps/components/no-nav-layout';

import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { UserPermission, UserProfile } from '@deps/models/user-profile';

export type additionalDataProps = {
    user: UserProfile;
};
type HomePageProps = {
    featureFlagDecisions: FeatureFlags;
    additionalData: additionalDataProps;
};

export default function Home({ featureFlagDecisions, additionalData }: HomePageProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'taskManagementQueue' });
    return (
        <NoNavLayout>
            <Typography variant={TypographyVariant.H1} className="md:mb-5 mb-4">
                {t('homeTitle')}
            </Typography>
            <div className="bg-white rounded-md shadow-md w-100 p-8 pb-4">
                <Typography className="mb-4" variant={TypographyVariant.H2}>
                    {t('taskTitle')}
                </Typography>
                <TaskManagementQueue featureFlagDecisions={featureFlagDecisions} additionalData={additionalData} showClaimTask={false} />
            </div>
        </NoNavLayout>
    );
}

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        const user = await getUserData(context);
        const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub);
        const { locale = DEFAULT_LOCALE, req, res } = context;

        let accessToken;
        const additionalData: additionalDataProps = { user: user };
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('getServerSidePropsTaskQueue::Access token expired', {
                ...parseErrorInformation(e),
                file: 'utils/page',
                function: 'getServerSidePropsTaskQueue',
            });
            return serverSidePropsLogout();
        }
        const showHome: any = featureFlagDecisions?.[FEATURE_FLAGS.SHOW_HOME_NAV_BTN];
        const doesUserHasPagePermissions = await doesUserHavePagePermissions(context, UserPermission.AllowReadOtpRenewals);

        if (!showHome || !doesUserHasPagePermissions) {
            return {
                redirect: {
                    destination: '/403',
                    permanent: false,
                },
            };
        }
        const transaltions = await serverSideTranslations(locale, [TranslationFiles.COMMON], nextI18nextConfig, ALL_LOCALES);
        return {
            props: { locale, ...transaltions, featureFlagDecisions, additionalData },
        };
    },
});
