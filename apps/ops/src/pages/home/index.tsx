import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import TaskManagementQueue from '@deps/containers/task-management-queue/task-management-queue-container';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { UserProfile } from '@deps/models/user-profile';
import { checkTuplePage } from '@deps/queries/api/server/fga/checkTuple';
import { FgaRelation, FgaUiEntity } from '@deps/types/fga';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { withPageAuthAndLogging } from '@deps/utils/server-logging';
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
            // Only users who are in a task queue can see the home page...for now
            const homePageCheck = await checkTuplePage(context, FgaRelation.UiAccess, FgaUiEntity.ZinniaLiveHomeExerience, loggingContext);
            const user = await getUserData(context);
            const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub, loggingContext);

            const showHome: any = featureFlagDecisions?.[FEATURE_FLAGS.SHOW_HOME_NAV_BTN];
            if (!homePageCheck || !showHome) {
                return {
                    redirect: {
                        destination: '/cases',
                        permanent: false,
                    },
                };
            }

            const { locale = DEFAULT_LOCALE } = context;
            const additionalData: additionalDataProps = { user: user };

            const transaltions = await serverSideTranslations(locale, [TranslationFiles.COMMON], nextI18nextConfig, ALL_LOCALES);
            return {
                props: { locale, ...transaltions, featureFlagDecisions, additionalData },
            };
        },
    },
    { file: 'home', function: 'getServerSideProps', page: 'home' }
);
