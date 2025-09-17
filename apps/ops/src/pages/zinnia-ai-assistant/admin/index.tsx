import { getAccessToken } from '@auth0/nextjs-auth0';
import { MeResponse } from '@xd/api-types/dist/generated-types/knowledgebase';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import SettingsPage from '@deps/components/knowledge-base/admin/settings-page/settings-page';
import { TranslationFiles } from '@deps/config/translations';
import KnowledgeBaseContainer from '@deps/containers/knowledge-base/knowledge-base-container';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { DEFAULT_LOCALE, ALL_LOCALES } from '@deps/helpers/routing.helpers';
import { UserProfile } from '@deps/models/user-profile';
import { getOpsUserDetailsSSR } from '@deps/queries/api/knowledge-base';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import { logWarn, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

type additionalDataProps = {
    user: UserProfile;
};

type AdminPageProps = {
    featureFlagDecisions: FeatureFlags;
    additionalData: additionalDataProps;
    opsUserData: MeResponse;
};

export default function AdminPage({ opsUserData }: AdminPageProps) {
    return (
        <KnowledgeBaseContainer opsUserData={opsUserData}>
            <SettingsPage />
        </KnowledgeBaseContainer>
    );
}

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);
            const featureFlagDecisions: FeatureFlags =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    loggingContext
                );

            if (!featureFlagDecisions?.[FEATURE_FLAGS.AI_ASSISTANT]) {
                logWarn(
                    'zinnia-ai-assistant::Feature flag disabled',
                    loggingContext
                );
                return {
                    redirect: {
                        destination: '/cases',
                        permanent: false,
                    },
                };
            }
            const { locale = DEFAULT_LOCALE, req, res } = context;
            const logCtx = {
                ...loggingContext,
                file: 'pages/zinnia-ai-assistant',
                function: 'getServerSideProps',
            };
            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('zinnia-ai-assistant::Access token expired', {
                    ...logCtx,
                });
                return serverSidePropsLogout();
            }
            const additionalData: additionalDataProps = { user: user };
            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON],
                nextI18nextConfig,
                ALL_LOCALES
            );

            try {
                if (!user?.email) {
                    logWarn(
                        'zinnia-ai-assistant::User email is missing',
                        logCtx
                    );
                    return serverSidePropsLogout();
                }
                const opsUserData = await getOpsUserDetailsSSR(
                    user.email.toLowerCase(),
                    accessToken,
                    logCtx
                );
                if (
                    !opsUserData?.client?.length ||
                    opsUserData?.role !== MeResponse.role.ADMIN
                ) {
                    logWarn('zinnia-ai-assistant::User is not admin', logCtx);
                    return {
                        redirect: {
                            destination: '/403',
                            permanent: false,
                        },
                    };
                }
                return {
                    props: {
                        locale,
                        ...translations,
                        featureFlagDecisions,
                        additionalData,
                        opsUserData: opsUserData as MeResponse,
                    },
                };
            } catch (error) {
                return {
                    props: {
                        locale,
                        ...translations,
                        featureFlagDecisions,
                        additionalData,
                    },
                };
            }
        },
    },
    {
        file: 'zinnia-ai-assistant/admin',
        function: 'getServerSideProps',
        page: 'ai-assistant/admin',
    }
);
