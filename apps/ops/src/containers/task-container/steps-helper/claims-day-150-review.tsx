import { useState } from 'react';

import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { Claims150Call } from '../components/steps/claims/claim-150-call';
import { ClaimBeneStatus } from '../components/steps/claims/claims-day-150-bene-status';
import { UpdatedBeneficiaryRecord } from '../components/steps/claims/claims.type';
import ConfirmStep from '../components/steps/confirm/confirm-step';
import { MemoizedTaskFormStep } from '../components/steps/task-form/task-form-step';

export const getDay150ReviewSteps = ({
    taskType,
    taskInfoLink,
    t,
    task,
    taskMetadata,
}: GetStepsProps) => {
    const [beneficiary, setBeneficiary] = useState<UpdatedBeneficiaryRecord>(
        task?.data?.details?.benefinalcontactattempt?.beneficiary || {
            notificationPreferences: null,
            changeRequire: null,
            changeType: null,
            beneDeceased: false,
            beneDeathDate: null,
            beneDeathSourceOfInfo: null,
        }
    );

    const steps: Step[] = [
        {
            isVisible: () => true,
            component: (
                <ClaimBeneStatus
                    beneficiary={beneficiary}
                    setBeneficiary={setBeneficiary}
                />
            ),
            text: t('tabs.beneficiaryStatus'),
            index: 0,
            isCompleted: true,
            screenReaderLabel: t('tabs.beneficiaryStatus'),
        },
        {
            isVisible: () => true,
            component: (
                <MemoizedTaskFormStep
                    taskInfoLink={taskInfoLink}
                    isSubmit={
                        task.data.details.benefinalcontactattempt
                            ?.beneficiaryChangeDetail?.changeType ===
                        'BENEFICIARY_ADDRESS_CHANGE'
                    }
                    taskMetadata={taskMetadata[0]}
                    key={`step_${0}`}
                    stepIndex={
                        task.data.details.benefinalcontactattempt
                            ?.beneficiaryChangeDetail?.changeType ===
                        'BENEFICIARY_ADDRESS_CHANGE'
                            ? 3
                            : 2
                    }
                ></MemoizedTaskFormStep>
            ),
            text: t('tabs.addressChange'),
            index: 1,
            screenReaderLabel: t('tabs.addressChange'),
        },
        {
            isVisible: () => true,
            component: (
                <Claims150Call
                    beneficiary={beneficiary}
                    setBeneficiary={setBeneficiary}
                    taskType={taskType}
                />
            ),
            text: t('tabs.call'),
            index: 2,
            screenReaderLabel: t('tabs.call'),
        },

        {
            isVisible: () => true,
            component: (
                <ConfirmStep
                    taskType={taskType}
                    taskInfoLink={taskInfoLink}
                ></ConfirmStep>
            ),
            text: t('confirm'),
            index: 3,
            screenReaderLabel: t('confirm'),
        },
    ];

    return steps;
};
