import { useRouter } from 'next/router';

import { getMainNavItems } from '@deps/helpers/main-nav.helper';
import { NavBar } from '@deps/navigation/nav-bar';

const StaticPolicyNavBar = () => {
    const router = useRouter();
    const { pathname } = router;
    const isPolicies = pathname.includes('/policies');

    const mainNavItems = getMainNavItems();

    return <>{isPolicies && <NavBar navItems={mainNavItems} />}</>;
};

export default StaticPolicyNavBar;
