import { useEffect, useState, useCallback } from 'react';

import { DairyNoteType } from '@deps/models/case/withdrawal/case';
import {
    PolicyNotesInfoItem,
    getPolicyNotesInfo,
} from '@deps/queries/api/policies';
import { browserLogError } from '@deps/utils/browser-logging';

type UseDiaryNotesParams = {
    policyNumber: string;
    clientCode: string;
    offset: number;
    limit: number;
    showDiaryNotes?: boolean;
    planCode?: string;
    isLC?: boolean;
};

export const useDiaryNotes = ({
    policyNumber,
    clientCode,
    offset,
    limit,
    showDiaryNotes = true,
    planCode,
    isLC,
}: UseDiaryNotesParams) => {
    const [diaryNotes, setDiaryNotes] = useState<PolicyNotesInfoItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [totalLogs, setTotalLogs] = useState(0);

    const sortedNotes = (diaryNotes: any) => {
        const today = new Date();
        return diaryNotes?.sort(
            (a: { NoteDate: string }, b: { NoteDate: string }) => {
                const dateA = new Date(a.NoteDate);
                const dateB = new Date(b.NoteDate);
                const isFutureA = dateA > today;
                const isFutureB = dateB > today;

                if (isFutureA && !isFutureB) return 1; // A is in future, B is not
                if (!isFutureA && isFutureB) return -1; // B is in future, A is not

                // If both are in the future or both are not, sort by date descending
                return dateB.getTime() - dateA.getTime();
            }
        );
    };

    const mapFASTNotes = (items: any) => {
        const arr = items?.map((item: any) => {
            const key = item.type as keyof typeof DairyNoteType;
            return {
                Alert: item.alertIndicator,
                NoteCategoryDesc: DairyNoteType[key] as DairyNoteType,
                NoteDate: item.createdDate,
                NoteText: item.message,
                SourceSystem: 'FAST',
            };
        });

        const sortedNotesList = sortedNotes(arr);
        return {
            Items: sortedNotesList || [],
            Count: sortedNotesList?.length || 0,
        };
    };

    const getDiaryNotes = useCallback(async () => {
        if (policyNumber && clientCode) {
            const results = await getPolicyNotesInfo({
                policyNumber,
                clientCode: clientCode.toUpperCase(),
                offset,
                limit,
                planCode: planCode ?? '',
                isLC,
            });
            const mappedResults = isLC ? results : mapFASTNotes(results);

            setDiaryNotes(mappedResults?.Items || []);
            setTotalLogs(mappedResults?.Count || 0);
            setIsLoading(false);
        } else {
            setIsLoading(false);
            browserLogError('No policy number or client code provided');
        }
    }, [policyNumber, clientCode, offset, limit, planCode]);

    useEffect(() => {
        if (showDiaryNotes) getDiaryNotes();
    }, [getDiaryNotes]);

    return { diaryNotes, setDiaryNotes, isLoading, setIsLoading, totalLogs };
};
