import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { FormEvent, useContext, useState } from 'react';

import AssistiveText, {
    AssistiveTextVariant,
} from '@deps/components/assistive-text/assistive-text';
import Button, {
    ButtonSize,
    ButtonType,
    ButtonVariant,
} from '@deps/components/button/button';
import NavElement, {
    NavElementSize,
    NavElementType,
    NavElementVariant,
} from '@deps/components/nav-element/nav-element';
import { TranslationFiles } from '@deps/config/translations';
import { DiaryNotesContext } from '@deps/contexts/DiaryNotesContext';
import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';
import { isLocalStorageEnabled } from '@deps/helpers/local-storage.hepler';
import { Channel } from '@deps/models/case/renewal/case-renewal';
import {
    CreateTaskBody,
    RenewalsFormData,
    TaskSource,
} from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { updateTask } from '@deps/queries/api/v2/task';
import {
    DEFAULT_DATE_FORMAT,
    DEFAULT_EXTENDED_DATE_FORMAT,
    DEFAULT_EXTENDED_DAY_DATE_FORMAT,
    DEFAULT_EXTENDED_MONTH_DATE_FORMAT,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';

import { OWNER_TYPES } from './renewal-form-helpers';
interface RenewalFormControls {
    userId: string;
    caseId: string;
    clientId: string;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const RenewalFormActions = ({
    userId,
    clientId,
    caseId,
    setIsLoading,
}: RenewalFormControls) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const router = useRouter();
    const { areDiaryNotesViewed } = useContext(DiaryNotesContext);
    const [timer] = useState(performance.now());
    const [taskApiError, setTaskApiError] = useState('');

    const {
        initialForm,
        channel,
        formErrors,
        document,
        contractValue,
        renewalRequestSignDate,
        subsequentTargetFunds,
        transOption,
        formValidator,
        setFormErrors,
        ownerInformation,
        isFormStateReadOnly,
    } = useContext(RenewalFormDataContext);

    const getRenewalFormDataPayload = () => {
        const updatedOwnerInformation = ownerInformation?.map((owner) => {
            if (OWNER_TYPES.includes(owner.type)) {
                return {
                    ...owner,
                    signature: {
                        ...owner?.signature,
                        ...(channel === Channel.Phone && {
                            signDate: renewalRequestSignDate,
                        }), // CMW-13965 updaing Call Received Date in signDate
                    },
                };
            }
            return owner;
        });

        const funds = subsequentTargetFunds?.map((item) => {
            return {
                fundName: item.fundName,
                value: item.value,
                fundCode: item?.fundCode,
                divisionCode: item?.divisionCode,
            };
        });

        return {
            channel,
            clientCode: clientId.toUpperCase(),
            contractNum: document?.contract,
            documentNumber: document?.documentNumber,
            contractValue:
                typeof contractValue === 'string' ? null : contractValue,
            documentReceivedDate: dayjs(document?.documentDate, [
                DEFAULT_DATE_FORMAT,
                DEFAULT_EXTENDED_DAY_DATE_FORMAT,
                DEFAULT_EXTENDED_MONTH_DATE_FORMAT,
                DEFAULT_EXTENDED_DATE_FORMAT,
            ]).format(ZAHARA_API_DATE_FORMAT),
            goodOrderDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
            lob: document?.lob,
            onbaseCaseId: document?.caseId,
            obPendTaskId: initialForm?.data?.obPendTaskId || null,
            ownerInformation: updatedOwnerInformation,
            productName: document?.productName,
            renewalRequestSignDate, // need to handle it for FormType
            source: 'SupportTool',
            subsequentGuaranteePeriod: null,
            subsequentTargetFunds: funds || null,
            taskType: 'RenewalTransfer',
            transOption,
            userId,
        };
    };

    const buildRenewalFormV2 = (
        status: TaskStatus
    ): CreateTaskBody<TaskStatus, RenewalsFormData> => {
        return {
            source: TaskSource.ZinniaTaskManagement,
            taskType: initialForm.taskType,
            status,
            data: getRenewalFormDataPayload(),
        };
    };

    const submitRenewalRequest = async (event: FormEvent): Promise<void> => {
        event.preventDefault();
        setFormErrors({});
        setTaskApiError('');

        if (validateForm() && areDiaryNotesViewed) {
            setIsLoading(true);

            const data = await updateTask(
                initialForm.caseId,
                initialForm.taskId,
                buildRenewalFormV2(TaskStatus.Completed),
                timer
            );
            if (data?.id) {
                if (isLocalStorageEnabled()) {
                    const successMessage = t(
                        'caseRenewal.request.createTaskSuccess',
                        {
                            contractNumber: document?.contract,
                            documentNumber: document?.documentNumber,
                        }
                    );

                    localStorage.setItem('otp-renewal-success', successMessage);
                }
                setIsLoading(false);
                router.push(`/create-case`);
            } else {
                // set api error
                setTaskApiError(
                    t('caseRenewal.request.createTaskError') as string
                );
                setIsLoading(false);
            }
        }
    };

    const validateForm = () => {
        const errors = formValidator({
            ownerInformation,
            subsequentTargetFunds,
            renewalRequestSignDate,
            channel,
        });

        setFormErrors({ ...errors });
        return Object.keys(errors).length === 0; // Returns true if no error
    };

    const renderErrors = (errors: string[]) => {
        return errors.map((error: string, index: number) => {
            return (
                <p
                    className="mb-2 self-center text-semantic-error"
                    key={`task-form-error-${index}`}
                >
                    {formErrors[error]}
                </p>
            );
        });
    };
    return (
        <div>
            <hr className="mt-4 h-0.5 border-none bg-gray-100" />
            <div className="my-4 flex flex-col pb-4">
                {Object.keys(formErrors) && (
                    <div className="flex flex-col">
                        {renderErrors(Object.keys(formErrors))}
                    </div>
                )}
                {taskApiError && (
                    <AssistiveText
                        variant={AssistiveTextVariant.Error}
                        text={taskApiError}
                        className="mt-2"
                    />
                )}
                <div className="flex flex-row self-center p-4">
                    <Button
                        className="mr-4"
                        onClick={submitRenewalRequest}
                        size={ButtonSize.Small}
                        type={ButtonType.Primary}
                        variant={
                            isFormStateReadOnly
                                ? ButtonVariant.Inactive
                                : ButtonVariant.Default
                        }
                        disabled={isFormStateReadOnly}
                    >
                        {t('caseRenewal.request.submit')}
                    </Button>
                    <NavElement
                        aria-label={t('caseRenewal.request.cancel') as string}
                        onClick={() => router.push('/create-case/')}
                        size={NavElementSize.Small}
                        type={NavElementType.Button}
                        variant={NavElementVariant.Default}
                        disabled={isFormStateReadOnly}
                    >
                        {t('caseRenewal.request.cancel')}
                    </NavElement>
                </div>
                <div className="self-center">
                    {!areDiaryNotesViewed && !isFormStateReadOnly && (
                        <AssistiveText
                            text={t(
                                'caseWithdrawal.request.formValidation.diaryNotesViewWarning'
                            )}
                            variant={AssistiveTextVariant.Warning}
                            className="mt-2"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default RenewalFormActions;
