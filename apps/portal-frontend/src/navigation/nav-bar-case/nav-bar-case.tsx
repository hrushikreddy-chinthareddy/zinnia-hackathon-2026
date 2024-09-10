import { useTranslation } from 'next-i18next';
import React from 'react';

import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { CallLogsContent } from '@deps/components/side-sheet/call-logs/call-logs-content';
import { DocumentsContent } from '@deps/components/side-sheet/documents/documents-content';
import NotesContent from '@deps/components/side-sheet/notes/notes-content';
import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { Case } from '@deps/models/case/case';
import { ReactComponent as AnnotationIcon } from '@deps/styles/elements/icons/icons_outlined/annotation.svg';
import { ReactComponent as ChevronLeftIcon } from '@deps/styles/elements/icons/icons_outlined/chevron-left.svg';
import { ReactComponent as PaperClipIcon } from '@deps/styles/elements/icons/icons_outlined/paperclip.svg';
import { ReactComponent as PhoneIcon } from '@deps/styles/elements/icons/icons_outlined/phone.svg';

interface NavBarCaseProps {
    caseDetails?: Case;
}

export const NavBarCase: React.FC<NavBarCaseProps> = ({ caseDetails }) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const sideSheet = useSideSheetContext();
    const contractNumber = (caseDetails?.identifiers.find(identifier => identifier.identifier === 'contractNumber') || {}).value;

    const openNotesSidesheet = () => {
        sideSheet.changeSideSheetContent(t(`site.navLinks.notes.text`, { count: 0 }) ?? '', <NotesContent t={t} />);
        sideSheet.handleOpen(true);
    };

    const openDocumentsSidesheet = () => {
        sideSheet.changeSideSheetContent(
            t(`site.navLinks.documents.text`, { count: 0 }) ?? '',
            <DocumentsContent caseDetails={caseDetails} />
        );
        sideSheet.handleOpen(true);
    };

    const openCallLogsSidesheet = () => {
        sideSheet.changeSideSheetContent(
            t(`site.navLinks.callLogs.text`, { count: 0 }) ?? '',
            <CallLogsContent contractNumber={contractNumber} t={t} />
        );
        sideSheet.handleOpen(true);
    };

    return (
        <div className="static flex h-20 w-full items-center justify-start bg-white shadow-lg">
            <div className="flex w-full max-w-[1440px] items-center justify-between px-4 md:px-6 lg:px-8">
                <NavElement
                    type={NavElementType.Link}
                    className="flex items-center"
                    size={NavElementSize.Small}
                    variant={NavElementVariant.Default}
                    href={'/cases'}
                    startIcon={<ChevronLeftIcon width={16} height={16} />}
                >
                    <span className="hidden md:inline">{t('site.navLinks.backToCaseManagement.textLargeScreen')}</span>
                    <span className="md:hidden">{t('site.navLinks.backToCaseManagement.textSmallScreen')}</span>
                </NavElement>
                <div className="flex flex-row items-center justify-end space-x-8">
                    <Typography variant={TypographyVariant.FieldLabel} className="hidden md:block">
                        {t('site.navLinks.relatedActivity.text')}
                    </Typography>
                    <NavElement
                        type={NavElementType.Button}
                        size={NavElementSize.Small}
                        className="flex items-center"
                        startIcon={<PhoneIcon width={16} height={16} />}
                        onClick={openCallLogsSidesheet}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openCallLogsSidesheet();
                            }
                        }}
                    >
                        {t('site.navLinks.callLogs.text')}
                    </NavElement>
                    <NavElement
                        type={NavElementType.Button}
                        size={NavElementSize.Small}
                        className="flex items-center"
                        startIcon={<AnnotationIcon width={16} height={16} />}
                        onClick={openNotesSidesheet}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openNotesSidesheet();
                            }
                        }}
                    >
                        {t('site.navLinks.notes.text')}
                    </NavElement>
                    <NavElement
                        type={NavElementType.Button}
                        size={NavElementSize.Small}
                        className="flex items-center"
                        startIcon={<PaperClipIcon width={16} height={16} />}
                        onClick={openDocumentsSidesheet}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openDocumentsSidesheet();
                            }
                        }}
                    >
                        {t('site.navLinks.documents.text')}
                    </NavElement>
                </div>
            </div>
        </div>
    );
};

export default NavBarCase;
