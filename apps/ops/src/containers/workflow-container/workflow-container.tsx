import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import GlobalValuesBar from '@deps/components/global-values/global-values-bar/global-values-bar';
import GlobalPolicyInfo from '@deps/components/global-values/policy-info/policy-info';
import { PopoverPlacement } from '@deps/components/popover/popover';
import SideSheetProductDetails from '@deps/components/side-sheet/side-sheet-product-details/side-sheet-product-details';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import {
    WorkflowProvider,
    useWorkflow,
} from '@deps/contexts/WorkflowContainerContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { DEFAULT_STEP_WIDTH } from '@deps/types/constants';
import { PartyRole, Policy } from '@zinnia/api-types/types/sor';

import styles from './workflow-container.module.css';
import ProgressBarSteps from '../progress-bar-steps/progress-bar-steps';
import { Step } from '../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';

interface WorkflowContainerProps {
    policy: Policy;
    steps: Step[];
    stepWidth?: number;
}

const WorkflowContent = ({
    policy,
    steps,
    stepWidth = DEFAULT_STEP_WIDTH,
}: WorkflowContainerProps) => {
    const { t } = useTranslation();
    const { currentStepIndex, setCurrentStepIndex } = useWorkflow();
    const sideSheet = useSideSheetContext();
    const globalValuesData = useMemo(
        () => policyDataToGlobalValues(new PolicyDetails(policy), t),
        [policy, t]
    );

    const {
        marketingName,
        planCode,
        policyNumber,
        productType,
        status,
        tooltip,
        variant,
    } = globalValuesData;

    const openProductDetailsSideSheet = () => {
        sideSheet.changeSideSheetContent(
            <GlobalPolicyInfo
                tooltipPlacements={PopoverPlacement.BottomLeft}
                {...globalValuesData}
            />,
            <SideSheetProductDetails globalValues={globalValuesData} />
        );
        sideSheet.handleOpen(true);
    };

    const handleClick = (step: Step) => {
        if (step.isDisabled || currentStepIndex === step.index) return;

        setCurrentStepIndex(step.index);
    };

    const policyOwnerId = policy?.partyRoles?.find(
        (pr) => pr.partyRole === PartyRole.OWNER
    )?.partyId;
    const policyOwner = policy?.parties?.find(
        (party) => party.partyId === policyOwnerId
    );

    return (
        <div>
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
            <div className={styles.contentContainer}>
                <ProgressBarSteps
                    currentStepIndex={Number(currentStepIndex)}
                    onClick={handleClick}
                    steps={steps}
                    stepWidth={stepWidth}
                />
                <div className={styles.stepsContainer}>
                    {steps[currentStepIndex].component}
                </div>
            </div>
        </div>
    );
};

const WorkflowContainer = ({
    policy,
    steps,
    stepWidth,
}: WorkflowContainerProps) => {
    return (
        <WorkflowProvider>
            <WorkflowContent
                policy={policy}
                steps={steps}
                stepWidth={stepWidth}
            />
        </WorkflowProvider>
    );
};

export default WorkflowContainer;
