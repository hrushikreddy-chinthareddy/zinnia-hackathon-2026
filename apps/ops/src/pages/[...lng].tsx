import { getAccessToken } from '@auth0/nextjs-auth0';
import { AppProps } from 'next/app';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { TranslationFiles } from '@deps/config/translations';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import Error from '@deps/pages/404s';
import {
    logWarn,
    parseErrorInformation,
    logInfo,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

// THIS IS THE 404 page. This allows us to include translations and server-side funtionality
// to a page that is usually statically generated.
const CatchAllPage = (pageProps: AppProps['pageProps']) => {
    return <Error {...pageProps} />;
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const { locale = DEFAULT_LOCALE, req, res } = context;
            try {
                (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('pages/[...lng]:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            const fullPath = context.req.url;

            logInfo('Accessed non-existent page', {
                originalPath: fullPath,
                ...loggingContext,
            });

            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                nextI18nextConfig,
                ALL_LOCALES
            );
            return { props: { locale, ...translations } };
        },
    },
    { file: '[...lng]', function: 'getServerSideProps', page: '404' }
);

export default CatchAllPage;
