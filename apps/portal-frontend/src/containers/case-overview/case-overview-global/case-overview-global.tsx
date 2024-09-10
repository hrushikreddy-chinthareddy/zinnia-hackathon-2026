import { useTranslation } from 'next-i18next';
import React, { useContext, useState } from 'react';

import CaseOverViewBox, { CaseOverviewBoxProps } from '@deps/components/case-overview-box/case-overview-box';
import CaseOverviewContent from '@deps/components/case-overview-box/content/case-overview-content';
import CaseOverviewStageContent from '@deps/components/case-overview-box/content/case-overview-stage-content';
import { CASE_OVERVIEW_TEXT, CaseOverviewNavDrawerContext } from '@deps/contexts/CaseOverviewNavDrawer';
import { Case, Statuses } from '@deps/models/case/case';
import { ExceptionStatuses } from '@deps/models/case/exception-instance';
import { StepInstance } from '@deps/models/case/step-instance';

interface CaseOverviewGlobalProps {
    caseDetails: Case;
}

const CaseOverviewGlobal = ({ caseDetails }: CaseOverviewGlobalProps) => {
    const { t } = useTranslation();

    const [selectedNavItem] = useContext(CaseOverviewNavDrawerContext);
    const [activeToggleBtn, setActiveToggleBtn] = useState('open');

    const isCaseOverview = selectedNavItem === CASE_OVERVIEW_TEXT;

    const currentStage = caseDetails.stages.find(stage => stage.label === selectedNavItem);

    const status = isCaseOverview ? caseDetails.caseStatus : (currentStage?.stageStatus as Statuses);

    const props: CaseOverviewBoxProps = {
        children: null,
        label: isCaseOverview ? t('caseOverview.headerText') : selectedNavItem,
        status,
        activeToggleBtn,
        setActiveToggleBtn,
    };

    if (isCaseOverview) {
        const openExceptions = caseDetails.exceptions.filter(exception => exception.status !== ExceptionStatuses.Resolved);
        const resolvedExceptions = caseDetails.exceptions.filter(exception => exception.status === ExceptionStatuses.Resolved);

        props.children = (
            <CaseOverviewContent
                openExceptions={openExceptions}
                resolvedExceptions={resolvedExceptions}
                activeToggleBtn={activeToggleBtn}
                status={status}
                updatedAt={caseDetails.updatedAt}
                createdAt={caseDetails.createdAt}
            />
        );

        props.caseProgress = {
            open: openExceptions.length,
            resolved: resolvedExceptions.length,
        };
    } else {
        const finishedStepStatuses = [ExceptionStatuses.Resolved, Statuses.Completed];
        props.children = <CaseOverviewStageContent steps={currentStage?.steps as StepInstance[]} />;

        props.stepProgress = {
            currentStep: currentStage?.steps?.filter(step => finishedStepStatuses.includes(step.stepStatus)).length as number,
            totalSteps: currentStage?.steps?.length as number,
        };
    }

    return <CaseOverViewBox {...props} />;
};

export default CaseOverviewGlobal;
