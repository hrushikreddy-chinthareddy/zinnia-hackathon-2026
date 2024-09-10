import clsx from 'clsx';
import { cloneElement } from 'react';

import NavButton, { NavButtonProps } from './nav-button/nav-button';
import NavLink, { NavLinkProps } from './nav-link/nav-link';

export enum NavElementSize {
    Default = 'default',
    ExtraSmall = 'extra-small',
    Small = 'small',
}

export enum NavElementVariant {
    Default = 'default',
    Primary = 'primary',
    Secondary = 'secondary',
    Text = 'text',
}

export enum NavElementType {
    Button = 'button',
    Link = 'link',
}

export type NavElementProps = {
    type: NavElementType;
} & (NavLinkProps | NavButtonProps);

export default function NavElement({ type, ...rest }: NavElementProps) {
    const { className, startIcon, ...newRest } = rest;
    const commonHoverClass = 'hover:text-secondary-dark hover:font-semibold';

    const startIconHoverClass =
        'after:content-[" "] relative after:absolute after:-bottom-[2px] after:left-0 after:h-[2px] after:w-full hover:after:bg-secondary-dark';
    const noStartIconHoverClass = 'hover:underline hover:decoration-2 hover:underline-offset-[5px]';

    const hoverClass = clsx(commonHoverClass, {
        [startIconHoverClass]: startIcon,
        [noStartIconHoverClass]: !startIcon,
    });

    const focusVisibleClass = 'default-focus focus-visible:rounded';
    const stateClass = `${hoverClass} ${focusVisibleClass}`;

    const extraSmallSizeClass = 'text-sm leading-4.5';
    const smallSizeClass = 'text-links-sm';
    const defaultSizeClass = 'text-base';
    const defaultIconMargin = 'mr-2';

    let sizeClass = defaultSizeClass;
    let iconMargin = defaultIconMargin;
    switch (newRest.size) {
        case NavElementSize.ExtraSmall:
            sizeClass = extraSmallSizeClass;
            iconMargin = 'mr-1';
            break;
        case NavElementSize.Small:
            sizeClass = smallSizeClass;
            iconMargin = 'mr-1';
            break;
        case NavElementSize.Default:
        default:
            break;
    }

    const defaultVariantClass = 'font-primary text-secondary font-semibold';
    const inactiveVariantClass = 'font-primary text-gray-300 cursor-not-allowed';
    const primaryVariantClass = 'font-primary rounded-none';
    const secondaryVariantClass = 'font-secondary text-secondary font-normal';
    const textVariantClass = 'font-primary text-gray-900';

    let variantClass;
    switch (newRest.variant) {
        case NavElementVariant.Primary:
            variantClass = primaryVariantClass;
            break;
        case NavElementVariant.Secondary:
            variantClass = `${focusVisibleClass} ${secondaryVariantClass} hover:text-secondary-dark`;
            break;
        case NavElementVariant.Text:
            variantClass = textVariantClass;
            break;
        case NavElementVariant.Default:
        default:
            variantClass = newRest.disabled ? inactiveVariantClass : `${stateClass} ${defaultVariantClass}`;
            break;
    }

    const classes = `${sizeClass} ${variantClass} ${className}`;
    const iconClone = startIcon
        ? cloneElement(startIcon as React.ReactElement<any>, { className: `inline-flex align-top ${iconMargin}` })
        : null;

    return type === NavElementType.Button ? (
        <NavButton className={classes} startIcon={iconClone} {...(newRest as NavButtonProps)} />
    ) : (
        <NavLink className={classes} startIcon={iconClone} {...(newRest as NavLinkProps)} />
    );
}
