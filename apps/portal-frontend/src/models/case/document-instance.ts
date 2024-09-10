import { AdditionalDataInstance } from './additional-data-instance';

export type DocumentInstance = {
    id: string;
    name: string;
    source: string;
    url: string;
    updatedAt: string;
    additionalData: AdditionalDataInstance;
    eventRef: string[];
};
