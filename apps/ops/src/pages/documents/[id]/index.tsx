import { getAccessToken } from '@auth0/nextjs-auth0';
import { SearchRequest } from '@zinnia/api-types/types/documents-v3';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { PageHead } from '@deps/components/page-title';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import { TranslationFiles } from '@deps/config/translations';
import { OptimizelyVariableKey } from '@deps/contexts/OptimizelyContext';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helpers';
import { ALL_LOCALES, DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { useSegmentPageTracker } from '@deps/hooks/useSegmentPageTracker';
import {
    DocumentDownloadV2WithMime,
    supportedTiffExtensions,
} from '@deps/models/case/document';
import documentDownloadV2 from '@deps/queries/server/documents/v2/download';
import documentDownload from '@deps/queries/server/documents/v3/download';
import { DocumentDownloadV3WithMime } from '@deps/types/documents-v3';
import {
    SegmentPageName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
import { b64ToBlob } from '@deps/utils/blob';
import { TiffConversion } from '@deps/utils/fileviewer/tiffConversion';
import {
    isFeatureFlagVariableActive,
    optimizelyService,
} from '@deps/utils/optimizely/optimizely';
import { FEATURE_FLAG_VARIABLES } from '@deps/utils/optimizely/variables';
import {
    logWarn,
    parseErrorInformation,
    withPageAuthAndLogging,
} from '@deps/utils/server-logging';
import nextI18nextConfig from 'next-i18next.config';

const DocumentViewerPage = ({
    doc,
    user,
}: SegmentTrackedPageProps & {
    doc: DocumentDownloadV2WithMime | DocumentDownloadV3WithMime;
}) => {
    useSegmentPageTracker(user, SegmentPageName.DocumentViewer);
    const blob = b64ToBlob(
        doc.binaryData || '',
        doc.mimeType || 'application/pdf'
    );

    const url = blob ? URL.createObjectURL(blob) : '';
    return (
        <>
            <PageHead titleKey="formData" />
            <div className="h-screen w-screen">
                <iframe src={url} width="100%" height="100%" />
            </div>
        </>
    );
};

export const getServerSideProps = withPageAuthAndLogging(
    {
        getServerSideProps: async (context, loggingContext) => {
            const user = await getUserData(context);
            const {
                params,
                res,
                req,
                query,
                locale = DEFAULT_LOCALE,
            } = context;
            let accessToken;
            try {
                accessToken = (await getAccessToken(req, res)).accessToken;
            } catch (e) {
                logWarn('documents:: Access token expired', {
                    ...parseErrorInformation(e),
                    ...loggingContext,
                });
                return serverSidePropsLogout();
            }

            const id = (params?.id as string) || '';

            if (!accessToken) {
                return {
                    redirect: {
                        destination: '/',
                        permanent: false,
                    },
                };
            }

            const documentType = query.documentType as string;
            const carrierCode = query.carrierCode as string;

            if (!documentType || !carrierCode || !id) {
                return {
                    redirect: {
                        destination: '/406',
                        permanent: false,
                    },
                };
            }
            const featureFlagVariables =
                await optimizelyService.getAllFeatureFlagVariables(
                    user.sub,
                    loggingContext
                );

            const useV3 = isFeatureFlagVariableActive(
                featureFlagVariables,
                FEATURE_FLAG_VARIABLES.DOCUMENTS_V3_FEATURE_FLAG,
                OptimizelyVariableKey.Clients,
                carrierCode?.toLocaleLowerCase() || ''
            );

            let docDownload;
            if (useV3) {
                let docClass;
                switch (documentType) {
                    case DocumentTypeView.Correspondence:
                        docClass =
                            SearchRequest.documentClassification.OUTBOUND;
                        break;
                    case DocumentTypeView.Policy:
                    default:
                        docClass = SearchRequest.documentClassification.INBOUND;
                        break;
                }
                docDownload = await documentDownload({
                    accessToken: accessToken,
                    partyId: user.partyId,
                    documentId: id,
                    parentCarrierCode: carrierCode,
                    documentClassification: docClass,
                    loggingContext,
                });
            } else {
                docDownload = await documentDownloadV2({
                    accessToken: accessToken,
                    partyId: user.partyId,
                    documentId: id,
                    clientCode: carrierCode,
                    source: documentType,
                    loggingContext,
                });
            }

            if (!docDownload) {
                return {
                    redirect: {
                        destination: '/404',
                        permanent: false,
                    },
                };
            }

            if (docDownload.error) {
                return {
                    redirect: {
                        destination: '/406',
                        permanent: false,
                    },
                };
            }
            const translations = await serverSideTranslations(
                locale,
                [TranslationFiles.COMMON],
                nextI18nextConfig,
                ALL_LOCALES
            );

            if (
                docDownload?.mimeType === 'image/tiff' ||
                supportedTiffExtensions.includes(docDownload?.fileExtension)
            ) {
                const { tiffBuffer, success } = await TiffConversion({
                    binaryData: docDownload.binaryData,
                });

                if (success) {
                    docDownload.mimeType = 'image/png';
                    docDownload.fileExtension = 'png';
                }
                docDownload.binaryData = tiffBuffer.toString('base64');
            }

            return {
                props: { locale, ...translations, user, doc: docDownload },
            };
        },
    },
    {
        file: 'documents/[id]/index',
        function: 'getServerSideProps',
        page: 'documents/:id',
    }
);

export default DocumentViewerPage;
