import { DocumentDownloadResponse } from '@zinnia/api-types/types/documents-v3';

export type DocumentDownloadV3WithMime = DocumentDownloadResponse & {
    mimeType: string;
};
