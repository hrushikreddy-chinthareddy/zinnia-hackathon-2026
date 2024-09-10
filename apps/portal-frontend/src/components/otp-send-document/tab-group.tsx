import { useTranslation } from 'next-i18next';
import React, { useMemo } from 'react';

import ProgressBarSteps from '@deps/containers/progress-bar-steps/progress-bar-steps';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { WorkflowProvider, useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PartyRole, Policy } from '@deps/models/policy/sor-policy';

import GlobalValuesBar from '../global-values/global-values-bar/global-values-bar';

type TabGroupContainerProps = {
    steps: Step[];
    policy: Policy;
};
const TabGroupContent = ({ steps, policy }: TabGroupContainerProps) => {
    const { t } = useTranslation();
    const { currentStepIndex, setCurrentStepIndex } = useWorkflow();
    const globalValuesData = useMemo(() => policyDataToGlobalValues(policy, t), [policy, t]);

    const { marketingName, planCode, policyNumber, productType, status, tooltip, variant } = globalValuesData;
    const handleClick = (step: Step) => {
        if (step.isDisabled || currentStepIndex === step.index) return;

        setCurrentStepIndex(step.index);
    };

    const policyOwnerId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.OWNER)?.partyId;
    const policyOwner = policy?.parties?.find(party => party.partyId === policyOwnerId);

    return (
        <div className="workflow-height-adjusted flex w-full max-w-[1130px] grow flex-col self-center">
            <GlobalValuesBar
                carrierId={policy.carrierId}
                marketingName={marketingName}
                owner={policyOwner}
                planCode={planCode}
                policyNumber={policyNumber}
                productType={productType}
                status={status}
                tooltip={tooltip}
                variant={variant}
            />
            <ProgressBarSteps
                classNames={`grid-cols-${steps.length}`}
                currentStepIndex={Number(currentStepIndex)}
                onClick={handleClick}
                steps={steps}
            />
            <div className="my-2 flex w-full grow flex-col rounded bg-white shadow-elevation-light-04">
                {steps[currentStepIndex].component}
            </div>
        </div>
    );
};

const TabGroupContainer = ({ steps, policy }: TabGroupContainerProps) => {
    return (
        <WorkflowProvider>
            <TabGroupContent steps={steps} policy={policy} />
        </WorkflowProvider>
    );
};

export default TabGroupContainer;
