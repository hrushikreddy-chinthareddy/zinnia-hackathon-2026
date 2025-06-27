import { Meta } from '@storybook/react';
import { useTranslation } from 'next-i18next';
import React from 'react';

import Button from '@deps/components/button/button';
import {
    SideSheetProvider,
    useSideSheetContext,
} from '@deps/contexts/SideSheetContext';
import { ReactComponent as AnnotationsIcon } from '@deps/styles/elements/icons/communications/annotations.svg';
import { ReactComponent as PaperClipIcon } from '@deps/styles/elements/icons/communications/paper-clip.svg';
import { ReactComponent as PhoneIcon } from '@deps/styles/elements/icons/communications/phone.svg';

import SideSheetEmpty from './side-sheet-empty';

export default {
    title: 'Components/SideSheet',
    component: SideSheetEmpty,
    decorators: [
        (Story) => (
            <div className="container">
                <SideSheetProvider>
                    <Story />
                </SideSheetProvider>
            </div>
        ),
    ],
} as Meta<typeof SideSheetEmpty>;

export const DocumentEmpty = () => {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContext();
    const openSideSheet = () => {
        sideSheet.changeSideSheetContent(
            'Documents (0)',
            <SideSheetEmpty
                icon={
                    <PaperClipIcon
                        width={50}
                        height={50}
                        className="text-gray-300"
                    />
                }
                header={t('sideSheet.documentsEmptyTitle')}
                text={t('sideSheet.documentsEmptyText')}
            />
        );
        sideSheet.handleOpen(true);
    };

    return (
        <div className="flex">
            <div className="width-20">
                <Button onClick={openSideSheet}>Open SideSheet</Button>
            </div>
        </div>
    );
};

export const NoteEmpty = () => {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContext();
    const openSideSheet = () => {
        sideSheet.changeSideSheetContent(
            'Notes (0)',
            <SideSheetEmpty
                icon={
                    <AnnotationsIcon
                        width={50}
                        height={50}
                        className="text-gray-300"
                    />
                }
                header={t('sideSheet.notesEmptyTitle')}
                text={t('sideSheet.notesEmptyText')}
            />
        );
        sideSheet.handleOpen(true);
    };

    return (
        <div className="flex">
            <div className="width-20">
                <Button onClick={openSideSheet}>Open SideSheet</Button>
            </div>
        </div>
    );
};

export const CallsEmpty = () => {
    const { t } = useTranslation();
    const sideSheet = useSideSheetContext();
    const openSideSheet = () => {
        sideSheet.changeSideSheetContent(
            'Calls (0)',
            <SideSheetEmpty
                icon={
                    <PhoneIcon
                        width={50}
                        height={50}
                        className="text-gray-300"
                        data-testid="call-logs-empty-icon"
                    />
                }
                header={t('sideSheet.callLogsEmptyTitle')}
                text={t('sideSheet.callLogsEmptyText')}
            />
        );
        sideSheet.handleOpen(true);
    };

    return (
        <div className="flex">
            <div className="width-20">
                <Button onClick={openSideSheet}>Open SideSheet</Button>
            </div>
        </div>
    );
};
