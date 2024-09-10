import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

export type ButtonProps = {
    size?: ButtonSize;
    variant?: ButtonVariant;
    type?: ButtonType;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size' | 'type'>;

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

export default function Button({ size = ButtonSize.Default, variant = ButtonVariant.Default, type, children, ...rest }: ButtonProps) {
    const { className, ...newRest } = rest;
    const classes = clsx(
        'default-focus flex min-w-[100px] flex-row justify-center whitespace-nowrap rounded-full rounded-full border-3 p-2 font-primary font-semibold',
        {
            'px-[13px] py-[1px] text-md leading-6': size === ButtonSize.Small,
            'px-[45px] py-[5px] text-[18px] leading-7': size === ButtonSize.Default,
        },
        {
            'border-primary bg-white text-gray-900': type === ButtonType.Primary && variant === ButtonVariant.Default,
            'border-primary bg-primary text-gray-900': type === ButtonType.Primary && variant === ButtonVariant.Selected,

            'border-gray-900 bg-white text-gray-900': type === ButtonType.Secondary && variant === ButtonVariant.Default,
            'border-gray-900 bg-gray-900 text-white': type === ButtonType.Secondary && variant === ButtonVariant.Selected,

            'border-white bg-gray-900 text-white': type === ButtonType.Contrast && variant === ButtonVariant.Default,
            'border-white bg-white text-gray-900': type === ButtonType.Contrast && variant === ButtonVariant.Selected,
            'border-gray-800 bg-gray-600 text-gray-800': type === ButtonType.Contrast && variant === ButtonVariant.Inactive,

            'border-gray-300 bg-gray-100 text-gray-300': variant === ButtonVariant.Inactive,
        },
        {
            'hover:bg-primary-lightest active:bg-primary-lighter':
                type === ButtonType.Primary && variant !== ButtonVariant.Inactive && variant !== ButtonVariant.Selected,
            'hover:bg-gray-200 active:bg-gray-300':
                type === ButtonType.Secondary && variant !== ButtonVariant.Inactive && variant !== ButtonVariant.Selected,
            'hover:bg-gray-800 active:bg-gray-700':
                type === ButtonType.Contrast && variant !== ButtonVariant.Inactive && variant !== ButtonVariant.Selected,
        },
        className
    );

    return (
        <button type="button" className={classes} {...newRest}>
            {children}
        </button>
    );
}
