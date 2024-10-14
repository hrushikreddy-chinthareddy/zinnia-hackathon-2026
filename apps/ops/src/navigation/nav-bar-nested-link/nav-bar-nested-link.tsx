import clsx from 'clsx';

import NavElement, { NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { SubLink } from '@deps/config/nav.config';
import { useActive } from '@deps/hooks/useActive';

export interface NavBarNestedLinkProps {
    link: SubLink;
    classNames?: string;
    onClick: () => void;
}

interface StartIconProps {
    isActive?: boolean;
    icon?: JSX.Element;
}

const StartIcon = ({ isActive, icon }: StartIconProps) => {
    const frontIconCircleClasses = clsx(`!ml-5 mr-3 block h-[8px] w-[8px] rounded-full`, {
        'bg-white': isActive,
        'group-focus:bg-white group-active:bg-white': !isActive,
    });

    return icon ? (
        <div className="rounded-r py-[1.5px] pl-4 pr-[3.67px] [&>svg]:h-[20px] [&>svg]:w-[20px]">{icon}</div>
    ) : (
        <span className={frontIconCircleClasses}></span>
    );
};

const NavBarNestedLink = ({ link, classNames, onClick }: NavBarNestedLinkProps) => {
    const { href, text, startIcon } = link;
    const isActive = useActive(link);

    const focusClasses = 'focus:outline-none focus-visible:outline-semantic-focus focus-visible:outline-2 focus-visible:outline-offset-8';
    const linkClasses = clsx(
        focusClasses,
        'group flex min-h-[24px] w-full items-center !rounded-lg !pl-0 pr-4 text-content-caption font-light text-white hover:bg-gray-800 active:font-medium [&>div]:active:bg-white [&>div]:active:text-gray-900',
        'max-w-[350px]',
        { 'font-semibold [&>div]:bg-white [&>div]:text-gray-900': isActive },
        classNames
    );

    return (
        <NavElement
            type={NavElementType.Link}
            href={href ? href : '#'}
            className={linkClasses}
            variant={NavElementVariant.Text}
            onClick={onClick}
        >
            <StartIcon icon={startIcon} isActive={isActive} />
            <span className="ml-3 font-primary text-base">{text}</span>
        </NavElement>
    );
};

export default NavBarNestedLink;
