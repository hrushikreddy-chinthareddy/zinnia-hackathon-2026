import { ButtonGroup, TabContent, TabGroup } from '@zinnia/bloom/components';
import { useRouter } from 'next/router';
import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { UsageTabs, UsageTabTitles } from '@deps/components/dashboard/types';
import { Activity } from '@deps/components/usage/activity/activity';
import { Logins } from '@deps/components/usage/logins/logins';
import { PageViews } from '@deps/components/usage/page-views/page-views';

import styles from '../Dashboard.module.css';

const Usage = forwardRef<HTMLDivElement, { tab?: string }>(({ tab }, ref) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState<string>(
        tab ?? UsageTabs.LOGINS
    );

    const buttonNavItems = [
        {
            id: `usage-tab-${UsageTabTitles.LOGINS}`,
            children: <span>{t(`enums.${UsageTabTitles.LOGINS}`)}</span>,
            value: UsageTabs.LOGINS,
        },
        {
            id: `usage-tab-${UsageTabTitles.PAGEVIEWS}`,
            children: <span>{t(`enums.${UsageTabTitles.PAGEVIEWS}`)}</span>,
            value: UsageTabs.PAGE_VIEWS,
        },
        {
            id: `analytics-tab-${UsageTabTitles.ACTIVITY}`,
            children: <span>{t(`enums.${UsageTabTitles.ACTIVITY}`)}</span>,
            value: UsageTabs.ACTIVITY,
        },
    ];

    const handleClick = (value: unknown) => {
        router.replace(`/analytics/usage/?tab=${value}`, undefined, {
            shallow: true,
        });
        // NOTE: the button group onClick handler type expect a function that returns unknown
        setSelectedTab(value as string);
    };

    return (
        <>
            <ButtonGroup
                className={styles.buttonGroup}
                items={buttonNavItems}
                onClick={handleClick}
                defaultValue={selectedTab}
            />
            <TabGroup defaultValue={UsageTabs.LOGINS} value={selectedTab}>
                <div className={styles.tabContent} ref={ref}>
                    <TabContent value={UsageTabs.LOGINS}>
                        <Logins />
                    </TabContent>
                    <TabContent value={UsageTabs.PAGE_VIEWS}>
                        <PageViews />
                    </TabContent>
                    <TabContent value={UsageTabs.ACTIVITY}>
                        <Activity />
                    </TabContent>
                </div>
            </TabGroup>
        </>
    );
});

Usage.displayName = 'Usage';

export default Usage;
