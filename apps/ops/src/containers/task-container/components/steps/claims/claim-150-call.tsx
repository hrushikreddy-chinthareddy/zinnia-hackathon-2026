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
import { convertToCamelCase } from '@deps/utils/strings';

import CallForInformation from './call-for-information';
import { UpdatedBeneficiaryRecord } from './claims.type';

type TaskReviewStepProps = {
    taskType: TaskType;
    beneficiary: UpdatedBeneficiaryRecord;
    readOnly: boolean;
    setBeneficiary: React.Dispatch<
        React.SetStateAction<UpdatedBeneficiaryRecord>
    >;
};

export const Claims150Call = ({
    taskType,
    beneficiary,
    readOnly,
    setBeneficiary,
}: TaskReviewStepProps) => {
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
                    readOnly={readOnly}
                    t={t}
                />
            </div>
        </WorkflowCard>
    );
};
