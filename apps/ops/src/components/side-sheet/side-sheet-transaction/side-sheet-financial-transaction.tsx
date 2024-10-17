import { Button, Loader, LoaderVariant } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import ChipStatus from '@deps/components/chip-status/chip-status';
import { Content, ContentVariant } from '@deps/components/content/content';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useSideSheetContext } from '@deps/contexts/SideSheetContext';
import { numberFormatify } from '@deps/helpers/numbers.helper';
import { Statuses } from '@deps/models/case/case';
import { TransactionStatus, TransactionType } from '@deps/models/policy/sor-policy';
import { getPolicyTransactions } from '@deps/queries/api/policies';

import SidesheetReverseRecreate from './reverse-recreate/side-sheet-reverse-recreate';
import SideSheetReversedTransaction from './reverse-recreate/side-sheet-reversed-transaction';
import SidesheetCancelPending from './side-sheet-cancel-pending';
import SideSheetFinancialTransactionContent from './side-sheet-financial-content';
import { getFinancialTransactionSideSheetValues, replacesReverseInitiator } from './side-sheet-transaction.helper';
import { SideSheetTransactionProps, TransactionSideSheetValues } from './types';
import SideSheetWithdrawalContent from './withdrawal/side-sheet-withdrawal-content';

const SidesheetViews = {
    surrender: 'surrender',
    cancel: 'cancel',
    default: 'default',
    reverse: 'reverse',
    loading: 'loading',
    reverseInitiator: 'reverseInitiator',
};

const SideSheetFinancialTransaction = ({ policy, refreshTransactions, transaction }: SideSheetTransactionProps) => {
    const { t } = useTranslation(undefined);
    const { featureFlags } = useOptimizely();

    const [sidesheetValues, setSidesheetValues] = useState<TransactionSideSheetValues>(
        getFinancialTransactionSideSheetValues(policy, transaction, t, featureFlags)
    );
    const { cancelCta, reverseCta, getAsyncSideSheetValues } = sidesheetValues;
    const [loading, setLoading] = useState(false);
    const [asyncValues, setAsyncValues] = useState<any | null>(null);

    const [view, setView] = useState(SidesheetViews.default);
    const { handleOpen, changeSideSheetContent } = useSideSheetContext();

    const { status, transactionType } = transaction || {};

    useEffect(() => {
        let active = true;
        const isReversedTransaction = !!transaction.originalTransactionId;

        // if the transaction is reversed
        // and if we haven't already checked if the original transaction is reversed
        //  check if the original transaction is reversed
        if (isReversedTransaction && active) {
            // we might have to change the sidesheet
            // so we need to set the entire view to loading
            setView(SidesheetViews.loading);
            // call function to check 
            // if this transaction replaces a reverseInitiator
            getReverseInitiators();
        }

        async function getReverseInitiators() {
            // get all reverseInitiators
            const reverseInitiators = await getPolicyTransactions({
                id: policy.policyNumber,
                planCode: policy?.product?.planCode,
                status: TransactionStatus.Reversed,
                reverseInitiatorOnly: true,
            });

            // if there are no reverseInitiators, then we can just return
            // there is nothing else to check
            if (!reverseInitiators.length) return setView(SidesheetViews.default);

            // if there are reverseInitiators, then we need to check if this transaction
            // or any of its parents replaces a reverseInitiator
            // which we will know if any of the transactions
            // have an originalTransactionId present in the reverseInitiator array
            const isReverseInitiator = await replacesReverseInitiator(transaction, reverseInitiators, policy);
            
            return setView(isReverseInitiator ? SidesheetViews.reverseInitiator : SidesheetViews.default);
        }

        return () => {
            // set active to false on cleanup
            // this will prevent race conditions
            // when the component unmounts
            active = false;
        };
    }, [policy, transaction]);

    useEffect(() => {
        const getValues = async () => {
            setLoading(true);

            const asyncValues = getAsyncSideSheetValues ? await getAsyncSideSheetValues() : {};
            setAsyncValues(asyncValues);
            setSidesheetValues(vals => {
                return { ...vals, ...asyncValues };
            });
            setLoading(false);
        };

        !loading && !asyncValues && getAsyncSideSheetValues && getValues();
    }, [getAsyncSideSheetValues, asyncValues, setAsyncValues, loading, setLoading, setSidesheetValues]);

    let SidesheetContent;

    switch (transactionType) {
        case TransactionType.FullSurrender:
        case TransactionType.PartialWithdrawalOneTime:
            SidesheetContent = <SideSheetWithdrawalContent loading={loading} t={t} values={sidesheetValues} />;
            break;
        default:
            SidesheetContent = <SideSheetFinancialTransactionContent loading={loading} t={t} values={sidesheetValues} />;
            break;
    }

    switch (view) {
        case SidesheetViews.loading:
            return (
                <div className="flex h-full w-full items-center justify-center">
                    <Loader variant={LoaderVariant.Default} />
                </div>
            );
        case SidesheetViews.reverseInitiator:
            return <SideSheetReversedTransaction transaction={transaction} policy={policy} />;
        case SidesheetViews.cancel:
            return (
                <SidesheetCancelPending
                    amount={sidesheetValues.transactionValue as string}
                    closeSidesheet={() => {
                        refreshTransactions && refreshTransactions();
                        handleOpen(false);
                    }}
                    exitTransaction={() => setView(SidesheetViews.default)}
                    policyNumber={policy.policyNumber}
                    planCode={policy.product?.planCode}
                    transactionId={sidesheetValues.transactionId as string}
                    transactionType={sidesheetValues.transactionType as string}
                />
            );
        case SidesheetViews.reverse:
            return (
                <SidesheetReverseRecreate
                    amount={sidesheetValues.transactionValue as string}
                    effectiveDate={sidesheetValues.effectiveDate as string}
                    exitTransaction={() => setView(SidesheetViews.default)}
                    closeSidesheet={() => {
                        refreshTransactions && refreshTransactions();
                        handleOpen(false);
                    }}
                    policyNumber={policy.policyNumber}
                    planCode={policy.product?.planCode}
                    transactionType={sidesheetValues.transactionType as string}
                    reversalTransactionId={sidesheetValues.reversalTransactionId as string}
                />
            );
        case SidesheetViews.default:
        default:
            return (
                <div className="p-8">
                    <div className={`flex flex-col gap-4`}>
                        <div className="flex flex-col">
                            {transactionType !== TransactionType.FullSurrender &&
                                transactionType !== TransactionType.PartialWithdrawalOneTime && (
                                    <div className={cancelCta ? 'mb-4' : ''}>
                                        <Content
                                            details={numberFormatify(sidesheetValues?.transactionValue)}
                                            variant={ContentVariant.Value}
                                        />
                                        <Content
                                            className="text-gray-600"
                                            details={
                                                t('policy.history.sidesheet.effective', { date: sidesheetValues?.effectiveDate }) as string
                                            }
                                            variant={ContentVariant.Caption}
                                        />
                                    </div>
                                )}
                            {reverseCta && (
                                <Button
                                    onClick={() => {
                                        changeSideSheetContent(t('policy.history.reverseRecreateSidesheet.title'));
                                        setView(SidesheetViews.reverse);
                                    }}
                                    mode="link"
                                    size="small"
                                    className="mt-4.5 !justify-start !p-0"
                                >
                                    {reverseCta}
                                </Button>
                            )}
                            {cancelCta && (
                                <Button
                                    onClick={() => {
                                        setView(SidesheetViews.cancel);
                                    }}
                                    mode="link"
                                    size="small"
                                    className={clsx('!justify-start !p-0', transactionType === TransactionType.FullSurrender ? 'mb-6' : '')}
                                >
                                    {cancelCta}
                                </Button>
                            )}

                            {status === TransactionStatus.Canceled && (
                                <ChipStatus
                                    classNames="mb-4"
                                    status={'Canceled' as Statuses}
                                    statusText={t('status.canceledOn', { date: sidesheetValues?.processDate }) as string}
                                />
                            )}
                        </div>
                    </div>
                    {SidesheetContent}
                </div>
            );
    }
};

export default SideSheetFinancialTransaction;
