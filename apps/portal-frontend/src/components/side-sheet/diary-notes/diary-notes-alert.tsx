import { useTranslation } from 'next-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { useDiaryNotesContext } from '@deps/contexts/DiaryNotesContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { ReactComponent as BellIcon } from '@deps/styles/elements/icons/icons_outlined/bell.svg';

import { DiaryNotesContent } from './diary-notes-content';

const DiaryNotesWarning = () => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const sideSheet = useSideSheetContext();
    // TODO: Create store and access diary notes from store
    const diaryNotesData = useDiaryNotesContext();

    const openSideSheet = () => {
        const content = <DiaryNotesContent notesData={diaryNotesData} />;
        sideSheet.changeSideSheetContent(t('site.navLinks.diaryNotes.text'), content);
        sideSheet.handleOpen(true);
    };

    const handleDiaryNotesView = () => {
        openSideSheet();
        diaryNotesData.setAreDiaryNotesViewed(true);
    };

    if (diaryNotesData.areDiaryNotesViewed) return <></>;

    return (
        <div>
            {Array.isArray(diaryNotesData.diaryNotes) && diaryNotesData.diaryNotes?.length >= 1 && (
                <div className="flex items-center justify-start rounded-lg border border-[#FA7625]  bg-[#FFF7E3] p-4 shadow-md">
                    <div className="flex items-center">
                        <div className="mr-3 h-5 w-5 rounded-full ">
                            <BellIcon width={23} height={23} className="text-[#FA7625]" />
                        </div>
                        <p>{t('site.navLinks.diaryNotesWarning.text')}</p>
                    </div>
                    <span onClick={handleDiaryNotesView} className="mx-1 underline hover:cursor-pointer">
                        {t('site.navLinks.diaryNotesWarning.clickToView')}
                    </span>
                </div>
            )}
        </div>
    );
};

export default DiaryNotesWarning;
