
import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { TaskReviewStep } from '../components/steps/task-review/task-review-step';

export const getNewBusinessDataSteps = ({
  carrierId,
  caseId,
  taskInfoLink,
  taskType,
  isReadyForDataEntry,
  t,
  nigoExceptions,
  nigoSubExceptions,
  taskMetadata,
}: GetStepsProps) => {
  const steps: Step[] = [
    {
      ariaLabel: taskMetadata[0]?.title || '',
      isVisible: () => true,
      component: <TaskReviewStep caseId={caseId} clientCode={carrierId} taskInfoLink={taskInfoLink} taskType={taskType} />,
      text: t('tabs.matchDocument'),
      index: 0,
      isCompleted: true,
      screenReaderLabel: taskMetadata[0]?.title || '',
    },

    {
      ariaLabel: t('confirm'),
      isVisible: () => true,
      component: <ConfirmStep taskType={taskType} taskInfoLink={taskInfoLink}></ConfirmStep>,
      text: t('confirm'),
      index: 3,
      screenReaderLabel: t('confirm'),
    },
  ];
  return steps;
};
