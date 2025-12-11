import { Button, ButtonProps, Icon, IconType } from '@zinnia/bloom/components';
import { forwardRef, ReactNode } from 'react';

interface IllustrationDetailsToolbarButtonProps
    extends Omit<ButtonProps, 'type' | 'size' | 'mode'> {
    icon: IconType;
    children: ReactNode;
}

const IllustrationDetailsToolbarButton = forwardRef<
    HTMLButtonElement,
    IllustrationDetailsToolbarButtonProps
>(({ icon, children, onClick, ...rest }, ref) => {
    return (
        <Button
            ref={ref}
            onClick={onClick}
            mode="link"
            type="button"
            size="small"
            {...rest}
        >
            <Icon type={icon} height={24} width={24} />
            {children}
        </Button>
    );
});

IllustrationDetailsToolbarButton.displayName =
    'IllustrationDetailsToolbarButton';

export default IllustrationDetailsToolbarButton;
