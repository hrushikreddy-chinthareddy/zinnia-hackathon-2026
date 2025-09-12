import { getAccessToken } from '@auth0/nextjs-auth0';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import { TranslationFiles } from '@deps/config/translations';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { downloadFormById } from '@deps/queries/api/c2web';
import {
    SegmentPageName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
import { b64ToBlob } from '@deps/utils/blob';
import { browserLogError, browserLogInfo } from '@deps/utils/browser-logging';
import {
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

interface FormViewerProps extends SegmentTrackedPageProps {
    formId: number;
}

const FormViewer = ({ formId, user }: FormViewerProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'policy.documents' });

    const [url, setUrl] = useState<string | undefined>();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useSegmentPageTracker(user, SegmentPageName.FormViewer, { formId });

    useEffect(() => {
        const getForms = async () => {
            try {
                browserLogInfo('GetCallCenterForms:: fetching document...', {
                    formId,
                });
                setIsLoading(true);
                const response = await downloadFormById(formId);

                const blob = b64ToBlob(response ?? '', 'application/pdf');
                if (blob) {
                    const objectURL = URL.createObjectURL(blob);
                    setUrl(objectURL);
                }
            } catch (e: any) {
                setError(true);
                browserLogError('GetCallCenterForms::Error fetching document', {
                    error: e,
                    formId,
                });
            } finally {
                setIsLoading(false);
            }
        };

        getForms();
    }, [formId]);

    if (error) {
        return <p>{t('pdfError' as string)}</p>;
    }

    return (
        <div className="h-full w-full flex flex-col">
            <>
                {isLoading ? (
                    <div className="mb-4 mt-8">
                        <PageLoader variant={PageLoaderVariant.Center} />
                    </div>
                ) : (
                    <iframe
                        src={url}
                        width="100%"
                        height="100%"
                        title="Document Viewer"
                        className="border-0"
                    />
                )}
            </>
        </div>
    );
};

const FormViewerPage = (props: FormViewerProps) => (
    <>
        <PageHead titleKey="formData" />
        <div className="h-screen w-screen overflow-hidden fixed top-0 left-0 z-50 bg-white">
            <FormViewer {...props} />
        </div>
    </>
);

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const { locale = DEFAULT_LOCALE, params, res, req } = context;

            try {
                (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('documents:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            const formId = (params?.formId as string) || '';

            if (!formId) {
                logWarn('documents:: No form id provided', {
                    ...loggingContext,
                });
                return {
                    redirect: {
                        destination: '/406',
                        permanent: false,
                    },
                };
            }
            try {
                const translations = await serverSideTranslations(
                    locale,
                    [TranslationFiles.COMMON, TranslationFiles.COLDEFS],
                    nextI18nextConfig,
                    ALL_LOCALES
                );

                return {
                    props: {
                        locale,
                        ...translations,
                        formId: Number(formId),
                    },
                };
            } catch (e) {
                return {
                    props: {},
                };
            }
        },
    },
    {
        file: 'contact-center/document/[formId]/index',
        function: 'getServerSideProps',
        page: 'contact-center/document/:formId',
    }
);

export default FormViewerPage;
