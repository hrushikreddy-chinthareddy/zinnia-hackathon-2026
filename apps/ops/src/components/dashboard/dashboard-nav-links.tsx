import {
    Icon,
    IconType,
    TabGroup,
    TabList,
    TabTrigger,
} from '@zinnia/bloom/components';
import { useRouter } from 'next/router';
import { CSSProperties, FC, PropsWithChildren, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AnalyticsRouteValues } from '@deps/types/constants';

const DEFAULT_TAB = AnalyticsRouteValues.cases;

export const DashboardTabNav: FC<PropsWithChildren & { tab?: string }> = ({
    children,
    tab,
}) => {
    const router = useRouter();
    // const params = useSearchParams();
    // const tabParam = params.get('tab');
    const [tabVal, setTabVal] = useState(tab || DEFAULT_TAB);

    const handleTabChange = (val: string) => {
        setTabVal(val);
        router.replace(`/analytics/${val}`, undefined, { shallow: true });
    };

    // if (!tabParam) {
    //     router.replace(`/analytics?tab=${DEFAULT_TAB}`, undefined, {
    //         shallow: true,
    //     });
    // }
    const { t } = useTranslation();

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
                <TabTrigger value={AnalyticsRouteValues.cases}>
                    <Icon
                        type={IconType.BRIEFCASE}
                        width={24}
                        height={24}
                        className="hidden lg:block"
                    />
                    {t('allFields.cases')}
                </TabTrigger>
                <TabTrigger value={AnalyticsRouteValues.policies}>
                    <Icon
                        type={IconType.BRIEFCASE}
                        width={24}
                        height={24}
                        className="hidden lg:block"
                    />
                    Policies
                </TabTrigger>
            </TabList>
            {children}
        </TabGroup>
    );
};
