import { createContext, useContext, useEffect, useState } from 'react';

import { PolicyNotesInfoItem } from '@deps/components/side-sheet/diary-notes/diary-notes-content';
import { useDiaryNotes } from '@deps/hooks/useDiaryNotes';

export interface DiaryNotesProviderProps {
    children: React.ReactNode;
    caseDetails: {
        policyNum?: string;
        clientId?: string;
        policyNumber?: string;
        carrierId?: string;
    };
    planCode?: string;
    isLC?: boolean;
}

export interface DiaryNotesContextProps {
    diaryNotes: PolicyNotesInfoItem[];
    setDiaryNotes: React.Dispatch<React.SetStateAction<any>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<any>>;
    totalLogs: number;
    areDiaryNotesViewed: boolean;
    setAreDiaryNotesViewed: React.Dispatch<React.SetStateAction<any>>;
}

export const useDiaryNotesContext = () => {
    return useContext(DiaryNotesContext);
};

export const DiaryNotesContext = createContext<DiaryNotesContextProps>(
    {} as DiaryNotesContextProps
);

export const DiaryNotesProvider = ({
    children,
    caseDetails,
    planCode,
    isLC,
}: DiaryNotesProviderProps) => {
    const [areDiaryNotesViewed, setAreDiaryNotesViewed] = useState(true);
    const { diaryNotes, setDiaryNotes, isLoading, setIsLoading, totalLogs } =
        useDiaryNotes(
            caseDetails?.policyNum || caseDetails?.policyNumber || '',
            caseDetails?.clientId || caseDetails?.carrierId || '',
            0,
            10,
            undefined,
            planCode,
            isLC
        );

    useEffect(() => {
        if (Array.isArray(diaryNotes) && diaryNotes.length >= 1) {
            setAreDiaryNotesViewed(false);
        }
    }, [diaryNotes]);

    return (
        <DiaryNotesContext.Provider
            value={{
                diaryNotes,
                setDiaryNotes,
                isLoading,
                setIsLoading,
                totalLogs,
                areDiaryNotesViewed,
                setAreDiaryNotesViewed,
            }}
        >
            {children}
        </DiaryNotesContext.Provider>
    );
};
