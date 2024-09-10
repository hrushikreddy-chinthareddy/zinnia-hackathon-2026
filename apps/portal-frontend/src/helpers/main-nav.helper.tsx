import { TFunction } from 'next-i18next';

import { PermissionsContextProps } from '@deps/contexts/PermissionsContext';
import { UserPermission } from '@deps/models/user-profile';
import { NavBarLinkProps } from '@deps/navigation/nav-bar-link/nav-bar-link';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-duplicate.svg';
import { ReactComponent as ShieldCheckIcon } from '@deps/styles/elements/icons/icons_outlined/shield-check.svg';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

export const getMainNavItems = async (
    t: TFunction,
    permissionContext: PermissionsContextProps,
    featureFlags: FeatureFlags
): Promise<NavBarLinkProps[]> => {
    const caseLinkText = t('site.navLinks.caseManagement.text');
    const caseLinkHref = t('site.navLinks.caseManagement.link') || '';
    const policySearchText = t('site.navLinks.policySearch.text');
    const policySearchHref = t('site.navLinks.policySearch.link') || '';
    const caseRenewalCreateHref = t('site.navLinks.caseRenewalCreate.link') || '';
    const transactionOpsSuiteHref = t('site.navLinks.transactionOpsSuite.link') || '';

    const shouldShowNewExperience = featureFlags?.[FEATURE_FLAGS.NEW_EXP];
    const navItems: NavBarLinkProps[] = [];

    const getNavItems = async () => {
        const isAllowReadCaseManagement = await permissionContext.doesUserHavePagePermission(UserPermission.AllowReadCaseManagement);
        const isAllowReadPolicyAdmin = await permissionContext.doesUserHavePagePermission(UserPermission.AllowReadPolicyAdmin);
        const isAllowReadOtpRenewals = await permissionContext.doesUserHavePagePermission(UserPermission.AllowReadOtpRenewals);

        if (isAllowReadCaseManagement) {
            navItems.push({ label: caseLinkText, link: caseLinkHref, icon: <DocumentIcon width={20} height={20} /> });
        }
        if (isAllowReadPolicyAdmin) {
            navItems.push({
                label: policySearchText,
                link: policySearchHref,
                queryParams: {
                    isReset: true,
                },
                icon: <ShieldCheckIcon width={20} height={20} />,
            });
        }
        if (isAllowReadOtpRenewals) {
            shouldShowNewExperience
                ? navItems.push({ label: t('site.navLinks.transactionOpsSuite.text'), link: transactionOpsSuiteHref })
                : navItems.push({ label: t('site.navLinks.caseRenewalCreate.text'), link: caseRenewalCreateHref });
        }

        return navItems;
    };
    return await getNavItems();
};
