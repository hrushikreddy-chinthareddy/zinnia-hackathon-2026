import { HttpStatusCode } from 'axios';
import { useEffect, useState, useRef, ChangeEvent, useCallback } from 'react';

import { getDocumentSearchResultsQuery } from '@deps/queries/tanstack/documentQueries/document-queries';
import { browserLogError } from '@deps/utils/browser-logging';
import { parseErrorInformation } from '@deps/utils/server-logging';
import {
    SearchRequest,
    MetadataSearchResponse,
    DocumentClassificationEnum,
} from '@zinnia/api-types/types/documents-v3';

export interface FileSearchContextData {
    carrier?: string;
    caseId?: string;
    readonly?: boolean;
    disabled?: boolean;
}

export const useFileSearch = ({
    carrier,
    caseId,
    readonly,
    disabled,
    limit = 25,
    offset = 0,
}: FileSearchContextData & { limit?: number; offset?: number }) => {
    const [documents, setDocuments] = useState<MetadataSearchResponse[]>([]);
    const [filteredDocuments, setFilteredDocuments] = useState<
        MetadataSearchResponse[]
    >([]);
    const [inputValue, setInputValue] = useState('');
    const [fetchingDocuments, setFetchingDocuments] = useState(false);
    const [error, setError] = useState(false);
    const inputRef = useRef<HTMLDivElement>(null);

    const fetchDocuments = useCallback(async () => {
        if (!caseId || !carrier) return;

        try {
            setFetchingDocuments(true);

            const searchBody: SearchRequest = {
                documentClassification: DocumentClassificationEnum.INBOUND,
                zinniaLiveCaseId: caseId,
                parentCarrierCode: carrier,
            };

            const { data, status } = await getDocumentSearchResultsQuery(
                searchBody,
                limit,
                offset
            );

            if (status === HttpStatusCode.Ok && data) {
                setDocuments(data as MetadataSearchResponse[]);
                setError(false);
            } else {
                setError(true);
            }
        } catch (err) {
            browserLogError(
                'useFileSearch::fetchDocuments failed',
                parseErrorInformation(err)
            );
            setError(true);
        } finally {
            setFetchingDocuments(false);
        }
    }, [carrier, caseId, limit, offset]);

    const filterDocuments = useCallback(
        (query: string) => {
            if (!query.trim()) {
                setFilteredDocuments(documents);
                return;
            }

            const filtered = documents.filter(
                (doc) =>
                    doc.documentId
                        ?.toLowerCase()
                        .includes(query.toLowerCase()) ||
                    doc.displayName?.toLowerCase().includes(query.toLowerCase())
            );

            setFilteredDocuments(filtered);
        },
        [documents]
    );

    const handleFocus = useCallback(() => {
        if (readonly || disabled) return;
        filterDocuments(inputValue ?? '');
    }, [readonly, disabled, inputValue, filterDocuments]);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (
            inputRef.current &&
            !inputRef.current.contains(event.target as Node)
        ) {
            setFilteredDocuments([]);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [handleClickOutside]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setInputValue(value);
        filterDocuments(value);
    };

    const clearFiltered = () => setFilteredDocuments([]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    return {
        inputRef,
        inputValue,
        setInputValue,
        fetchingDocuments,
        error,
        documents,
        filteredDocuments,
        handleChange,
        filterDocuments,
        clearFiltered,
        handleFocus,
        handleClickOutside,
    };
};
