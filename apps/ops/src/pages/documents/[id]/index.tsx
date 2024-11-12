import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { deleteCookie, getCookies } from 'cookies-next';
import { GetServerSidePropsContext } from 'next';
import dynamic from 'next/dynamic';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { DocumentViewerProps } from '@deps/components/document-viewer/document-viewer';
import { PageHead } from '@deps/components/page-title';
import { TranslationFiles } from '@deps/config/translations';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { doesUserHavePagePermissions, getUserData } from '@deps/helpers/query-data.helper';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helper';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import { UserPermission } from '@deps/models/user-profile';
import { SegmentPageName, SegmentTrackedPageProps } from '@deps/types/segment-analytics';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

const DocumentViewer = dynamic(() => import('@deps/components/document-viewer/document-viewer'), {
    ssr: false,
});

interface DocumentViewerPageProps extends DocumentViewerProps,SegmentTrackedPageProps { }

const DocumentViewerPage = (props: DocumentViewerPageProps) => {
    useSegmentPageTracker(props.user, SegmentPageName.DocumentViewer, {
        id: props.id,
        documentType: props.documentType,
        carrierCode: props.carrierCode
    });

    return (
        <>
            <PageHead titleKey="formData" />
            <DocumentViewer {...props} />
        </>
    );
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

        const hasPermissionToReadCaseManagement = await doesUserHavePagePermissions(accessToken, user, UserPermission.AllowReadCaseManagement);
        if (!hasPermissionToReadCaseManagement) {
            return {
                redirect: {
                    destination: '/403',
                    permanent: false,
                },
            };
        }

        const { documentType, carrierCode } = getCookies({ req, res });
        const id = (params?.id as string) || '';

        deleteCookie('carrierCode');
        deleteCookie('documentType');

        if (!documentType || !carrierCode || !id) {
            return {
                redirect: {
                    destination: '/406',
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
                locale,
                ...translations,
                id,
                documentType,
                carrierCode,
                user,
            },
        };
    },
});

export default DocumentViewerPage;
