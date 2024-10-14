import { IdentifierInstance } from './identifier-instance';

export type EventInstance = {
    _id?: string;
    id: string;
    eventGroup: any;
    payload: any;
    source: string;
    eventName: string;
    eventTs: string; // This can be changed to 'Date' if you want to store a Date object instead of a string
    correlationId: string;
    identifiers: IdentifierInstance[];
};
