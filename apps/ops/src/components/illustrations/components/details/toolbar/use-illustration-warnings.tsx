import { useTranslation } from 'react-i18next';

import { useIllustrationDetail } from '@deps/components/illustrations/providers/IllustrationDetailProvider';
import { IllustrationMessageCode } from '@deps/queries/api/v3/illustrations/types';

export const useIllustrationWarnings = () => {
    const { t } = useTranslation();
    const illustrationDetail = useIllustrationDetail();

    if (!illustrationDetail) {
        return [];
    }

    const { messages } = illustrationDetail.response;

    const hasUnsatisfiedSolveWarning = messages.some(
        (message) => message.code === IllustrationMessageCode.UnsatisfiedSolve
    );
    const hasUnreachDesiredSolutionWarning = messages.some(
        (message) =>
            message.code === IllustrationMessageCode.UnreachDesiredSolution
    );
    const hasRiderWarning = messages.some(
        ({ code }) => code === IllustrationMessageCode.UnsatisfiedRider
    );

    return [
        hasUnsatisfiedSolveWarning
            ? t('allFields.illustrationCalcUnsatisfiedSolveUsingBestAvailable')
            : hasUnreachDesiredSolutionWarning &&
              t('allFields.illustrationCalcUnreachableSolveFailed'),
        hasRiderWarning &&
            t('allFields.illustrationCalcRiderNotIncludedUnmetFaceAmount'),
    ].filter((warning): warning is string => !!warning);
};
