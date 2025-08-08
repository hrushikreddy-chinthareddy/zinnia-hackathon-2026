import { Button, Loader, LoaderVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'react-i18next';

import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';

import { useClientCaseId } from '../../helpers/hooks/use-client-case-id';
import { useIllustrationActions } from '../../helpers/hooks/useIllustrationActions';
import { useSelectedIllustration } from '../../providers/SelectedIllustrationProvider';

type IllustrationSelectForApplicationFooterProps = {
    illustrationId: string;
};

export default function IllustrationSelectForApplicationFooter({
    illustrationId,
}: IllustrationSelectForApplicationFooterProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {});

    const clientCaseId = useClientCaseId();
    const sideSheet = useSideSheetContext();
    const { setIsLoadingSelectForApplication } = useSelectedIllustration();
    const {
        selectIllustrationMutation: { mutate, isIdle, isPending },
    } = useIllustrationActions();

    const handleSubmit = () => {
        setIsLoadingSelectForApplication(true);
        mutate(
            { clientCaseId, illustrationId },
            {
                onSuccess: sideSheet.onClose,
            }
        );
    };

    return (
        <div className="flex flex-row gap-2xl">
            <Button
                type="button"
                size="large"
                disabled={isPending}
                aria-label={
                    t(
                        'clientCase.illustrationSelectForApplication.ariaSubmit'
                    ) ?? undefined
                }
                onClick={handleSubmit}
            >
                <div className="flex flex-row items-center gap-sm">
                    {t('clientCase.illustrationSelectForApplication.submit')}
                    <Loader variant={LoaderVariant.CTA} hide={isIdle} />
                </div>
            </Button>
            <Button
                mode="link"
                size="large"
                disabled={isPending}
                aria-label={
                    t(
                        'clientCase.illustrationSelectForApplication.ariaCancel'
                    ) ?? undefined
                }
                onClick={sideSheet.onClose}
            >
                {t('clientCase.illustrationSelectForApplication.cancel')}
            </Button>
        </div>
    );
}
