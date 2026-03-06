import {
    AssistiveText,
    AssistiveTextVariant,
    Loader,
} from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useState } from 'react';

import Radio from '@deps/components/radio/radio';
import { NotificationsTransactionData } from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab/bene-notification-tab.types';
import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import {
    TaskActions,
    useUpdateNotificationMethod,
} from '@deps/contexts/UpdateNotificationMethodContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import { CaseIdentifier } from '@deps/models/case/case';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { updateNotificationMethod } from '@deps/queries/api/web-non-financial';
import { Policy } from '@zinnia/api-types/types/sor';

import { TaskAction } from './task-action';
import { buildUpdateNotificationMethodPayload } from './update-notification-method-helper';

type ContactEstablishedStepProps = {
    policy: Policy;
    transactionData: NotificationsTransactionData;
};

const ContactEstablishedStep = ({
    policy,
    transactionData,
}: ContactEstablishedStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'updateNotificationMethodForBeneficiary',
    });
    const [isLoading, setIsLoading] = useState(false);
    const {
        taskActions,
        setTaskActions,
        setCaseId,
        setSubmitFailed,
        emailData,
        faxData,
        addressData,
        notificationMethodSelected,
        setNotificationMethodSelected,
    } = useUpdateNotificationMethod();
    const { goToNext } = useWorkflow();
    const [errors, setErrors] = useState<FormValidationErrors>();

    const caseId = getCaseIdentifierValue(
        transactionData?.identifiers || [],
        CaseIdentifier.ZlCaseId
    );

    useEffect(() => {
        if (
            transactionData?.entity?.notificationPreferences?.notificationMethod
                ?.method
        ) {
            setNotificationMethodSelected(
                transactionData?.entity?.notificationPreferences
                    ?.notificationMethod?.method
            );
        }
    }, [transactionData, setNotificationMethodSelected]);

    const validateForm = useCallback(() => {
        if (taskActions?.length === 0) {
            setErrors({
                ...errors,
                taskActions: t(
                    `contactEstablishedStep.formErrors.formValidation.taskActionsIsRequired`
                ),
            });
            return false;
        }
        return true;
    }, [taskActions, errors, t]);

    const submit = useCallback(async () => {
        setIsLoading(true);
        const payload = buildUpdateNotificationMethodPayload(
            policy,
            transactionData,
            emailData,
            faxData,
            addressData,
            notificationMethodSelected,
            taskActions
        );

        const successfulSubmit = await updateNotificationMethod(payload);
        if (successfulSubmit && successfulSubmit?.zlCaseId) {
            setCaseId(successfulSubmit?.zlCaseId);
            setSubmitFailed(false);
        } else {
            setCaseId('');
            setSubmitFailed(true);
        }
        setIsLoading(false);
    }, [
        policy,
        transactionData,
        emailData,
        faxData,
        addressData,
        notificationMethodSelected,
        setCaseId,
        setSubmitFailed,
        taskActions,
    ]);

    const handleStepContinue = useCallback(async () => {
        const isValid = validateForm();
        if (isValid) {
            if (
                taskActions.length > 0 &&
                !taskActions.includes(TaskActions.UPDATE_NOTIFICATION_METHOD)
            ) {
                await submit();
            }
            goToNext();
        } else {
            return;
        }
    }, [validateForm, taskActions, goToNext, submit]);

    const handleChangeRadio = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setTaskActions([value as TaskActions]);
        setErrors({});
    };

    const radioOptions = [
        {
            label: t('contactEstablishedStep.contactEstablished.resendPacket'),
            value: TaskActions.RESEND_PACKET,
            subElement: (
                <TaskAction
                    item={{
                        label: t(
                            'contactEstablishedStep.contactEstablished.resendPacket'
                        ),
                        value: TaskActions.RESEND_PACKET,
                    }}
                    disabled={false}
                    tooltipBody={
                        t('contactEstablishedStep.tooltips.resendPacket') ?? ''
                    }
                    transactionData={transactionData}
                    taskActions={taskActions}
                />
            ),
        },
        {
            label: t(
                'contactEstablishedStep.contactEstablished.restartFollowupProcess'
            ),
            value: TaskActions.CONTACT_ESTABLISHED,
            subElement: (
                <TaskAction
                    item={{
                        label: t(
                            'contactEstablishedStep.contactEstablished.restartFollowupProcess'
                        ),
                        value: TaskActions.CONTACT_ESTABLISHED,
                    }}
                    disabled={false}
                    tooltipBody={
                        t(
                            'contactEstablishedStep.tooltips.restartFollowupProcess'
                        ) ?? ''
                    }
                    transactionData={transactionData}
                    taskActions={taskActions}
                />
            ),
        },
        {
            label: t(
                'contactEstablishedStep.contactEstablished.updateNotificationMethod'
            ),
            value: TaskActions.UPDATE_NOTIFICATION_METHOD,
            subElement: (
                <TaskAction
                    item={{
                        label: t(
                            'contactEstablishedStep.contactEstablished.updateNotificationMethod'
                        ),
                        value: TaskActions.UPDATE_NOTIFICATION_METHOD,
                    }}
                    disabled={false}
                    tooltipBody={
                        t(
                            'contactEstablishedStep.tooltips.updateNotificationMethod'
                        ) ?? ''
                    }
                    transactionData={transactionData}
                    taskActions={taskActions}
                />
            ),
        },
    ];

    return (
        <WorkflowCard
            title={t('contactEstablishedStep.title')}
            subtitle={''}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleStepContinue}
                    planCode={policy?.product?.planCode}
                    policyNumber={policy?.policyNumber}
                    parentPage={ParentPage.None}
                    leaveTransactionLink={`/cases/${caseId}/`}
                />
            }
        >
            <div>
                {isLoading && (
                    <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                        <Loader />
                    </div>
                )}
                <Typography variant={TypographyVariant.Body}>
                    {t('contactEstablishedStep.selectOption')}
                </Typography>
                <div className="mt-4">
                    <Radio
                        items={radioOptions}
                        value={taskActions?.[0] ?? ''}
                        disabled={false}
                        onChange={handleChangeRadio}
                        className="text-sm"
                        alignItems="items-stretch"
                    />
                </div>
                {errors?.taskActions ? (
                    <AssistiveText
                        text={errors.taskActions}
                        variant={AssistiveTextVariant.Error}
                        className="mt-2"
                    />
                ) : null}
            </div>
        </WorkflowCard>
    );
};

export default ContactEstablishedStep;
