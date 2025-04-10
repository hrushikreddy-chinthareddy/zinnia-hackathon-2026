import clsx from 'clsx';
import React from 'react';

import styles from '@deps/components/NoNavLayout.module.css';
import { getMainNavItems } from '@deps/helpers/main-nav.helper';
import { NavBar } from '@deps/navigation/nav-bar';
interface NoNavLayoutProps {
    children: React.ReactNode;
    displayTopNavBar?: boolean;
    fullHeight?: boolean;
    size?: 'large';
}

const NoNavLayout: React.FC<NoNavLayoutProps> = ({ fullHeight, children, displayTopNavBar = true, size }: NoNavLayoutProps) => {
    const navItems = getMainNavItems();

    return (
        <div className={`${fullHeight ? 'h-full' : ''}`}>
            {displayTopNavBar && <NavBar navItems={navItems} />}

            <div
                className={clsx(
                    'mx-4 mb-8 mt-16 sm:mt-6 md:mx-6 md:mt-16 lg:mx-8 [@media(min-width:1194px)]:mx-auto',
                    styles.default,
                    size === 'large' && styles.large
                )}
            >
                {children}
            </div>
        </div>
    );
};

export default NoNavLayout;
