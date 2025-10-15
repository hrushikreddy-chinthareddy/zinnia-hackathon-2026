import {
    FullSurrenderRequest,
    PartialWithdrawalOneTimeRequest,
} from '@zinnia/api-types/types/bpm';
import { Policy, TransactionType } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useMemo } from 'react';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import PayeesStep, {
    PayeesStepSetState,
} from '@deps/components/workflows/payees-step/payees-step';
import PaymentStep from '@deps/components/workflows/payment-step/payment-step';
import PaymentStepMoneyOut from '@deps/components/workflows/payment-step/payment-step-money-out';
import { PaymentStepSetState } from '@deps/components/workflows/payment-step/types';
import StartStep, {
    StartStepSetState,
} from '@deps/components/workflows/start-step/start-step';
import { TransactionName } from '@deps/constants/policy';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import WorkflowContainer from '@deps/containers/workflow-container/workflow-container';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useWithdrawal } from '@deps/contexts/transactions/WithdrawalContext';
import { Processes } from '@deps/models/case/case';
import {
    validateFullSurrenderWithdrawal,
    validatePartialWithdrawalOneTime,
} from '@deps/queries/api/bpm';
import { TransactionStep } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import Amount from './amount/amount';
import { WithdrawalType } from './amount/types';
import Confirm from './confirm/confirm';
import Summary from './summary/summary';
import Taxes from './taxes/taxes';
import { WithdrawalContainerProps } from './types';
import { buildWithdrawalsRequestBody } from './withdrawals.helpers';

const WithdrawalContainer = ({ policy }: WithdrawalContainerProps) => {
    const { t } = useTranslation();
    const { withdrawal, setWithdrawal } = useWithdrawal();
    const { featureFlags } = useOptimizely();

    const wireCheckPaymentsEnabled =
        featureFlags[FEATURE_FLAGS.WITHDRAWAL_WIRE_CHECK_PAYMENTS];

    const startLabel = t('withdrawals.start.label');
    const amountLabel = t('withdrawals.amount.label');
    const taxesLabel = t('withdrawals.taxes.label');
    const payeeLabel = t('withdrawals.payee.label');
    const paymentLabel = t('withdrawals.payment.label');
    const summaryLabel = t('withdrawals.summary.label');
    const confirmLabel = t('withdrawals.confirm.label');

    const transactionType = useMemo(() => {
        return withdrawal.type === WithdrawalType.Surrender
            ? TransactionType.FULL_SURRENDER
            : TransactionType.PARTIAL_WITHDRAWAL_ONE_TIME;
    }, [withdrawal.type]);

    const validateCall = () => {
        const query = buildWithdrawalsRequestBody(
            withdrawal,
            wireCheckPaymentsEnabled
        );

        return withdrawal.type === WithdrawalType.Surrender
            ? validateFullSurrenderWithdrawal(
                  policy.product?.planCode,
                  policy.policyNumber,
                  query as FullSurrenderRequest
              )
            : validatePartialWithdrawalOneTime(
                  policy.product?.planCode,
                  policy.policyNumber,
                  query as PartialWithdrawalOneTimeRequest
              );
    };

    const steps: Step[] = [
        {
            component: (
                <StartStep
                    parentPage={ParentPage.Withdrawals}
                    policy={policy}
                    processType={Processes.Withdrawal}
                    setState={setWithdrawal as StartStepSetState}
                    state={withdrawal}
                    title={t('withdrawals.start.title') as string}
                    subtitle={t('withdrawals.start.subtitle') as string}
                    trackEventProps={{
                        type: transactionType,
                        step: TransactionStep.Start,
                    }}
                />
            ),
            screenReaderLabel: startLabel,
            index: 0,
            text: startLabel,
        },
        {
            component: <Amount policy={policy} />,
            screenReaderLabel: amountLabel,
            index: 1,
            text: amountLabel,
        },
        {
            component: <Taxes policy={policy as Policy} />,
            screenReaderLabel: taxesLabel,
            index: 2,
            text: taxesLabel,
        },
        {
            component: (
                <PayeesStep
                    parentPage={ParentPage.Withdrawals}
                    policy={policy as Policy}
                    setState={setWithdrawal as PayeesStepSetState}
                    state={withdrawal}
                    trackEventProps={{
                        type: transactionType,
                        step: TransactionStep.Payees,
                    }}
                />
            ),
            screenReaderLabel: payeeLabel,
            index: 3,
            text: payeeLabel,
        },
        {
            component: wireCheckPaymentsEnabled ? (
                <PaymentStepMoneyOut
                    parentPage={ParentPage.Withdrawals}
                    policy={policy}
                    setState={setWithdrawal as PaymentStepSetState}
                    state={withdrawal}
                    validateTransaction={validateCall}
                    transactionName={TransactionName.Withdrawal}
                />
            ) : (
                <PaymentStep
                    parentPage={ParentPage.Withdrawals}
                    policy={policy}
                    setState={setWithdrawal as PaymentStepSetState}
                    state={withdrawal}
                    validateTransaction={validateCall}
                />
            ),
            screenReaderLabel: paymentLabel,
            index: 4,
            text: paymentLabel,
        },
        {
            component: <Summary policy={policy as Policy} />,
            screenReaderLabel: summaryLabel,
            index: 5,
            text: summaryLabel,
        },
        {
            component: <Confirm policy={policy as Policy} />,
            screenReaderLabel: confirmLabel,
            index: 6,
            text: confirmLabel,
        },
    ];

    return <WorkflowContainer policy={policy} steps={steps} />;
};

export default WithdrawalContainer;
