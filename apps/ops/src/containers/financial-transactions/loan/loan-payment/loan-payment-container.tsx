import { useTranslation } from 'next-i18next';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import PaymentStep from '@deps/components/workflows/payment-step/payment-step';
import { PaymentStepSetState } from '@deps/components/workflows/payment-step/types';
import PayorStep, {
    PayorStepSetState,
} from '@deps/components/workflows/payor-step/payor-step';
import StartStep, {
    StartStepSetState,
} from '@deps/components/workflows/start-step/start-step';
import { TranslationFiles } from '@deps/config/translations';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import WorkflowContainer from '@deps/containers/workflow-container/workflow-container';
import { useLoanPayment } from '@deps/contexts/transactions/LoanPaymentContext';
import { Processes } from '@deps/models/case/case';
import { validateLoanPayment } from '@deps/queries/api/bpm';
import { TransactionStep } from '@deps/types/segment-analytics';
import { Policy, SchemaEnum as TransactionTypeSchemaEnum } from '@zinnia/api-types/types/sor';

import Amount from './amount/amount';
import Confirm from './confirm/confirm';
import { buildLoanPaymentRequestBody } from './loan-payment.helpers';
import Summary from './summary/summary';
import { getProcessSubTypes } from '../../autopay/autopay.helpers';

export type LoanPaymentContainerProps = {
    policy: Policy;
};

const LoanPaymentContainer = ({ policy }: LoanPaymentContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'loanPayment',
    });
    const { loanPayment, setLoanPayment } = useLoanPayment();

    const startLabel = t('start.label');
    const amountLabel = t('amount.label');
    const payorLabel = t('payor.label');
    const paymentLabel = t('payment.label');
    const summaryLabel = t('summary.label');
    const confirmLabel = t('confirm.label');

    const validateCall = () => {
        const query = buildLoanPaymentRequestBody(loanPayment);

        return validateLoanPayment(
            policy.product?.planCode,
            policy.policyNumber,
            query
        );
    };

    const steps: Step[] = [
        {
            component: (
                <StartStep
                    parentPage={ParentPage.Loans}
                    policy={policy}
                    processType={Processes.SSW}
                    setState={setLoanPayment as StartStepSetState}
                    state={loanPayment}
                    title={t('start.title') as string}
                    subtitle={t('start.subtitle') as string}
                    trackEventProps={{
                        type: TransactionTypeSchemaEnum.PAYMENT_LOAN_REPAYMENT_ONE_TIME,
                        step: TransactionStep.Start,
                    }}
                    processSubType={getProcessSubTypes(ParentPage.Loans)}
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
            component: (
                <PayorStep
                    parentPage={ParentPage.Loans}
                    policy={policy}
                    setState={setLoanPayment as PayorStepSetState}
                    state={loanPayment}
                    trackEventProps={{
                        type: TransactionTypeSchemaEnum.PAYMENT_LOAN_REPAYMENT_ONE_TIME,
                        step: TransactionStep.Payor,
                    }}
                />
            ),
            screenReaderLabel: payorLabel,
            index: 2,
            text: payorLabel,
        },
        {
            component: (
                <PaymentStep
                    parentPage={ParentPage.Loans}
                    policy={policy}
                    setState={setLoanPayment as PaymentStepSetState}
                    state={loanPayment}
                    validateTransaction={validateCall}
                    trackEventProps={{
                        type: TransactionTypeSchemaEnum.PAYMENT_LOAN_REPAYMENT_ONE_TIME,
                        step: TransactionStep.Payment,
                    }}
                />
            ),
            screenReaderLabel: paymentLabel,
            index: 3,
            text: paymentLabel,
        },
        {
            component: <Summary policy={policy} />,
            screenReaderLabel: summaryLabel,
            index: 4,
            text: summaryLabel,
        },
        {
            component: <Confirm policy={policy} />,
            screenReaderLabel: confirmLabel,
            index: 5,
            text: confirmLabel,
        },
    ];

    return <WorkflowContainer policy={policy} steps={steps} />;
};

export default LoanPaymentContainer;
