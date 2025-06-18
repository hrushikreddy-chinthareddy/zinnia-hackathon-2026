import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { ClaimsBeneficiaryCall } from '../components/steps/claims/claim-beneficiary-call.tsx';
import ConfirmStep from '../components/steps/confirm/confirm-step';
export const getBeneCallSteps = ({ taskType, taskInfoLink, t, taskMetadata, task }: GetStepsProps) => {

  const dynamicSteps = taskMetadata.map((metadata, index) => ({
    ariaLabel: metadata?.title || t('callforInformation'),
    isVisible: () => true,
    component: (
      <ClaimsBeneficiaryCall
        key={`step_${index}`}
        taskType={taskType}
      />
    ),
    text: (metadata?.title || t('callforInformation')) || 'Call for Information',
    isSubmit: true,
    index: index,
    isCompleted: true,
    screenReaderLabel: (metadata?.title || t('callforInformation')) || 'Beneficiary Call Step',
  }));

  const staticSteps: Step[] = [
    {
      isVisible: () => true,
      component: (
        <ConfirmStep
          taskType={taskType}
          taskInfoLink={taskInfoLink}
          isCta={true}
          ctaLink={`/cases/${task?.caseId}/progress`} />
      ),
      text: t('confirm'),
      index: dynamicSteps.length,
      screenReaderLabel: t('confirm'),
    },
  ];

  return [...dynamicSteps, ...staticSteps];
};
