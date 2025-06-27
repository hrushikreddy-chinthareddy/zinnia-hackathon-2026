import clsx from 'clsx';

export enum NavTextVariant {
    Links = 'links',
    LinksSm = 'links-sm',
    NavDrawer = 'nav-drawer',
    NavDrawerSelected = 'nav-drawer-selected',
    NavMenu = 'nav-menu',
    NavMenuSelected = 'nav-menu-selected',
}

interface NavTextProps {
    className?: string;
    text: string;
    variant?: NavTextVariant;
}

export const NavText = ({
    variant = NavTextVariant.Links,
    text,
    className = '',
    ...rest
}: NavTextProps) => {
    const classes = clsx(
        'font-primary text-gray-900',
        {
            'text-base font-semibold leading-normal':
                variant === NavTextVariant.Links,
            'text-[14px] font-semibold leading-normal':
                variant === NavTextVariant.LinksSm,
            'text-md font-light leading-[24px]':
                variant === NavTextVariant.NavDrawer,
            'text-md font-medium leading-[24px]':
                variant === NavTextVariant.NavDrawerSelected,
            'text-md font-normal uppercase leading-normal':
                variant === NavTextVariant.NavMenu,
            'text-md font-semibold uppercase leading-normal':
                variant === NavTextVariant.NavMenuSelected,
        },
        className
    );

    return (
        <span className={classes} {...rest}>
            {text}
        </span>
    );
};

export default NavText;
