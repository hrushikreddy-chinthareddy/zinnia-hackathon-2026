import { convertToCamelCase } from '@zinnia/utils';
import { useTranslation } from 'next-i18next';
import { useContext, useState } from 'react';

import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { TaskType } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';

import CallForInformation from './call-for-information';
import { UpdatedBeneficiaryRecord } from './claims.type';

type TaskReviewStepProps = {
    taskType: TaskType;
};

export const ClaimsBeneficiaryCall = ({ taskType }: TaskReviewStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: `${convertToCamelCase(taskType)}.callForInformation`,
    });
    const {
        task,
        correlationId,
        setTask,
        setSubmitFailed,
        formErrors,
        setFormErrors,
    } = useContext(TaskDataContext);
    const [handleContinueFn, setHandleContinueFn] = useState<() => void>(
        () => () => {}
    );

    const [beneficiary, setBeneficiary] = useState<UpdatedBeneficiaryRecord>({
        notificationPreferences:
            task?.data?.details?.beneCall?.beneficiary?.notificationPreferences,
        changeRequire: null,
        changeType: null,
        beneDeceased: false,
        beneDeathDate: null,
        beneDeathSourceOfInfo: null,
    } as UpdatedBeneficiaryRecord);
    const readOnly = task.status === TaskStatus.Completed;
    const { goToNext } = useWorkflow();
    return (
        <WorkflowCard
            title={t('title')}
            subtitle={t('subTitle') as string}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    submitLabel={t('submit') as string}
                    readonly={readOnly}
                    handleContinue={
                        readOnly
                            ? () => {
                                  goToNext();
                              }
                            : handleContinueFn
                    }
                    isSubmit={!readOnly}
                    disableContinue={
                        readOnly ? false : Object.keys(formErrors).length > 0
                    }
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink="/create-case"
                    cancelLabel={t('cancel') as string}
                />
            }
        >
            <div className="flex flex-col gap-4">
                <CallForInformation
                    task={task}
                    setTask={setTask}
                    onContinueReady={setHandleContinueFn}
                    correlationId={correlationId}
                    setSubmitFailed={setSubmitFailed}
                    formErrors={formErrors}
                    setFormErrors={setFormErrors}
                    beneficiary={beneficiary}
                    setBeneficiary={setBeneficiary}
                    t={t}
                />
            </div>
        </WorkflowCard>
    );
};
