import { useTranslation } from 'next-i18next';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import PayeesStep, { PayeesStepSetState } from '@deps/components/workflows/payees-step/payees-step';
import PaymentStep, { PaymentStepSetState } from '@deps/components/workflows/payment-step/payment-step';
import StartStep, { StartStepSetState } from '@deps/components/workflows/start-step/start-step';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import WorkflowContainer from '@deps/containers/workflow-container/workflow-container';
import { useNewLoan } from '@deps/contexts/transactions/NewLoanContext';
import { Processes } from '@deps/models/case/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { validateNewLoan } from '@deps/queries/api/bpm';

import Amount from './amount/amount';
import Confirm from './confirm/confirm';
import { buildNewLoanRequestBody } from './new-loan.helpers';
import Summary from './summary/summary';

export type NewLoanContainerProps = {
    policy: Policy;
};

const NewLoanContainer = ({ policy }: NewLoanContainerProps) => {
    const { t } = useTranslation();
    const { newLoan, setNewLoan } = useNewLoan();

    const startLabel = t('newLoan.start.label');
    const amountLabel = t('newLoan.amount.label');
    const payorLabel = t('newLoan.payor.label');
    const paymentLabel = t('newLoan.payment.label');
    const summaryLabel = t('newLoan.summary.label');
    const confirmLabel = t('newLoan.confirm.label');

    const validateCall = () => {
        const query = buildNewLoanRequestBody(newLoan);

        return validateNewLoan(policy.product?.planCode, policy.policyNumber, query);
    };

    const steps: Step[] = [
        {
            ariaLabel: startLabel,
            component: (
                <StartStep
                    parentPage={ParentPage.NewLoan}
                    policy={policy}
                    processType={Processes.Withdrawal}
                    setState={setNewLoan as StartStepSetState}
                    state={newLoan}
                    title={t('newLoan.start.title') as string}
                    subtitle={t('newLoan.start.subtitle') as string}
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
            ariaLabel: payorLabel,
            component: (
                <PayeesStep
                    parentPage={ParentPage.NewLoan}
                    policy={policy}
                    setState={setNewLoan as PayeesStepSetState}
                    state={newLoan}
                />
            ),
            screenReaderLabel: payorLabel,
            index: 2,
            text: payorLabel,
        },
        {
            ariaLabel: paymentLabel,
            component: (
                <PaymentStep
                    parentPage={ParentPage.NewLoan}
                    policy={policy}
                    setState={setNewLoan as PaymentStepSetState}
                    state={newLoan}
                    subtitle={t('newLoan.payment.title') as string}
                    validateTransaction={validateCall}
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

export default NewLoanContainer;
