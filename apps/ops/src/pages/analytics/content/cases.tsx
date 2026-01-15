import { ButtonGroup, TabContent, TabGroup } from '@zinnia/bloom/components';
import { useRouter } from 'next/router';
import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AnalyticsTabs, TabTitles } from '@deps/components/dashboard/types';
import { ActiveApplications } from '@deps/containers/dashboard/active-applications/active-applications';
import { ClosedTransactions } from '@deps/containers/dashboard/closed-transactions/closed-transactions';
import { NIGOAnalysis } from '@deps/containers/dashboard/nigo-analysis/nigo-analysis';
import { TasksAnalysis } from '@deps/containers/dashboard/tasks-analysis/tasks-analysis';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import styles from '../Dashboard.module.css';

const Cases = forwardRef<HTMLDivElement, { tab?: string }>(({ tab }, ref) => {
    const { t } = useTranslation();
    const router = useRouter();
    const [selectedTab, setSelectedTab] = useState<string>(
        tab ?? AnalyticsTabs.ACTIVE_APPLICATIONS
    );

    const { featureFlags } = useOptimizely();
    const buttonNavItems = [
        {
            id: `analytics-tab-${TabTitles.OPEN}`,
            children: <span>{t(`enums.${TabTitles.OPEN}`)}</span>,
            value: AnalyticsTabs.ACTIVE_APPLICATIONS,
        },
        {
            id: `analytics-tab-${TabTitles.CLOSED}`,
            children: <span>{t(`enums.${TabTitles.CLOSED}`)}</span>,
            value: AnalyticsTabs.CLOSED_TRANSACTIONS,
        },
        {
            id: `analytics-tab-${TabTitles.ISSUES}`,
            children: <span>{t(`enums.${TabTitles.ISSUES}`)}</span>,
            value: AnalyticsTabs.NIGO_ANALYSIS,
        },
        {
            id: `analytics-tab-${TabTitles.TASKS}`,
            children: <span>{t(`enums.${TabTitles.TASKS}`)}</span>,
            value: AnalyticsTabs.TASKS_VOLUME,
        },
    ];

    const handleClick = (value: unknown) => {
        if (value) {
            router.replace(`/analytics/cases/?tab=${value}`, undefined, {
                shallow: true,
            });
            // NOTE: the button group onClick handler type expect a function that returns unknown
            setSelectedTab(value as string);
        }
    };

    return (
        <>
            <ButtonGroup
                className={styles.buttonGroup}
                items={buttonNavItems}
                onClick={handleClick}
                defaultValue={selectedTab}
                value={selectedTab}
            />
            <TabGroup
                defaultValue={AnalyticsTabs.ACTIVE_APPLICATIONS}
                value={selectedTab}
                activationMode="manual"
            >
                <div className={styles.tabContent} ref={ref}>
                    <TabContent value={AnalyticsTabs.ACTIVE_APPLICATIONS}>
                        <ActiveApplications />
                    </TabContent>
                    <TabContent value={AnalyticsTabs.CLOSED_TRANSACTIONS}>
                        <ClosedTransactions />
                    </TabContent>
                    {featureFlags[FEATURE_FLAGS.DASHBOARD_NIGO_TAB] && (
                        <TabContent value={AnalyticsTabs.NIGO_ANALYSIS}>
                            <NIGOAnalysis />
                        </TabContent>
                    )}
                    <TabContent value={AnalyticsTabs.TASKS_VOLUME}>
                        <TasksAnalysis />
                    </TabContent>
                </div>
            </TabGroup>
        </>
    );
});

Cases.displayName = 'Cases';

export default Cases;
