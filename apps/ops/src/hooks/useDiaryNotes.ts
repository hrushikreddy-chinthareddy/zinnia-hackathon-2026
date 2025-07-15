import { useEffect, useState, useCallback } from 'react';

import {
    PolicyNotesInfoItem,
    getPolicyNotesInfo,
} from '@deps/queries/api/policies';

export const useDiaryNotes = (
    policyNumber: string,
    clientCode: string,
    offset: number,
    limit: number,
    showDiaryNotes: boolean = true
) => {
    const [diaryNotes, setDiaryNotes] = useState<PolicyNotesInfoItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [totalLogs, setTotalLogs] = useState(0);

    const getDiaryNotes = useCallback(async () => {
        if (policyNumber && clientCode) {
            const results = await getPolicyNotesInfo({
                policyNumber,
                clientCode: clientCode.toUpperCase(),
                offset,
                limit,
            });
            setDiaryNotes(results?.Items || []);
            setTotalLogs(results?.Count || 0);
            setIsLoading(false);
        } else {
            setIsLoading(false);
            console.error('No policy number or client code provided');
        }
    }, [policyNumber, clientCode, offset, limit]);

    useEffect(() => {
        if (showDiaryNotes) getDiaryNotes();
    }, [getDiaryNotes]);

    return { diaryNotes, setDiaryNotes, isLoading, setIsLoading, totalLogs };
};
