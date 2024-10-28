import { TabGroup, TabList, TabTrigger, TabContent } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { TransformedStep } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-helpers';
import StepAdditionalData, { hasAdditionalDataSideSheet } from '@deps/containers/case-overview/step-overview/step-additional-data';
import { AdditionalDataStepIds } from '@deps/models/case/additional-data-instance';

import DocumentsTab from './tabs/documents-tab';
import MultiInstanceTab from './tabs/multi-instance-tab';

// BPB - move this!
const StepSideSheetViews = {
    AdditionalData: 'additionalData',
    Documents: 'documents',
    MultiInstance: 'multiInstance',
    Overview: 'overview',
};

const getStepSidesheetViews = (step: TransformedStep): string[] => {
    const sideSheetViews = [];
    if (step.isMultiInstance && step.substeps?.length) {
        sideSheetViews.push(StepSideSheetViews.MultiInstance);
    }

    if (step.documents?.length) {
        sideSheetViews.push(StepSideSheetViews.Documents);
    }

    if (hasAdditionalDataSideSheet(step)) {
        sideSheetViews.push(StepSideSheetViews.AdditionalData);
    }

    return sideSheetViews;
};

export const doesStepHaveSidesheet = (step: TransformedStep): boolean => {
    return getStepSidesheetViews(step).length > 0;
};

export default function StepSideSheetContent({ step }: { step: TransformedStep }) {
    const { t } = useTranslation();
    const sideSheetViews = getStepSidesheetViews(step);
    const [tab, setTab] = useState(sideSheetViews[0]);

    return (
        <div>
            <TabGroup defaultValue={tab} value={tab} activationMode="manual" onValueChange={setTab}>
                <TabList className={`!mb-0 w-full px-4 pt-4 md:px-6 lg:px-8 ${sideSheetViews.length <= 1 ? '!hidden' : ''}`}>
                    {sideSheetViews.map(view => (
                        <TabTrigger key={view} value={view}>
                            {t(`caseOverview.sidesheet.${view}`)}
                        </TabTrigger>
                    ))}
                </TabList>
                <TabContent className="w-full p-8" value={StepSideSheetViews.MultiInstance}>
                    <MultiInstanceTab step={step} />
                </TabContent>
                <TabContent className="w-full p-8" value={StepSideSheetViews.Documents}>
                    <DocumentsTab step={step} />
                </TabContent>
                <TabContent className="w-full p-8" value={StepSideSheetViews.AdditionalData}>
                    <StepAdditionalData
                        additionalData={step.additionalData}
                        stepKey={step.id as AdditionalDataStepIds}
                        status={step.status}
                        date={step.updatedAt}
                    />
                </TabContent>
            </TabGroup>
        </div>
    );
}
