import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { FormEvent, useContext, useState } from 'react';

import AssistiveText, { AssistiveTextVariant } from '@deps/components/assistive-text/assistive-text';
import Button, { ButtonSize, ButtonType } from '@deps/components/button/button';
import NavElement, { NavElementSize, NavElementType, NavElementVariant } from '@deps/components/nav-element/nav-element';
import { TranslationFiles } from '@deps/config/translations';
import { DiaryNotesContext } from '@deps/contexts/DiaryNotesContext';
import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';
import { isLocalStorageEnabled } from '@deps/helpers/local-storage.hepler';
import { Channel } from '@deps/models/case/renewal/case-renewal';
import { CreateTaskBody, RenewalsFormData, TaskType } from '@deps/models/case/task';
import { TaskStatus } from '@deps/models/case/task-instance';
import { CaseStatus } from '@deps/models/case/withdrawal/case';
import { createTask } from '@deps/queries/api/v1/task';
import {
    DEFAULT_DATE_FORMAT,
    DEFAULT_EXTENDED_DATE_FORMAT,
    DEFAULT_EXTENDED_DAY_DATE_FORMAT,
    DEFAULT_EXTENDED_MONTH_DATE_FORMAT,
    ZAHARA_API_DATE_FORMAT,
} from '@deps/types/constants';

import { OWNER_TYPES } from './renewal-form-helper';
interface RenewalFormControls {
    userId: string;
    caseId: string;
    clientId: string;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const RenewalFormActions = ({ userId, clientId, caseId, setIsLoading }: RenewalFormControls) => {
    const { t } = useTranslation(TranslationFiles.COMMON);
    const router = useRouter();
    const { areDiaryNotesViewed } = useContext(DiaryNotesContext);

    const [taskApiError, setTaskApiError] = useState('');

    const {
        channel,
        formErrors,
        caseDocument,
        contractValue,
        currentFormState,
        renewalRequestSignDate,
        subsequentTargetFunds,
        transOption,
        formValidator,
        setFormErrors,
        ownerInformation,
        isFormStateReadOnly,
    } = useContext(RenewalFormDataContext);

    const isCancelActionDisabled = ![CaseStatus.Draft, CaseStatus.Pending, ''].includes(currentFormState as CaseStatus);

    const submitRenewalRequest = async (event: FormEvent): Promise<void> => {
        event.preventDefault();
        setTaskApiError('');

        if (validateForm() && areDiaryNotesViewed) {
            setIsLoading(true);

            const updatedOwnerInformation = ownerInformation?.map(owner => {
                if (OWNER_TYPES.includes(owner.type)) {
                    return {
                        ...owner,
                        signature: {
                            ...owner?.signature,
                            ...(channel === Channel.Phone && { signDate: renewalRequestSignDate }), // CMW-13965 updaing Call Received Date in signDate
                        },
                    };
                }
                return owner;
            });

            const funds = subsequentTargetFunds?.map(item => {
                return {
                    fundName: item.fundName,
                    value: item.value,
                    fundCode: item?.fundCode,
                    divisionCode: item?.divisionCode,
                };
            });

            const task: CreateTaskBody<TaskStatus, RenewalsFormData> = {
                taskType: TaskType.RENEWAL,
                carrier: clientId,
                data: {
                    channel,
                    clientCode: clientId,
                    contractNum: caseDocument?.contract,
                    documentNumber: caseDocument?.documentNumber,
                    contractValue: typeof contractValue === 'string' ? null : contractValue,
                    documentReceivedDate: dayjs(caseDocument?.documentDate, [
                        DEFAULT_DATE_FORMAT,
                        DEFAULT_EXTENDED_DAY_DATE_FORMAT,
                        DEFAULT_EXTENDED_MONTH_DATE_FORMAT,
                        DEFAULT_EXTENDED_DATE_FORMAT,
                    ]).format(ZAHARA_API_DATE_FORMAT),
                    goodOrderDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
                    lob: caseDocument?.lob,
                    onbaseCaseId: caseDocument?.caseId,
                    ownerInformation: updatedOwnerInformation,
                    productName: caseDocument?.productName,
                    renewalRequestSignDate, // need to handle it for FormType
                    source: 'SupportTool',
                    subsequentGuaranteePeriod: null,
                    subsequentTargetFunds: funds || null,
                    taskType: 'RenewalTransfer',
                    transOption,
                    userId,
                },
            };

            const data = await createTask(caseId, task);

            if (data?.taskId) {
                if (isLocalStorageEnabled()) {
                    const successMessage = t('caseRenewal.request.createTaskSuccess', {
                        contractNumber: caseDocument?.contract,
                        documentNumber: caseDocument?.documentNumber,
                    });

                    localStorage.setItem('otp-renewal-success', successMessage);
                }

                router.push(`/create-case`);
            } else {
                // set api error
                setTaskApiError(t('caseRenewal.request.createTaskError') as string);
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
                <p className="mb-2 self-center text-semantic-error" key={`task-form-error-${index}`}>
                    {formErrors[error]}
                </p>
            );
        });
    };
    return (
        <div>
            <hr className="mt-4 h-0.5 border-none bg-gray-100" />
            <div className="my-4 flex flex-col pb-4">
                {Object.keys(formErrors) && <div className="flex flex-col">{renderErrors(Object.keys(formErrors))}</div>}
                {taskApiError && <AssistiveText variant={AssistiveTextVariant.Error} text={taskApiError} className="mt-2" />}
                <div className="flex flex-row self-center p-4">
                    <Button className="mr-4" onClick={submitRenewalRequest} size={ButtonSize.Small} type={ButtonType.Primary}>
                        {t('caseRenewal.request.submit')}
                    </Button>
                    <NavElement
                        aria-label={t('caseRenewal.request.cancel') as string}
                        onClick={() => router.push('/create-case/')}
                        size={NavElementSize.Small}
                        type={NavElementType.Button}
                        variant={NavElementVariant.Default}
                        disabled={isCancelActionDisabled}
                    >
                        {t('caseRenewal.request.cancel')}
                    </NavElement>
                </div>
                <div className="self-center">
                    {!areDiaryNotesViewed && !isFormStateReadOnly && (
                        <AssistiveText
                            text={t('caseWithdrawal.request.formValidation.diaryNotesViewWarning')}
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
