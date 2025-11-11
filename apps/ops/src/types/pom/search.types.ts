import { ProducerType } from '.';

interface GetProducersResponse {
    count: number;
    next: string;
    previous: string;
    results: SearchResult[];
}

interface SearchResult {
    producerType: ProducerType;
    id: string;
    firstName?: string;
    lastName?: string;
    producerName?: string;
    nationalProducerNumber: string;
    email?: string;
    phone?: string;
}

export type { SearchResult, GetProducersResponse };
