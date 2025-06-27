import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { ReactNode, useState } from 'react';

import { TranslationFiles } from '@deps/config/translations';
import { ReactComponent as CancelIcon } from '@deps/styles/elements/icons/actions/cancel.svg';
import { ReactComponent as AlertIcon } from '@deps/styles/elements/icons/alert/alert.svg';
import { ReactComponent as ExclamationAlertIcon } from '@deps/styles/elements/icons/icons_outlined/exclamation-alert.svg';
import { ReactComponent as HexExclamationIcon } from '@deps/styles/elements/icons/icons_outlined/hex-exclamation.svg';

export enum BannerVariant {
    Default = 'default',
    Error = 'error',
    Information = 'information',
    Success = 'success',
    Warning = 'warning',
}

export interface BannerAlertProps {
    canDismiss?: boolean;
    children: ReactNode;
    cta?: {
        href: string;
        text: string;
    };
    variant?: BannerVariant;
}

const BannerAlert = ({
    canDismiss = true,
    children,
    cta,
    variant = BannerVariant.Default,
}: BannerAlertProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'bannerAlert',
    });
    const [show, setShow] = useState(true);

    if (!show) return null;

    const wrapperStyles =
        'flex max-w-[1130px] gap-2 rounded-lg border-1 p-2 shadow-elevation-light-08';
    const textStyles = 'font-primary text-sm font-medium leading-[16px]';

    const variantStyles = {
        [BannerVariant.Default]: 'border-gray-900 text-white bg-gray-900',
        [BannerVariant.Error]:
            'border-semantic-error text-semantic-error bg-semantic-error-light',
        [BannerVariant.Information]:
            'border-semantic-info text-semantic-info bg-semantic-info-light',
        [BannerVariant.Success]:
            'border-semantic-success text-semantic-success bg-semantic-success-light',
        [BannerVariant.Warning]:
            'border-semantic-warning text-semantic-warning bg-semantic-warning-light',
    };

    const icons = {
        [BannerVariant.Default]: AlertIcon,
        [BannerVariant.Error]: HexExclamationIcon,
        [BannerVariant.Information]: AlertIcon,
        [BannerVariant.Success]: AlertIcon,
        [BannerVariant.Warning]: ExclamationAlertIcon,
    };
    const IconVariant = icons[variant];

    const hasCta = cta != null;

    return (
        <div
            className={clsx(wrapperStyles, variantStyles[variant])}
            data-testid="banner-alert"
        >
            <IconVariant className="shrink-0" height={24} width={24} />
            <div className="my-auto flex grow flex-col gap-2">
                <p
                    className={clsx(textStyles, {
                        'text-gray-900': variant !== BannerVariant.Default,
                    })}
                >
                    {children}
                </p>

                {hasCta && (
                    <a
                        className="default-focus font-primary text-links-sm font-semibold hover:underline hover:decoration-2 hover:underline-offset-[6px] focus-visible:rounded"
                        href={cta.href}
                    >
                        {cta.text}
                    </a>
                )}
            </div>

            {!hasCta && canDismiss && (
                <button
                    aria-label={t('close') as string}
                    className="default-focus-icons rounded-xl"
                    onClick={() => setShow(false)}
                >
                    <CancelIcon height={24} width={24} />
                </button>
            )}
        </div>
    );
};

export default BannerAlert;
