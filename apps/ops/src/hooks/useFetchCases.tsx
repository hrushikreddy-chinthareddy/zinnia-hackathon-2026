import { useState, useCallback, Dispatch, SetStateAction, useEffect } from 'react';

import { isEmptyObject } from '@deps/helpers/objects.helper';
import { Case } from '@deps/models/case/case';
import { getCases } from '@deps/queries/api/cases';
import { CaseSearchBody } from '@deps/types/search';

type UseFetchCasesResult = {
    filters: CaseSearchBody | null;
    total: number | null;
    cases: Case[] | null;
    loading: boolean;
    error: string | null;
    setFilters: Dispatch<SetStateAction<CaseSearchBody>>;
    fetchCases: () => void;
};

export const useFetchCases = (): UseFetchCasesResult => {
    const [filters, setFilters] = useState<CaseSearchBody>({});
    const [total, setTotal] = useState<number | null>(null);
    const [cases, setCases] = useState<Case[] | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isEmptyObject(filters)) {
            setTotal(null);
            setCases(null);
        }
    }, [filters]);

    const fetchCases = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getCases(filters);
            if ('total' in response) {
                setCases(response.data);
                setTotal(response.total);
            } else {
                throw new Error(response.data.err ? response.data.err : 'Error fetching cases');
            }
        } catch (err) {
            setError((err as Error).message);
            setCases(null);
            setTotal(null);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    return { cases, total, loading, error, filters, fetchCases, setFilters };
};
