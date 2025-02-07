import { useTranslation } from 'next-i18next';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import PayeesStep, { PayeesStepSetState } from '@deps/components/workflows/payees-step/payees-step';
import PaymentStep, { PaymentStepSetState } from '@deps/components/workflows/payment-step/payment-step';
import StartStep, { StartStepSetState } from '@deps/components/workflows/start-step/start-step';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import WorkflowContainer from '@deps/containers/workflow-container/workflow-container';
import { WithdrawalType, useWithdrawal } from '@deps/contexts/transactions/WithdrawalContext';
import { Processes } from '@deps/models/case/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { validateFullSurrenderWithdrawal, validatePartialWithdrawalOneTime } from '@deps/queries/api/bpm';

import Amount from './amount/amount';
import Confirm from './confirm/confirm';
import Summary from './summary/summary';
import Taxes from './taxes/taxes';
import { buildWithdrawalsRequestBody } from './withdrawals.helpers';

export type WithdrawalContainerProps = {
    policy: Policy;
};

const WithdrawalContainer = ({ policy }: WithdrawalContainerProps) => {
    const { t } = useTranslation();
    const { withdrawal, setWithdrawal } = useWithdrawal();

    const startLabel = t('withdrawals.start.label');
    const amountLabel = t('withdrawals.amount.label');
    const taxesLabel = t('withdrawals.taxes.label');
    const payeeLabel = t('withdrawals.payee.label');
    const paymentLabel = t('withdrawals.payment.label');
    const summaryLabel = t('withdrawals.summary.label');
    const confirmLabel = t('withdrawals.confirm.label');

    const validateCall = () => {
        const query = buildWithdrawalsRequestBody(withdrawal);

        return withdrawal.type === WithdrawalType.Surrender
            ? validateFullSurrenderWithdrawal(policy.product?.planCode, policy.policyNumber, query)
            : validatePartialWithdrawalOneTime(policy.product?.planCode, policy.policyNumber, query);
    };

    const steps: Step[] = [
        {
            ariaLabel: startLabel,
            component: (
                <StartStep
                    parentPage={ParentPage.Withdrawals}
                    policy={policy}
                    processType={Processes.Withdrawal}
                    setState={setWithdrawal as StartStepSetState}
                    state={withdrawal}
                    title={t('withdrawals.start.title') as string}
                    subtitle={t('withdrawals.start.subtitle') as string}
                />
            ),
            screenReaderLabel: startLabel,
            index: 0,
            text: startLabel,
        },
        {
            ariaLabel: amountLabel,
            component: <Amount policy={policy} />,
            screenReaderLabel: amountLabel,
            index: 1,
            text: amountLabel,
        },
        {
            ariaLabel: taxesLabel,
            component: <Taxes policy={policy} />,
            screenReaderLabel: taxesLabel,
            index: 2,
            text: taxesLabel,
        },
        {
            ariaLabel: payeeLabel,
            component: (
                <PayeesStep
                    parentPage={ParentPage.Withdrawals}
                    policy={policy}
                    setState={setWithdrawal as PayeesStepSetState}
                    state={withdrawal}
                />
            ),
            screenReaderLabel: payeeLabel,
            index: 3,
            text: payeeLabel,
        },
        {
            ariaLabel: paymentLabel,
            component: (
                <PaymentStep
                    parentPage={ParentPage.Withdrawals}
                    policy={policy}
                    setState={setWithdrawal as PaymentStepSetState}
                    state={withdrawal}
                    subtitle={t('withdrawals.payment.title') as string}
                    validateTransaction={validateCall}
                />
            ),
            screenReaderLabel: paymentLabel,
            index: 4,
            text: paymentLabel,
        },
        {
            ariaLabel: summaryLabel,
            component: <Summary policy={policy} />,
            screenReaderLabel: summaryLabel,
            index: 5,
            text: summaryLabel,
        },
        {
            ariaLabel: confirmLabel,
            component: <Confirm policy={policy} />,
            screenReaderLabel: confirmLabel,
            index: 6,
            text: confirmLabel,
        },
    ];

    return <WorkflowContainer policy={policy} steps={steps} />;
};

export default WithdrawalContainer;
