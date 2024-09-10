import { TFunction } from 'next-i18next';
import React from 'react';

import PageLoader, { PageLoaderVariant } from '@deps/components/page-loader/page-loader';
import SideSheetNoteItem from '@deps/components/side-sheet/notes/note-item/note-item';
import SideSheetEmpty from '@deps/components/side-sheet/side-sheet-empty/side-sheet-empty';
import { useCaseActivityContext } from '@deps/contexts/CaseActivityContext';
import { ReactComponent as AnnotationsIcon } from '@deps/styles/elements/icons/communications/annotations.svg';

export default function NotesContent({ t }: { t: TFunction }) {
    const { caseNotes, loadingNotes } = useCaseActivityContext();

    if (loadingNotes) {
        return (
            <div className="p-8">
                <PageLoader variant={PageLoaderVariant.Center} />
            </div>
        );
    }

    if (!caseNotes || caseNotes.length === 0)
        return (
            <SideSheetEmpty
                icon={<AnnotationsIcon width={50} height={50} className="text-gray-300" />}
                header={t('sideSheet.notesEmptyTitle')}
                text={t('sideSheet.notesEmptyText')}
            />
        );

    return (
        <>
            {caseNotes.map(note => (
                <SideSheetNoteItem key={note.id} note={note} />
            ))}
        </>
    );
}
