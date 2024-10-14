import { useRouter } from 'next/router';
import React from 'react';

import NavElement, { NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { convertToQueryString } from '@deps/helpers/routing.helper';

export interface NavBarLinkProps {
    label: string;
    link: string;
    icon?: React.ReactElement;
    queryParams?: {
        [key: string]: string | number | boolean;
    };
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

const NavBarLink: React.FC<NavBarLinkProps> = ({ label, link, icon = <></>, queryParams = undefined, className = '', onClick }) => {
    const router = useRouter();
    const isActive = router.pathname.startsWith(link);
    const borderBottomClass = isActive ? 'border-b-3 primary-gradient-linear' : 'border-b-3 border-transparent';
    const internalClassNames = `h-8 font-primary text-md inline-flex ml-7 items-center focus-visible:outline-2 focus-visible:outline-semantic-focus focus-visible:rounded focus-visible:outline-offset-8 ${
        isActive ? 'font-medium' : 'font-[300]'
    } ${borderBottomClass}`;
    const iconClassNames = `h-5 mr-1`;

    if (queryParams !== undefined) {
        link = `${link}${convertToQueryString(queryParams)}`;
    }

    return (
        <NavElement
            data-testid={label}
            type={NavElementType.Link}
            variant={NavElementVariant.Text}
            className={`${internalClassNames} ${className}`}
            href={link}
            aria-label={label}
            onClick={onClick}
        >
            {React.cloneElement(icon, { className: iconClassNames })} {label}
        </NavElement>
    );
};

export default NavBarLink;
