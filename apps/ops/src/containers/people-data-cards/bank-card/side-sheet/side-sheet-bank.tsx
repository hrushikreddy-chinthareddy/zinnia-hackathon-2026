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
import SelectSimple from '@deps/components/select/select';
import ApiErrorState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/api-error-state';
import BpmErrorState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/bpm-error-state';
import LoadingState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/loading-state';
import {
    handleResponse,
    ViewState,
} from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/states.helpers';
import SuccessState from '@deps/components/side-sheet/side-sheet-transaction/non-financial-transactions/states/success-state';
import WarnState from '@deps/components/side-sheet/side-sheet-transaction/states/warn-state';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import { TranslationFiles } from '@deps/config/translations';
import {
    BankDetails,
    Errors,
    getAccountTypeOptions,
    GetAction,
    getFormErrors,
    getPurposeOptions,
} from '@deps/containers/people-data-cards/bank-card/side-sheet/side-sheet-bank.helpers';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { usePermissionsContext } from '@deps/contexts/PermissionsContext';
import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';
import { buildNonFinancialTransactionsSubmittedEvent } from '@deps/helpers/analytics/submit-transaction-event';
import { getFirstLastName } from '@deps/helpers/party-info-helpers';
import { buildFullNameFromParty } from '@deps/helpers/string.helpers';
import { mapAccountTypeToTranslation } from '@deps/helpers/translation.helpers';
import {
    hasErrorsAndFocus,
    useFocusOnError,
} from '@deps/hooks/useFocusOnError';
import { Processes } from '@deps/models/case/case';
import { ValidationResult } from '@deps/queries/api/bpm';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactionBody,
    NonFinancialTransactions,
    addNonFinancialTransaction,
    editNonFinancialTransaction,
    validateNonFinancialTransaction,
} from '@deps/queries/api/bpm-non-financial';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';
import {
    SegmentTrackedEventName,
    TransactionSubmittedEventType,
    TransactionSuccessfulEvent,
} from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    AccountStatus,
    AccountType,
    BankAccount,
    BankAccountPurpose,
    Party,
    Policy,
    Transaction,
} from '@zinnia/api-types/types/sor';

dayjs.extend(utc);

export type SideSheetBankProps = {
    onCancel: () => void;
    party?: Party;
    planCode?: string;
    policyNumber?: string;
    policy?: Policy;
    updatedBank: BankAccount;
    setCurrentBankAccounts: Dispatch<SetStateAction<BankAccount[]>>;
};

const SideSheetBank = ({
    party,
    planCode,
    policy,
    policyNumber,
    onCancel,
    updatedBank,
}: SideSheetBankProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'people.sideSheet.bank',
    });
    const { t: defaultT } = useTranslation();
    const router = useRouter();
    const correlationIdFromRoute =
        typeof router?.query?.correlationId === 'string'
            ? router?.query?.correlationId
            : undefined;
    const { featureFlags } = useOptimizely();
    const { partyId: userId, sessionId } = usePermissionsContext();
    const shouldShowBankDelete =
        featureFlags[FEATURE_FLAGS.BANK_CHANGE_DELETE_TRANSACTION];

    const INITIAL_BANK_ACCOUNT: BankAccount = {
        accountType: AccountType.CHECKING,
        accountStatus: AccountStatus.ACTIVEBANKACCOUNT,
        nameOnAccount: buildFullNameFromParty(party),
    };

    const INITIAL_BODY: NonFinancialTransactionBody = {
        correlationId: uuidV4(),
        effectiveDate: dayjs.utc().format(ZAHARA_API_DATE_FORMAT),
        reverseInitiator: false,
    };

    const [bankAccount, setBankAccount] = useState(
        updatedBank ?? INITIAL_BANK_ACCOUNT
    );
    const [body, setBody] = useState(INITIAL_BODY);
    const [caseDocumentOptions, setCaseDocumentOptions] = useState<
        CaseDocumentOption[]
    >([]);
    const [currentErrors, setCurrentErrors] = useState<Errors>();

    const [validationResults, setValidationResults] = useState<
        ValidationResult[]
    >([]);
    const [viewState, setViewState] = useState(ViewState.Default);
    const [newCaseId, setNewCaseId] = useState<string>();
    const purposeOptions = getPurposeOptions({ t: defaultT });

    const { errorRef, triggerErrorFocus } = useFocusOnError(currentErrors);

    const { caseId } = body;
    const { partyId } = party ?? {};

    const stopLoading =
        currentErrors === undefined
            ? true
            : !!Object.entries(currentErrors).length;

    const accountTypeOptions = getAccountTypeOptions({ t: defaultT });
    const mainCtaText = t('general.add', {
        type: mapAccountTypeToTranslation(
            bankAccount.accountType,
            defaultT
        ).toLowerCase(),
    });
    const [action, setAction] = useState(
        updatedBank
            ? NonFinancialTransactionActions.Edit
            : NonFinancialTransactionActions.Add
    );

    const isAdd = action === NonFinancialTransactionActions.Add;
    const isDelete = action === NonFinancialTransactionActions.Delete;
    const getAction = GetAction(isAdd, isDelete);

    const handleDelete = async () => {
        const response = await editNonFinancialTransaction({
            body: {
                ...body,
                deleteRequest: true,
                bankAccount,
            },
            itemId: updatedBank?.bankId,
            partyId,
            planCode,
            policyNumber,
            transaction: NonFinancialTransactions.BankAccount,
        });

        const onSuccessfulSubmit = (caseId: string) => {
            segmentAnalyticsTrackEvent<TransactionSuccessfulEvent>(
                SegmentTrackedEventName.TransactionSubmitted,
                buildNonFinancialTransactionsSubmittedEvent({
                    transactionSubmittedEventType:
                        TransactionSubmittedEventType.REMOVE_BANK_INFO,
                    query: {
                        ...body,
                        deleteRequest: true,
                        bankAccount,
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

    const handleValidation = async () => {
        const errors = getFormErrors({ bankAccount, caseId, t, isDelete });
        setCurrentErrors(errors);
        if (hasErrorsAndFocus(errors, triggerErrorFocus)) return;
        let response;
        if (isAdd) {
            response = await validateNonFinancialTransaction({
                body: {
                    ...body,
                    bankAccount,
                },
                partyId,
                planCode,
                policyNumber,
                transaction: NonFinancialTransactions.BankAccount,
                action: NonFinancialTransactionActions.Add,
            });
        } else {
            delete bankAccount.branchAddress;
            const extendedBody = isDelete
                ? {
                      ...body,
                      deleteRequest: true,
                      bankAccount,
                  }
                : {
                      ...body,
                      bankAccount,
                  };
            response = await validateNonFinancialTransaction({
                body: extendedBody,
                partyId,
                planCode,
                policyNumber,
                transaction: NonFinancialTransactions.BankAccount,
                action: isDelete
                    ? NonFinancialTransactionActions.Delete
                    : NonFinancialTransactionActions.Edit,
            });
        }

        switch (response?.status) {
            case StatusCode.Okay:
                if (isDelete) {
                    setViewState(ViewState.Warn);
                } else {
                    handleSubmit();
                }
                break;
            case StatusCode.BadRequest:
                setValidationResults(
                    response?.data?.validationResult as ValidationResult[]
                );
                setViewState(ViewState.BpmError);
                break;
            case StatusCode.InternalServerError:
            default:
                setViewState(ViewState.ApiError);
                break;
        }
    };

    const handleSubmit = async () => {
        const errors = getFormErrors({ bankAccount, caseId, t, isDelete });
        setCurrentErrors(errors);
        if (hasErrorsAndFocus(errors, triggerErrorFocus)) return;

        let response;
        if (isAdd) {
            response = await addNonFinancialTransaction({
                body: {
                    ...body,
                    bankAccount,
                },
                partyId,
                planCode,
                policyNumber,
                transaction: NonFinancialTransactions.BankAccount,
            });
        } else {
            delete bankAccount.branchAddress;
            response = await editNonFinancialTransaction({
                body: {
                    ...body,
                    bankAccount,
                },
                itemId: updatedBank?.bankId,
                partyId,
                planCode,
                policyNumber,
                transaction: NonFinancialTransactions.BankAccount,
            });
        }

        switch (response?.status) {
            case StatusCode.Accepted:
                setViewState(ViewState.Success);
                if (response?.data?.caseId) {
                    setNewCaseId(response?.data?.caseId);
                }
                segmentAnalyticsTrackEvent<TransactionSuccessfulEvent>(
                    SegmentTrackedEventName.TransactionSubmitted,
                    buildNonFinancialTransactionsSubmittedEvent({
                        transactionSubmittedEventType: isAdd
                            ? TransactionSubmittedEventType.ADD_BANK_INFO
                            : TransactionSubmittedEventType.UPDATE_BANK_INFO,
                        query: body,
                        caseId: response?.data?.caseId,
                        policy,
                        sessionId,
                        userId,
                    })
                );
                break;
            case StatusCode.BadRequest:
                setValidationResults(response?.data?.validationResult);
                setViewState(ViewState.BpmError);
                break;
            case StatusCode.InternalServerError:
            default:
                setViewState(ViewState.ApiError);
                break;
        }
    };

    switch (viewState) {
        case ViewState.Loading:
            return <LoadingState />;
        case ViewState.BpmError:
            return (
                <BpmErrorState
                    onCancel={onCancel}
                    onContinue={handleSubmit}
                    setViewState={setViewState}
                    transaction={NonFinancialTransactions.BankAccountLabel}
                    validationResults={validationResults}
                >
                    <BankDetails bankAccount={bankAccount} />
                </BpmErrorState>
            );
        case ViewState.ApiError:
            return (
                <ApiErrorState
                    action={NonFinancialTransactionActions.Add}
                    name={getFirstLastName(party)}
                    onCancel={onCancel}
                    onContinue={handleSubmit}
                    transaction={NonFinancialTransactions.BankAccountLabel}
                />
            );
        case ViewState.Warn:
            return (
                <WarnState
                    name={getFirstLastName(party)}
                    onCancel={onCancel}
                    onContinue={handleDelete}
                    transaction={NonFinancialTransactions.BankAccountLabel}
                />
            );
        case ViewState.Success:
            return (
                <SuccessState
                    action={getAction()}
                    name={bankAccount.branchName ?? ''}
                    onCancel={onCancel}
                    transaction={NonFinancialTransactions.BankAccountLabel}
                    caseId={newCaseId}
                />
            );
        case ViewState.Default:
        default:
            break;
    }

    return (
        <div ref={errorRef} className="flex flex-col p-8">
            <div className="flex flex-col gap-4">
                <CaseDocumentSelect
                    caseId={caseId}
                    caseDocumentOptions={caseDocumentOptions}
                    currentErrors={currentErrors}
                    policyNumber={policyNumber}
                    processType={Processes.PolicyUpdate}
                    setBody={setBody as SetStateCaseId}
                    setCaseDocumentOptions={setCaseDocumentOptions}
                    setCurrentErrors={setCurrentErrors}
                    setViewState={setViewState}
                    processSubType={[Processes.BankChange]}
                    correlationId={correlationIdFromRoute}
                    body={body}
                />
                <Radio
                    aria-label={t('labels.accountType') as string}
                    items={accountTypeOptions}
                    label={t('labels.accountType') as string}
                    onChange={(event) => {
                        setBankAccount((prevState) => ({
                            ...prevState,
                            accountType: event.target.value as AccountType,
                        }));
                    }}
                    value={bankAccount.accountType}
                    disabled={isDelete}
                />
                <Field
                    errorId="routingNumber"
                    formatOptions={{ format: '#########' }}
                    label={t('labels.routingNumber') as string}
                    message={currentErrors?.routingNumber}
                    onChange={(event) => {
                        setCurrentErrors((prevState) => {
                            const { routingNumber, ...errors } =
                                prevState ?? {};
                            return errors;
                        });
                        setBankAccount((prevState) => ({
                            ...prevState,
                            routingNumber: event.target.value,
                        }));
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={bankAccount.routingNumber}
                    variant={
                        currentErrors?.routingNumber
                            ? FieldVariant.Error
                            : isDelete
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                />
                <Field
                    errorId="branchName"
                    label={t('labels.bankName') as string}
                    message={currentErrors?.branchName}
                    onChange={(event) => {
                        setCurrentErrors((prevState) => {
                            const { branchName, ...errors } = prevState ?? {};
                            return errors;
                        });
                        setBankAccount((prevState) => ({
                            ...prevState,
                            branchName: event.target.value,
                        }));
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={bankAccount.branchName}
                    variant={
                        currentErrors?.branchName
                            ? FieldVariant.Error
                            : isDelete
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                />
                <Field
                    errorId="accountNumber"
                    formatOptions={{ format: '#################' }}
                    label={t('labels.accountNumber') as string}
                    message={currentErrors?.accountNumber}
                    onChange={(event) => {
                        setCurrentErrors((prevState) => {
                            const { accountNumber, ...errors } =
                                prevState ?? {};
                            return errors;
                        });
                        setBankAccount((prevState) => ({
                            ...prevState,
                            accountNumber: event.target.value,
                        }));
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={bankAccount.accountNumber}
                    variant={
                        currentErrors?.accountNumber
                            ? FieldVariant.Error
                            : isDelete
                            ? FieldVariant.Inactive
                            : FieldVariant.Default
                    }
                />
                <SelectSimple
                    aria-label={t('fieldLabels.purpose') as string}
                    disabled={isDelete}
                    label={t('fieldLabels.purpose') as string}
                    onChange={(value) => {
                        setBankAccount((prevState) => ({
                            ...prevState,
                            bankAccountPurpose: value as BankAccountPurpose,
                        }));
                    }}
                    options={purposeOptions}
                    size={FieldSize.Small}
                    value={bankAccount.bankAccountPurpose}
                />
            </div>

            {!isAdd && shouldShowBankDelete && (
                <div className="pt-8">
                    <CheckboxText
                        checked={isDelete}
                        label={t('fieldLabels.removeBank')}
                        onChange={(e) => {
                            setAction(
                                e
                                    ? NonFinancialTransactionActions.Delete
                                    : NonFinancialTransactionActions.Edit
                            );
                        }}
                    />
                </div>
            )}

            <TransactionCta
                className="mt-10"
                mainCta={{
                    onClick: handleValidation,
                    text: mainCtaText,
                }}
                secondaryCta={{
                    onClick: onCancel,
                    text: t('general.cancel'),
                }}
                stopLoading={stopLoading}
                trackEventProps={{
                    type: Transaction.transactionType.BANK_ACCOUNT_CHANGE,
                    correlationId: body.correlationId,
                }}
            />
        </div>
    );
};

export default SideSheetBank;
