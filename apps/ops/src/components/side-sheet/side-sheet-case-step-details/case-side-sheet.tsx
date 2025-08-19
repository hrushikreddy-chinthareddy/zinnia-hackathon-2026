import {
    TabGroup,
    TabList,
    TabTrigger,
    TabContent,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import { TransformedStep } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-helpers';
import StepAdditionalData, {
    hasAdditionalDataSideSheet,
    hasTransactionalAdditionalDataSideSheet,
} from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/step-additional-data';
import { AdditionalDataStepIds } from '@deps/models/case/additional-data-instance';
import { DEFAULT_ERROR_STRING } from '@deps/types/constants';

import DocumentsTab from './tabs/documents-tab';
import MultiInstanceTab from './tabs/multi-instance-tab';
import { TransactionsStepAdditionalData } from './tabs/transactions-step-additional-data';
import { TransactionsAdditionalDataStepIds } from './tabs/transactions-step-additional-data.types';

const StepSideSheetViews = {
    AdditionalData: 'additionalData',
    Documents: 'documents',
    MultiInstance: 'multiInstance',
    Overview: 'overview',
    StepAdditionalData: 'stepAdditionalData',
};
const entityTypes = {
    CedingCarrier: 'Ceding Carrier',
    Insured: 'Insured',
    Policy: 'Policy',
    Program: 'Program',
    Transaction: 'Transaction',
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

    if (hasTransactionalAdditionalDataSideSheet(step)) {
        sideSheetViews.push(StepSideSheetViews.StepAdditionalData);
    }

    return sideSheetViews;
};

export const doesStepHaveSidesheet = (step: TransformedStep): boolean => {
    return getStepSidesheetViews(step).length > 0;
};

export const ContractDetails = ({
    step,
    ...rest
}: { step: TransformedStep } & React.HTMLAttributes<HTMLDivElement>) => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col w-full mb-4">
            <h3 className="tracking-normal no-underline headline-3 mb-4">
                {t('sideSheet.task.tabs.details')}
            </h3>
            <div className="flex flex-row items-start gap-16">
                <div className="w-1/3 text-[--color-base-text-text-secondary]">
                    {t('contractNumber')}
                </div>
                <div className="w-2/3">
                    {step.stepRaw.additionalData?.surrenderContractNumber
                        ?.value || DEFAULT_ERROR_STRING}
                </div>
            </div>
        </div>
    );
};

export default function StepSideSheetContent({
    step,
}: {
    step: TransformedStep;
}) {
    const { t } = useTranslation();
    const sideSheetViews = getStepSidesheetViews(step);
    const [tab, setTab] = useState(sideSheetViews[0]);

    return (
        <div>
            <TabGroup
                defaultValue={tab}
                value={tab}
                activationMode="manual"
                onValueChange={setTab}
            >
                <TabList
                    className={`!mb-0 w-full px-4 pt-4 md:px-6 lg:px-8 ${
                        sideSheetViews.length <= 1 ? '!hidden' : ''
                    }`}
                >
                    {sideSheetViews.map((view) => (
                        <TabTrigger key={view} value={view}>
                            {t(`caseOverview.sidesheet.${view}`)}
                        </TabTrigger>
                    ))}
                </TabList>
                <TabContent
                    className="w-full p-8"
                    value={StepSideSheetViews.MultiInstance}
                >
                    {step.stepRaw.instanceInfo?.entityType ===
                        entityTypes.CedingCarrier && (
                        <ContractDetails step={step} />
                    )}

                    <MultiInstanceTab step={step} />
                </TabContent>
                <TabContent
                    className="w-full p-8"
                    value={StepSideSheetViews.Documents}
                >
                    <DocumentsTab step={step} />
                </TabContent>
                <TabContent
                    className="w-full p-8"
                    value={StepSideSheetViews.AdditionalData}
                >
                    <StepAdditionalData
                        additionalData={step.additionalData}
                        stepKey={step.id as AdditionalDataStepIds}
                        status={step.status}
                        date={step.updatedAt}
                    />
                </TabContent>
                <TabContent
                    className="w-full p-8"
                    value={StepSideSheetViews.StepAdditionalData}
                >
                    <TransactionsStepAdditionalData
                        stepAdditionalData={step.stepAdditionalData?.[0]}
                        stepKey={step.id as TransactionsAdditionalDataStepIds}
                    />
                </TabContent>
            </TabGroup>
        </div>
    );
}
