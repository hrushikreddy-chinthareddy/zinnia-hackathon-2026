import { useTranslation } from 'next-i18next';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import EffectiveDate from '@deps/components/workflows/effective-date-step/effective-date-step';
import PayeesStep, { PayeesStepSetState } from '@deps/components/workflows/payees-step/payees-step';
import PaymentStep, { PaymentStepSetState } from '@deps/components/workflows/payment-step/payment-step';
import StartStep, { StartStepSetState } from '@deps/components/workflows/start-step/start-step';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import WorkflowContainer from '@deps/containers/workflow-container/workflow-container';
import { useWithdrawal } from '@deps/contexts/transactions/WithdrawalContext';
import { Processes } from '@deps/models/case/case';
import { Policy } from '@deps/models/policy/sor-policy';

import Confirm from './confirm/confirm';
import Summary from './summary/summary';

const FreeLookCancelContainer = ({ policy }: { policy: Policy }) => {
    const { t } = useTranslation();
    const { withdrawal, setWithdrawal } = useWithdrawal();

    const startLabel = t('cancelFreeLook.start.label');
    const dateLabel = t('cancelFreeLook.date.label');
    const payeeLabel = t('withdrawals.payee.label');
    const paymentLabel = t('withdrawals.payment.label');
    const summaryLabel = t('withdrawals.summary.label');
    const confirmLabel = t('withdrawals.confirm.label');

    const steps: Step[] = [
        {
            ariaLabel: startLabel,
            component: (
                <StartStep
                    parentPage={ParentPage.Withdrawals}
                    policy={policy}
                    processType={Processes.NewBusiness}
                    setState={setWithdrawal as StartStepSetState}
                    state={withdrawal}
                    title={t('cancelFreeLook.start.title') as string}
                />
            ),
            screenReaderLabel: startLabel,
            index: 0,
            text: startLabel,
        },
        {
            ariaLabel: dateLabel,
            component: (
                <EffectiveDate
                    effectiveDate={withdrawal.effectiveDate}
                    policy={policy}
                    setEffectiveDate={date => setWithdrawal({ ...withdrawal, effectiveDate: date })}
                />
            ),
            screenReaderLabel: dateLabel,
            index: 1,
            text: dateLabel,
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
            index: 2,
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
                />
            ),
            screenReaderLabel: paymentLabel,
            index: 3,
            text: paymentLabel,
        },
        {
            ariaLabel: summaryLabel,
            component: <Summary policy={policy} />,
            screenReaderLabel: summaryLabel,
            index: 4,
            text: summaryLabel,
        },
        {
            ariaLabel: confirmLabel,
            component: <Confirm policy={policy} />,
            screenReaderLabel: confirmLabel,
            index: 5,
            text: confirmLabel,
        },
    ];

    return <WorkflowContainer policy={policy} steps={steps} />;
};

export default FreeLookCancelContainer;
