import { saveAs } from 'file-saver';
import { useCallback, useState } from 'react';

import { DocumentTypeView } from '@deps/components/side-sheet/documents/documents-content';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { PolicyDocument, supportedExtensions, DocumentDownloadWithMime } from '@deps/models/case/document';
import { downloadDocumentV2, downloadDocumentV3 } from '@deps/queries/api/documents';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
export const isPreviewSupported = (document: PolicyDocument): boolean => {
    return supportedExtensions.includes(document?.fileType?.toLowerCase());
};

// Converts the Base 64 encoded binaryData string into a blob on the client to allow for downloading.
export const b64ToBlob = (b64data: string, contentType = 'application/octet-stream'): Blob | null => {
    try {
        const chunkSize = 1024;
        const byteChars = atob(b64data);

        const chunks = [];

        for (let i = 0; i < byteChars.length; i += chunkSize) {
            const chunk = byteChars.slice(i, i + chunkSize);

            const byteArray = new Uint8Array(chunk.length);
            for (let j = 0; j < chunkSize; ++j) {
                byteArray[j] = chunk.charCodeAt(j);
            }

            chunks.push(byteArray);
        }

        const blob = new Blob(chunks, { type: contentType });
        return blob;
    } catch (error) {
        console.error('document-downloader::b64ToBlob::Error converting document response to Blob', error);
        return null;
    }
};

// Handles downloading of a document.  Provides a loading state and the download method.
export const useDocumentDownload = (
    documentId: string,
    documentType: DocumentTypeView,
    carrierCode: string,
    documentName: string
): [boolean, () => void] => {
    const { featureFlags } = useOptimizely();
    const [blob, setBlob] = useState<Blob | null>(null);
    const [document, setDocument] = useState<DocumentDownloadWithMime | null>(null);
    const [loading, setLoading] = useState(false);

    const download = useCallback(async () => {
        if (blob && document) {
            saveAs(blob, `${documentName.replace(/[^A-Z0-9]/gi, '')}.${document.fileExtension}`);
            return;
        }
        if (document || loading || blob) return;

        try {
            setLoading(true);
            const downloader = featureFlags[FEATURE_FLAGS.DOCUMENTS_V3] ? downloadDocumentV3 : downloadDocumentV2;

            const doc = await downloader(documentId, documentType, carrierCode);
            if (doc?.binaryData && doc?.fileExtension) {
                const docBlob = b64ToBlob(doc.binaryData, doc.mimeType);
                if (!docBlob) {
                    console.error('DocumentDownload::download::no-blob');
                    throw new Error('No blob created');
                }
                setDocument(doc);
                setBlob(docBlob);
                saveAs(docBlob, `${documentName.replace(/[^A-Z0-9]/gi, '')}.${doc.fileExtension}`);
            }
        } catch (e) {
            console.error('DocumentDownloader::download::error downloading document', e);
        } finally {
            setLoading(false);
        }
    }, [carrierCode, document, documentId, documentName, documentType, loading, setDocument, setLoading, featureFlags, blob]);

    return [loading, download];
};
