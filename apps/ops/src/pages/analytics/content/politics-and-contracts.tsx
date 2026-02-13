import { ButtonGroup, TabContent, TabGroup } from '@zinnia/bloom/components';
import { useRouter } from 'next/router';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { RetentionAttrition } from '@deps/components/dashboard/sections/retention-attrition/retention-attrition';
import {
    PoliciesContractsTabs,
    PoliciesContractsTabTitles,
} from '@deps/components/dashboard/types';

import styles from '../Dashboard.module.css';

const PoliciesAndContracts = forwardRef<HTMLDivElement, { tab?: string }>(
    ({ tab }, ref) => {
        const { t } = useTranslation();
        const router = useRouter();
        const [selectedTab, setSelectedTab] = useState<string>(
            PoliciesContractsTabs.RETENTION_ATTRITION
        );

        const buttonNavItems = [
            {
                id: `analytics-tab-${PoliciesContractsTabTitles.RETENTIONATTRITION}`,
                children: (
                    <span>
                        {t(
                            `enums.${PoliciesContractsTabTitles.RETENTIONATTRITION}`
                        )}
                    </span>
                ),
                value: PoliciesContractsTabs.RETENTION_ATTRITION,
            },
        ];

        const policiesAndContractsTabSet = useMemo(
            () => new Set<string>(Object.values(PoliciesContractsTabs)),
            []
        );

        useEffect(() => {
            if (tab && policiesAndContractsTabSet.has(tab)) {
                setSelectedTab(tab);
            }
        }, [tab, policiesAndContractsTabSet]);

        const handleClick = (value: unknown) => {
            if (
                typeof value === 'string' &&
                policiesAndContractsTabSet.has(value)
            ) {
                router.replace(`/analytics/policies/?tab=${value}`, undefined, {
                    shallow: true,
                });
                // NOTE: the button group onClick handler type expect a function that returns unknown
                setSelectedTab(value);
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
                    defaultValue={PoliciesContractsTabs.RETENTION_ATTRITION}
                    value={selectedTab}
                >
                    <div className={styles.tabContent} ref={ref}>
                        <TabContent
                            value={PoliciesContractsTabs.RETENTION_ATTRITION}
                        >
                            <RetentionAttrition />
                        </TabContent>
                    </div>
                </TabGroup>
            </>
        );
    }
);

PoliciesAndContracts.displayName = 'Policies & Contracts';

export default PoliciesAndContracts;
