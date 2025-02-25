import { useTranslation } from 'next-i18next';
import { useContext, useMemo } from 'react';

import GlobalValuesNbBar from '@deps/components/global-values/global-values-bar/global-values-nb-bar';
import { TranslationFiles } from '@deps/config/translations';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';

import ProgressBarSteps from '../progress-bar-steps/progress-bar-steps';
import { Step } from '../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { TaskDataContext } from './task-context';
import GlobalTaskSideSheet from '../case-overview/tasks-table/sidesheet/global-task-sidesheet-content';
import { ReactComponent as ClipboardListIcon } from '@deps/styles/elements/icons/content/clipboard-list.svg';

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
        const content = <GlobalTaskSideSheet taskId={task.id} type={'task'} />;
        sideSheet.changeSideSheetContent(
            `${task.taskName ? `${t('sideSheet.task.taskHeading')}: ${task.taskName}` : t('sideSheet.task.taskHeading')}`,
            content
        );
        sideSheet.handleOpen(true);
    };

    const showDocumentPanel = () => {
        openSideSheet();
    };

    const filteredSteps: Step[] = useMemo(
        () => steps.filter((item: any) => item.isVisible?.()).map((item: any, index: number) => ({ ...item, index })),
        [steps]
    );

    return (
        <div className="workflow-height-adjusted flex w-full max-w-[1130px] flex-col self-center">
            <div className="flex">
                <GlobalValuesNbBar carrierId={carrierId} showLink={false} caseId={caseId} />
                <div className="my-2 ml-auto cursor:pointer" onClick={showDocumentPanel}>
                    <div className="flex  font-semibold text-secondary whitespace-nowrap cursor-pointer">
                        <ClipboardListIcon height={20} width={20} />
                        <div>{t('nigoEntry.documentPanel.taskTitle')}</div>
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
                {filteredSteps[currentStepIndex]?.component}
            </div>
        </div>
    );
};
