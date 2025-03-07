import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import GlobalValuesBar from '@deps/components/global-values/global-values-bar/global-values-bar';
import GlobalPolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import { PopoverPlacement } from '@deps/components/popover/popover';
import SideSheetProductDetails from '@deps/containers/side-sheet-product-details/side-sheet-product-details';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { WorkflowProvider, useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { PartyRole, Policy } from '@deps/models/policy/sor-policy';

import ProgressBarSteps from '../progress-bar-steps/progress-bar-steps';
import { Step } from '../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';

interface WorkflowContainerProps {
    policy: Policy;
    steps: Step[];
}

const WorkflowContent = ({ policy, steps }: WorkflowContainerProps) => {
    const { t } = useTranslation();
    const { currentStepIndex, setCurrentStepIndex } = useWorkflow();
    const sideSheet = useSideSheetContext();
    const globalValuesData = useMemo(() => policyDataToGlobalValues(new PolicyDetails(policy), t), [policy, t]);

    const { marketingName, planCode, policyNumber, productType, status, tooltip, variant } = globalValuesData;

    const openProductDetailsSideSheet = () => {
        sideSheet.changeSideSheetContent(
            <GlobalPolicyInfo tooltipPlacements={PopoverPlacement.BottomLeft} {...globalValuesData} />,
            <SideSheetProductDetails globalValues={globalValuesData} />
        );
        sideSheet.handleOpen(true);
    };

    const handleClick = (step: Step) => {
        if (step.isDisabled || currentStepIndex === step.index) return;

        setCurrentStepIndex(step.index);
    };

    const policyOwnerId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.OWNER)?.partyId;
    const policyOwner = policy?.parties?.find(party => party.partyId === policyOwnerId);

    return (
        <div className="workflow-height-adjusted flex w-full max-w-[1130px] grow flex-col self-center">
            <GlobalValuesBar
                carrierId={policy?.carrierId}
                marketingName={marketingName}
                openSideSheet={openProductDetailsSideSheet}
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
            <div className="flex w-full grow flex-col rounded bg-white shadow-elevation-light-04">{steps[currentStepIndex].component}</div>
        </div>
    );
};

const WorkflowContainer = ({ policy, steps }: WorkflowContainerProps) => {
    return (
        <WorkflowProvider>
            <WorkflowContent policy={policy} steps={steps} />
        </WorkflowProvider>
    );
};

export default WorkflowContainer;
