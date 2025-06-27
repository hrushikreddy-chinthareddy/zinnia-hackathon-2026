import { Icon, IconType, TabGroup, TabList, TabTrigger } from '@zinnia/bloom/components';
import { FC, PropsWithChildren } from 'react';

import styles from '@deps/components/dashboard/sections-tab-nav/sections-tab-nav.module.css';
export enum SectionTabValues {
    CHART = 'chart',
    TABLE = 'table',
    INSIGHTS = 'insights',
}

interface Tabs {
    value: SectionTabValues;
    iconType: IconType;
}

interface SectionTabNavsProps {
    tabs?: Tabs[];
    defaultValue?: string;
}

const defaultTabs = [
    {
        value: SectionTabValues.CHART,
        iconType: IconType.CHART_BARS,
    },
    {
        value: SectionTabValues.TABLE,
        iconType: IconType.TABLE,
    },
    {
        value: SectionTabValues.INSIGHTS,
        iconType: IconType.SPARKLES,
    },
];

export const SectionTabNavs: FC<PropsWithChildren<SectionTabNavsProps>> = ({ tabs, children, defaultValue = SectionTabValues.CHART }) => {
    const tabsToRender = tabs || defaultTabs;
    return (
        <TabGroup defaultValue={defaultValue} className="bg-white">
            <div className="flex">
                <TabList className={styles.tabList}>
                    {tabsToRender.map(tab => (
                        <TabTrigger aria-label={`View ${tab.value}`} value={tab.value} key={tab.value}>
                            <Icon type={tab.iconType} width={28} height={28} />
                        </TabTrigger>
                    ))}
                </TabList>
                {children}
            </div>
        </TabGroup>
    );
};
