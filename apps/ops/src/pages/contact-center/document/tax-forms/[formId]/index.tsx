import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { deleteCookie, getCookies } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useEffect, useState } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import PdfPreview from '@deps/containers/documents-page/pdf-preview';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { UserPermission } from '@deps/models/user-profile';
import { downloadTaxFormById } from '@deps/queries/api/tax-forms';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

interface FormViewerProps extends SegmentTrackedPageProps {
    formId: number;
    contractNumber: string;
    carrierCode: string;
    fChar: string;
    taxYear: string;
}

const FormViewer = ({ formId, user, contractNumber, carrierCode, fChar, taxYear }: FormViewerProps) => {
    const [pdf, setPdf] = useState<string | null>(null);

    useSegmentPageTracker(user, SegmentPageName.FormViewer, { formId });
    const { featureFlags } = useOptimizely();

    useEffect(() => {
        const getForms = async () => {
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
                console.error('GetCallCenterForms::Error call center forms', e);
            }
        };
        getForms();
    }, [carrierCode, contractNumber, fChar, formId, taxYear, featureFlags]);

    return <>{pdf && <PdfPreview documentBinary={pdf} />}</>;
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        const user = await getUserData(context);
        const { locale = DEFAULT_LOCALE, params, res, req } = context;
        let accessToken;
        try {
            accessToken = (await getAccessToken(req, res)).accessToken;
        } catch (e) {
            logWarn('documents:: Access token expired', {
                ...parseErrorInformation(e),
                file: 'documents',
                function: 'getServerSideProps',
            });
            return serverSidePropsLogout();
        }

        const hasPermissionToReadCaseManagement = await doesUserHavePagePermissions(
            accessToken,
            user,
            UserPermission.AllowReadCaseManagement
        );
        if (!hasPermissionToReadCaseManagement) {
            return {
                redirect: {
                    destination: '/403',
                    permanent: false,
                },
            };
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
});

export default FormViewer;
