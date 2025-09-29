import dayjs from 'dayjs';
import { TFunction } from 'next-i18next';
import { useCallback, useContext, useEffect, useMemo } from 'react';

import { useNigoEntry } from '@deps/containers/nigo-entry-container/components/nigo-entry-provider';
import { getCaseType } from '@deps/containers/nigo-entry-container/components/steps/form-entry/form-entry-step.helpers';
import { SuggestedDocType } from '@deps/containers/nigo-entry-container/components/steps/service-form-review/document-indexing-info';
import { SelOptionType } from '@deps/containers/nigo-entry-container/components/steps/service-form-review/service-form-review';
import {
    getFormData,
    NIGO_EXCEPTIONS_LABEL,
} from '@deps/containers/nigo-entry-container/components/steps/service-form-review/service-form-review.helpers';
import { OWNER_TYPES } from '@deps/containers/otp/renewal-forms/components/renewal-form-helpers';
import { buildFormV2 } from '@deps/containers/otp/withdrawal-forms/utils/withdrawal-form-helpers';
import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';
import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { isEmptyObject } from '@deps/helpers/objects.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { DocumentData } from '@deps/models/case/document';
import { Channel } from '@deps/models/case/renewal/case-renewal';
import {
    TaskType,
    TaskSource,
    CreateTaskBody,
    RenewalsFormData,
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
import { browserLogInfo } from '@deps/utils/browser-logging';

export interface UseServiceFormReviewLogicProps {
    t: TFunction;
    docType: string;
    clientCode: string;
    document: DocumentData;
    nigoExceptions: Array<{ label: string; value: string }>;
    nigoSubExceptions: Array<{
        nmId: string;
        subExceptions: Array<{ label: string; value: string }>;
    }>;
    setIsLoading: (loading: boolean) => void;
}

const SUPPORT_TOOL = 'SupportTool';
const RENEWAL_TRANSFER = 'RenewalTransfer';

export function useServiceFormReview({
    t,
    docType,
    clientCode,
    document,
    nigoExceptions,
    nigoSubExceptions,
    setIsLoading,
}: UseServiceFormReviewLogicProps) {
    const nigoEntry = useNigoEntry();
    const { goToNext } = useWorkflow();
    const formState = useContext(FormDataContext);
    const renewalFormState = useContext(RenewalFormDataContext);

    const {
        sectionOption,
        documentIndexingInfo,
        formErrors,
        submitFailed,
        setFormErrors,
        setSubmitFailed,
        setMessages,
        messages,
        setFormComment,
    } = nigoEntry;

    const {
        formSource,
        setFormSource,
        setFormData,
        formSubtype,
        setFormNigos,
        formComment,
        setFormReindexingData,
    } = formState;

    const {
        initialForm,
        channel,
        contractValue,
        renewalRequestSignDate,
        subsequentTargetFunds,
        transOption,
        ownerInformation,
        upfrontNIGO,
    } = renewalFormState;

    const caseType = useMemo(() => getCaseType(docType as string), [docType]);
    const carrier = useMemo(() => clientCode?.toUpperCase(), [clientCode]);
    const timer = useMemo(() => performance.now(), []);
    const isRenewals = initialForm.taskType === TaskType.RENEWAL_TASK;

    const filteredNigoException = useMemo(
        () =>
            nigoExceptions?.find(
                (nigoException) =>
                    nigoException.label ===
                    NIGO_EXCEPTIONS_LABEL.CASE_ROUTED_MANUAL
            ),
        [nigoExceptions]
    );
    const NIGO_EXCEPTION = filteredNigoException?.value;

    const subExceptions = useMemo(
        () =>
            nigoSubExceptions?.find(
                (subItem) => subItem.nmId === NIGO_EXCEPTION
            )?.subExceptions,
        [nigoSubExceptions, NIGO_EXCEPTION]
    );
    const notesSubException = useMemo(
        () =>
            subExceptions?.find(
                (item) =>
                    item.label ===
                    NIGO_EXCEPTIONS_LABEL.VALIDATION_FAILED_REASON_NOT_LISTED
            )?.value,
        [subExceptions]
    );

    const getRenewalFormDataPayload = useCallback(() => {
        const updatedOwnerInformation = ownerInformation?.map((owner) => {
            if (OWNER_TYPES.includes(owner.type)) {
                return {
                    ...owner,
                    signature: {
                        ...owner?.signature,
                        ...(channel === Channel.Phone && {
                            signDate: renewalRequestSignDate,
                        }),
                    },
                };
            }
            return owner;
        });

        const funds = subsequentTargetFunds?.map((item) => ({
            fundName: item.fundName,
            value: item.value,
            fundCode: item?.fundCode,
            divisionCode: item?.divisionCode,
        }));

        return {
            channel,
            clientCode: initialForm.carrier,
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
            renewalRequestSignDate,
            source: SUPPORT_TOOL,
            subsequentGuaranteePeriod: null,
            subsequentTargetFunds: funds || null,
            taskType: RENEWAL_TRANSFER,
            transOption,
            userId: initialForm.data.userId,
            upfrontNIGO: upfrontNIGO,
        };
    }, [
        channel,
        initialForm,
        contractValue,
        document,
        ownerInformation,
        renewalRequestSignDate,
        subsequentTargetFunds,
        transOption,
        upfrontNIGO,
    ]);

    const buildRenewalFormV2 = useCallback(
        (status: TaskStatus): CreateTaskBody<TaskStatus, RenewalsFormData> => ({
            source: TaskSource.ZinniaTaskManagement,
            taskType: initialForm.taskType,
            status,
            data: getRenewalFormDataPayload(),
        }),
        [initialForm, getRenewalFormDataPayload]
    );

    const submit = useCallback(async () => {
        setIsLoading(true);
        let successfulCaseUpdate;

        if (
            formState.initialForm.status !== TaskStatus.Completed &&
            !isRenewals
        ) {
            successfulCaseUpdate = await updateTask(
                formState.initialForm.caseId,
                formState.initialForm.taskId,
                buildFormV2(TaskStatus.Completed, document, formState),
                timer
            );
            browserLogInfo(
                successfulCaseUpdate && successfulCaseUpdate.id
                    ? 'ServiceFormReviewStep::submit::Successfully updated task'
                    : 'ServiceFormReviewStep::submit::Failed to update task',
                {
                    caseId: formState.initialForm.caseId,
                    taskId: formState.initialForm.taskId,
                    id: successfulCaseUpdate?.id,
                }
            );
            setSubmitFailed(!(successfulCaseUpdate && successfulCaseUpdate.id));
        } else if (isRenewals) {
            successfulCaseUpdate = await updateTask(
                initialForm.caseId,
                initialForm.taskId,
                buildRenewalFormV2(TaskStatus.Completed),
                timer
            );
            browserLogInfo(
                successfulCaseUpdate && successfulCaseUpdate.id
                    ? 'ServiceFormReviewStep::submit::Successfully updated task'
                    : 'ServiceFormReviewStep::submit::Failed to update task',
                {
                    caseId: initialForm.caseId,
                    taskId: initialForm.taskId,
                    id: successfulCaseUpdate?.id,
                }
            );
            setSubmitFailed(!(successfulCaseUpdate && successfulCaseUpdate.id));
        } else {
            setSubmitFailed(false);
        }
        setIsLoading(false);
    }, [
        document,
        formState,
        setSubmitFailed,
        timer,
        isRenewals,
        initialForm,
        buildRenewalFormV2,
        setIsLoading,
    ]);

    const validateForm = useCallback(() => {
        const errors: any = {};
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
        if (sectionOption === NIGO_EXCEPTION && !isRenewals) {
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
        return errors;
    }, [
        sectionOption,
        documentIndexingInfo,
        messages,
        NIGO_EXCEPTION,
        notesSubException,
        formComment,
        t,
    ]);

    const handleStepContinue = useCallback(async () => {
        setFormErrors({});
        const errors = validateForm();
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
        sectionOption,
        validateForm,
        submit,
        goToNext,
        setFormErrors,
        NIGO_EXCEPTION,
    ]);

    useEffect(() => {
        if (
            sectionOption === NIGO_EXCEPTION &&
            Object.keys(formErrors).length === 0
        ) {
            const nigos = [
                {
                    exceptionId: NIGO_EXCEPTION,
                    messages: !isEmptyObject(messages)
                        ? Object.keys(messages[NIGO_EXCEPTION])
                        : [],
                },
            ];
            setFormNigos({ nigos });
        } else {
            setFormNigos(null);
        }
    }, [formErrors, messages, sectionOption, NIGO_EXCEPTION]);

    useEffect(() => {
        setFormSource({
            ...formSource,
            channel: { text: document.source },
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

    return {
        formErrors,
        handleStepContinue,
        filteredNigoException,
        isRenewals,
        submitFailed,
    };
}
