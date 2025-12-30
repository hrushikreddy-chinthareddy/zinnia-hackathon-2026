import {
    Icon,
    IconType,
    TabGroup,
    TabList,
    TabTrigger,
} from '@zinnia/bloom/components';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import { CSSProperties, FC, PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { toTitleCase } from '@deps/utils/strings';

export enum UsageTabs {
    LOGINS = 'logins',
    PAGE_VIEWS = 'page-views',
    ACTIVITY = 'activity',
}
const DEFAULT_TAB = UsageTabs.LOGINS;

export const UsageTabNav: FC<PropsWithChildren> = ({ children }) => {
    const router = useRouter();
    const params = useSearchParams();
    const { t } = useTranslation();
    const tabParam = params.get('tab');
    const [tabVal, setTabVal] = useState(tabParam || DEFAULT_TAB);

    const handleTabChange = (val: string) => {
        setTabVal(val);
        router.replace(`/usage?tab=${val}`, undefined, { shallow: true });
    };

    if (!tabParam) {
        router.replace(`/usage?tab=${DEFAULT_TAB}`, undefined, {
            shallow: true,
        });
    }

    return (
        <TabGroup
            defaultValue={tabVal}
            value={tabVal}
            activationMode="manual"
            onValueChange={handleTabChange}
        >
            <TabList
                style={
                    {
                        '--indicator-z-index': 2,
                    } as CSSProperties
                }
                className="!mb-0 w-full !border-b-0 bg-white "
            >
                <TabTrigger value={UsageTabs.LOGINS}>
                    <Icon
                        type={IconType.USER_GROUP}
                        width={24}
                        height={24}
                        className="hidden lg:block"
                    />
                    {t('usage.tabs.logins')}
                </TabTrigger>
                <TabTrigger value={UsageTabs.PAGE_VIEWS}>
                    <Icon
                        type={IconType.DASHBOARD}
                        width={24}
                        height={24}
                        className="hidden lg:block"
                    />
                    {toTitleCase('page views')}
                </TabTrigger>
                <TabTrigger value={UsageTabs.ACTIVITY}>
                    <Icon
                        type={IconType.COLLECTION}
                        width={24}
                        height={24}
                        className="hidden lg:block"
                    />
                    {toTitleCase('activity')}
                </TabTrigger>
            </TabList>
            {children}
        </TabGroup>
    );
};
