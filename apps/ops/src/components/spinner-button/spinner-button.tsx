import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import Button, {
    ButtonSize,
    ButtonType,
    ButtonVariant,
} from '@deps/components/button/button';

import CustomLoader from '../loader/customLoader';

export interface SpinnerButtonProps {
    size?: ButtonSize;
    stopLoading?: boolean;
    text: string;
    onClick: () => void;
}

const SpinnerButton = ({
    size,
    stopLoading = false,
    text,
    onClick,
}: SpinnerButtonProps) => {
    const { t } = useTranslation();

    const [isLoading, setIsLoading] = useState(false);
    const [variant, setVariant] = useState(ButtonVariant.Default);

    useEffect(() => {
        if (stopLoading) {
            setIsLoading(false);
            setVariant(ButtonVariant.Default);
        }
    }, [stopLoading]);

    const handleClick = () => {
        onClick();

        if (stopLoading) return;

        setIsLoading(true);
        setVariant(ButtonVariant.Inactive);
    };

    return (
        <Button
            className={clsx('flex items-center gap-1', {
                'cursor-wait': variant === ButtonVariant.Inactive,
            })}
            data-testid="continue-button"
            onClick={handleClick}
            size={size}
            type={ButtonType.Primary}
            variant={variant}
        >
            {text}
            {!!isLoading && (
                <div data-testid="test-loader">
                    {/* to do - add optional alt text? */}
                    {/* alt={t('site.loader')} */}
                    <CustomLoader />
                </div>
            )}
        </Button>
    );
};

export default SpinnerButton;
