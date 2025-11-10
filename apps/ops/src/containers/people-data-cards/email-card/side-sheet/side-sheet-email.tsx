import {
    Email,
    EmailType,
    Party,
    Policy,
    PreferredCommunicationType,
    TransactionType,
} from '@zinnia/api-types/types/sor';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import CaseDocumentSelect, {
    CaseDocumentOption,
    SetStateCaseId,
} from '@deps/components/case-document-select/case-document-select';
import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import Field, {
    FieldSize,
    FieldType,
    FieldVariant,
} from '@deps/components/fields/field';
import Radio from '@deps/components/radio/radio';
import { updateOptimistically } from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/side-sheet-non-financial-transactions.helpers';
import AlertState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/alert-state';
import ApiErrorState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/api-error-state';
import BpmErrorState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/bpm-error-state';
import LoadingState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/loading-state';
import {
    ViewState,
    handleResponse,
} from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/states.helpers';
import SuccessState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/success-state';
import WarnState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/warn-state';
import { NonFinancialTransactionIdKeys } from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/types';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import { TranslationFiles } from '@deps/config/translations';
import {
    EmailDetails,
    Errors,
    getEmailTypes,
    getFormErrors,
} from '@deps/containers/people-data-cards/email-card/side-sheet/side-sheet-email.helpers';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { buildNonFinancialTransactionsSubmittedEvent } from '@deps/helpers/analytics/submit-transaction-event';
import { getFirstLastName } from '@deps/helpers/party-info-helpers';
import { mapEmailTypeToTranslation } from '@deps/helpers/translation.helpers';
import { Processes } from '@deps/models/case/case';
import { ValidationResult } from '@deps/queries/api/bpm';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactionBody,
    NonFinancialTransactions,
    addNonFinancialTransaction,
    editNonFinancialTransaction,
} from '@deps/queries/api/bpm-non-financial';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import {
    TransactionSuccessfulEvent,
    SegmentTrackedEventName,
    TransactionSubmittedEventType,
} from '@deps/types/segment-analytics';

dayjs.extend(utc);

export type SideSheetEmailProps = {
    isOnlyEmail: boolean;
    onCancel: () => void;
    party?: Party;
    policy?: Policy;
    planCode?: string;
    policyNumber?: string;
    setCurrentEmails: Dispatch<SetStateAction<Email[]>>;
    updateEmail?: Email;
};

const SideSheetEmail = ({
    isOnlyEmail,
    onCancel,
    party,
    planCode,
    policyNumber,
    policy,
    setCurrentEmails,
    updateEmail,
}: SideSheetEmailProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.email',
    });

    const { t: defaultT } = useTranslation();
    const router = useRouter();
    const correlationIdFromRoute =
        typeof router?.query?.correlationId === 'string'
            ? router?.query?.correlationId
            : undefined;
    const { sessionId, partyId: userId } = usePermissionsContext();

    const INITIAL_EMAIL: Email = {
        emailType: EmailType.PERSONAL,
        startDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
    };

    const INITIAL_BODY: NonFinancialTransactionBody = {
        correlationId: uuidV4(),
        effectiveDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
        reverseInitiator: false,
    };

    const [action, setAction] = useState(
        updateEmail
            ? NonFinancialTransactionActions.Edit
            : NonFinancialTransactionActions.Add
    );
    const [body, setBody] = useState(INITIAL_BODY);
    const [caseDocumentOptions, setCaseDocumentOptions] = useState<
        CaseDocumentOption[]
    >([]);
    const [currentErrors, setCurrentErrors] = useState<Errors>();
    const [email, setEmail] = useState<Email>(updateEmail ?? INITIAL_EMAIL);
    const [newCaseId, setNewCaseId] = useState<string>();

    const [validationResults, setValidationResults] = useState<
        ValidationResult[]
    >([]);
    const [viewState, setViewState] = useState(ViewState.Default);

    const { emailAddress, emailType = EmailType.PERSONAL } = email;
    const { partyId } = party ?? {};

    const isAdd = action === NonFinancialTransactionActions.Add;
    const isDelete = action === NonFinancialTransactionActions.Delete;
    const stopLoading =
        currentErrors === undefined
            ? true
            : !!Object.entries(currentErrors).length;

    const emailTypes = getEmailTypes({ t: defaultT });
    const emailTypeTranslation = mapEmailTypeToTranslation(
        emailType,
        defaultT
    ).toLowerCase();
    const mainCtaText = isAdd
        ? t('mainCta.add', { type: emailTypeTranslation })
        : t('mainCta.update', { type: emailTypeTranslation });

    const handleDelete = async () => {
        const response = await editNonFinancialTransaction({
            body: {
                ...body,
                deleteRequest: true,
                email,
            },
            itemId: updateEmail?.emailId,
            partyId,
            planCode,
            policyNumber,
            transaction: NonFinancialTransactions.EmailAddress,
        });

        const onSuccessfulSubmit = (caseId: string) => {
            setNewCaseId(caseId);
            segmentAnalyticsTrackEvent<TransactionSuccessfulEvent>(
                SegmentTrackedEventName.TransactionSubmitted,
                buildNonFinancialTransactionsSubmittedEvent({
                    transactionSubmittedEventType:
                        TransactionSubmittedEventType.REMOVE_EMAIL,
                    query: {
                        ...body,
                        email,
                        deleteRequest: true,
                    },
                    caseId,
                    policy,
                    sessionId,
                    userId,
                })
            );
        };

        handleResponse({
            response,
            setViewState,
            setValidationResults,
            onSuccessfulSubmit,
        });
    };

    const handleSubmit = async () => {
        const caseId = body.caseId;
        const errors = getFormErrors({ email, caseId, isDelete, t: defaultT });
        setCurrentErrors(errors);
        if (Object.keys(errors).length > 0) return;

        if (isDelete) {
            if (
                party?.preferredCommunicationType ===
                    PreferredCommunicationType.EMAIL &&
                isOnlyEmail
            ) {
                setViewState(ViewState.Alert);
                return;
            }

            setViewState(ViewState.Warn);
            return;
        }

        let response;

        if (isAdd) {
            response = await addNonFinancialTransaction({
                body: {
                    ...body,
                    email,
                },
                partyId,
                planCode,
                policyNumber,
                transaction: NonFinancialTransactions.EmailAddress,
            });
        } else {
            response = await editNonFinancialTransaction({
                body: {
                    ...body,
                    email,
                },
                itemId: updateEmail?.emailId,
                partyId,
                planCode,
                policyNumber,
                transaction: NonFinancialTransactions.EmailAddress,
            });
        }

        const onSuccessfulSubmit = (caseId: string) => {
            setNewCaseId(caseId);
            segmentAnalyticsTrackEvent<TransactionSuccessfulEvent>(
                SegmentTrackedEventName.TransactionSubmitted,
                buildNonFinancialTransactionsSubmittedEvent({
                    transactionSubmittedEventType: isAdd
                        ? TransactionSubmittedEventType.ADD_EMAIL
                        : TransactionSubmittedEventType.UPDATE_EMAIL,
                    query: {
                        ...body,
                        email,
                    },
                    caseId,
                    policy,
                    sessionId,
                    userId,
                })
            );
        };

        handleResponse({
            response,
            setViewState,
            setValidationResults,
            onSuccessfulSubmit,
        });
    };

    switch (viewState) {
        case ViewState.Loading:
            return <LoadingState />;
        case ViewState.Alert:
            return (
                <AlertState ctaAction={() => setViewState(ViewState.Default)} />
            );
        case ViewState.BpmError:
            return (
                <BpmErrorState
                    onCancel={onCancel}
                    onContinue={handleSubmit}
                    setViewState={setViewState}
                    transaction={NonFinancialTransactions.EmailAddress}
                    validationResults={validationResults}
                >
                    <EmailDetails email={email} />
                </BpmErrorState>
            );
        case ViewState.ApiError:
            return (
                <ApiErrorState
                    action={action}
                    name={getFirstLastName(party)}
                    onCancel={onCancel}
                    onContinue={handleSubmit}
                    transaction={NonFinancialTransactions.Email}
                    type={emailTypeTranslation}
                />
            );
        case ViewState.Warn:
            return (
                <WarnState
                    name={getFirstLastName(party)}
                    onCancel={onCancel}
                    onContinue={handleDelete}
                    transaction={NonFinancialTransactions.Email}
                    type={emailTypeTranslation}
                />
            );
        case ViewState.Success:
            updateOptimistically({
                action,
                idKey: NonFinancialTransactionIdKeys.Email,
                newItem: email,
                setState: setCurrentEmails,
            });

            return (
                <SuccessState
                    action={action}
                    isNigo={!!validationResults?.length}
                    name={getFirstLastName(party)}
                    onCancel={onCancel}
                    transaction={NonFinancialTransactions.Email}
                    type={emailTypeTranslation}
                    caseId={newCaseId}
                />
            );
        case ViewState.Default:
        default:
            break;
    }

    return (
        <div className="flex flex-col gap-6 p-10">
            <CaseDocumentSelect
                caseDocumentOptions={caseDocumentOptions}
                caseId={body.caseId}
                currentErrors={currentErrors}
                policyNumber={policyNumber}
                processType={Processes.PolicyUpdate}
                setBody={setBody as SetStateCaseId}
                setCaseDocumentOptions={setCaseDocumentOptions}
                setCurrentErrors={setCurrentErrors}
                setViewState={setViewState}
                processSubType={[Processes.EmailChange]}
                correlationId={correlationIdFromRoute}
                body={body}
            />

            <div className="flex flex-col gap-8">
                {isAdd && (
                    <Radio
                        aria-label={t('labels.type') as string}
                        items={emailTypes}
                        label={t('labels.type') as string}
                        onChange={(event) =>
                            setEmail((prevState) => ({
                                ...prevState,
                                emailType: event.target.value as EmailType,
                            }))
                        }
                        value={emailType}
                    />
                )}

                <Field
                    aria-label={t('labels.email') as string}
                    label={t('labels.email') as string}
                    message={currentErrors?.emailAddress}
                    onChange={(event) => {
                        setCurrentErrors((prevState) => {
                            const { emailAddress, ...errors } = prevState ?? {};
                            return errors;
                        });
                        setEmail((prevState) => ({
                            ...prevState,
                            emailAddress: event.target.value,
                        }));
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={emailAddress}
                    variant={
                        isDelete
                            ? FieldVariant.Inactive
                            : currentErrors?.emailAddress
                            ? FieldVariant.Error
                            : FieldVariant.Default
                    }
                />
            </div>

            {!isAdd && (
                <CheckboxText
                    checked={isDelete}
                    label={t('labels.removeEmail')}
                    onChange={(e) => {
                        setAction(
                            e
                                ? NonFinancialTransactionActions.Delete
                                : NonFinancialTransactionActions.Edit
                        );
                    }}
                />
            )}

            <TransactionCta
                className="mt-4"
                mainCta={{
                    onClick: handleSubmit,
                    text: mainCtaText,
                }}
                secondaryCta={{
                    onClick: onCancel,
                    text: t('general.cancel'),
                }}
                stopLoading={stopLoading}
                trackEventProps={{
                    type: TransactionType.EMAIL_CHANGE,
                    correlationId: body.correlationId,
                }}
            />
        </div>
    );
};

export default SideSheetEmail;
