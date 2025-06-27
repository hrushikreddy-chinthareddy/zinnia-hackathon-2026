import { Button as BloomButton } from '@zinnia/bloom/components';
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export interface ButtonProps
    extends PropsWithChildren,
        Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size' | 'type'> {
    size?: ButtonSize;
    variant?: ButtonVariant;
    type?: ButtonType;
}

export enum ButtonSize {
    Small = 'small',
    Default = 'default',
}

export enum ButtonType {
    Primary = 'primary',
    Secondary = 'secondary',
    Contrast = 'contrast',
}

export enum ButtonVariant {
    Default = 'default',
    Inactive = 'inactive',
    Selected = 'selected',
}

export default function Button({
    size = ButtonSize.Default,
    variant = ButtonVariant.Default,
    type,
    children,
    ...rest
}: ButtonProps) {
    const { className, ...newRest } = rest;

    const bSize = size === ButtonSize.Small ? 'small' : 'large';
    const bMode = type === ButtonType.Secondary ? 'secondary' : 'primary';

    return (
        <BloomButton
            size={bSize}
            mode={bMode}
            className={className}
            disabled={ButtonVariant.Inactive === variant}
            onClick={newRest.onClick}
            selected={ButtonVariant.Selected === variant}
            {...newRest}
        >
            {children}
        </BloomButton>
    );
}
