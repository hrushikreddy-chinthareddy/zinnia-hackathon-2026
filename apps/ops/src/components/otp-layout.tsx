import { useTranslation } from 'next-i18next';
import React, { PropsWithChildren } from 'react';

import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useDiaryNotesContext } from '@deps/contexts/DiaryNotesContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { ReactComponent as AnnotationIcon } from '@deps/styles/elements/icons/icons_outlined/annotation.svg';
import { ReactComponent as ChevronLeftIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-left.svg';

import { DiaryNotesContent } from './side-sheet/diary-notes/diary-notes-content';

interface OTPLayoutProps extends PropsWithChildren {
    childContainerClasses?: string;
    children: React.ReactNode;
    clientId?: string;
    contractNumber?: string;
}

export default function OtpLayout({
    childContainerClasses = '',
    children,
}: OTPLayoutProps) {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const sideSheet = useSideSheetContext();
    const diaryNotesData = useDiaryNotesContext();

    // TODO: create store and use diary notes data from store. Passing context data in props is not correct.
    const openSideSheet = () => {
        const content = <DiaryNotesContent notesData={diaryNotesData} />;
        sideSheet.changeSideSheetContent(
            t('site.navLinks.diaryNotes.text'),
            content
        );
        sideSheet.handleOpen(true);
        if (diaryNotesData && diaryNotesData.areDiaryNotesViewed) {
            diaryNotesData.setAreDiaryNotesViewed(true);
        }
    };

    return (
        <div className="border-2 rounded-lg border-border-subtle">
            <div className="flex w-full items-center justify-between h-20 border-border-light border-b-1 px-3">
                <NavElement
                    type={NavElementType.Link}
                    className="flex items-center"
                    size={NavElementSize.Small}
                    variant={NavElementVariant.Default}
                    href={'/create-case'}
                    startIcon={<ChevronLeftIcon width={16} height={16} />}
                >
                    <span className="hidden md:inline">
                        {t('site.navLinks.backToCreateCase.textLargeScreen')}
                    </span>
                    <span className="md:hidden">
                        {t('site.navLinks.backToCreateCase.textSmallScreen')}
                    </span>
                </NavElement>
                <div className="flex flex-row items-center justify-end space-x-8">
                    <Typography
                        variant={TypographyVariant.FieldLabel}
                        className="hidden md:block"
                    >
                        {t('site.navLinks.relatedActivity.text')}
                    </Typography>
                    <NavElement
                        type={NavElementType.Button}
                        size={NavElementSize.Small}
                        className="flex items-center"
                        startIcon={<AnnotationIcon width={16} height={16} />}
                        onClick={() => openSideSheet()}
                        onKeyDown={(e: {
                            key: string;
                            preventDefault: () => void;
                        }) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openSideSheet();
                            }
                        }}
                    >
                        {t('site.navLinks.diaryNotes.text')}
                    </NavElement>
                </div>
            </div>
            <div className={`mr-4 md:mr-6 lg:mr-8 ${childContainerClasses}`}>
                {children}
            </div>
        </div>
    );
}
