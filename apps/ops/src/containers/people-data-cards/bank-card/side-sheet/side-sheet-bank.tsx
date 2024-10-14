import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { Dispatch, SetStateAction, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';

import CaseDocumentSelect, { CaseDocumentOption, SetStateCaseId } from '@deps/components/case-document-select/case-document-select';
import { FieldSize, FieldType, FieldVariant } from '@deps/components/fields/field';
import Field from '@deps/components/fields/field';
import Radio from '@deps/components/radio/radio';
import {
    NonFinancialTransactionIdKeys,
    updateOptimistically,
} from '@deps/components/side-sheet/non-financial-transactions/non-financial-transactions.helper';
import ApiErrorState from '@deps/components/side-sheet/non-financial-transactions/states/api-error-state';
import BpmErrorState from '@deps/components/side-sheet/non-financial-transactions/states/bpm-error-state';
import LoadingState from '@deps/components/side-sheet/non-financial-transactions/states/loading-state';
import { ViewState } from '@deps/components/side-sheet/non-financial-transactions/states/states.helpers';
import SuccessState from '@deps/components/side-sheet/non-financial-transactions/states/success-state';
import TransactionCta from '@deps/components/transaction-cta/transaction-cta';
import { TranslationFiles } from '@deps/config/translations';
import {
    BankDetails,
    Errors,
    getAccountTypeOptions,
    getFormErrors,
} from '@deps/containers/people-data-cards/bank-card/side-sheet/side-sheet-bank.helpers';
import { getFirstLastName } from '@deps/helpers/party-info-helper';
import { buildFullNameFromParty } from '@deps/helpers/string.helper';
import { mapAccountTypeToTranslation } from '@deps/helpers/translation.helper';
import { Processes } from '@deps/models/case/case';
import { AccountStatus, AccountType, BankAccount, PolicyAllOfPartiesItem } from '@deps/models/policy/sor-policy';
import { ValidationResult } from '@deps/queries/api/bpm';
import {
    NonFinancialTransactionActions,
    NonFinancialTransactionBody,
    NonFinancialTransactions,
    addNonFinancialTransaction,
} from '@deps/queries/api/bpm-non-financial';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export type SideSheetBankProps = {
    onCancel: () => void;
    party?: PolicyAllOfPartiesItem;
    planCode?: string;
    policyNumber?: string;

    setCurrentBankAccounts: Dispatch<SetStateAction<BankAccount[]>>;
};

const SideSheetBank = ({ party, planCode, policyNumber, onCancel, setCurrentBankAccounts }: SideSheetBankProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'people.sideSheet.bank' });
    const { t: defaultT } = useTranslation();

    const INITIAL_BANK_ACCOUNT: BankAccount = {
        accountType: AccountType.CHECKING,
        accountStatus: AccountStatus.ACTIVEBANKACCOUNT,
        nameOnAccount: buildFullNameFromParty(party),
    };

    const INITIAL_BODY: NonFinancialTransactionBody = {
        correlationId: uuidV4(),
        effectiveDate: dayjs().format(ZAHARA_API_DATE_FORMAT),
        reverseInitiator: false,
    };

    const [bankAccount, setBankAccount] = useState(INITIAL_BANK_ACCOUNT);
    const [body, setBody] = useState(INITIAL_BODY);
    const [caseDocumentOptions, setCaseDocumentOptions] = useState<CaseDocumentOption[]>([]);
    const [currentErrors, setCurrentErrors] = useState<Errors>();

    const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
    const [viewState, setViewState] = useState(ViewState.Default);

    const { caseId } = body;
    const { partyId } = party ?? {};

    const stopLoading = currentErrors === undefined ? true : !!Object.entries(currentErrors).length;

    const accountTypeOptions = getAccountTypeOptions({ t: defaultT });
    const mainCtaText = t('general.add', {
        type: mapAccountTypeToTranslation(bankAccount.accountType, defaultT).toLowerCase(),
    });

    const handleSubmit = async () => {
        const errors = getFormErrors({ bankAccount, caseId, t });
        setCurrentErrors(errors);
        if (Object.keys(errors).length > 0) return;

        const response = await addNonFinancialTransaction({
            body: {
                ...body,
                bankAccount,
            },
            partyId,
            planCode,
            policyNumber,
            transaction: NonFinancialTransactions.BankAccount,
        });

        switch (response?.status) {
            case StatusCode.Accepted:
                setViewState(ViewState.Success);
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
                    transaction={NonFinancialTransactions.BankAccount}
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
                    transaction={NonFinancialTransactions.BankAccount}
                />
            );
        case ViewState.Success:
            updateOptimistically({
                action: NonFinancialTransactionActions.Add,
                idKey: NonFinancialTransactionIdKeys.BankAccount,
                newItem: bankAccount,
                setState: setCurrentBankAccounts,
            });

            return (
                <SuccessState
                    action={NonFinancialTransactionActions.Add}
                    name={bankAccount.branchName ?? ''}
                    onCancel={onCancel}
                    transaction={NonFinancialTransactions.BankAccount}
                />
            );
        case ViewState.Default:
        default:
            break;
    }

    return (
        <div className="flex flex-col p-8">
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
                />
                <Radio
                    aria-label={t('labels.accountType') as string}
                    items={accountTypeOptions}
                    label={t('labels.accountType') as string}
                    onChange={event => {
                        setBankAccount(prevState => ({ ...prevState, accountType: event.target.value as AccountType }));
                    }}
                    value={bankAccount.accountType}
                />
                <Field
                    formatOptions={{ format: '#########' }}
                    label={t('labels.routingNumber') as string}
                    message={currentErrors?.routingNumber}
                    onChange={event => {
                        setCurrentErrors(prevState => {
                            const { routingNumber, ...errors } = prevState ?? {};
                            return errors;
                        });
                        setBankAccount(prevState => ({ ...prevState, routingNumber: event.target.value }));
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={bankAccount.routingNumber}
                    variant={currentErrors?.routingNumber ? FieldVariant.Error : FieldVariant.Default}
                />
                <Field
                    label={t('labels.bankName') as string}
                    message={currentErrors?.branchName}
                    onChange={event => {
                        setCurrentErrors(prevState => {
                            const { branchName, ...errors } = prevState ?? {};
                            return errors;
                        });
                        setBankAccount(prevState => ({ ...prevState, branchName: event.target.value }));
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={bankAccount.branchName}
                    variant={currentErrors?.branchName ? FieldVariant.Error : FieldVariant.Default}
                />
                <Field
                    formatOptions={{ format: '#################' }}
                    label={t('labels.accountNumber') as string}
                    message={currentErrors?.accountNumber}
                    onChange={event => {
                        setCurrentErrors(prevState => {
                            const { accountNumber, ...errors } = prevState ?? {};
                            return errors;
                        });
                        setBankAccount(prevState => ({ ...prevState, accountNumber: event.target.value }));
                    }}
                    size={FieldSize.Small}
                    type={FieldType.BaseActive}
                    value={bankAccount.accountNumber}
                    variant={currentErrors?.accountNumber ? FieldVariant.Error : FieldVariant.Default}
                />
            </div>

            <TransactionCta
                className="mt-10"
                mainCta={{
                    onClick: handleSubmit,
                    text: mainCtaText,
                }}
                secondaryCta={{
                    onClick: onCancel,
                    text: t('general.cancel'),
                }}
                stopLoading={stopLoading}
            />
        </div>
    );
};

export default SideSheetBank;
