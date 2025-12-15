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

import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { toTitleCase } from '@deps/utils/strings';

import { AnalyticsTabs } from './types';

const DEFAULT_TAB = AnalyticsTabs.ACTIVE_APPLICATIONS;

export const DashboardTabNav: FC<PropsWithChildren> = ({ children }) => {
    const router = useRouter();
    const params = useSearchParams();
    const tabParam = params.get('tab');
    const [tabVal, setTabVal] = useState(tabParam || DEFAULT_TAB);
    const { featureFlags } = useOptimizely();

    const handleTabChange = (val: string) => {
        setTabVal(val);
        router.replace(`/dashboard?tab=${val}`, undefined, { shallow: true });
    };

    if (!tabParam) {
        router.replace(`/analytics?tab=${DEFAULT_TAB}`, undefined, {
            shallow: true,
        });
    }
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
                <TabTrigger value={AnalyticsTabs.ACTIVE_APPLICATIONS}>
                    <Icon
                        type={IconType.DOCUMENT_TEXT}
                        width={24}
                        height={24}
                        className="hidden lg:block"
                    />
                    {toTitleCase('open cases')}
                </TabTrigger>
                <TabTrigger value={AnalyticsTabs.CLOSED_TRANSACTIONS}>
                    <Icon
                        type={IconType.SHIELD_CHECKMARK}
                        width={24}
                        height={24}
                        className="hidden lg:block"
                    />
                    {toTitleCase('closed cases')}
                </TabTrigger>
                {featureFlags[FEATURE_FLAGS.DASHBOARD_NIGO_TAB] && (
                    <TabTrigger value={AnalyticsTabs.NIGO_ANALYSIS}>
                        <Icon
                            type={IconType.HEX_EXCLAMATION}
                            width={24}
                            height={24}
                            className="hidden lg:block"
                        />
                        {t('caseStats.tabs.issue') ?? ''}
                    </TabTrigger>
                )}
                <TabTrigger value={AnalyticsTabs.TASKS_VOLUME}>
                    <Icon
                        type={IconType.CLIPBOARD_LIST}
                        width={24}
                        height={24}
                        className="hidden lg:block"
                    />
                    {t('caseStats.tabs.tasks') ?? ''}
                </TabTrigger>
            </TabList>
            {children}
        </TabGroup>
    );
};
