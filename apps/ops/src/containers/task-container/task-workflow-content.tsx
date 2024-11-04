import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import GlobalValuesBar from '@deps/components/global-values/global-values-bar/global-values-bar';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { policyDataToGlobalValues } from '@deps/helpers/global-values';
import { PolicyDetails } from '@deps/helpers/policy-sor/PolicyDetails';
import { TaskType } from '@deps/models/case/task';
import { PartyRole, Policy } from '@deps/models/policy/sor-policy';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-text-2.svg';

import ProgressBarSteps from '../progress-bar-steps/progress-bar-steps';
import { Step } from '../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import DocumentPortalPanel from './components/side-panel/document-portal-panel';

type TaskPageProps = {
    steps: Step[];
    policy: Policy;
    caseId: string;
    taskId: string;
    taskType: TaskType;
    documentNumber?: string;
    docType: string;
    clientCode: string;
    showJointOwner?: boolean;
    taskInfoLink?: string;
};

export const TaskWorkflowContent = ({ steps, policy, documentNumber = '', docType = '', showJointOwner = false }: TaskPageProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { currentStepIndex, setCurrentStepIndex } = useWorkflow();
    const sideSheet = useSideSheetContext();
    const globalValuesData = useMemo(() => policyDataToGlobalValues(new PolicyDetails(policy), t), [policy, t]);

    const { marketingName, planCode, policyNumber, productType, status, tooltip, variant } = globalValuesData;

    const handleProgressBarClick = (step: Step) => {
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
                classNames={`pb-2 grid-cols-${steps.length}`}
                currentStepIndex={currentStepIndex}
                onClick={handleProgressBarClick}
                steps={steps}
            />
            <div className="flex w-full grow flex-col rounded bg-white shadow-elevation-light-04">{steps[currentStepIndex].component}</div>
        </div>
    );
};
