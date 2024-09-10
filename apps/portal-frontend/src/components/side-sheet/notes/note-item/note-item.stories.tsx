import { Meta } from '@storybook/react';
import { useTranslation } from 'next-i18next';
import React, { useState } from 'react';

import Button from '@deps/components/button/button';
import { NoteInstance } from '@deps/models/case/note-instance';

import SideSheetNoteItem from './note-item';
import SideSheet from '../../side-sheet';

export default {
    title: 'Components/SideSheet',
    component: SideSheetNoteItem,
    decorators: [
        Story => (
            <div className="container">
                <Story />
            </div>
        ),
    ],
} as Meta<typeof SideSheetNoteItem>;

const mockNotes: NoteInstance[] = [
    {
        id: 'note1',
        desc: 'Description 1',
        note: 'This is a sample note 1.',
        author: 'John Doe',
        updatedAt: '2023-05-01T10:00:00.000Z',
        additionalData: {
            key1: 'value1',
            key2: 'value2',
        },
        eventRef: ['event1', 'event2'],
    },
    {
        id: 'note2',
        desc: '',
        note: 'This is a sample note 2.  No description',
        author: 'Jane Smith',
        updatedAt: '2023-05-02T10:00:00.000Z',
        additionalData: {
            key3: 'value3',
            key4: 'value4',
        },
        eventRef: ['event3', 'event4'],
    },
    {
        id: 'note3',
        desc: 'Description 3 - no note',
        note: '',
        author: 'Alice Brown',
        updatedAt: '2023-05-03T10:00:00.000Z',
        additionalData: {
            key5: 'value5',
            key6: 'value6',
        },
        eventRef: ['event5', 'event6'],
    },
];

export const NoteItems = () => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(true);
    const handleClose = () => setOpen(false);

    return (
        <div className="flex">
            <div className="width-20">
                <Button onClick={() => setOpen(true)}>Open SideSheet</Button>
            </div>
            <SideSheet open={open} handleClose={handleClose} header={t('sideSheet.notes', { count: mockNotes.length }) as string}>
                {mockNotes.map(note => (
                    <SideSheetNoteItem key={note.id} note={note} />
                ))}
            </SideSheet>
        </div>
    );
};
