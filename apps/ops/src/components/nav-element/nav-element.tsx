import clsx from 'clsx';
import { cloneElement } from 'react';

import NavButton, { NavButtonProps } from './nav-button/nav-button';
import styles from './nav-element.module.css';
import NavLink, { NavLinkProps } from './nav-link/nav-link';

export enum NavElementSize {
    Default = 'default',
    Small = 'small',
}

export enum NavElementVariant {
    Default = 'default',
    Primary = 'primary',
    Text = 'text',
}

export enum NavElementType {
    Button = 'button',
    Link = 'link',
}

export type NavElementProps = {
    type: NavElementType;
    variant?: NavElementVariant;
    size?: NavElementSize;
    underline?: boolean;
} & (NavLinkProps | NavButtonProps);

export default function NavElement({
    type,
    underline,
    ...rest
}: NavElementProps) {
    const { className, startIcon, variant, size, ...newRest } = rest;

    const classes = clsx(
        `${styles.navLink} text-links default-focus focus-visible:rounded ${className}`,
        newRest.disabled && styles.disabled,
        variant === NavElementVariant.Text && styles.text,
        size === NavElementSize.Small && 'text-links-sm',
        underline && '!underline underline-offset-4'
    );
    const iconClone = startIcon
        ? cloneElement(startIcon as React.ReactElement<any>, {
              className: clsx(
                  `inline-flex align-top`,
                  size === NavElementSize.Small ? 'mr-1' : 'mr-2'
              ),
          })
        : null;

    return type === NavElementType.Button ? (
        <NavButton
            className={classes}
            startIcon={iconClone}
            {...(newRest as NavButtonProps)}
        />
    ) : (
        <NavLink
            className={classes}
            startIcon={iconClone}
            {...(newRest as NavLinkProps)}
        />
    );
}
