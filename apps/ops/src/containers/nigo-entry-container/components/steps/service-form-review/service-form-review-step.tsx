import {
    AssistiveText,
    AssistiveTextVariant,
    Loader,
} from '@zinnia/bloom/components';
import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { useCallback, useContext, useEffect, useState } from 'react';

import TransactionNavigationButtons, {
    ParentPage,
} from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import WorkflowCard from '@deps/components/workflows/workflow-card/workflow-card';
import { TranslationFiles } from '@deps/config/translations';
import { buildFormV2 } from '@deps/containers/otp/withdrawal-forms/utils/withdrawal-form-helpers';
import { NigoSubException } from '@deps/containers/task-container/components/steps/nigo-details/nigo-details.types';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isEmptyObject } from '@deps/helpers/objects.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { DocumentData } from '@deps/models/case/document';
import { ApiVersion } from '@deps/models/case/enums';
import { TaskApiVersionMapper } from '@deps/models/case/helpers';
import { TaskStatus } from '@deps/models/case/task-instance';
import {
    FormValidationErrors,
    NigoMessages,
} from '@deps/models/case/withdrawal/case';
import { updateTask } from '@deps/queries/api/v2/task';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import { browserLogInfo } from '@deps/utils/browser-logging';

import { SuggestedDocType } from './document-indexing-info';
import { SelOptionType, ServiceFormReview } from './service-form-review';
import { getFormData } from './service-form-review.helpers';
import { useNigoEntry } from '../../nigo-entry-provider';
import { getCaseType } from '../form-entry/form-entry-step.helpers';
import { NigoException } from '../nigo-details/nigo-details.types';

interface ServiceFormReviewStepProps {
    documentNumber: string;
    policyNumber: string;
    docType: string;
    clientCode: string;
    taskInfoLink: string;
    document: DocumentData;
    nigoExceptions: NigoException[];
    nigoSubExceptions: NigoSubException[];
}

export const ServiceFormReviewStep = ({
    documentNumber,
    policyNumber,
    docType,
    clientCode,
    document,
    nigoExceptions,
    nigoSubExceptions,
}: ServiceFormReviewStepProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'nigoEntry.serviceFormReview',
    });
    const { goToNext } = useWorkflow();

    const {
        sectionOption,
        documentIndexingInfo,
        formErrors,
        setFormErrors,
        setSubmitFailed,
        setMessages,
        messages,
    } = useNigoEntry();
    const formState = useContext(FormDataContext);

    const {
        formSource,
        setFormSource,
        setFormData,
        formSubtype,
        setFormReindexingData,
        setFormNigos,
        formNigos,
        formComment,
        setFormComment,
    } = formState;
    const caseType = getCaseType(docType as string);
    const carrier = clientCode?.toUpperCase();
    const [isLoading, setIsLoading] = useState(false);
    const [timer] = useState(performance.now());
    const filteredNigoException = nigoExceptions?.find(
        (nigoException) =>
            nigoException.label === 'Case routed for manual processing'
    );
    const NIGO_EXCEPTION = filteredNigoException?.value;
    const subExceptions = nigoSubExceptions?.find(
        (subItem: NigoSubException) => subItem.nmId === NIGO_EXCEPTION
    )?.subExceptions;
    const notesSubException = subExceptions?.find((item: any) => {
        return item.label === 'Validation failed due to reason not listed.';
    })?.value;

    const submit = useCallback(async () => {
        setIsLoading(true);

        if (
            TaskApiVersionMapper[formState.initialForm.taskType] ===
                ApiVersion.v2 &&
            formState.initialForm.status !== TaskStatus.Completed
        ) {
            const successfulCaseUpdate = await updateTask(
                formState.initialForm.caseId,
                formState.initialForm.taskId,
                buildFormV2(TaskStatus.Completed, document, formState),
                timer
            );

            if (successfulCaseUpdate && successfulCaseUpdate.id) {
                browserLogInfo(
                    'ServiceFormReviewStep::submit::Successfully updated task',
                    {
                        caseId: formState.initialForm.caseId,
                        taskId: formState.initialForm.taskId,
                        id: successfulCaseUpdate.id,
                    }
                );
                setSubmitFailed(false);
            } else {
                browserLogInfo(
                    'ServiceFormReviewStep::submit::Failed to update task',
                    {
                        caseId: formState.initialForm.caseId,
                        taskId: formState.initialForm.taskId,
                        id: successfulCaseUpdate.id,
                    }
                );
                setSubmitFailed(true);
            }
        } else {
            setSubmitFailed(false);
        }

        setIsLoading(false);
    }, [document, formState, setSubmitFailed, timer]);

    const handleStepContinue = useCallback(async () => {
        const errors = {} as FormValidationErrors;
        setFormErrors({});

        if (sectionOption === SelOptionType.DOC_INDEXING) {
            if (
                isNullEmptyOrUndefined(documentIndexingInfo?.docTypeToReindex)
            ) {
                errors['noDocTypeToReindex'] = t(
                    'formErrors.formValidation.noDocTypeToReindex'
                );
            }
            if (
                !isNullEmptyOrUndefined(
                    documentIndexingInfo?.docTypeToReindex
                ) &&
                documentIndexingInfo?.docTypeToReindex ===
                    SuggestedDocType.OTHER &&
                isNullEmptyOrUndefined(documentIndexingInfo?.notes)
            ) {
                errors['noNotes'] = t('formErrors.formValidation.noNotes');
            }
        }

        if (sectionOption === NIGO_EXCEPTION) {
            if (
                messages[NIGO_EXCEPTION] === undefined ||
                isEmptyObject(messages[NIGO_EXCEPTION])
            ) {
                errors['noCategoryDetailsSelected'] = t(
                    'formErrors.formValidation.noCategoryDetailsSelected'
                );
            } else {
                const selectedMessage = messages[NIGO_EXCEPTION]
                    ? Object.keys(messages[NIGO_EXCEPTION])
                    : [];
                if (selectedMessage.includes(notesSubException as string)) {
                    if (isNullEmptyOrUndefined(formComment?.comment)) {
                        errors['noComment'] = t(
                            'formErrors.formValidation.noComment'
                        );
                    }
                }
            }
        }

        setFormErrors(errors);
        if (Object.keys(errors).length === 0) {
            if (
                [SelOptionType.DOC_INDEXING, NIGO_EXCEPTION].includes(
                    sectionOption
                )
            ) {
                await submit();
                goToNext();
            } else {
                goToNext();
            }
        }
    }, [
        documentIndexingInfo,
        goToNext,
        sectionOption,
        setFormErrors,
        submit,
        messages,
        formComment,
        t,
    ]);

    useEffect(() => {
        if (
            sectionOption === NIGO_EXCEPTION &&
            Object.keys(formErrors).length === 0
        ) {
            const nigos: NigoMessages[] = [];
            const obj = {
                exceptionId: NIGO_EXCEPTION,
                messages: !isEmptyObject(messages)
                    ? Object.keys(messages[NIGO_EXCEPTION])
                    : [],
            };
            nigos.push(obj);
            setFormNigos({ nigos: nigos });
        } else {
            setFormNigos(null);
        }
    }, [formErrors, messages, setFormNigos]);

    useEffect(() => {
        setFormSource({
            ...formSource,
            channel: {
                text: document.source,
            },
            businessKey: document.documentNumber,
            receivedDate: dayjs(
                document.dateReceived,
                'M/D/YYYY hh:mm:ss A'
            ).format(ZAHARA_API_DATE_FORMAT),
            receivedDateTime: dayjs(
                document.dateReceived,
                'M/D/YYYY hh:mm:ss A'
            ).format('YYYY-MM-DDTHH:mm:ss:Z'),
            sourceSysId: 'ONBASE',
        });
    }, [document]);

    useEffect(() => {
        if (carrier && caseType) {
            const data = getFormData(caseType, carrier, formSubtype);
            if (data) {
                setFormData((prevFormData) => {
                    return {
                        ...prevFormData,
                        ...data,
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
                notes:
                    documentIndexingInfo?.docTypeToReindex ===
                    SuggestedDocType.OTHER
                        ? documentIndexingInfo?.notes
                        : null,
            }));
            setFormNigos(null);
            setMessages([]);
            setFormComment({ comment: '' });
        } else if (sectionOption === SelOptionType.NIGO_ENTRY) {
            setFormNigos(null);
            setFormReindexingData(null);
            setMessages([]);
            setFormComment({ comment: '' });
        } else if (sectionOption === NIGO_EXCEPTION) {
            setFormReindexingData(null);
            setFormNigos(null);
        } else {
            setFormReindexingData(null);
            setFormNigos(null);
            setMessages([]);
            setFormComment({ comment: '' });
        }
    }, [sectionOption, document, documentIndexingInfo, NIGO_EXCEPTION]);

    return (
        <WorkflowCard
            title={t('title')}
            subtitle={t('subTitle') as string}
            footerContent={
                <TransactionNavigationButtons
                    className="mt-4"
                    handleContinue={handleStepContinue}
                    parentPage={ParentPage.CreateCase}
                    leaveTransactionLink="/create-case"
                />
            }
        >
            {isLoading && (
                <div className="fixed left-0 top-0 z-10 flex h-screen w-screen justify-center bg-gray-800 opacity-80">
                    <Loader />
                </div>
            )}
            <div className="flex flex-col">
                <div className="flex flex-col gap-1">
                    <ServiceFormReview
                        documentNumber={documentNumber}
                        clientCode={clientCode}
                        policyNumber={policyNumber as string}
                        docType={docType}
                        nigoExpection={filteredNigoException}
                        nigoSubExceptions={nigoSubExceptions}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    {formErrors?.noDocTypeToReindex && (
                        <AssistiveText
                            text={formErrors?.noDocTypeToReindex}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                    {formErrors?.noNotes && (
                        <AssistiveText
                            text={formErrors?.noNotes}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                    {formErrors?.noCategoryDetailsSelected && (
                        <AssistiveText
                            text={formErrors?.noCategoryDetailsSelected}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                    {formErrors?.noComment && (
                        <AssistiveText
                            text={formErrors?.noComment}
                            variant={AssistiveTextVariant.Error}
                            className="mt-2"
                        />
                    )}
                </div>
            </div>
        </WorkflowCard>
    );
};
