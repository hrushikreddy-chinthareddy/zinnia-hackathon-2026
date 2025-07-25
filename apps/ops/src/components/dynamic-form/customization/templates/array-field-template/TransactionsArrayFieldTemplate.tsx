import {
    ArrayFieldTemplateProps,
    FormContextType,
    getUiOptions,
    RJSFSchema,
    StrictRJSFSchema,
} from '@rjsf/utils';
import { Label } from '@zinnia/bloom/components';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CheckboxText from '@deps/components/checkbox/checkbox-text/checkbox-text';
import { TranslationFiles } from '@deps/config/translations';
import { TaskStatus } from '@deps/models/case/task-instance';

import { TransactionsTable } from './TransactionTable';
export interface Transaction {
    id: string;
    policyNumber: string;
    transactionNumber: string;
    transactionDate?: string;
    transactionAmount: string;
    checkNumber: string;
    checkIssueDate: string;
    postFund: boolean;
    stopTransactionStatus: string;
    identifiedManually: boolean;
    reverseSor: boolean;
    sendCheckToEstate: boolean;
    isReverseUncashTxnReviewRequired: boolean;
}
export function TransactionsArrayFieldTemplate<
    T = any,
    S extends StrictRJSFSchema = RJSFSchema,
    F extends FormContextType = any
>(props: ArrayFieldTemplateProps<T, S, F>) {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'reverseTransaction',
    });

    const { items, schema, formData, uiSchema, formContext } = props;

    const { postFundData, preFundData, reviewData } = useMemo(() => {
        const data = Array.isArray(formData) ? formData : [];
        return {
            postFundData: data.filter(
                (item: Transaction) => item?.postFund === true
            ),
            preFundData: data.filter(
                (item: Transaction) => item?.postFund === false
            ),
            reviewData: data.filter(
                (item: Transaction) =>
                    item?.postFund === null || item?.postFund === undefined
            ),
        };
    }, [formData]);

    const {
        reverseTransactionRadioCheck,
        sendCheckToEstateRadioCheck,
        reviewFundsRadioCheck,
    } = useMemo(() => {
        return {
            reverseTransactionRadioCheck: postFundData.every(
                (item: Transaction) => item?.reverseSor === true
            ),
            sendCheckToEstateRadioCheck: preFundData.every(
                (item: Transaction) => item?.sendCheckToEstate === true
            ),
            reviewFundsRadioCheck: reviewData.every(
                (item: Transaction) =>
                    item?.isReverseUncashTxnReviewRequired === true
            ),
        };
    }, [preFundData, postFundData, reviewData]);

    const { customData, setCustomData, setSubmitEnabled } =
        formContext as FormContextType;

    const taskStatus = customData?.task?.status ?? '';

    const [sendCheckToEstateRadio, setSendCheckToEstateRadio] = useState(
        sendCheckToEstateRadioCheck
    );
    const [reverseTransactionRadio, setReverseTransactionRadio] = useState(
        reverseTransactionRadioCheck
    );
    const [reviewFundsRadio, setReviewFundsRadio] = useState(
        reviewFundsRadioCheck
    );

    useEffect(() => {
        const uncash = customData?.details?.uncashTransaction;
        if (!uncash) return;

        const hasPreFund = preFundData && preFundData.length > 0;
        const hasPostFund = postFundData && postFundData.length > 0;
        const hasReviewFunds = reviewData && reviewData.length > 0;

        setSubmitEnabled(() => {
            return (
                (!hasPostFund || reverseTransactionRadio) &&
                (!hasPreFund || sendCheckToEstateRadio) &&
                (!hasReviewFunds || reviewFundsRadio)
            );
        });
        const updatedTransactions = uncash.transactions.map(
            (tx: Transaction) => ({
                ...tx,
                reverseSor: tx.postFund ? reverseTransactionRadio : false,
                sendCheckToEstate:
                    tx.postFund === false ? sendCheckToEstateRadio : false,
                isReverseUncashTxnReviewRequired:
                    tx.postFund === null || tx.postFund === undefined
                        ? reviewFundsRadio
                        : false,
            })
        );

        setCustomData({
            details: {
                ...customData.details,
                uncashTransaction: {
                    ...customData.details.uncashTransaction,
                    transactions: updatedTransactions,
                },
            },
        });
    }, [sendCheckToEstateRadio, reverseTransactionRadio, reviewFundsRadio]);

    const uiOptions = getUiOptions(uiSchema);
    const sorting = uiOptions.sorting as boolean | undefined;

    return (
        <div className="w-full">
            {preFundData.length > 0 && (
                <div className="my-2 pt-2">
                    <Label>
                        <span className="typography-content-body-sm-bold">
                            {t('preFunds')}
                        </span>
                    </Label>

                    <TransactionsTable
                        schema={schema}
                        items={items}
                        uiSchema={uiSchema}
                        sorting={sorting}
                        TransactionData={preFundData}
                    />
                    <CheckboxText
                        label={t('sendCheckToEstate')}
                        checked={sendCheckToEstateRadio}
                        onChange={(value) => setSendCheckToEstateRadio(value)}
                        className="mt-4"
                        isDisabled={taskStatus === TaskStatus.Completed}
                    />
                </div>
            )}
            {postFundData.length > 0 && (
                <div className="my-2 pt-6">
                    <Label>
                        <span className="typography-content-body-sm-bold">
                            {' '}
                            {t('postFunds')}
                        </span>
                    </Label>

                    <TransactionsTable
                        schema={schema}
                        items={items}
                        uiSchema={uiSchema}
                        sorting={sorting}
                        TransactionData={postFundData}
                    />
                    <CheckboxText
                        label={t('reverseTransaction')}
                        checked={reverseTransactionRadio}
                        onChange={(value) => setReverseTransactionRadio(value)}
                        className="mt-4"
                        isDisabled={taskStatus === TaskStatus.Completed}
                    />
                </div>
            )}
            {reviewData.length > 0 && (
                <div className="my-2 pt-6">
                    <Label>
                        <span className="typography-content-body-sm-bold">
                            {' '}
                            {t('reviewFunds')}
                        </span>
                    </Label>

                    <TransactionsTable
                        schema={schema}
                        items={items}
                        uiSchema={uiSchema}
                        sorting={sorting}
                        TransactionData={reviewData}
                    />
                    <CheckboxText
                        label={t('reviewFundsRadio')}
                        checked={reviewFundsRadio}
                        onChange={(value) => setReviewFundsRadio(value)}
                        className="mt-4"
                        isDisabled={taskStatus === TaskStatus.Completed}
                    />
                </div>
            )}
        </div>
    );
}
