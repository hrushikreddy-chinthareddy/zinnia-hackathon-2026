import { useUser } from '@auth0/nextjs-auth0/client';
import { NavGroup } from '@xd/xd-components/src/components/Nav/Nav';
import { IconType } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import { NavElementType } from '@deps/components/nav-element/nav-element';
import NavLink from '@deps/components/nav-element/nav-link/nav-link';
import { UserContextMenu } from '@deps/components/user-context-menu/user-context-menu';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

export const useMainNavItems = (): NavGroup[] => {
    const {
        hasDashboardPermission,
        isAdvisorsExcel,
        isAllowReadCaseManagement,
        isAllowReadOtpRenewals,
        isAllowReadPolicyAdmin,
        permissionsLoadingComplete,
        isSuperAdmin,
        hasHomeExperience,
        isOpsManagerView,
        showToppanMerrill,
        isAllowReadIllustrations,
        hasUsagePermission,
    } = usePermissionsContext();

    const { user } = useUser();
    const { t } = useTranslation();
    const { featureFlags } = useOptimizely();
    const showHomeNavBtn = featureFlags?.[FEATURE_FLAGS.SHOW_HOME_NAV_BTN];
    const showIllustrationsNavBtn =
        featureFlags?.[FEATURE_FLAGS.ILLUSTRATIONS_EXPERIENCE];

    if (!permissionsLoadingComplete) {
        return [];
    }

    const homeLinkText = t('site.navLinks.home.text');
    const homeLinkHref = t('site.navLinks.home.link');
    const taskManagementText = t('site.navLinks.tasks.text');
    const taskManagementHref = t('site.navLinks.tasks.link') || '';
    const caseLinkText = t('site.navLinks.caseManagement.text');
    const caseLinkHref = t('site.navLinks.caseManagement.link') || '';
    const policySearchText = t('site.navLinks.policySearch.text');
    const policySearchHref = t('site.navLinks.policySearch.link') || '';
    const transactionOpsSuiteText = t('site.navLinks.transactionOpsSuite.text');
    const transactionOpsSuiteHref =
        t('site.navLinks.transactionOpsSuite.link') || '';
    const dashboardText = t('site.navLinks.dashboard.text') || '';
    const dashboardHref = t('site.navLinks.dashboard.link') || '';
    const usageText = t('site.navLinks.usage.text') || '';
    const usageHref = t('site.navLinks.usage.link') || '';
    const accessManagement = t('site.navLinks.accessManagement.text');
    const marketingStorefrontText = t('site.navLinks.marketingStorefront.text');
    const marketingStorefrontHref =
        t('site.navLinks.marketingStorefront.link') || '';
    const illustrationsText = t('site.navLinks.illustrations.text');

    const handleAnalytics = (linkText: string) => {
        segmentAnalyticsTrackEvent('navigation_clicked', {
            button_text: linkText,
            timestamp: new Date().toISOString(),
            userId: user?.partyId,
        });
    };

    const homeLink = {
        id: homeLinkHref,
        display: homeLinkText,
        icon: IconType.HOUSE,
        renderComponent: (
            <NavLink
                type={NavElementType.Link}
                href={homeLinkHref}
                onClick={() => handleAnalytics(homeLinkText)}
            />
        ),
    };

    const taskManagementLink = {
        id: taskManagementHref,
        display: taskManagementText,
        icon: IconType.TABLE,
        renderComponent: (
            <NavLink type={NavElementType.Link} href={taskManagementHref} onClick={() => handleAnalytics(taskManagementText)} />
        ),
    };

    const caseLink = {
        id: caseLinkHref,
        display: caseLinkText,
        icon: IconType.BRIEFCASE,
        renderComponent: (
            <NavLink
                type={NavElementType.Link}
                href={caseLinkHref}
                onClick={() => handleAnalytics(caseLinkText)}
            />
        ),
    };

    const policyLink = {
        id: policySearchHref,
        display: policySearchText,
        icon: IconType.SHIELD_CHECKMARK,
        renderComponent: (
            <NavLink
                type={NavElementType.Link}
                href={policySearchHref}
                onClick={() => handleAnalytics(policySearchText)}
            />
        ),
    };

    const illustrationsLink = {
        id: '/illustrations',
        display: 'Illustrations',
        icon: IconType.DOCUMENT,
        renderComponent: (
            <NavLink
                type={NavElementType.Link}
                href={'/illustrations/client-cases'}
                onClick={() => handleAnalytics(illustrationsText)}
            />
        ),
    };

    const transactionOpsLink = {
        id: transactionOpsSuiteHref,
        display: transactionOpsSuiteText,
        icon: IconType.TICKET,
        renderComponent: (
            <NavLink
                type={NavElementType.Link}
                href={transactionOpsSuiteHref}
                onClick={() => handleAnalytics(transactionOpsSuiteText)}
            />
        ),
    };

    const dashboardLink = {
        id: dashboardHref,
        display: dashboardText,
        icon: IconType.CHART_LINE,
        renderComponent: (
            <NavLink
                type={NavElementType.Link}
                href={dashboardHref}
                onClick={() => handleAnalytics(dashboardText)}
            />
        ),
    };

    const toppanMerrillLink = {
        id: marketingStorefrontHref,
        display: marketingStorefrontText,
        icon: IconType.LIGHTBULB,
        renderComponent: (
            <NavLink
                type={NavElementType.Link}
                href={marketingStorefrontHref}
                target="_blank"
                onClick={() => handleAnalytics(marketingStorefrontText)}
            />
        ),
    };

    const accessManagementLink = {
        id: accessManagement,
        display: accessManagement,
        icon: IconType.MENU_GRID,
        renderComponent: (
            <NavLink
                type={NavElementType.Link}
                href={process.env.NEXT_PUBLIC_ACCESS_MANAGEMENT_URL}
                onClick={() => handleAnalytics(accessManagement)}
            />
        ),
    };

    const userContextMenu = {
        id: 'userContextMenu',
        display: user?.name || '',
        icon: IconType.USER,
        renderComponent: <UserContextMenu name={user?.name || ''} />,
    };

    const usageLink = {
        id: usageHref,
        display: usageText,
        icon: IconType.CHAT_SQUARE_BAR,
        renderComponent: (
            <NavLink type={NavElementType.Link} href={usageHref} />
        ),
    };

    const navGroups: NavGroup[] = [
        {
            items: [
                ...(hasHomeExperience && showHomeNavBtn ? [homeLink] : []),
                ...(isAllowReadCaseManagement ? [caseLink] : []),
                ...(isAdvisorsExcel || isAllowReadPolicyAdmin
                    ? [policyLink]
                    : []),
                ...(isAllowReadIllustrations && showIllustrationsNavBtn
                    ? [illustrationsLink]
                    : []),
            ],
        },
        {
            items: [...(isAllowReadOtpRenewals ? [transactionOpsLink] : []), ...(isOpsManagerView ? [taskManagementLink] : [])],
        },
        {
            items: [...(hasDashboardPermission ? [dashboardLink] : [])],
        },
        {
            items: [
                ...(hasUsagePermission ? [usageLink] : []),
                ...(isSuperAdmin ? [accessManagementLink] : []),
                ...(showToppanMerrill ? [toppanMerrillLink] : []),
                userContextMenu,
            ],
            alignEnd: true,
        },
    ];

    return navGroups;
};
