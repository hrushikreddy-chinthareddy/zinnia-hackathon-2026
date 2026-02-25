import { Button, Loader, LoaderVariant } from '@zinnia/bloom/components';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

import ChipStatus from '@deps/components/chip-status/chip-status';
import { Content, ContentVariant } from '@deps/components/content/content';
import TempNavInactive from '@deps/components/nav-element/temp-nav-inactive/temp-nav-inactive';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useSideSheetContextLegacy } from '@deps/contexts/SideSheetContext';
import { numberFormatify } from '@deps/helpers/numbers.helpers';
import { convertKebabedDateString } from '@deps/helpers/string.helpers';
import { withdrawalFinancialTransactions } from '@deps/helpers/transaction-types.helpers';
import { useTransactionPermissionCheck } from '@deps/hooks/useTransactionPermissionCheck';
import { Statuses } from '@deps/models/case/case';
import { getPolicyTransactions } from '@deps/queries/api/policies';
import { TransactionPermission } from '@deps/utils/auth';
import { getCarrierNameByClientId } from '@deps/utils/carriers';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    TransactionTypeEnum,
    TransactionStatus,
} from '@zinnia/api-types/types/sor';

import SideSheetFinancialTransactionContent from './side-sheet-financial-content';
import SidesheetCancelPending from '../cancel-pending/side-sheet-cancel-pending';
import SideSheetNewLoanTransactionContent from '../loan/side-sheet-new-loan-transaction-content';
import { NewLoanTransactionSideSheetValues } from '../loan/types';
import SidesheetReverseRecreate from '../reverse-recreate/side-sheet-reverse-recreate';
import { replacesReverseInitiator } from '../reverse-recreate/side-sheet-reverse-recreate.helpers';
import SideSheetReversedTransaction from '../reverse-recreate/side-sheet-reversed-transaction';
import { getFinancialTransactionSideSheetValues } from '../side-sheet-transaction.helpers';
import {
    SideSheetTransactionProps,
    TransactionSideSheetValues,
} from '../types';
import SideSheetWithdrawalContent from '../withdrawal/side-sheet-withdrawal-content';
import { WithdrawalSideSheetValues } from '../withdrawal/types';

const SidesheetViews = {
    surrender: 'surrender',
    cancel: 'cancel',
    default: 'default',
    reverse: 'reverse',
    loading: 'loading',
    reverseInitiator: 'reverseInitiator',
};

const SideSheetFinancialTransaction = (props: SideSheetTransactionProps) => {
    const { t } = useTranslation();
    const { featureFlags } = useOptimizely();
    const [loading, setLoading] = useState<boolean>(false);
    const [asyncValues, setAsyncValues] = useState<any | null>(null);
    const [view, setView] = useState(SidesheetViews.default);
    const { handleOpen, changeSideSheetContent } = useSideSheetContextLegacy();
    const { policy, transaction, refreshTransactions } = props || {};

    const [sideSheetValues, setSideSheetValues] = useState<
        TransactionSideSheetValues | WithdrawalSideSheetValues
    >(
        getFinancialTransactionSideSheetValues(
            policy,
            transaction,
            t,
            featureFlags
        )
    );

    const {
        cancelCta,
        effectiveDate,
        getAsyncSideSheetValues,
        reverseCta,
        processDate,
        transactionId,
        transactionValue,
    } = sideSheetValues || {};
    const { status, transactionType } = transaction || {};

    const { isPermissioned: isUserPermissionedToDoTransaction } =
        useTransactionPermissionCheck(
            TransactionPermission.WritePolicy,
            policy?.policyNumber,
            policy?.product?.planCode
        );

    useEffect(() => {
        if (featureFlags[FEATURE_FLAGS.REVERSE_RECREATE_ENABLED]) return;

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
                status: TransactionStatus.REVERSED,
                reverseInitiatorOnly: true,
            });

            // if there are no reverseInitiators, then we can just return
            // there is nothing else to check
            if (!reverseInitiators.length)
                return setView(SidesheetViews.default);

            // if there are reverseInitiators, then we need to check if this transaction
            // or any of its parents replaces a reverseInitiator
            // which we will know if any of the transactions
            // have an originalTransactionId present in the reverseInitiator array
            const isReverseInitiator = await replacesReverseInitiator(
                transaction,
                reverseInitiators,
                policy
            );

            return setView(
                isReverseInitiator
                    ? SidesheetViews.reverseInitiator
                    : SidesheetViews.default
            );
        }

        return () => {
            // set active to false on cleanup
            // this will prevent race conditions
            // when the component unmounts
            active = false;
        };
    }, [policy, transaction, featureFlags]);

    useEffect(() => {
        const getValues = async () => {
            setLoading(true);

            const asyncValues = getAsyncSideSheetValues
                ? await getAsyncSideSheetValues()
                : {};
            setAsyncValues(asyncValues);

            setSideSheetValues((vals) => {
                return { ...vals, ...asyncValues };
            });
            setLoading(false);
        };

        !loading && !asyncValues && getAsyncSideSheetValues && getValues();
    }, [asyncValues, getAsyncSideSheetValues, loading]);

    let SidesheetContent;

    switch (true) {
        case transactionType === TransactionTypeEnum.NEW_LOAN:
            SidesheetContent = (
                <SideSheetNewLoanTransactionContent
                    t={t}
                    values={
                        sideSheetValues as NewLoanTransactionSideSheetValues
                    }
                    loading={loading}
                />
            );
            break;
        case withdrawalFinancialTransactions.includes(
            transactionType as TransactionTypeEnum
        ):
            SidesheetContent = (
                <SideSheetWithdrawalContent
                    t={t}
                    values={sideSheetValues as WithdrawalSideSheetValues}
                    policy={policy}
                    loading={loading}
                />
            );
            break;

        default:
            SidesheetContent = (
                <SideSheetFinancialTransactionContent
                    t={t}
                    values={sideSheetValues as TransactionSideSheetValues}
                    loading={loading}
                />
            );
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
            return (
                <SideSheetReversedTransaction
                    transaction={transaction}
                    policy={policy}
                />
            );
        case SidesheetViews.cancel:
            return (
                <SidesheetCancelPending
                    amount={transactionValue}
                    closeSidesheet={() => {
                        refreshTransactions && refreshTransactions();
                        handleOpen(false);
                    }}
                    exitTransaction={() => setView(SidesheetViews.default)}
                    policyNumber={policy?.policyNumber}
                    planCode={policy?.product?.planCode}
                    transactionId={transactionId as string}
                    transactionType={transactionType as string}
                />
            );
        case SidesheetViews.reverse:
            return (
                <SidesheetReverseRecreate
                    amount={transactionValue}
                    effectiveDate={effectiveDate as string}
                    exitTransaction={() => setView(SidesheetViews.default)}
                    closeSidesheet={() => {
                        refreshTransactions && refreshTransactions();
                        handleOpen(false);
                    }}
                    policyNumber={policy?.policyNumber}
                    planCode={policy?.product?.planCode}
                    transactionId={transactionId as string}
                    transactionType={transactionType as string}
                />
            );
        case SidesheetViews.default:
        default:
            return (
                <div className="p-8">
                    <div className={`flex flex-col gap-4`}>
                        <div className="flex flex-col">
                            {![
                                ...withdrawalFinancialTransactions,
                                TransactionTypeEnum.NEW_LOAN,
                            ].includes(
                                transactionType as TransactionTypeEnum
                            ) && (
                                <div className={cancelCta ? 'mb-4' : ''}>
                                    <Content
                                        details={numberFormatify(
                                            transactionValue
                                        )}
                                        variant={ContentVariant.Value}
                                    />
                                    <Content
                                        className="text-gray-600"
                                        details={
                                            t(
                                                'policy.history.sidesheet.effective',
                                                {
                                                    date: convertKebabedDateString(
                                                        effectiveDate
                                                    ),
                                                }
                                            ) as string
                                        }
                                        variant={ContentVariant.Caption}
                                    />
                                </div>
                            )}

                            {reverseCta && (
                                <div className="mt-4.5">
                                    {isUserPermissionedToDoTransaction ? (
                                        <Button
                                            onClick={() => {
                                                changeSideSheetContent(
                                                    t(
                                                        'policy.history.reverseRecreateSidesheet.title'
                                                    )
                                                );
                                                setView(SidesheetViews.reverse);
                                            }}
                                            mode="link"
                                            size="small"
                                            className="!justify-start !p-0"
                                        >
                                            {reverseCta}
                                        </Button>
                                    ) : (
                                        <TempNavInactive
                                            tooltipBody={t(
                                                'policy.history.reverseRecreateSidesheet.transactions.permissionDeniedTooltip',
                                                {
                                                    carrier:
                                                        getCarrierNameByClientId(
                                                            policy.carrierId as string
                                                        ),
                                                }
                                            )}
                                            navElementClassName="!px-2"
                                        >
                                            <Button
                                                disabled
                                                mode="link"
                                                size="small"
                                            >
                                                {reverseCta}
                                            </Button>
                                        </TempNavInactive>
                                    )}
                                </div>
                            )}
                            {cancelCta && (
                                <div className="mb-6">
                                    {isUserPermissionedToDoTransaction ? (
                                        <Button
                                            onClick={() => {
                                                setView(SidesheetViews.cancel);
                                            }}
                                            mode="link"
                                            size="small"
                                            className={clsx(
                                                '!justify-start !p-0',
                                                transactionType ===
                                                    TransactionTypeEnum.FULL_SURRENDER
                                                    ? 'mb-6'
                                                    : ''
                                            )}
                                        >
                                            {cancelCta}
                                        </Button>
                                    ) : (
                                        <TempNavInactive
                                            tooltipBody={t(
                                                'policy.history.reverseRecreateSidesheet.transactions.permissionDeniedTooltip',
                                                {
                                                    carrier:
                                                        getCarrierNameByClientId(
                                                            policy.carrierId as string
                                                        ),
                                                }
                                            )}
                                            navElementClassName="!px-2"
                                        >
                                            <Button
                                                disabled
                                                mode="link"
                                                size="small"
                                            >
                                                {cancelCta}
                                            </Button>
                                        </TempNavInactive>
                                    )}
                                </div>
                            )}

                            {status === TransactionStatus.CANCELED && (
                                <ChipStatus
                                    classNames="mb-4"
                                    status={'Canceled' as Statuses}
                                    statusText={
                                        t('status.canceledOn', {
                                            date: convertKebabedDateString(
                                                processDate
                                            ),
                                        }) as string
                                    }
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
