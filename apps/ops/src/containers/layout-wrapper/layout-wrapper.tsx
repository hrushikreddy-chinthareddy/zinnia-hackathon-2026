import { useUser } from '@auth0/nextjs-auth0/client';
import { Layout } from '@xd/components/Layout/Layout';
import { usePathname } from 'next/navigation';
import React, { PropsWithChildren } from 'react';

import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { useMainNavItems } from '@deps/hooks/useMainNavItems';

import styles from './layout-wrapper.module.css';

const noNavRoutes = ['/'];

export const LayoutWrapper: React.FC<PropsWithChildren> = ({ children }) => {
    const navItems = useMainNavItems();
    const path = usePathname();
    const { user } = useUser();
    const theme = process.env.NEXT_PUBLIC_THEME;

    if (noNavRoutes.includes(path)) {
        return <>{children}</>;
    }

    const handleAnalytics = (toggleState: boolean) => {
        const actionText = toggleState ? 'Expand Nav' : 'Collapse Nav';

        segmentAnalyticsTrackEvent('navigation_clicked', {
            button_text: actionText,
            timestamp: new Date().toISOString(),
            userId: user?.partyId,
        });
    };

    return (
        <Layout
            navGroups={navItems}
            displaySearch={false}
            onNavigationToggle={handleAnalytics}
            activeNavItem={path}
            theme={theme}
            className={styles.bodyContainer}
        >
            {children}
        </Layout>
    );
};
