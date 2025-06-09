import { ButtonHTMLAttributes } from 'react';

export type NavButtonProps = {
    children: React.ReactNode;
    startIcon?: React.ReactNode;
    disabled?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function NavButton({ disabled, children, startIcon, ...rest }: NavButtonProps) {
    return (
        <button disabled={disabled} {...rest}>
            {startIcon}
            {children}
        </button>
    );
}
