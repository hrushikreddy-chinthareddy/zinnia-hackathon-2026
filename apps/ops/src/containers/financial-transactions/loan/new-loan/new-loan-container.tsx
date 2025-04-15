import { TransactionType } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import PayeesStep, { PayeesStepSetState } from '@deps/components/workflows/payees-step/payees-step';
import PaymentStep, { PaymentStepSetState } from '@deps/components/workflows/payment-step/payment-step';
import StartStep, { StartStepSetState } from '@deps/components/workflows/start-step/start-step';
import { TranslationFiles } from '@deps/config/translations';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import WorkflowContainer from '@deps/containers/workflow-container/workflow-container';
import { useNewLoan } from '@deps/contexts/transactions/NewLoanContext';
import { Processes } from '@deps/models/case/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { validateNewLoan } from '@deps/queries/api/bpm';
import { TransactionStep } from '@deps/types/segment-analytics';

import Amount from './amount/amount';
import Confirm from './confirm/confirm';
import { buildNewLoanRequestBody } from './new-loan.helpers';
import Summary from './summary/summary';

export type NewLoanContainerProps = {
    policy: Policy;
};

const NewLoanContainer = ({ policy }: NewLoanContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'newLoan' });
    const { newLoan, setNewLoan } = useNewLoan();

    const startLabel = t('start.label');
    const amountLabel = t('amount.label');
    const payeeLabel = t('payee.label');
    const paymentLabel = t('payment.label');
    const summaryLabel = t('summary.label');
    const confirmLabel = t('confirm.label');

    const validateCall = () => {
        const query = buildNewLoanRequestBody(newLoan);

        return validateNewLoan(policy.product?.planCode, policy.policyNumber, query);
    };

    const steps: Step[] = [
        {
            ariaLabel: startLabel,
            component: (
                <StartStep
                    parentPage={ParentPage.Loans}
                    policy={policy}
                    processType={Processes.Loan}
                    setState={setNewLoan as StartStepSetState}
                    state={newLoan}
                    title={t('start.title') as string}
                    subtitle={t('start.subtitle') as string}
                    trackEventProps={{ type: TransactionType.NEW_LOAN, step: TransactionStep.Start }}
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
            ariaLabel: payeeLabel,
            component: (
                <PayeesStep
                    parentPage={ParentPage.Loans}
                    policy={policy}
                    setState={setNewLoan as PayeesStepSetState}
                    state={newLoan}
                    trackEventProps={{ type: TransactionType.NEW_LOAN, step: TransactionStep.Payees }}
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
                    parentPage={ParentPage.Loans}
                    policy={policy}
                    setState={setNewLoan as PaymentStepSetState}
                    state={newLoan}
                    validateTransaction={validateCall}
                    trackEventProps={{ type: TransactionType.NEW_LOAN, step: TransactionStep.Payment }}
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
