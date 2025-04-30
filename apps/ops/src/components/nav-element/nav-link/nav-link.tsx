import NextLink from 'next/link';
import { AnchorHTMLAttributes } from 'react';

import { NavElementSize, NavElementVariant } from '@deps/components/nav-element/nav-element';

export type NavLinkProps = {
    isNewPage?: boolean;
    children?: React.ReactNode;
    startIcon?: React.ReactNode;
    disabled?: boolean;
    size?: NavElementSize;
    variant?: NavElementVariant;
    pathname?: string;
    replace?: boolean;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export default function NavLink({
    href = '/',
    onClick,
    onFocus,
    onBlur,
    target,
    referrerPolicy,
    rel,
    disabled,
    isNewPage,
    startIcon,
    children,
    pathname,
    replace = false,
    ...rest
}: NavLinkProps) {
    const clickEvent = !disabled && onClick ? onClick : () => undefined;
    const focusEvent = !disabled && onFocus ? onFocus : () => undefined;
    const blurEvent = !disabled && onBlur ? onBlur : () => undefined;

    if (isNewPage) {
        return (
            <a
                href={!disabled ? href : '#'}
                target={target}
                referrerPolicy={referrerPolicy}
                rel={rel}
                onClick={clickEvent}
                onFocus={focusEvent}
                onBlur={blurEvent}
                {...rest}
            >
                {startIcon}
                {children}
            </a>
        );
    }

    if (pathname === '/re-reg') {
        return (
            <a
                href={!disabled ? href : '#'}
                target={target}
                referrerPolicy={referrerPolicy}
                rel={rel}
                onClick={() => window.location.reload()}
                onFocus={focusEvent}
                onBlur={blurEvent}
                {...rest}
            >
                {startIcon}
                {children}
            </a>
        );
    }

    return (
        <NextLink
            href={!disabled ? href : '#'}
            target={target}
            referrerPolicy={referrerPolicy}
            rel={rel}
            onClick={clickEvent}
            onFocus={focusEvent}
            onBlur={blurEvent}
            replace={replace}
            {...rest}
        >
            {startIcon}
            {children}
        </NextLink>
    );
}
