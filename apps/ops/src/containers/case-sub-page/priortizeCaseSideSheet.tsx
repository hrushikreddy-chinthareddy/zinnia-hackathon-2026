import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button, {
    ButtonSize,
    ButtonVariant,
} from '@deps/components/button/button';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { escalateCase } from '@deps/queries/api/cases';
import { browserLogError } from '@deps/utils/browser-logging';

import SuccessErrorSideSheet from './success-error-side-sheet';

function PrioritizeCaseSideSheet({ caseId }: { caseId: string }) {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'caseOverview.prioritizeCase',
    });
    const [error, setError] = useState<string | undefined>();
    const sideSheet = useSideSheetContext();

    const handleSubmit = async () => {
        try {
            const response = await escalateCase(caseId);
            if (response) {
                const content = (
                    <SuccessErrorSideSheet
                        t={t}
                        response={response}
                        sideSheet={sideSheet}
                        caseId={caseId}
                    />
                );
                sideSheet.changeSideSheetContent(t('title'), content);
                sideSheet.handleOpen(true);
            }
        } catch (error) {
            browserLogError(`escalateCase :${caseId} : error : ${error}`);
            setError(error as string);
        }
    };
    return (
        <div className="flex flex-col py-10 pl-10 pr-5 justify-between h-full">
            <div className="flex flex-col gap-4 ">
                <Typography variant={TypographyVariant.H3}>
                    {t('detailsHeader')}
                </Typography>
                <Typography variant={TypographyVariant.Body}>
                    {t('detailsBody')}
                </Typography>
                <div className="flex gap-2 items-end width-full justify-end pr-5">
                    <Button
                        variant={ButtonVariant.Selected}
                        size={ButtonSize.Small}
                        onClick={() => sideSheet.handleOpen(false)}
                    >
                        {t('cancel')}
                    </Button>
                    <Button
                        variant={ButtonVariant.Default}
                        size={ButtonSize.Small}
                        onClick={handleSubmit}
                    >
                        {t('submit')}
                    </Button>
                </div>
            </div>

            <div className=" flex-1 justify-start  items-end flex">
                {error && (
                    <Typography variant={TypographyVariant.H3}>
                        {t('errorMessage', { error })}
                    </Typography>
                )}
            </div>
        </div>
    );
}

export default PrioritizeCaseSideSheet;
