import { getAccessToken } from '@auth0/nextjs-auth0';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import TaskManagementQueue from '@deps/containers/task-management-queue/task-management-queue-container';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { UserPermission, UserProfile } from '@deps/models/user-profile';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

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
        <>
            <Typography variant={TypographyVariant.H1} className="md:mb-5 mb-4">
                {t('homeTitle')}
            </Typography>
            <>
                <Typography className="mb-4" variant={TypographyVariant.H2}>
                    {t('taskTitle')}
                </Typography>
                <TaskManagementQueue featureFlagDecisions={featureFlagDecisions} additionalData={additionalData} showClaimTask={false} />
            </>
        </>
    );
}

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);
            const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub, loggingContext);
            const { locale = DEFAULT_LOCALE, req, res } = context;

            let accessToken;
            const additionalData: additionalDataProps = { user: user };
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('getServerSidePropsTaskQueue::Access token expired', {
                    ...loggingContext,
                    ...parseErrorInformation(e),
                    file: 'utils/page',
                    function: 'getServerSidePropsTaskQueue',
                });
                return serverSidePropsLogout();
            }
            const showHome: any = featureFlagDecisions?.[FEATURE_FLAGS.SHOW_HOME_NAV_BTN];
            const doesUserHasPagePermissions = await doesUserHavePagePermissions(
                context,
                UserPermission.AllowReadOtpRenewals,
                loggingContext
            );

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
    },
    { file: 'home', function: 'getServerSideProps', page: 'home' }
);
