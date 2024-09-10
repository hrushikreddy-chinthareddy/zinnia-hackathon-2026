import { ButtonHTMLAttributes } from 'react';

import { NavElementSize, NavElementVariant } from '@deps/components/nav-element/nav-element';

export type NavButtonProps = {
    children: React.ReactNode;
    startIcon?: React.ReactNode;
    disabled?: boolean;
    size?: NavElementSize;
    variant?: NavElementVariant;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function NavButton({ disabled, children, startIcon, ...rest }: NavButtonProps) {
    return (
        <button disabled={disabled} {...rest}>
            {startIcon}
            {children}
        </button>
    );
}
