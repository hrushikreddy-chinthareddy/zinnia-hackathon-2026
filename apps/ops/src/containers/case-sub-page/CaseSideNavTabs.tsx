import { TabList, TabContent, TabGroup, TabTrigger } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import Typography, { TypographyVariant } from '@deps/components/typography/typography';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { Case } from '@deps/models/case/case';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { CaseSideNavProps } from './CaseSideNav';
import { FundingSources } from './CaseSideNavFundingSource';
import { Parties } from './CaseSideNavParties';

const TabViews = {
    people: 'people',
    fundingSource: 'fundingSource',
};

const getTabs = (caseDetails: Case, includeFundingSource?: boolean): string[] => {
    const tabs = [TabViews.people];
    if (
        includeFundingSource &&
        (caseDetails?.caseAdditionalData ?? []).filter(val => val?.label?.toLowerCase() === 'paymentrecordid')?.length > 0
    ) {
        tabs.push(TabViews.fundingSource);
    }
    return tabs;
};

export default function CaseSideNavTabs({ caseDetails, sideNavData }: { caseDetails: Case; sideNavData: CaseSideNavProps['data'] }) {
    const { t } = useTranslation();
    const { featureFlags } = useOptimizely();
    const tabs = getTabs(caseDetails, featureFlags[FEATURE_FLAGS.DEPU_4253_FUNDING_SOURCES]);
    const [tab, setTab] = useState(tabs[0]);
    const showFundingSourceTab = tabs.includes(TabViews.fundingSource);

    return (
        <div className='flex w-full flex-col px-8 py-4 rounded bg-white border-1 border-gray-200'>
            <TabGroup defaultValue={tab} value={tab} activationMode="manual" onValueChange={setTab}>
                <TabList className={`w-full ${tabs.length <= 1 ? '!hidden' : ''}`}>
                    {tabs.map(view => (
                        <TabTrigger key={view} value={view}>
                            <Typography variant={TypographyVariant.LabelMdAlt}>{t(`caseOverview.sidenav.tabs.${view}`)}</Typography>
                        </TabTrigger>
                    ))}
                </TabList>
                <TabContent className="w-full" value={TabViews.people}>
                    <Parties parties={sideNavData.parties} caseStatus={caseDetails.caseStatus} showTitle={tabs.length === 1} />
                </TabContent>
                {showFundingSourceTab && (
                    <TabContent className="w-full" value={TabViews.fundingSource}>
                        <FundingSources
                            fundingSources={
                                caseDetails?.caseAdditionalData?.filter(val => val?.label?.toLowerCase() === 'paymentrecordid') ?? []
                            }
                        />
                    </TabContent>
                )}
            </TabGroup>
        </div>
    );
}
