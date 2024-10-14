import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import { FormEvent, useContext, useEffect, useState } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import Button, { ButtonSize, ButtonType, ButtonVariant } from '@deps/components/button/button';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { DiaryNotesContext } from '@deps/contexts/DiaryNotesContext';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { isLocalStorageEnabled } from '@deps/helpers/local-storage.hepler';
import { DocumentData } from '@deps/models/case/document';
import { ApiVersion } from '@deps/models/case/enums';
import { TaskApiVersionMapper } from '@deps/models/case/helpers';
import { TaskStatus } from '@deps/models/case/task-instance';
import { CaseStatus } from '@deps/models/case/withdrawal/case';
import { putCaseTask } from '@deps/queries/api/v1/task';
import { updateTask } from '@deps/queries/api/v2/task';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { FormSuccessMessageKey } from '@deps/types/localStorage';
import { TaskTypeTranslation } from '@deps/types/translation-mapping';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import { buildForm, buildFormV2 } from '../utils/withdrawal-form-helper';

export type FormControlsProps = {
    t: TFunction;
    document: DocumentData;
    isLoading?: boolean;
    setIsLoading: (loading: boolean) => void;
    setTaskApiError: (error: string) => void;
};

export function FormControls({ t, isLoading, setIsLoading, setTaskApiError, document }: FormControlsProps) {
    const [timer] = useState(performance.now());
    const router = useRouter();
    const { action } = router.query;
    const formState = useContext(FormDataContext);
    const { areDiaryNotesViewed } = useContext(DiaryNotesContext);

    const shouldShowNewExperience = formState.featureFlagDecisions?.[FEATURE_FLAGS.NEW_EXP];
    const isFormStateReadOnly = shouldShowNewExperience ? action === 'readonly' || formState.isFormStateReadOnly : false;

    const taskStatusList: string[] = [CaseStatus.Draft, CaseStatus.Pending, TaskStatus.New, TaskStatus.InProgress];
    const isCancelActionDisabled = !taskStatusList.includes(formState.currentFormState);

    useEffect(() => {
        const { formSource, setFormSource } = formState;
        setFormSource({
            ...formSource,
            channel: {
                text: document.source,
            },
            businessKey: document.documentNumber,
            receivedDate: dayjs(document.dateReceived, 'M/D/YYYY hh:mm:ss A').format(ZAHARA_API_DATE_FORMAT),
            receivedDateTime: dayjs(document.dateReceived, 'M/D/YYYY hh:mm:ss A').format('YYYY-MM-DDTHH:mm:ss:Z'),
            sourceSysId: 'ONBASE',
        });
    }, [document]);

    const validateForm = () => {
        const {
            formValidator,
            setFormErrors,
            initialForm: {
                data: { formRequest },
            },
            formData,
            formDisbursement,
            formDistribution,
            formFullSurrenderAck,
            formIrsData,
            formLoan,
            formParty,
            formProgram,
            formRestriction,
            formSignature,
            formSource,
            formTaxWithholding,
            formTpaAuthorization,
            formSurrenderingCompany,
            formAdditionalWaivers,
        } = formState;
        const errors = formValidator({
            formData,
            formDisbursement,
            formDistribution,
            formFullSurrenderAck,
            formIrsData,
            formLoan,
            formParty,
            formProgram,
            formRestriction,
            formSignature,
            formSource,
            formSpecialInstruction: formRequest.formSpecialInstruction,
            formTaxWithholding,
            formTaxIdCertificate: formRequest.formTaxIdCertificate,
            formTpaAuthorization,
            formSurrenderingCompany,
            formAdditionalWaivers,
        });

        setFormErrors({ ...errors });
        return Object.keys(errors).length === 0;
    };

    const handleDraftFormSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setTaskApiError('');

        let successfulCaseUpdate;
        if (TaskApiVersionMapper[formState.initialForm.taskType] === ApiVersion.v2) {
            successfulCaseUpdate = await updateTask(
                formState.initialForm.caseId,
                formState.initialForm?.taskId,
                buildFormV2(formState.currentFormState === TaskStatus.InProgress ? TaskStatus.InProgress : TaskStatus.New, document, formState),
                timer
            );
        } else {
            successfulCaseUpdate = await putCaseTask(
                formState.initialForm.caseId,
                formState.initialForm.taskId,
                buildForm(CaseStatus.Pending, document, formState)
            );
        }

        if (!successfulCaseUpdate) {
            setTaskApiError(t('saveAsDraftError') as string);
        }
        setIsLoading(false);
    };

    const handleFormSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setTaskApiError('');
        if (validateForm() && areDiaryNotesViewed) {
            let successfulCaseUpdate;
            if (TaskApiVersionMapper[formState.initialForm.taskType] === ApiVersion.v2) {
                successfulCaseUpdate = await updateTask(
                    formState.initialForm.caseId,
                    formState.initialForm?.taskId,
                    buildFormV2(TaskStatus.Completed, document, formState),
                    timer
                );
            } else {
                successfulCaseUpdate = await putCaseTask(
                    formState.initialForm.caseId,
                    formState.initialForm.taskId,
                    buildForm(CaseStatus.Submit, document, formState)
                );
            }

            if (successfulCaseUpdate) {
                if (isLocalStorageEnabled()) {
                    const successMessage = t(
                        `createTaskSuccess.${
                            TaskTypeTranslation[formState?.initialForm?.data?.taskType as keyof typeof TaskTypeTranslation]
                        }`,
                        {
                            contractNumber: document?.contract,
                            documentNumber: document?.documentNumber,
                        }
                    );

                    localStorage.setItem(
                        FormSuccessMessageKey[formState?.initialForm?.data?.taskType as keyof typeof FormSuccessMessageKey],
                        successMessage
                    );
                }

                router.push(`/create-case`);
            } else {
                setTaskApiError(t('submitError') as string);
                setIsLoading(false);
            }
        } else {
            setIsLoading(false);
        }
    };

    const handleCancelClick = async (event: FormEvent) => {
        event.preventDefault();
        const confirmCancel = window.confirm(t('cancelConfirm') as string);
        if (confirmCancel) {
            setIsLoading(true);
            setTaskApiError('');
            if (TaskApiVersionMapper[formState.initialForm.taskType] === ApiVersion.v2) {
                router.push('/create-case/');
            } else {
                const successfulCaseUpdate = await putCaseTask(
                    formState.initialForm.caseId,
                    formState.initialForm.taskId,
                    buildForm(CaseStatus.Cancelled, document, formState)
                );
                setIsLoading(false);

                if (successfulCaseUpdate) {
                    router.push('/create-case/');
                } else {
                    setTaskApiError(t('cancelError') as string);
                }
            }
        }
    };

    return (
        <div className="flex flex-col self-center p-4">
            <div className="flex">
                <Button
                    className="mr-4"
                    onClick={handleFormSubmit}
                    size={ButtonSize.Small}
                    variant={isFormStateReadOnly || isLoading ? ButtonVariant.Inactive : ButtonVariant.Default}
                    disabled={isFormStateReadOnly || isLoading}
                    type={ButtonType.Primary}
                >
                    {t('submit')}
                </Button>
                <Button
                    className="mr-4"
                    onClick={handleDraftFormSubmit}
                    size={ButtonSize.Small}
                    variant={isFormStateReadOnly || isLoading ? ButtonVariant.Inactive : ButtonVariant.Default}
                    disabled={isFormStateReadOnly || isLoading}
                    type={ButtonType.Primary}
                >
                    {t('saveAsDraft')}
                </Button>
                <NavElement
                    aria-label={t('cancel') as string}
                    onClick={handleCancelClick}
                    size={NavElementSize.Small}
                    type={NavElementType.Button}
                    variant={NavElementVariant.Default}
                    disabled={isCancelActionDisabled}
                >
                    {t('cancel')}
                </NavElement>
            </div>
            <div className="my-2">
                {!areDiaryNotesViewed && !isFormStateReadOnly && (
                    <AssistiveText
                        text={t('formValidation.diaryNotesViewWarning')}
                        variant={AssistiveTextVariant.Warning}
                        className="mt-2"
                    />
                )}
            </div>
        </div>
    );
}
