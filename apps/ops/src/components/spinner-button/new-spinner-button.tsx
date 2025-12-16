import clsx from 'clsx';

import Button, {
    ButtonSize,
    ButtonType,
    ButtonVariant,
} from '@deps/components/button/button';

import CustomLoader from '../loader/customLoader';

export interface SpinnerButtonProps {
    size?: ButtonSize;
    loading?: boolean;
    text: string;
    onClick: () => void;
}

const NewSpinnerButton = ({
    size,
    loading,
    text,
    onClick,
}: SpinnerButtonProps) => {
    const variant = loading ? ButtonVariant.Inactive : ButtonVariant.Default;

    const handleClick = async () => {
        if (loading) return;
        onClick();
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
            disabled={loading}
        >
            {text}
            {loading && (
                <div data-testid="test-loader">
                    {/* alt text optional: t('site.loader') */}
                    <CustomLoader />
                </div>
            )}
        </Button>
    );
};

export default NewSpinnerButton;
