import NextLink from 'next/link';
import { AnchorHTMLAttributes, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { transformChildrenToString } from '@deps/utils/nav-link';

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
    const { t } = useTranslation();
    const clickEvent = !disabled && onClick ? onClick : () => undefined;
    const focusEvent = !disabled && onFocus ? onFocus : () => undefined;
    const blurEvent = !disabled && onBlur ? onBlur : () => undefined;
    const newPageAnnounce = useRef<string | undefined>(undefined);
    const linkText = transformChildrenToString(children);
    newPageAnnounce.current = `${linkText}${
        target === '_blank' ? ` ${t('allFields.openInNewWindow') ?? ''}` : ''
    }`;

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
