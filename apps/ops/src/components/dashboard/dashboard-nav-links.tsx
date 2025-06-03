import { Icon, IconType, TabGroup, TabList, TabTrigger } from '@zinnia/bloom/components';
import { toTitleCase } from '@zinnia/utils';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { CSSProperties, FC, PropsWithChildren, useState } from 'react';

export enum DashboardTabs {
    ACTIVE_APPLICATIONS = 'active-applications',
    CLOSED_TRANSACTIONS = 'closed-transactions',
}
const DEFAULT_TAB = DashboardTabs.ACTIVE_APPLICATIONS;

export const DashboardTabNav: FC<PropsWithChildren> = ({ children }) => {
    const router = useRouter();
    const params = useSearchParams();
    const tabParam = params.get('tab');
    const [tabVal, setTabVal] = useState(tabParam || DEFAULT_TAB);

    const handleTabChange = (val: string) => {
        setTabVal(val);
        router.replace(`/dashboard?tab=${val}`, undefined, { shallow: true });
    };

    if (!tabParam) {
        router.replace(`/dashboard?tab=${DEFAULT_TAB}`, undefined, { shallow: true });
    }

    return (
        <TabGroup defaultValue={tabVal} value={tabVal} activationMode="manual" onValueChange={handleTabChange}>
            <TabList
                style={
                    {
                        '--indicator-z-index': 2,
                    } as CSSProperties
                }
                className="!mb-0 w-full !border-b-0 bg-white "
            >
                <TabTrigger value={DashboardTabs.ACTIVE_APPLICATIONS}>
                    <Icon type={IconType.DOCUMENT_TEXT} width={24} height={24} className="hidden lg:block" /> {toTitleCase('open cases')}
                </TabTrigger>
                <TabTrigger value={DashboardTabs.CLOSED_TRANSACTIONS}>
                    <Icon type={IconType.SHIELD_CHECKMARK} width={24} height={24} className="hidden lg:block" />{' '}
                    {toTitleCase('closed cases')}
                </TabTrigger>
            </TabList>
            {children}
        </TabGroup>
    );
};
