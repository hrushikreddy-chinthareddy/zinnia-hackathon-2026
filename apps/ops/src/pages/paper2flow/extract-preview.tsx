import { getAccessToken } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { ExtractPdfPreviewPanel } from '@deps/components/paper2flow/extract-pdf-preview-panel';
import { TranslationFiles } from '@deps/config/translations';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import {
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

const Paper2flowExtractPreviewPage = () => {
    return (
        <div className="flex w-full flex-col overflow-auto px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
            <div className="mb-8">
                <h1 className="typography-desktop-headline-1-d text-gray-900">
                    Paper2Flow — PDF text extract
                </h1>
                <p className="mt-2 max-w-3xl text-sm text-gray-600">
                    Upload a PDF to run the PDF.js text-layer extractor (same
                    output as{' '}
                    <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                        POST /api/paper2flow/extract-pdf
                    </code>
                    ). Requires sign-in. Non-production only. On localhost,
                    paste page{' '}
                    <code className="rounded bg-gray-100 px-1 text-xs">
                        fullText
                    </code>{' '}
                    into{' '}
                    <Link
                        href="/schema-builder"
                        className="font-medium text-blue-700 underline"
                    >
                        RJSF Schema Builder
                    </Link>{' '}
                    to draft forms.
                </p>
            </div>
            <ExtractPdfPreviewPanel />
        </div>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const { locale = DEFAULT_LOCALE, req, res } = context;
            try {
                (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('paper2flow/extract-preview::access token', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON],
                nextI18nextConfig,
                ALL_LOCALES
            );

            return {
                props: {
                    ...translations,
                },
            };
        },
    },
    {
        file: 'paper2flow/extract-preview',
        function: 'getServerSideProps',
        page: 'paper2flow-extract-preview',
    }
);

export default Paper2flowExtractPreviewPage;
