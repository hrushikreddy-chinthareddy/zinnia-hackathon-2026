import { Icon, IconType } from '@zinnia/bloom/components';
import { HttpStatusCode } from 'axios';
import { useTranslation } from 'react-i18next';

import Button, {
    ButtonSize,
    ButtonVariant,
} from '@deps/components/button/button';
import CardInfo from '@deps/components/card/card-info/card-info';
import { TranslationFiles } from '@deps/config/translations';
import { ReactComponent as CircleCheckIcon } from '@deps/styles/elements/icons/circles/circle-checkmark.svg';

/**
 * @deprecated Use standard Sidesheet from Bloom component library
 */
interface SideSheetContextLegacy {
    handleOpen: (open: boolean) => void;
    changeSideSheetContent: (title: string, content: React.ReactNode) => void;
}

interface ApiResponse {
    status: number;
    data?: {
        message?: string;
    };
    success?: boolean;
}

interface SuccessErrorSideSheetProps {
    response: ApiResponse;
    sideSheet: SideSheetContextLegacy;
    successMessage: string;
    errorMessage: string;
}
function SuccessErrorSideSheet({
    response,
    sideSheet,
    successMessage,
    errorMessage,
}: SuccessErrorSideSheetProps) {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'successErrorSidesheet',
    });
    return (
        <div>
            <CardInfo
                className="mt-8 flex-col"
                icon={
                    response.status === HttpStatusCode.Ok ||
                    response?.success ? (
                        <CircleCheckIcon
                            className="text-semantic-success"
                            height={50}
                            width={50}
                        />
                    ) : (
                        <Icon
                            width={50}
                            height={50}
                            color={'var(--color-status-icon-status-error-icon)'}
                            type={IconType.ALERT_EXCLAMATION}
                        />
                    )
                }
                secondaryCta={
                    <Button
                        aria-label={t('closeButton') as string}
                        onClick={() => sideSheet.handleOpen(false)}
                        variant={ButtonVariant.Default}
                        size={ButtonSize.Small}
                        className="font-semibold text-secondary mt-8"
                    >
                        {t('closeButton')}
                    </Button>
                }
                subtitle={
                    <span>
                        {response.status === HttpStatusCode.Ok ||
                        response?.success
                            ? successMessage
                            : errorMessage}
                    </span>
                }
                title={
                    response.status === HttpStatusCode.Ok || response?.success
                        ? t('successTitle')
                        : t('errorTitle')
                }
            />
        </div>
    );
}

export default SuccessErrorSideSheet;
