import NextLink from 'next/link';
import { AnchorHTMLAttributes, useRef } from 'react';

import useNavLink from '@deps/hooks/useNavLink';

export type NavLinkProps = {
    isNewPage?: boolean;
    children?: React.ReactNode;
    startIcon?: React.ReactNode;
    disabled?: boolean;
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
    const { getLinkText } = useNavLink();
    const clickEvent = !disabled && onClick ? onClick : () => undefined;
    const focusEvent = !disabled && onFocus ? onFocus : () => undefined;
    const blurEvent = !disabled && onBlur ? onBlur : () => undefined;
    const newPageAnnounce = useRef<string | undefined>(undefined);

    newPageAnnounce.current = getLinkText(target, children);

    if (isNewPage) {
        return (
            <a
                href={!disabled ? href : undefined}
                target={target}
                referrerPolicy={referrerPolicy}
                rel={rel}
                onClick={clickEvent}
                onFocus={focusEvent}
                onBlur={blurEvent}
                aria-label={newPageAnnounce.current}
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
                href={!disabled ? href : undefined}
                target={target}
                referrerPolicy={referrerPolicy}
                rel={rel}
                onClick={() => window.location.reload()}
                onFocus={focusEvent}
                onBlur={blurEvent}
                aria-label={newPageAnnounce.current}
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
            aria-disabled={disabled}
            aria-label={newPageAnnounce.current}
            {...rest}
        >
            {startIcon}
            {children}
        </NextLink>
    );
}
