import { getAccessToken } from '@auth0/nextjs-auth0';
import { deleteCookie, getCookies } from 'cookies-next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';

import PageLoader from '@deps/components/page-loader/page-loader';
import { TranslationFiles } from '@deps/config/translations';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { downloadTaxFormById } from '@deps/queries/api/tax-forms';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { logWarn, parseErrorInformation, withPageAuthAndLogging } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

interface FormViewerProps extends SegmentTrackedPageProps {
    formId: number;
    contractNumber: string;
    carrierCode: string;
    fChar: string;
    taxYear: string;
}

// NOTE!  This FormViewer is now shared between Policy Management and Contact Center.  If substantial changes are made to this page, they should be made to both places
const FormViewer = ({ formId, user, contractNumber, carrierCode, fChar, taxYear }: FormViewerProps) => {
    const [pdf, setPdf] = useState<string | null>(null);
    const [pdfError, setPdfError] = useState<boolean>(false);

    useSegmentPageTracker(user, SegmentPageName.FormViewer, { formId });
    const { featureFlags } = useOptimizely();

    useEffect(() => {
        const getForms = async () => {
            // short circuit if there are no required params
            if (![carrierCode, contractNumber, fChar, taxYear, formId, featureFlags].every(Boolean)) return;

            try {
                const response = await downloadTaxFormById(
                    formId,
                    { contractNumber, clientCode: carrierCode, fChar, taxYear },
                    featureFlags[FEATURE_FLAGS.DOCUMENTS_V3]
                );

                if (response?.binaryData) {
                    setPdf(response?.binaryData);
                } else {
                    throw new Error('No document data provided');
                }
            } catch (e: any) {
                setPdfError(true);
                console.error('GetCallCenterForms::Error call center forms', e);
            }
        };
        getForms();
    }, [carrierCode, contractNumber, fChar, formId, taxYear, featureFlags]);

    if (!pdf) return <PageLoader />;
    if (pdfError) return <p>An error occured while loading the PDF.</p>;

    return (
        pdf && (
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
        )
    );
};

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
                const { contractNumber, carrierCode, fChar, taxYear } = getCookies({ req, res });

                deleteCookie('contractNumber');
                deleteCookie('carrierCode');
                deleteCookie('fChar');
                deleteCookie('taxYear');

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
                        contractNumber,
                        carrierCode,
                        fChar,
                        taxYear,
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
        file: 'contact-center/document/tax-forms/[formId]/index',
        function: 'getServerSideProps',
        page: 'contact-center/document/tax-forms/:formId',
    }
);

export default FormViewer;
