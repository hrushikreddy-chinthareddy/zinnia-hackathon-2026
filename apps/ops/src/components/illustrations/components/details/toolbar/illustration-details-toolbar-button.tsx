import { Button, ButtonProps, Icon, IconType } from '@zinnia/bloom/components';
import { ReactNode } from 'react';

interface IllustrationDetailsToolbarButtonProps
    extends Omit<ButtonProps, 'type' | 'size' | 'mode'> {
    icon: IconType;
    children: ReactNode;
}

export default function IllustrationDetailsToolbarButton({
    icon,
    children,
    onClick,
    ...rest
}: IllustrationDetailsToolbarButtonProps) {
    return (
        <Button
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
}
