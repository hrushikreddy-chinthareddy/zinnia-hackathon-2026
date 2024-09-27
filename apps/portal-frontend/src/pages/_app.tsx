import '@deps/styles/styles.css';
import '@zinnia/bloom/css';

import { UserProvider, useUser } from '@auth0/nextjs-auth0/client';
import { datadogRum } from '@datadog/browser-rum';
import { GoogleAnalytics } from '@next/third-parties/google';
import { AppProps } from 'next/app';
import { Lato, Poppins } from 'next/font/google';
import Head from 'next/head';
import { appWithTranslation } from 'next-i18next';
import { useEffect } from 'react';

import { DEFAULT_PAGE_TITLE } from '@deps/constants/page-title';
import { ApplicationDataProvider } from '@deps/contexts/ApplicationContext';
import { initializeBrowserLogging } from '@deps/utils/browser-logs';

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['200', '300', '400', '500', '600', '700', '800'],
    variable: '--font-family-primary'
});
const lato = Lato({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-family-secondary'
});

if (process.env.NODE_ENV === 'production') {
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

const AppHead = () => {
    // DEPU-1025 to clean up only required user fields once we start collecting data
    const { user } = useUser();

    useEffect(() => {
        const rumId = user && user.sub ? user.sub : null;
        const rumEmail = rumId && user?.email ? user?.email.replace(/^.*@/, `${user?.sub}@`) : null;
        const emailDomainRegex = /(?<=@)[^.]+(?=\.)/;
        const emailDomain = rumId && user?.email ? user?.email.match(emailDomainRegex) : null;
        if (process.env.NODE_ENV === 'production' && rumId) {
            datadogRum.setUser({
                id: rumId,
                ...(rumEmail && { email: rumEmail }),
                ...(emailDomain && { domain: emailDomain[0] }),
            });
        }
    }, [user]);

    return (
        <Head>
            <title>{DEFAULT_PAGE_TITLE}</title>
            <meta name="description" content="DEPS Frontend" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
            <link rel="alternate" hrefLang="x-default" href="/" />
            <link rel="alternate" hrefLang="en" href="/en/" />
            <link rel="alternate" hrefLang="fr" href="/fr/" />
        </Head>
    );
};

const AppBody = ({ Component, pageProps }: AppProps) => {
    return (
        <ApplicationDataProvider pageProps={pageProps}>
            <Component {...pageProps} />
        </ApplicationDataProvider>
    );
};

function isClient() {
    return typeof window !== 'undefined';
}

const App = (props: AppProps) => {
    if (isClient() && process.env.NODE_ENV === 'production') {
        // initializing the browser logs to datadog
        initializeBrowserLogging();
    }
    return (
        <main className={`${poppins.variable} ${lato.variable}`}>
            <UserProvider>
                <AppHead />
                <AppBody {...props} />
                {process.env.NEXT_PUBLIC_GOOGLEANALYTICS_ENV === 'production' && <GoogleAnalytics gaId="G-1NY7KTG7T3" />}
            </UserProvider>
        </main>
    );
};

export default appWithTranslation(App as any);
