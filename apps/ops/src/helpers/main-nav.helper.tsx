import { Icon, IconType } from '@zinnia/bloom/components';
import { TFunction } from 'next-i18next';

import { PermissionsContextProps } from '@deps/contexts/PermissionsContext';
import { UserPermission } from '@deps/models/user-profile';
import { NavBarLinkProps } from '@deps/navigation/nav-bar-link/nav-bar-link';
import { ReactComponent as CollectionIcon } from '@deps/styles/elements/icons/icons_outlined/collection.svg';
import { ReactComponent as DashboardIcon } from '@deps/styles/elements/icons/icons_outlined/dashboard.svg';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-duplicate.svg';
import { ReactComponent as HomeIcon } from '@deps/styles/elements/icons/icons_outlined/house.svg';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

export const getMainNavItems = async (
    t: TFunction,
    permissionContext: PermissionsContextProps,
    featureFlags: FeatureFlags
): Promise<NavBarLinkProps[]> => {
    const { hasDashboardPermission, isAdvisorsExcel } = permissionContext;

    const homeLinkText = t('site.navLinks.home.text');
    const homeLinkHref = t('site.navLinks.home.link');
    const caseLinkText = t('site.navLinks.caseManagement.text');
    const caseLinkHref = t('site.navLinks.caseManagement.link') || '';
    const policySearchText = t('site.navLinks.policySearch.text');
    const policySearchHref = t('site.navLinks.policySearch.link') || '';
    const caseRenewalCreateHref = t('site.navLinks.caseRenewalCreate.link') || '';
    const transactionOpsSuiteHref = t('site.navLinks.transactionOpsSuite.link') || '';

    const shouldShowNewExperience = featureFlags?.[FEATURE_FLAGS.NEW_EXP];
    const shouldShowCaseStatsDashboard = featureFlags?.[FEATURE_FLAGS.CASE_STATS_DASHBOARD];
    const enableAdditionalAdvisorsExcelCarriers = featureFlags?.[FEATURE_FLAGS.CASE_ADVISORS_EXCEL_ADDITIONAL_CARRIER_SUPPORT];
    const showHomeNavBtn = featureFlags?.[FEATURE_FLAGS.SHOW_HOME_NAV_BTN];
    const navItems: NavBarLinkProps[] = [];

    const getNavItems = async () => {
        const isAllowReadCaseManagement =
            isAdvisorsExcel || (await permissionContext.doesUserHavePagePermission(UserPermission.AllowReadCaseManagement));
        const isAllowReadPolicyAdmin = await permissionContext.doesUserHavePagePermission(UserPermission.AllowReadPolicyAdmin);
        const isAllowReadOtpRenewals = await permissionContext.doesUserHavePagePermission(UserPermission.AllowReadOtpRenewals);

        if (isAllowReadOtpRenewals && shouldShowNewExperience && showHomeNavBtn) {
            navItems.push({ label: homeLinkText, link: homeLinkHref, icon: <HomeIcon width={20} height={20} /> });
        }

        if (isAllowReadCaseManagement) {
            navItems.push({ label: caseLinkText, link: caseLinkHref, icon: <DocumentIcon width={20} height={20} /> });
        }

        if ((enableAdditionalAdvisorsExcelCarriers && isAdvisorsExcel) || isAllowReadPolicyAdmin) {
            navItems.push({
                label: policySearchText,
                link: policySearchHref,
                icon: <Icon type={IconType.SHIELD_CHECKMARK} />,
            });
        }

        if (isAllowReadOtpRenewals) {
            shouldShowNewExperience
                ? navItems.push({
                      label: t('site.navLinks.transactionOpsSuite.text'),
                      link: transactionOpsSuiteHref,
                      icon: <CollectionIcon width={20} height={20} />,
                  })
                : navItems.push({
                      label: t('site.navLinks.caseRenewalCreate.text'),
                      link: caseRenewalCreateHref,
                      icon: <CollectionIcon width={20} height={20} />,
                  });
        }

        if (shouldShowCaseStatsDashboard && hasDashboardPermission) {
            const dashboardText = t('site.navLinks.dashboard.text') || '';
            const dashboardHref = t('site.navLinks.dashboard.link') || '';
            navItems.push({ label: dashboardText, link: dashboardHref, icon: <DashboardIcon width={20} height={20} /> });
        }
        return navItems;
    };

    return await getNavItems();
};
