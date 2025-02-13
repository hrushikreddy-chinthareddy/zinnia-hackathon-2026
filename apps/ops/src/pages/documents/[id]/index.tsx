import { getAccessToken, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { SearchRequest } from '@zinnia/api-types/types/documents-v3';
import { GetServerSidePropsContext } from 'next';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import { serverSidePropsLogout } from '@deps/helpers/logout.helpers';
import { getUserData } from '@deps/helpers/query-data.helper';
import documentDownloadV2 from '@deps/queries/server/documents/v2/download';
import documentDownload from '@deps/queries/server/documents/v3/download';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags, optimizelyService } from '@deps/utils/optimizely/optimizely';
import { logWarn, parseErrorInformation } from '@deps/utils/server-logging';

const DocumentViewerPage = () => {
    return null;
};

export const getServerSideProps = withPageAuthRequired({
    getServerSideProps: async (context: GetServerSidePropsContext) => {
        const user = await getUserData(context);
        const { params, res, req, query } = context;
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

        const featureFlagDecisions: FeatureFlags = await optimizelyService.getFeatureFlagDecisions(user.sub);

        let docDownload;
        if (featureFlagDecisions[FEATURE_FLAGS.DOCUMENTS_V3]) {
            let docClass;
            switch (documentType) {
                case DocumentTypeView.Correspondence:
                    docClass = SearchRequest.documentClassification.OUTBOUND;
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
            });
        } else {
            docDownload = await documentDownloadV2({
                accessToken: accessToken,
                partyId: user.partyId,
                documentId: id,
                clientCode: carrierCode,
                source: documentType,
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

        res.setHeader('Content-Type', docDownload.mimeType);
        res.setHeader('Content-Disposition', `inline; filename=document.${docDownload.fileExtension}`);

        res.end(Buffer.from(docDownload.binaryData, 'base64'));

        return {
            props: {},
        };
    },
});

export default DocumentViewerPage;
