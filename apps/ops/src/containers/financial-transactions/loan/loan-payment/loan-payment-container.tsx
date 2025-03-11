import { useTranslation } from 'next-i18next';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import PaymentStep, { PaymentStepSetState } from '@deps/components/workflows/payment-step/payment-step';
import PayorStep, { PayorStepSetState } from '@deps/components/workflows/payor-step/payor-step';
import StartStep, { StartStepSetState } from '@deps/components/workflows/start-step/start-step';
import { TranslationFiles } from '@deps/config/translations';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import WorkflowContainer from '@deps/containers/workflow-container/workflow-container';
import { useLoanPayment } from '@deps/contexts/transactions/LoanPaymentContext';
import { Processes } from '@deps/models/case/case';
import { Policy } from '@deps/models/policy/sor-policy';
import { validateLoanPayment } from '@deps/queries/api/bpm';

import Amount from './amount/amount';
import Confirm from './confirm/confirm';
import { buildLoanPaymentRequestBody } from './loan-payment.helpers';
import Summary from './summary/summary';

export type LoanPaymentContainerProps = {
    policy: Policy;
};

const LoanPaymentContainer = ({ policy }: LoanPaymentContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: 'loanPayment' });
    const { loanPayment, setLoanPayment } = useLoanPayment();

    const startLabel = t('start.label');
    const amountLabel = t('amount.label');
    const payorLabel = t('payor.label');
    const paymentLabel = t('payment.label');
    const summaryLabel = t('summary.label');
    const confirmLabel = t('confirm.label');

    const validateCall = () => {
        const query = buildLoanPaymentRequestBody(loanPayment);

        return validateLoanPayment(policy.product?.planCode, policy.policyNumber, query);
    };

    const steps: Step[] = [
        {
            ariaLabel: startLabel,
            component: (
                <StartStep
                    parentPage={ParentPage.Loans}
                    policy={policy}
                    processType={Processes.SSW}
                    setState={setLoanPayment as StartStepSetState}
                    state={loanPayment}
                    title={t('start.title') as string}
                    subtitle={t('start.subtitle') as string}
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
                <PayorStep parentPage={ParentPage.Loans} policy={policy} setState={setLoanPayment as PayorStepSetState} state={loanPayment} />
            ),
            screenReaderLabel: payorLabel,
            index: 2,
            text: payorLabel,
        },
        {
            ariaLabel: paymentLabel,
            component: (
                <PaymentStep
                    parentPage={ParentPage.Loans}
                    policy={policy}
                    setState={setLoanPayment as PaymentStepSetState}
                    state={loanPayment}
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

export default LoanPaymentContainer;
