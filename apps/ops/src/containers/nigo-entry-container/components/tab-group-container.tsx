import { useTranslation } from 'next-i18next';
import React, { useMemo } from 'react';

import GlobalValuesBar from '@deps/components/global-values/global-values-bar/global-values-bar';
import { TranslationFiles } from '@deps/config/translations';
import ProgressBarSteps from '@deps/containers/progress-bar-steps/progress-bar-steps';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { WorkflowProvider, useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { PartyRole, Policy } from '@deps/models/policy/sor-policy';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-text-2.svg';

import DocumentPortalPanel from './side-panel/document-portal-panel';

type TabGroupContainerProps = {
    steps: Step[];
    policy: Policy;
    showJointOwner?: boolean;
    documentNumber?: string;
    docType: string;
};
const TabGroupContent = ({ steps, policy, showJointOwner = false, documentNumber = '', docType = '' }: TabGroupContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { currentStepIndex, setCurrentStepIndex } = useWorkflow();
    const sideSheet = useSideSheetContext();

    const globalValuesData = useMemo(() => policyDataToGlobalValues(new PolicyDetails(policy), t), [policy, t]);

    const { marketingName, planCode, policyNumber, productType, status, tooltip, variant } = globalValuesData;
    const handleClick = (step: Step) => {
        if (step.isDisabled || currentStepIndex === step.index) return;

        setCurrentStepIndex(step.index);
    };

    const openSideSheet = () => {
        const content = <DocumentPortalPanel policy={policy} documentNumber={documentNumber} docType={docType} />;
        sideSheet.changeSideSheetContent(t('nigoEntry.documentPanel.documents'), content);
        sideSheet.handleOpen(true);
    };

    const policyOwnerId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.OWNER)?.partyId;
    const policyOwner = policy?.parties?.find(party => party.partyId === policyOwnerId);
    const jointOwnerId = policy?.partyRoles?.find(pr => pr.partyRole === PartyRole.JOINTOWNER)?.partyId;
    const jointOwner = policy?.parties?.find(party => party.partyId === jointOwnerId);

    const showDocumentPanel = () => {
        openSideSheet();
    };

    return (
        <div className="workflow-height-adjusted flex w-full max-w-[1130px] grow flex-col self-center">
            <div className="flex">
                <GlobalValuesBar
                    carrierId={policy.carrierId}
                    marketingName={marketingName}
                    owner={policyOwner}
                    jointOwner={jointOwner}
                    planCode={planCode}
                    policyNumber={policyNumber}
                    productType={productType}
                    status={status}
                    tooltip={tooltip}
                    variant={variant}
                    showJointOwner={showJointOwner}
                    showDocument={true}
                    documentNumber={documentNumber}
                    showLink={false}
                />
                <div className="my-2 ml-auto" onClick={showDocumentPanel}>
                    <div className="flex  font-semibold text-secondary">
                        <DocumentIcon height={20} width={20} />
                        <span>{t('nigoEntry.documentPanel.documentTitle')}</span>
                    </div>
                </div>
            </div>
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

const TabGroupContainer = ({ steps, policy, documentNumber, docType }: TabGroupContainerProps) => {
    return (
        <WorkflowProvider>
            <TabGroupContent steps={steps} policy={policy} showJointOwner={true} documentNumber={documentNumber} docType={docType} />
        </WorkflowProvider>
    );
};

export default TabGroupContainer;
