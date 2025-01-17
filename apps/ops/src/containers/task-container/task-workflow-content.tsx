import { useTranslation } from 'next-i18next';
import { useContext, useMemo } from 'react';

import GlobalValuesNbBar from '@deps/components/global-values/global-values-bar/global-values-nb-bar';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { ReactComponent as DocumentIcon } from '@deps/styles/elements/icons/icons_outlined/document-text-2.svg';

import ProgressBarSteps from '../progress-bar-steps/progress-bar-steps';
import { Step } from '../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import DocumentPortalPanel from './components/side-panel/document-portal-panel';
import { TaskDataContext } from './task-context';

type TaskPageProps = {
    steps: Step[];
    caseId: string;
    carrierId: string;
};

export const TaskWorkflowContent = ({ steps, caseId, carrierId }: TaskPageProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { currentStepIndex, setCurrentStepIndex } = useWorkflow();
    const { task } = useContext(TaskDataContext);
    const sideSheet = useSideSheetContext();

    const handleProgressBarClick = (step: Step) => {
        if (step.isDisabled || currentStepIndex === step.index) return;

        setCurrentStepIndex(step.index);
    };

    const openSideSheet = () => {
        const content = <DocumentPortalPanel documents={task.documents || []} clientCode={carrierId} />;
        sideSheet.changeSideSheetContent(t('task.documentPanel.documents'), content);
        sideSheet.handleOpen(true);
    };

    const showDocumentPanel = () => {
        openSideSheet();
    };

    const filteredSteps: Step[] = useMemo(
        () =>
            steps
                .filter((item: any, index: number) => item.isVisible?.(task, index))
                .map((item: any, index: number) => ({ ...item, index })),
        [steps]
    );

    return (
        <div className="workflow-height-adjusted flex w-full max-w-[1130px] grow flex-col self-center">
            <div className="flex">
                <GlobalValuesNbBar carrierId={carrierId} showLink={false} caseId={caseId} />
                <div className="my-2 ml-auto" onClick={showDocumentPanel}>
                    <div className="flex  font-semibold text-secondary">
                        <DocumentIcon height={20} width={20} />
                        <span>{t('nigoEntry.documentPanel.documentTitle')}</span>
                    </div>
                </div>
            </div>
            <ProgressBarSteps
                classNames={`pb-2 grid-cols-${filteredSteps.length}`}
                currentStepIndex={currentStepIndex}
                onClick={handleProgressBarClick}
                steps={filteredSteps}
            />
            <div className="flex w-full grow flex-col rounded bg-white shadow-elevation-light-04">
                {filteredSteps[currentStepIndex].component}
            </div>
        </div>
    );
};
