import { TabGroup, TabList, TabTrigger } from '@zinnia/bloom/components';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useState } from 'react';

import { baseAppUrl } from '@deps/queries/api-config';

import styles from './person-role-tabs.module.css';
import {
    DEFAULT_PERSON_ROLE_TAB,
    PersonRoleTab,
    PersonRoleTabValues,
    resolvePersonRoleTab,
} from './person-sub-page.helpers';

interface PersonRoleTabsProps {
    /** The currently active tab slug from the URL */
    activeTab: string | undefined;
    /** Content to render inside the active tab panel */
    children: React.ReactNode;
}

/**
 * Renders a tablist with "Policy Details" and "Agent Details" tabs
 * above the person header. Uses Bloom TabGroup for accessible
 * keyboard navigation and semantics (tablist/tab/tabpanel).
 *
 * Tab selection is persisted via the URL slug so that browser
 * back/forward and refresh preserve the selected tab.
 */
const PersonRoleTabs = ({ activeTab, children }: PersonRoleTabsProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const { planCode, id, slug } = router.query;

    // slug is ['people', partyId] or ['people', partyId, tabSlug]
    const partyId = Array.isArray(slug) ? slug[1] : undefined;

    const [currentTab, setCurrentTab] = useState<PersonRoleTab>(
        resolvePersonRoleTab(activeTab)
    );

    const handleTabChange = useCallback(
        (value: string) => {
            const newTab = resolvePersonRoleTab(value);
            setCurrentTab(newTab);

            // Default tab doesn't need a slug segment
            const tabSegment =
                newTab === DEFAULT_PERSON_ROLE_TAB ? '' : `/${newTab}`;
            const newUrl = `${baseAppUrl}/policies/${planCode}/${id}/people/${partyId}${tabSegment}`;

            window.history.replaceState(window.history.state, '', newUrl);
        },
        [planCode, id, partyId]
    );

    return (
        <TabGroup
            defaultValue={currentTab}
            value={currentTab}
            activationMode="manual"
            onValueChange={handleTabChange}
        >
            <TabList className={styles.tabList}>
                <TabTrigger value={PersonRoleTabValues.policyDetails}>
                    {t('allFields.roleTabsPolicyDetails')}
                </TabTrigger>
                <TabTrigger value={PersonRoleTabValues.agentDetails}>
                    {t('allFields.roleTabsAgentDetails')}
                </TabTrigger>
            </TabList>
            {children}
        </TabGroup>
    );
};

export default PersonRoleTabs;
