import { useTranslation } from 'next-i18next';
import { useCallback } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';

import { useClientCaseId } from './use-client-case-id';
import IllustrationSelectForApplication from '../../components/select-for-application/illustration-select-for-application-content';
import {
    SelectedIllustrationContext,
    useSelectedIllustration,
} from '../../providers/SelectedIllustrationProvider';

export function useSelectIllustrationForApplication() {
    const { t } = useTranslation(TranslationFiles.COMMON, {});
    const clientCaseId = useClientCaseId();
    const sideSheet = useSideSheetContextLegacy();
    const selectedIllustrationState = useSelectedIllustration();
    const sideSheetWidth = 500;

    return useCallback(() => {
        sideSheet.changeSideSheetContent(
            t('clientCase.illustrationSelectForApplication.title'),
            <SelectedIllustrationContext.Provider
                value={selectedIllustrationState}
            >
                <IllustrationSelectForApplication />
            </SelectedIllustrationContext.Provider>
        );
        sideSheet.handleOpen(true, sideSheetWidth);
    }, [clientCaseId, selectedIllustrationState]);
}
