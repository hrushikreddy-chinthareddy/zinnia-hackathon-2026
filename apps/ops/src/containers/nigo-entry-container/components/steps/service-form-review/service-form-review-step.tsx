
import { AssistiveText, AssistiveTextVariant, Loader } from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useCallback, useContext, useEffect, useState } from 'react';

import TransactionNavigationButtons, { ParentPage } from "@deps/components/transaction-navigation-buttons/transaction-navigation-buttons";
import WorkflowCard from "@deps/components/workflows/workflow-card/workflow-card";
import { TranslationFiles } from '@deps/config/translations';
import { buildFormV2 } from '@deps/containers/otp/withdrawal-forms/utils/withdrawal-form-helper';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helper';
import { DocumentData } from '@deps/models/case/document';
import { ApiVersion } from '@deps/models/case/enums';
import { TaskApiVersionMapper } from '@deps/models/case/helpers';
import { TaskStatus } from '@deps/models/case/task-instance';
import { FormValidationErrors } from '@deps/models/case/withdrawal/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { updateTask } from '@deps/queries/api/v2/task';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import { SuggestedDocType } from './document-indexing-info';
import { SelOptionType, ServiceFormReview } from './service-form-review';
import { getFormData } from './service-form-review.helper';
import { useNigoEntry } from '../../nigo-entry-provider';
import { getCaseType } from '../form-entry/form-entry-step.helper';

interface ServiceFormReviewStepProps {
    documentNumber: string;
    policy: Policy;
    docType: string;
    clientCode: string;
    taskInfoLink: string;
    document: DocumentData;
};

export const ServiceFormReviewStep = ({documentNumber, policy, docType, clientCode, document} : ServiceFormReviewStepProps ) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'nigoEntry.serviceFormReview' });
    const { goToNext } = useWorkflow();
    const { policyNumber } = policy || {};
    const { sectionOption, documentIndexingInfo, formErrors, setFormErrors, setSubmitFailed } = useNigoEntry();
    const formState = useContext(FormDataContext);

    const { formSource, setFormSource, setFormData, formSubtype, setFormReindexingData } = formState;
    const caseType = getCaseType(docType as string);
    const carrier = clientCode.toUpperCase();
    const [isLoading, setIsLoading] = useState(false);
    const [timer] = useState(performance.now());

    const submit = useCallback(async () => {
        setIsLoading(true);

        if (
            TaskApiVersionMapper[formState.initialForm.taskType] === ApiVersion.v2 &&
            formState.initialForm.status !== TaskStatus.Completed
        ) {
            const successfulCaseUpdate = await updateTask(
                formState.initialForm.caseId,
                formState.initialForm.taskId,
                buildFormV2(TaskStatus.Completed, document, formState),
                timer
            );

            if (successfulCaseUpdate && successfulCaseUpdate.id) {
                setSubmitFailed(false);
            } else {
                setSubmitFailed(true);
            }
        } else {
            setSubmitFailed(false);
        }

        setIsLoading(false);
    }, [document, formState, setSubmitFailed, timer]);

    const handleStepContinue = useCallback(async() => {
        const errors = {} as FormValidationErrors;
        if (sectionOption === SelOptionType.DOC_INDEXING) {
            if (isNullEmptyOrUndefined(documentIndexingInfo?.docTypeToReindex)) {
                errors['noDocTypeToReindex'] = t('formErrors.formValidation.noDocTypeToReindex');
                setFormErrors(errors);
            }

            if (!isNullEmptyOrUndefined(documentIndexingInfo?.docTypeToReindex) && documentIndexingInfo?.docTypeToReindex === SuggestedDocType.OTHER && isNullEmptyOrUndefined(documentIndexingInfo?.notes)) {
                errors['noNotes'] = t('formErrors.formValidation.noNotes');
                setFormErrors(errors);
            }
        }

        if (sectionOption === SelOptionType.DOC_INDEXING && Object.keys(errors).length === 0) {
            await submit();
            goToNext();
        } else {
            goToNext();
        }
    }, [documentIndexingInfo, goToNext, sectionOption, setFormErrors, submit, t]);

    useEffect(() => {
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

    useEffect(() => {
        if (carrier && caseType) {
            const data = getFormData(caseType, carrier, formSubtype);
            if (data) {
                setFormData(prevFormData => {
                    return{
                        ...prevFormData,
                        ...data
                    };
                });
            }
        }
    }, [carrier, caseType, formSubtype]);

    useEffect(() => {
        if (sectionOption === SelOptionType.DOC_INDEXING) {
            setFormReindexingData((prevState: any) => ({
                ...prevState,
                lob: document.lob,
                docHandle: document.sysDocumentHandle,
                docTypeToReindex: documentIndexingInfo?.docTypeToReindex,
                notes: documentIndexingInfo?.docTypeToReindex === SuggestedDocType.OTHER ? documentIndexingInfo?.notes : null
            }));
        } else {
            setFormReindexingData(null);
        }
    }, [sectionOption, document, documentIndexingInfo]);

    return (
        <WorkflowCard
            title={t('title')}
            subtitle={t('subTitle') as string}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink='/create-case'
                />
            }
        >
            {isLoading && (
                <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                    <Loader />
                </div>
            )}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                    <ServiceFormReview
                        documentNumber={documentNumber}
                        clientCode={clientCode}
                        policyNumber={policyNumber as string}
                        docType={docType}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    {formErrors?.noDocTypeToReindex && (
                        <AssistiveText text={formErrors?.noDocTypeToReindex} variant={AssistiveTextVariant.Error} className="mt-2" />
                    )}
                    {formErrors?.noNotes && (
                        <AssistiveText text={formErrors?.noNotes} variant={AssistiveTextVariant.Error} className="mt-2" />
                    )}
                </div>
            </div>
        </WorkflowCard>
    );
};
