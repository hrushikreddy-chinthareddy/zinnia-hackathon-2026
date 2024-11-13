import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import React, { useEffect, useState } from 'react';

import styles from '@deps/components/NoNavLayout.module.css';
import { TranslationFiles } from '@deps/config/translations';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { getMainNavItems } from '@deps/helpers/main-nav.helper';
import { NavBar } from '@deps/navigation/nav-bar';
import { NavBarLinkProps } from '@deps/navigation/nav-bar-link/nav-bar-link';
interface NoNavLayoutProps {
    children: React.ReactNode;
    displayTopNavBar?: boolean;
    fullHeight?: boolean;
    size?: 'large';
}

const NoNavLayout: React.FC<NoNavLayoutProps> = ({ fullHeight, children, displayTopNavBar = true, size }: NoNavLayoutProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const permissions = usePermissionsContext();
    const { featureFlags } = useOptimizely();
    const [navItems, setNavItems] = useState<NavBarLinkProps[]>([]);

    useEffect(() => {
        const fetchNavItems = async () => {
            const mainNavItems = await getMainNavItems(t, permissions, featureFlags);
            setNavItems(mainNavItems);
        };
        if (permissions && featureFlags) {
            fetchNavItems();
        }
    }, [permissions, featureFlags, t]);

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
