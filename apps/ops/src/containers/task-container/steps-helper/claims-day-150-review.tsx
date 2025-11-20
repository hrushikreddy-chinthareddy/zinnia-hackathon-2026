import { useState } from 'react';

import { TaskStatus } from '@deps/models/case/task-instance';

import { GetStepsProps } from './types';
import { Step } from '../../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { Claims150Call } from '../components/steps/claims/claim-150-call';
import { ClaimBeneStatus } from '../components/steps/claims/claims-day-150-bene-status';
import {
    DynamicKey,
    UpdatedBeneficiaryRecord,
} from '../components/steps/claims/claims.type';
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
        task?.data?.details?.[DynamicKey.BENE_FINAL_CONTACT_ATTEMPT]
            ?.beneficiaryChangeDetail || {
            notificationPreferences:
                task?.data?.details?.[DynamicKey.BENE_FINAL_CONTACT_ATTEMPT]
                    ?.beneficiary?.notificationPreferences,
            changeRequire: null,
            changeType: null,
            beneDeceased: false,
            beneDeathDate: null,
        }
    );

    const readOnly = task.status === TaskStatus.Completed;

    const beneAttempt =
        task?.data?.details?.[DynamicKey.BENE_FINAL_CONTACT_ATTEMPT] ?? {};
    const stepOneIsVisible =
        beneAttempt?.subTaskBeneDeceasedChangeRequire === false;
    const stepTwoIsVisible =
        beneAttempt?.subTaskBeneAddressChangeRequire === false &&
        stepOneIsVisible;

    const steps: Step[] = [
        {
            isVisible: () => {
                return true;
            },
            component: (
                <ClaimBeneStatus
                    beneficiary={beneficiary}
                    setBeneficiary={setBeneficiary}
                    readOnly={readOnly}
                />
            ),
            text: t('tabs.beneficiaryStatus'),
            index: 0,
            isCompleted: true,
            screenReaderLabel: t('tabs.beneficiaryStatus'),
        },
        {
            isVisible: () => {
                return stepOneIsVisible;
            },
            component: (
                <MemoizedTaskFormStep
                    readonly={readOnly}
                    taskInfoLink={taskInfoLink}
                    isSubmit={
                        readOnly
                            ? false
                            : beneAttempt?.beneficiaryChangeDetail
                                  ?.changeType === 'BENEFICIARY_ADDRESS_CHANGE'
                    }
                    taskMetadata={taskMetadata[0]}
                    key={`step_${1}`}
                ></MemoizedTaskFormStep>
            ),
            text: t('tabs.addressChange'),
            index: 1,
            screenReaderLabel: t('tabs.addressChange'),
        },
        {
            isVisible: () => {
                return stepTwoIsVisible;
            },
            component: (
                <Claims150Call
                    beneficiary={beneficiary}
                    setBeneficiary={setBeneficiary}
                    taskType={taskType}
                    readOnly={readOnly}
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
