import { Icon, IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { NavBarLinkProps } from '@deps/navigation/nav-bar-link/nav-bar-link';
import { ReactComponent as CollectionIcon } from '@deps/styles/elements/icons/icons_outlined/collection.svg';
import { ReactComponent as DashboardIcon } from '@deps/styles/elements/icons/icons_outlined/dashboard.svg';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-duplicate.svg';
import { ReactComponent as HomeIcon } from '@deps/styles/elements/icons/icons_outlined/house.svg';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

export const getMainNavItems = (): NavBarLinkProps[] => {
    const {
        hasDashboardPermission,
        isAdvisorsExcel,
        isAllowReadCaseManagement,
        isAllowReadOtpRenewals,
        isAllowReadPolicyAdmin,
        permissionsLoadingComplete,
    } = usePermissionsContext();

    const { featureFlags } = useOptimizely();
    const { t } = useTranslation();
    if (!permissionsLoadingComplete) {
        return [];
    }

    const homeLinkText = t('site.navLinks.home.text');
    const homeLinkHref = t('site.navLinks.home.link');
    const caseLinkText = t('site.navLinks.caseManagement.text');
    const caseLinkHref = t('site.navLinks.caseManagement.link') || '';
    const policySearchText = t('site.navLinks.policySearch.text');
    const policySearchHref = t('site.navLinks.policySearch.link') || '';
    const transactionOpsSuiteHref = t('site.navLinks.transactionOpsSuite.link') || '';

    const showHomeNavBtn = featureFlags?.[FEATURE_FLAGS.SHOW_HOME_NAV_BTN];
    const navItems: NavBarLinkProps[] = [];

    const getNavItems = () => {
        if (isAllowReadOtpRenewals && showHomeNavBtn) {
            navItems.push({ label: homeLinkText, link: homeLinkHref, icon: <HomeIcon width={20} height={20} /> });
        }

        if (isAllowReadCaseManagement) {
            navItems.push({ label: caseLinkText, link: caseLinkHref, icon: <DocumentIcon width={20} height={20} /> });
        }

        if (isAdvisorsExcel || isAllowReadPolicyAdmin) {
            navItems.push({
                label: policySearchText,
                link: policySearchHref,
                icon: <Icon type={IconType.SHIELD_CHECKMARK} />,
            });
        }

        if (isAllowReadOtpRenewals) {
            navItems.push({
                label: t('site.navLinks.transactionOpsSuite.text'),
                link: transactionOpsSuiteHref,
                icon: <CollectionIcon width={20} height={20} />,
            });
        }

        if (hasDashboardPermission) {
            const dashboardText = t('site.navLinks.dashboard.text') || '';
            const dashboardHref = t('site.navLinks.dashboard.link') || '';
            navItems.push({ label: dashboardText, link: dashboardHref, icon: <DashboardIcon width={20} height={20} /> });
        }
        return navItems;
    };

    return getNavItems();
};
