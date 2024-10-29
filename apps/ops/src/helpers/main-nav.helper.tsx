import { Icon, IconType } from '@zinnia/bloom/components';
import { TFunction } from 'next-i18next';

import { PermissionsContextProps } from '@deps/contexts/PermissionsContext';
import { UserPermission } from '@deps/models/user-profile';
import { NavBarLinkProps } from '@deps/navigation/nav-bar-link/nav-bar-link';
import { ReactComponent as LockIcon } from '@deps/styles/elements/icons/actions/lock.svg';
import { ReactComponent as CollectionIcon } from '@deps/styles/elements/icons/icons_outlined/collection.svg';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-duplicate.svg';
import { ENVIRONMENT_NAME, getEnvironment } from '@deps/utils/environment.helper';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { FeatureFlags } from '@deps/utils/optimizely/optimizely';

const accessManagementUrls: Record<string, string> = {
    [ENVIRONMENT_NAME.DEV]: 'http://alb-dep-dev-615563491.us-east-1.elb.amazonaws.com/',
    [ENVIRONMENT_NAME.QA]: 'http://alb-dep-qa-1124930781.us-east-1.elb.amazonaws.com/',
};

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
    const accessManagementText = t('site.navLinks.accessManagement.text');
    const accessManagementHref = accessManagementUrls[getEnvironment()];

    const shouldShowNewExperience = featureFlags?.[FEATURE_FLAGS.NEW_EXP];
    const navItems: NavBarLinkProps[] = [];

    const getNavItems = async () => {
        const isAllowReadCaseManagement = await permissionContext.doesUserHavePagePermission(UserPermission.AllowReadCaseManagement);
        const isAllowReadPolicyAdmin = await permissionContext.doesUserHavePagePermission(UserPermission.AllowReadPolicyAdmin);
        const isAllowReadOtpRenewals = await permissionContext.doesUserHavePagePermission(UserPermission.AllowReadOtpRenewals);
        const isAdvisorsExcel = await permissionContext.getIsAdvisorsExcel();
        const isSuperAdmin = await permissionContext.getIsSuperAdmin();
        const isAllowAccessManagement = isSuperAdmin && isAllowReadOtpRenewals;

        if (isAdvisorsExcel || isAllowReadCaseManagement) {
            navItems.push({ label: caseLinkText, link: caseLinkHref, icon: <DocumentIcon width={20} height={20} /> });
        }
        if (isAllowReadPolicyAdmin) {
            navItems.push({
                label: policySearchText,
                link: policySearchHref,
                queryParams: {
                    isReset: true,
                },
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
        if (isAllowAccessManagement) {
            navItems.push({
                label: accessManagementText,
                link: accessManagementHref,
                icon: <LockIcon width={20} height={20} />,
            });
        }

        return navItems;
    };
    return await getNavItems();
};
