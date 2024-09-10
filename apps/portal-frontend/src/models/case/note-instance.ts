import { AdditionalDataInstance } from './additional-data-instance';

export type NoteInstance = {
    id: string;
    desc: string;
    note: string;
    author: string;
    updatedAt: string;
    additionalData: AdditionalDataInstance;
    eventRef: string[];
    internal?: boolean;
};
