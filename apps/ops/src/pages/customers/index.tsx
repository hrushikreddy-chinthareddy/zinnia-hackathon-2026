import { getAccessToken } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback, useEffect, useMemo } from 'react';

import {
    PageLoader,
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
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

import styles from './index.module.css';

export default function CustomersPage({
    accessToken,
}: {
    accessToken: string;
}) {
    const router = useRouter();

    const getAccessToken = useCallback(async () => {
        return accessToken;
    }, [accessToken]);

    useEffect(() => {
        const handleOrderEntryTransaction = (
            event: CustomEvent<{ customerId: string; transactionId: string }>
        ) => {
            const { customerId, transactionId } = event.detail;
            router.push(
                `/customers/${customerId}/order-entry/${transactionId}`
            );
        };

        const handleIllustrationsCreateCase = () => {
            router.push(`/illustrations/client-cases/new`);
        };

        const handleIllustrationsQuickQuote = () => {
            router.push(`/illustrations/client-cases/quick-quote`);
        };

        window.addEventListener(
            'zembed:order-entry-transaction',
            handleOrderEntryTransaction as EventListener
        );

        window.addEventListener(
            'zembed:illustrations-create-case',
            handleIllustrationsCreateCase as EventListener
        );

        window.addEventListener(
            'zembed:illustrations-quick-quote',
            handleIllustrationsQuickQuote as EventListener
        );

        return () => {
            window.removeEventListener(
                'zembed:order-entry-transaction',
                handleOrderEntryTransaction as EventListener
            );

            window.removeEventListener(
                'zembed:illustrations-create-case',
                handleIllustrationsCreateCase as EventListener
            );

            window.removeEventListener(
                'zembed:illustrations-quick-quote',
                handleIllustrationsQuickQuote as EventListener
            );
        };
    }, [router]);

    const zembedConfig = useMemo(
        () => ({
            modules: ['contact-management'],
            debug: process.env.NODE_ENV === 'development',
            accessToken: getAccessToken,
        }),
        [getAccessToken]
    );

    const { success, error } = useZEmbedInit(zembedConfig);

    if (error) {
        return <div>Error embedding component: {error?.message}</div>;
    }

    if (!success) {
        return (
            <div className={styles.loaderContainer}>
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    }

    return (
        <zen-contact-management id="contact-management"></zen-contact-management>
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
                    'getServerSidePropsCustomersPage::Access token expired',
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
        file: 'customers/index',
        function: 'getServerSideProps',
        page: 'customers/index',
    }
);
