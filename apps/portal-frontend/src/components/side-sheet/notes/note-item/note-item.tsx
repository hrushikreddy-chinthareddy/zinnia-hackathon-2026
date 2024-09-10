import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'next-i18next';
import React from 'react';

import { NoteInstance } from '@deps/models/case/note-instance';

dayjs.extend(relativeTime);

export interface SideSheetNoteItemProps {
    note: NoteInstance;
}

export default function SideSheetNoteItem({ note }: SideSheetNoteItemProps) {
    const { t } = useTranslation();
    const { desc, note: text, author, updatedAt } = note;

    const timeAgo = dayjs(updatedAt).fromNow();
    return (
        <div className="flex flex-col items-start gap-8 border-b-2 border-gray-100 p-8 last:border-b-0">
            <div>
                {desc && <p className="whitespace-pre-line font-secondary text-md font-normal leading-5.5 text-gray-900">{desc}</p>}
                {text && <p className="whitespace-pre-line font-secondary text-md font-normal leading-5.5 text-gray-900">{text}</p>}
            </div>
            <div className="flex flex-col items-start gap-1">
                <p className="mb-1 font-primary text-sm font-medium leading-4 text-gray-600">
                    {t('sideSheet.postedBy', { timeAgo: timeAgo })}
                </p>
                <p className="font-secondary text-md font-bold leading-5.5 text-gray-900">{author}</p>
            </div>
        </div>
    );
}
