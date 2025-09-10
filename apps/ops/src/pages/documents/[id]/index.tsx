import { getAccessToken } from '@auth0/nextjs-auth0';
import { SearchRequest } from '@zinnia/api-types/types/documents-v3';
import { Button } from '@zinnia/bloom/components';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
import Custom404Page from '@deps/pages/404s';
import documentDownloadV2 from '@deps/queries/server/documents/v2/download';
import documentDownload from '@deps/queries/server/documents/v3/download';
import { DocumentDownloadV3WithMime } from '@deps/types/documents-v3';
import {
    SegmentPageName,
    SegmentTrackedPageProps,
} from '@deps/types/segment-analytics';
import { b64ToBlob } from '@deps/utils/blob';
import {
    drawCanvas,
    renderTiffPagesToContainer,
    ViewerState,
} from '@deps/utils/fileviewer/tiffUtils';
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
    const { t } = useTranslation();
    useSegmentPageTracker(user, SegmentPageName.DocumentViewer);

    const containerRef = useRef<HTMLDivElement>(null);
    const viewerStatesRef = useRef<ViewerState[]>([]);
    const [url, setUrl] = useState<string | undefined>();
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    const isTiff =
        doc.mimeType === 'image/tiff' ||
        supportedTiffExtensions.includes(String(doc.fileExtension));

    useEffect(() => {
        if (!isTiff) {
            const blob = b64ToBlob(
                doc.binaryData ?? '',
                doc.mimeType ?? 'application/pdf'
            );
            if (blob) {
                const objectURL = URL.createObjectURL(blob);
                setUrl(objectURL);
            }
        }
    }, [doc, isTiff]);

    useEffect(() => {
        if (isTiff && containerRef?.current && doc.binaryData) {
            renderTiffPagesToContainer(
                doc.binaryData,
                containerRef?.current
            ).then((states) => {
                if (states) viewerStatesRef.current = states;
            });
        }
    }, [doc, isTiff]);

    const redrawAllPages = useCallback(() => {
        if (!containerRef.current) return;
        const canvases = containerRef.current.querySelectorAll('canvas');
        canvases.forEach((canvas, index) => {
            const viewerState = viewerStatesRef.current[index];
            if (viewerState) {
                viewerState.scale = scale;
                viewerState.rotation = rotation;
                drawCanvas(canvas, viewerState);
            }
        });
    }, [scale, rotation]);

    useEffect(() => {
        redrawAllPages();
    }, [redrawAllPages]);

    const zoomIn = () => setScale((prev) => prev + 0.1);
    const zoomOut = () => setScale((prev) => Math.max(0.1, prev - 0.1));
    const rotate = () => setRotation((prev) => (prev + 90) % 360);

    return (
        <>
            <PageHead titleKey="formData" />
            <div className="h-screen w-screen flex flex-col">
                {isTiff && (
                    <div className="flex justify-center mt-4 mb-8 space-x-4">
                        <Button
                            aria-label={t('policy.documents.zoomIn') as string}
                            onClick={zoomIn}
                            mode="primary"
                            type="button"
                            size="large"
                        >
                            {t('policy.documents.zoomIn')}
                        </Button>
                        <Button
                            aria-label={t('policy.documents.zoomOut') as string}
                            onClick={zoomOut}
                            mode="primary"
                            size="large"
                            type="button"
                            selected={false}
                        >
                            {t('policy.documents.zoomOut')}
                        </Button>
                        <Button
                            aria-label={t('policy.documents.rotate') as string}
                            onClick={rotate}
                            mode="primary"
                            type="button"
                            size="large"
                        >
                            {t('policy.documents.rotate')}
                        </Button>
                    </div>
                )}
                {isTiff ? (
                    <div className="flex-1 overflow-auto relative">
                        <div className="flex justify-center relative min-w-max">
                            <div
                                ref={containerRef}
                                className="relative inline-block [transform-origin:center]"
                            />
                        </div>
                    </div>
                ) : url ? (
                    <iframe src={url} width="100%" height="100%" />
                ) : (
                    <Custom404Page />
                )}
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

            if ((!useV3 && !documentType && !carrierCode) || !id) {
                return {
                    redirect: {
                        destination: '/406',
                        permanent: false,
                    },
                };
            }

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
