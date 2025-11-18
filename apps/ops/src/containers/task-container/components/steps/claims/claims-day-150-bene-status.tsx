/* eslint-disable import/no-unresolved */
import {
    AssistiveText,
    AssistiveTextVariant,
    Radio,
} from '@zinnia/bloom/components';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { TaskDataContext } from '@deps/containers/task-container/task-context';
import { updateTask } from '@deps/containers/task-container/task.helpers';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { TaskStatus } from '@deps/models/case/task-instance';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';

import BeneficiaryDeceased from './beneficiary-deceased';
import { UpdatedBeneficiaryRecord, ChangeTypeEnum } from './claims.type';

const BENE_STATUS = {
    YES: 'yes',
    NO: 'no',
} as const;

type TaskReviewStepProps = {
    beneficiary: UpdatedBeneficiaryRecord;
    setBeneficiary: React.Dispatch<
        React.SetStateAction<UpdatedBeneficiaryRecord>
    >;
    readOnly: boolean;
};

export const ClaimBeneStatus = ({
    beneficiary,
    setBeneficiary,
    readOnly,
}: TaskReviewStepProps) => {
    const {
        task,
        setTask,
        correlationId,
        setSubmitFailed,
        formErrors,
        setFormErrors,
    } = useContext(TaskDataContext);

    const { goToNext } = useWorkflow();
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'claimsDay150.beneStatus',
    });
    const { t: errorsT } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'claimsDay150.errors',
    });

    const [isBeneDeceased, setIsBeneDeceased] = useState<string>('');

    const handleContinueFn = async () => {
        if (readOnly) {
            goToNext();
            return;
        }
        if (isBeneDeceased === BENE_STATUS.YES) {
            const success = await updateTask(task, correlationId);
            setSubmitFailed && setSubmitFailed(!success);
        }
        goToNext();
    };

    const validateAddress = () => {
        const errors: FormValidationErrors = {};
        if (!isBeneDeceased) {
            errors['beneDeceased'] = errorsT('beneDeceased') as string;
        }
        setFormErrors(errors);
    };

    useEffect(() => {
        if (readOnly) return;
        const updatedTask = { ...task };

        // Initialize the nested objects if they don't exist
        if (!updatedTask.data) updatedTask.data = {};
        if (!updatedTask.data.details) updatedTask.data.details = {};
        if (!updatedTask.data.details.benefinalcontactattempt)
            updatedTask.data.details.benefinalcontactattempt = {};

        updatedTask.data.details.benefinalcontactattempt.beneficiaryChangeDetail =
            {
                ...(updatedTask.data.details.benefinalcontactattempt
                    ?.beneficiaryChangeDetail || {}),
                ...beneficiary,
                beneDeceased: isBeneDeceased === BENE_STATUS.YES,
                changeType:
                    isBeneDeceased === BENE_STATUS.YES
                        ? ChangeTypeEnum.BENEFICIARY_DECEASED
                        : null,
                changeRequire:
                    isBeneDeceased === BENE_STATUS.YES ? true : false,
            };

        setTask(updatedTask);
        validateAddress();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isBeneDeceased, beneficiary]);

    useEffect(() => {
        if (readOnly) {
            if (
                task.data?.details?.benefinalcontactattempt
                    ?.subTaskBeneDeceasedChangeRequire &&
                beneficiary.beneDeceased
            ) {
                setIsBeneDeceased(BENE_STATUS.YES);
            } else {
                setIsBeneDeceased(BENE_STATUS.NO);
            }
        }
    }, [beneficiary.beneDeceased, readOnly, task.data]);

    return (
        <WorkflowCard
            title={task.taskName || t('title')}
            subtitle={t('subTitle') as string}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    readonly={readOnly}
                    handleContinue={handleContinueFn}
                    isSubmit={!readOnly && isBeneDeceased === BENE_STATUS.YES}
                    submitLabel={t('submit') as string}
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
                <Typography variant={TypographyVariant.H3}>
                    {t('title') as string}
                </Typography>

                <div className="py-2">
                    <Radio
                        isDisabled={task.status === TaskStatus.Completed}
                        id="beneStatus"
                        value={isBeneDeceased}
                        groupLabel={t('isDeceased') as string}
                        onValueChange={(value) => {
                            setIsBeneDeceased(value);
                            setTask({
                                ...task,
                                data: {
                                    ...task.data,
                                    details: {
                                        ...task.data.details,
                                        benefinalcontactattempt: {
                                            ...task.data.details
                                                .benefinalcontactattempt,
                                            subTaskBeneDeceasedChangeRequire:
                                                value == BENE_STATUS.YES
                                                    ? true
                                                    : false,
                                        },
                                    },
                                },
                            });
                        }}
                        options={[
                            {
                                label: t('yes') as string,
                                value: BENE_STATUS.YES,
                                ariaLabel: t('yes') as string,
                            },
                            {
                                label: t('no') as string,
                                value: BENE_STATUS.NO,
                                ariaLabel: t('no') as string,
                            },
                        ]}
                    />
                    {formErrors?.beneDeceased && (
                        <div className="mt-4">
                            <AssistiveText
                                text={formErrors?.beneDeceased}
                                variant={AssistiveTextVariant.Error}
                            />
                        </div>
                    )}
                </div>

                {isBeneDeceased === BENE_STATUS.YES && (
                    <div className="grid grid-cols-4">
                        <div className="col-span-1">
                            <BeneficiaryDeceased
                                readOnly={task.status === TaskStatus.Completed}
                                beneficiary={beneficiary}
                                setBeneficiary={setBeneficiary}
                                t={t}
                            />
                        </div>
                    </div>
                )}
            </div>
        </WorkflowCard>
    );
};
