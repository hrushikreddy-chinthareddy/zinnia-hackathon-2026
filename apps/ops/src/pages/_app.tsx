import '@deps/styles/styles.css';
import '@zinnia/bloom/css';
import '@zinnia/bloom/themes/bloom';
import '@zinnia/bloom/themes/farmers';
import '@radix-ui/themes/styles.css';

import { UserProvider, useUser } from '@auth0/nextjs-auth0/client';
import { datadogRum } from '@datadog/browser-rum';
import { GoogleAnalytics } from '@next/third-parties/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppProps } from 'next/app';
import { Lato } from 'next/font/google';
import Head from 'next/head';
import { appWithTranslation, useTranslation } from 'next-i18next';
import { useEffect } from 'react';

import GaMouseflowTrackingScript from '@deps/components/analytics/GaMouseflowTrackingScript';
import PendoAnalyticsInit from '@deps/components/analytics/PendoAnalyticsInit';
import SegmentAnalyticsScript from '@deps/components/analytics/SegmentAnalyticsScript';
import { TranslationFiles } from '@deps/config/translations';
import { DEFAULT_PAGE_TITLE } from '@deps/constants/page-title';
import { ApplicationDataProvider } from '@deps/contexts/ApplicationContext';
import { NODE_ENV_PRODUCTION } from '@deps/types/constants';
import { initializeBrowserLogging } from '@deps/utils/browser-logs';
import { isProd } from '@deps/utils/environment.helpers';
import nextI18nextConfig from 'next-i18next.config';

const lato = Lato({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-family-secondary',
});

if (process.env.NODE_ENV === NODE_ENV_PRODUCTION) {
    datadogRum.init({
        applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID || '',
        clientToken: process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN || '',
        site: 'datadoghq.com',
        service: 'zinnia-live-xd',
        env: process.env.NEXT_PUBLIC_DATADOG_ENV || '',
        sessionSampleRate: 100,
        sessionReplaySampleRate: 20,
        trackUserInteractions: true,
        trackResources: true,
        trackLongTasks: true,
        version: process.env.NEXT_PUBLIC_GIT_SHA || '',
        defaultPrivacyLevel: 'mask',
    });

    datadogRum.startSessionReplayRecording();
}

const AppHead = ({ pageProps }: AppProps) => {
    // DEPU-1025 to clean up only required user fields once we start collecting data
    const { user } = useUser();
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'site.pageTitles',
    });
    useEffect(() => {
        const rumId = user && user.sub ? user.sub : null;
        const rumEmail = user?.email ? user?.email : null;
        const emailDomainRegex = /(?<=@)[^.]+(?=\.)/;
        const emailDomain =
            rumId && user?.email ? user?.email.match(emailDomainRegex) : null;

        if (process.env.NODE_ENV === NODE_ENV_PRODUCTION && rumId) {
            datadogRum.setUser({
                id: rumId,
                ...(rumEmail && { email: rumEmail }),
                ...(emailDomain && { domain: emailDomain[0] }),
            });
        }
    }, [user]);

    const title = pageProps?.subPageTitleKey
        ? `${t(pageProps.subPageTitleKey)} | ${DEFAULT_PAGE_TITLE}`
        : DEFAULT_PAGE_TITLE;

    return (
        <Head>
            <title>{title}</title>
            <meta
                name="description"
                content="Creating a modern experience today"
            />
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
            ({!isProd() && <meta name="robots" content="noindex, nofollow" />})
            <link
                rel="icon"
                href={process.env.NEXT_PUBLIC_FAVICON_PATH || '/favicon.ico'}
            />
            <link rel="alternate" hrefLang="x-default" href="/" />
            <link rel="alternate" hrefLang="en" href="/en/" />
            <link rel="alternate" hrefLang="fr" href="/fr/" />
        </Head>
    );
};

const AppBody = ({ Component, pageProps }: AppProps) => {
    return (
        <ApplicationDataProvider pageProps={pageProps}>
            <GaMouseflowTrackingScript />
            <Component {...pageProps} />
        </ApplicationDataProvider>
    );
};

function isClient() {
    return typeof window !== 'undefined';
}

const queryClient = new QueryClient();

queryClient.setDefaultOptions({
    queries: {
        staleTime: 60 * 1000, // 1 minute,
        retry: false,
    },
});

const App = (props: AppProps) => {
    if (isClient()) {
        // initializing the browser logs to datadog
        initializeBrowserLogging();
    }

    return (
        <QueryClientProvider client={queryClient}>
            <section className={`${lato.variable} relative`}>
                <UserProvider>
                    <AppHead {...props} />
                    <AppBody {...props} />
                    {process.env.NEXT_PUBLIC_GOOGLEANALYTICS_ENV ===
                        NODE_ENV_PRODUCTION && (
                        <GoogleAnalytics gaId="G-1NY7KTG7T3" />
                    )}
                    <PendoAnalyticsInit
                        userRolesMap={props.pageProps.userRolesMap}
                    />
                </UserProvider>
                <SegmentAnalyticsScript />
            </section>
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
};

export default appWithTranslation(App as any, nextI18nextConfig);
