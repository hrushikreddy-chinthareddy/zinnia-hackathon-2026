import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';

import { storage } from '@deps/helpers/sessionStorage.helper';
import useMock from '@deps/hooks/useMock';
import { NavBarBrand } from '@deps/navigation/nav-bar-brand/nav-bar-brand';
import { NavBarButtons } from '@deps/navigation/nav-bar-buttons/nav-bar-buttons';
import NavBarLink, { NavBarLinkProps } from '@deps/navigation/nav-bar-link/nav-bar-link';
import NavBarNestedLink from '@deps/navigation/nav-bar-nested-link/nav-bar-nested-link';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-duplicate.svg';
import { isResetQueryParam } from '@deps/types/constants';
import { isMockAllowed } from '@deps/utils/environment.helper';

export interface NavBarProps {
    navItems: NavBarLinkProps[];
}

export const NavBar: React.FC<NavBarProps> = (props: NavBarProps) => {
    const { isMockOn } = useMock();
    const [menuOpen, setMenuOpen] = useState(false);
    const { t } = useTranslation();
    const router = useRouter();

    useEffect(() => {
        const handleRouteChangeComplete = (url: string) => {
            if (url.indexOf(isResetQueryParam) !== -1) {
                const link = t('site.navLinks.policySearch.link');
                router.replace(link);
                storage.removeItem('pathHistory');
                storage.removeItem('current');
            }
        };

        router.events.on('routeChangeComplete', handleRouteChangeComplete);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChangeComplete);
        };
    }, []);

    const handleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleClose = () => {
        setMenuOpen(false);
    };

    return (
        <div className="static">
            <div className="relative flex w-full items-center bg-white shadow-lg">
                <NavBarBrand isOpen={menuOpen} toggleMenu={handleMenu} onClose={handleClose} />
                {isMockAllowed() && isMockOn && (
                    <span
                        className="font-bold text-red-500"
                    >
                        Mock is on
                    </span>
                )}
                <div data-testid="nav-brand"  className="hidden md:block">
                    {props.navItems.map(item => {
                        return (
                            <NavBarLink
                                label={item.label}
                                link={item.link}
                                queryParams={item.queryParams || {}}
                                icon={<DocumentIcon />}
                                key={item.label + item.link}
                            />
                        );
                    })}
                </div>
                <div className="flex-grow" />
                <NavBarButtons onClick={handleClose} />
            </div>
            {menuOpen && (
                <div className="height-adjusted fixed z-50 w-full bg-gray-900 text-white md:hidden">
                    <div className="flex flex-col py-6 pl-6">
                        {props.navItems.map((item, i) => {
                            return (
                                <NavBarNestedLink
                                    link={{
                                        text: item.label,
                                        href: item.link,
                                        startIcon: item.icon,
                                    }}
                                    classNames="[&>span]:ml-2 mb-4"
                                    key={i}
                                    onClick={handleClose}
                                />
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
