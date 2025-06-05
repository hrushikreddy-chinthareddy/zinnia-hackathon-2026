import { getAccessToken } from '@auth0/nextjs-auth0';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';

import PageLoader from '@deps/components/page-loader/page-loader';
import { PageHead } from '@deps/components/page-title';
import { TranslationFiles } from '@deps/config/translations';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { downloadFormById } from '@deps/queries/api/c2web';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';
interface FormViewerProps extends SegmentTrackedPageProps {
    formId: number;
}

const FormViewer = ({ formId, user }: FormViewerProps) => {
    const { t } = useTranslation(undefined, { keyPrefix: 'policy.documents' });
    const [pdf, setPdf] = useState<string | null>(null);
    const [pdfError, setPdfError] = useState<boolean>(false);

    useSegmentPageTracker(user, SegmentPageName.FormViewer, { formId });

    useEffect(() => {
        const getForms = async () => {
            try {
                const response = await downloadFormById(formId);

                setPdf(response);
            } catch (e: any) {
                setPdfError(true);
                console.error('GetCallCenterForms::Error call center forms', e);
            }
        };

        getForms();
    }, [formId]);

    if (!pdf) return <PageLoader />;
    if (pdfError) return <p>{t('pdfError' as string)}</p>;

    return (
        <iframe
            src={`data:application/pdf;base64,${pdf}`}
            width="100%"
            height="100%"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                border: 'none',
            }}
        />
    );
};

const FormViewerPage = (props: FormViewerProps) => (
    <>
        <PageHead titleKey="viewDocument" />
        <FormViewer {...props} />
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
    { file: 'contact-center/document/[formId]/index', function: 'getServerSideProps', page: 'contact-center/document/:formId' }
);

export default FormViewerPage;
