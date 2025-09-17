import {
    Icon,
    type IconType,
    TabContent,
    TabGroup,
    TabList,
    TabTrigger,
} from '@zinnia/bloom/components';
import { useState } from 'react';

export enum SettingsTabEnum {
    TENANTS = 'tenants',
    SYSTEM_USERS = 'systemUsers',
}

export type SettingsTabs = {
    label: string;
    icon: IconType;
    value: SettingsTabEnum;
    content: React.ReactNode;
};

export type SettingsTabProps = {
    tabs: SettingsTabs[];
};

const SettingsTab = ({ tabs }: SettingsTabProps) => {
    const [selectedTab, setSelectedTab] = useState<SettingsTabEnum>(
        tabs[0].value
    );
    const handleTabValueChange = (val: string) => {
        setSelectedTab(val as SettingsTabEnum);
    };
    return (
        <div>
            <TabGroup
                activationMode="manual"
                defaultValue={tabs[0].value}
                onValueChange={handleTabValueChange}
                value={selectedTab}
            >
                <TabList>
                    {tabs?.map((page) => (
                        <TabTrigger key={page.value} value={page.value}>
                            <Icon type={page.icon} /> {page.label}
                        </TabTrigger>
                    ))}
                </TabList>
                {tabs?.map((page) => (
                    <TabContent key={page.value} value={page.value}>
                        {page.content}
                    </TabContent>
                ))}
            </TabGroup>
        </div>
    );
};

export default SettingsTab;
