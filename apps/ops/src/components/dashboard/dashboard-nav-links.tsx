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

const DEFAULT_PATH = AnalyticsRouteValues.cases;

export const DashboardTabNav: FC<PropsWithChildren & { path?: string }> = ({
    children,
    path,
}) => {
    const router = useRouter();
    const [pathVal, setPathVal] = useState(path || DEFAULT_PATH);

    const handleTabChange = (val: string) => {
        setPathVal(val);
        router.replace(`/analytics/${val}`, undefined, { shallow: true });
    };

    const { t } = useTranslation();

    return (
        <TabGroup
            defaultValue={pathVal}
            value={pathVal}
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
            </TabList>
            {children}
        </TabGroup>
    );
};
