import { useUser } from '@auth0/nextjs-auth0/client';
import { useTranslation } from 'next-i18next';
import { useContext, useMemo } from 'react';

import GlobalValuesNbBar from '@deps/components/global-values/global-values-bar/global-values-nb-bar';
import CreateCarrierTaskSideSheet from '@deps/components/side-sheet/create-carrier-task/create-carrier-task';
import { TranslationFiles } from '@deps/config/translations';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { TaskType } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { ReactComponent as ClipboardListIcon } from '@deps/styles/elements/icons/content/clipboard-list.svg';
import { ReactComponent as ClipboardStarIcon } from '@deps/styles/elements/icons/content/clipboard-star.svg';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { TaskDataContext } from './task-context';
import GlobalTaskSideSheet from '../../components/side-sheet/task-details-sidesheet/global-task-sidesheet-content';
import ProgressBarSteps from '../progress-bar-steps/progress-bar-steps';
import { Step } from '../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';

type TaskPageProps = {
    steps: Step[];
    caseId: string;
    carrierId: string;
};

export const TaskWorkflowContent = ({
    steps,
    caseId,
    carrierId,
}: TaskPageProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const { currentStepIndex, setCurrentStepIndex } = useWorkflow();
    const { task, mappedDocuments } = useContext(TaskDataContext);
    const sideSheet = useSideSheetContextLegacy();

    const handleProgressBarClick = (step: Step) => {
        if (
            step.isDisabled ||
            step.isCompleted ||
            currentStepIndex === step.index
        )
            return;
        setCurrentStepIndex(step.index);
    };

    const openSideSheet = () => {
        const content = (
            <GlobalTaskSideSheet
                taskId={task.id}
                caseId={caseId}
                type={'task'}
                mappedDocuments={mappedDocuments}
                queue={task.queue ?? ''}
                carrier={carrierId}
            />
        );
        sideSheet.changeSideSheetContent(
            `${
                task.taskName
                    ? `${t('sideSheet.task.taskHeading')}: ${task.taskName}`
                    : t('sideSheet.task.taskHeading')
            }`,
            content
        );
        sideSheet.handleOpen(true);
    };

    const openCreateTaskSideSheet = () => {
        const content = (
            <CreateCarrierTaskSideSheet task={task} readonly={false} />
        );
        sideSheet.changeSideSheetContent(
            `${t('allFields.createCarrierTask')}`,
            content
        );
        sideSheet.handleOpen(true);
    };

    const showDocumentPanel = () => {
        openSideSheet();
    };

    const showCreateCarrierTaskPanel = () => {
        openCreateTaskSideSheet();
    };

    const filteredSteps: Step[] = useMemo(
        () =>
            steps
                .filter((item: any) => item.isVisible?.())
                .map((item: any, index: number) => ({ ...item, index })),
        [steps]
    );

    const isClaimCase = (taskType: TaskType) => {
        switch (taskType) {
            case TaskType.Claims_Identify_Uncashed_Transactions:
            case TaskType.Claims_Stop_Uncashed_Transactions:
            case TaskType.Claims_Reverse_Uncashed_Transactions:
                return true;
            default:
                return false;
        }
    };

    const { user } = useUser();
    const { featureFlags } = useOptimizely();
    const isExternalTask =
        task.taskType === TaskType.External_Review_Task ||
        task.taskType === TaskType.External_Data_Request_Task;

    const isTaskOwner = task?.assigneePartyId === user?.partyId;

    const isCreateCarrierExternalTaskEnabled =
        featureFlags?.[FEATURE_FLAGS.CREATE_CARRIER_EXTERNAL_TASK] ?? false;

    const shouldShowCreateCarrierTask =
        isCreateCarrierExternalTaskEnabled &&
        !isExternalTask &&
        isTaskOwner &&
        task.status !== TaskStatus.Completed;

    return (
        <div className="workflow-height-adjusted flex w-full max-w-[1130px] flex-col self-center">
            <div className="flex">
                <GlobalValuesNbBar
                    carrierId={carrierId}
                    showLink={false}
                    caseId={caseId}
                />
                {shouldShowCreateCarrierTask && (
                    <button
                        className="my-2 ml-auto mr-4"
                        onClick={showCreateCarrierTaskPanel}
                    >
                        <div className="flex font-semibold whitespace-nowrap text-secondary cursor-pointer">
                            <ClipboardStarIcon
                                role="img"
                                aria-label="Create carrier task"
                                height={24}
                                width={24}
                                className="text-secondary"
                            />
                            <div>
                                {t('nigoEntry.documentPanel.createCarrierTask')}
                            </div>
                        </div>
                    </button>
                )}
                <button
                    className="my-2 ml-auto cursor:pointer"
                    onClick={showDocumentPanel}
                >
                    <div className="flex  font-semibold text-secondary whitespace-nowrap cursor-pointer">
                        <ClipboardListIcon
                            role="img"
                            aria-label="View task details"
                            height={20}
                            width={20}
                        />
                        <div>{t('nigoEntry.documentPanel.taskTitle')}</div>
                    </div>
                </button>
            </div>
            <ProgressBarSteps
                classNames={`pb-2`}
                currentStepIndex={currentStepIndex}
                onClick={handleProgressBarClick}
                steps={filteredSteps}
            />
            <div
                className={`flex w-full grow flex-col rounded ${
                    isClaimCase(task.taskType as TaskType)
                        ? ''
                        : 'bg-white shadow-elevation-light-04'
                }  `}
            >
                {filteredSteps[currentStepIndex]?.component}
            </div>
        </div>
    );
};
