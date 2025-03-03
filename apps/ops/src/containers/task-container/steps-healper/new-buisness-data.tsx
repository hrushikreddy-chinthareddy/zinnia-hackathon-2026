import { MatchingCase } from '@deps/models/case/task/doc-matching-payment';

import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep as TaskFormStep } from '../components/steps/task-form/task-form-step';

export const getNewBusinessDataSteps = ({ taskType, taskInfoLink, t, taskMetadata, task }: GetStepsProps) => {
  const isSubmit = task.data.matchingResult === MatchingCase.REINDEX;

  const dynamicSteps = taskMetadata.map((metadata, index) => ({
    ariaLabel: metadata?.title || '',
    isVisible: () => index === 0 || !isSubmit,
    component: (
      <TaskFormStep
        taskInfoLink={taskInfoLink}
        isSubmit={index === 0 ? true : isSubmit}
        taskMetadata={metadata}
        key={`step_${index}`}
      ></TaskFormStep>
    ),
    text: metadata?.title || '',
    isSubmit: index === 1 ? true : isSubmit,
    index: index,
    isCompleted: true,
    screenReaderLabel: metadata?.title || '',
  }));

  const staticSteps: Step[] = [
    {
      ariaLabel: t('confirm'),
      isVisible: () => true,
      component: <ConfirmStep taskType={taskType} taskInfoLink={taskInfoLink}></ConfirmStep>,
      text: t('confirm'),
      index: dynamicSteps.length,
      screenReaderLabel: t('confirm'),
    },
  ];
  console.log(taskMetadata)
  return [...dynamicSteps, ...staticSteps];
};
