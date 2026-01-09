import { getAccessToken } from '@auth0/nextjs-auth0';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback, useMemo } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useZEmbedInit } from '@deps/hooks/useZEmbedInit';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    FeatureFlags,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import {
    logInfo,
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

export default function OrderEntryPage({
    accessToken,
}: {
    accessToken: string;
}) {
    const getAccessToken = useCallback(async () => {
        return accessToken;
    }, [accessToken]);

    const zembedConfig = useMemo(
        () => ({
            modules: ['order-entry'],
            debug: process.env.NODE_ENV === 'development',
            accessToken: getAccessToken,
        }),
        [getAccessToken]
    );

    const { success, error } = useZEmbedInit(zembedConfig);

    if (!success && error) {
        return <div>Error: {error?.message}</div>;
    }

    return (
        <div>
            <zen-order-entry id="order-entry"></zen-order-entry>
        </div>
    );
}

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, _loggingContext) => {
            const { locale = DEFAULT_LOCALE, req, res } = context;
            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn(
                    'getServerSidePropsNigoEntryPage::Access token expired',
                    {
                        ...parseErrorInformation(e),
                        ..._loggingContext,
                    }
                );
                return serverSidePropsLogout();
            }
            const user = await getUserData(context);

            const featureFlagDecisions: FeatureFlags =
                await optimizelyService.getFeatureFlagDecisions(
                    user.sub,
                    _loggingContext
                );

            if (!featureFlagDecisions[FEATURE_FLAGS.MARKET_CONNECT_ENABLED]) {
                logInfo(
                    'customersPage::Feature flag not enabled',
                    _loggingContext
                );
                return {
                    redirect: {
                        destination: '/404',
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
                    ...translations,
                    user,
                    accessToken,
                },
            };
        },
    },
    {
        file: 'customers/[customerId]/order-entry/[transactionId]/index',
        function: 'getServerSideProps',
        page: 'customers/[customerId]/order-entry/[transactionId]/index',
    }
);
