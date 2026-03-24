import { AxiosResponse } from 'axios';

import { Note } from '@deps/models/case/task-instance';
import { baseAppUrl } from '@deps/queries/api-config';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';

import { client } from '../api-utils/client';

export interface SearchNotesFilters {
    externalTaskId: string;
    entityType: string;
}

const transactionSearchUrl =
    baseAppUrl + '/api/transactions/v1/transaction/search';

export interface SearchNotesPayload {
    identifiers: { identifier: string; value: string }[];
    entityType: string[];
}

export interface NotesResponse {
    entity: {
        notesDetails: {
            notes: Note[];
        };
    };
}

export const searchNotesByCaseId = async (
    filters: SearchNotesFilters
): Promise<NotesResponse[] | null> => {
    const loggingContext = {
        file: 'queries/api/transaction-search',
        function: 'searchNotesByCaseId',
        inputs: { filters },
    };

    const payload: SearchNotesPayload = {
        identifiers: [
            {
                identifier: 'internalTaskExternalId',
                value: filters.externalTaskId,
            },
        ],
        entityType: [filters.entityType],
    };

    try {
        const { data } = await client.post<any, AxiosResponse<NotesResponse[]>>(
            transactionSearchUrl,
            payload
        );
        return data;
    } catch (e: any) {
        browserLogError('transactions::searchNotesByCaseId::error', {
            ...parseErrorInformation(e),
            ...loggingContext,
        });
        return null;
    }
};
