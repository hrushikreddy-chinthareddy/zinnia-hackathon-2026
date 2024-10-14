import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';

import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { getMainNavItems } from '@deps/helpers/main-nav.helper';
import { NavBar } from '@deps/navigation/nav-bar';
import { NavBarLinkProps } from '@deps/navigation/nav-bar-link/nav-bar-link';

const StaticPolicyNavBar = () => {
    const router = useRouter();
    const { pathname } = router;
    const isPolicies = pathname.includes('/policies');
    const { t } = useTranslation();
    const permissions = usePermissionsContext();
    const { featureFlags } = useOptimizely();
    const [navItems, setNavItems] = useState<NavBarLinkProps[]>([]);

    useEffect(() => {
        const fetchNavItems = async () => {
            const mainNavItems = await getMainNavItems(t, permissions, featureFlags);
            setNavItems(mainNavItems);
        }
        if (featureFlags && permissions) {
            fetchNavItems();
        }

    }, [featureFlags, permissions]);

    const topbar = useMemo(() => {
        return isPolicies && <NavBar navItems={navItems} />;
    }, [navItems]);

    return <>{topbar}</>;
};

export default StaticPolicyNavBar;
