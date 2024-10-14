import { useTranslation } from 'next-i18next';
import React, { useCallback, useState } from 'react';

import DiaryNoteCard from '@deps/components/card/diary-note-card/diary-note-card';
import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import PaginationControls from '@deps/components/pagination/pagination';
import SideSheetEmpty from '@deps/components/side-sheet/side-sheet-empty/side-sheet-empty';
import { TranslationFiles } from '@deps/config/translations';
import { ReactComponent as AnnotationIcon } from '@deps/styles/elements/icons/icons_outlined/annotation.svg';

export interface PolicyNotesInfoItem {
    SourceSystem: string;
    NoteDate: string; // DateTime 'YYYY-MM-DDTHH:MM:SS'
    NoteCategoryDesc: string; // Might be an enum, but uncertain
    NoteText: string; // Where the content of the notes lives
    Alert: string; // Y or N
}

interface DiaryNotesObject {
    diaryNotes: PolicyNotesInfoItem[];
    isLoading?: boolean;
    totalLogs?: number;
    areDiaryNotesViewed?: boolean;
    setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}

interface DiaryNotesContentProps {
    readonly notesData: DiaryNotesObject;
}

export function DiaryNotesContent({ notesData }: DiaryNotesContentProps) {
    const { t } = useTranslation(TranslationFiles.COMMON);

    const [offset, setOffset] = useState(0);
    const limit = 10;

    const { diaryNotes, isLoading, setIsLoading, totalLogs } = notesData;

    const goToPage = useCallback(
        (pageNumber: number) => {
            setOffset((pageNumber - 1) * limit);
            setIsLoading && setIsLoading(true);
        },
        [offset, setOffset]
    );

    if (isLoading)
        return (
            <div className="p-8">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );

    if (Array.isArray(diaryNotes) && diaryNotes?.length === 0)
        return (
            <SideSheetEmpty
                icon={<AnnotationIcon width={50} height={50} className="text-gray-300" data-testid="diary-notes-empty-icon" />}
                header={t('sideSheet.diaryNotesEmptyTitle')}
                text={t('sideSheet.diaryNotesEmptyText')}
            />
        );

    return (
        <div className="flex h-full flex-col">
            <div className="overflow-y-scroll">
                {Array.isArray(diaryNotes) &&
                    diaryNotes?.map(({ Alert, NoteCategoryDesc, NoteDate, NoteText }: PolicyNotesInfoItem, index) => (
                        <DiaryNoteCard
                            key={`diary-note-${index}`}
                            alert={Alert}
                            category={NoteCategoryDesc}
                            noteDate={NoteDate}
                            noteText={NoteText}
                        />
                    ))}
            </div>
            <div className="grow" />
            <div className="mx-auto my-6">
                <PaginationControls total={totalLogs as number} limit={limit} offset={offset} goToPage={goToPage} />
            </div>
        </div>
    );
}
