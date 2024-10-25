import { AdditionalDataInstance } from './additional-data-instance';

export type DocumentInstance = {
    id: string;
    name: string;
    documentNumber?: string; // BPB - added to the spec example, but not the schema
    documentUploadDate?: string; // BPB - added to spec example, but not the schema
    source: string;
    url: string; // BPB - optimistic schema per case management
    updatedAt: string;
    additionalData: AdditionalDataInstance;
    eventRef: string[];
    fileType?: string | null;
};
