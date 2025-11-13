import { Policy, TransactionType } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';

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
import { TranslationFiles } from '@deps/config/translations';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import WorkflowContainer from '@deps/containers/workflow-container/workflow-container';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useNewLoan } from '@deps/contexts/transactions/NewLoanContext';
import { Processes } from '@deps/models/case/case';
import { validateNewLoan } from '@deps/queries/api/bpm';
import { TransactionStep } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import Amount from './amount/amount';
import Confirm from './confirm/confirm';
import { buildNewLoanRequestBody } from './new-loan.helpers';
import Summary from './summary/summary';
import { getProcessSubTypes } from '../../autopay/autopay.helpers';

type NewLoanContainerProps = {
    policy: Policy;
};

const NewLoanContainer = ({ policy }: NewLoanContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, {
        keyPrefix: 'newLoan',
    });
    const { newLoan, setNewLoan } = useNewLoan();
    const { featureFlags } = useOptimizely();

    const wireCheckPaymentsEnabled =
        featureFlags[FEATURE_FLAGS.NEW_LOAN_WIRE_CHECK_PAYMENTS];
    const startLabel = t('start.label');
    const amountLabel = t('amount.label');
    const payeeLabel = t('payee.label');
    const paymentLabel = t('payment.label');
    const summaryLabel = t('summary.label');
    const confirmLabel = t('confirm.label');

    const validateCall = () => {
        const query = buildNewLoanRequestBody(
            newLoan,
            wireCheckPaymentsEnabled
        );

        return validateNewLoan(
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
                    processType={Processes.Loan}
                    setState={setNewLoan as StartStepSetState}
                    state={newLoan}
                    title={t('start.title') as string}
                    subtitle={t('start.subtitle') as string}
                    trackEventProps={{
                        type: TransactionType.NEW_LOAN,
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
            component: (
                <PayeesStep
                    parentPage={ParentPage.Loans}
                    policy={policy}
                    setState={setNewLoan as PayeesStepSetState}
                    state={newLoan}
                    trackEventProps={{
                        type: TransactionType.NEW_LOAN,
                        step: TransactionStep.Payees,
                    }}
                />
            ),
            screenReaderLabel: payeeLabel,
            index: 2,
            text: payeeLabel,
        },
        {
            component: wireCheckPaymentsEnabled ? (
                <PaymentStepMoneyOut
                    parentPage={ParentPage.Loans}
                    policy={policy}
                    setState={setNewLoan as PaymentStepSetState}
                    state={newLoan}
                    validateTransaction={validateCall}
                />
            ) : (
                <PaymentStep
                    parentPage={ParentPage.Loans}
                    policy={policy}
                    setState={setNewLoan as PaymentStepSetState}
                    state={newLoan}
                    validateTransaction={validateCall}
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

export default NewLoanContainer;
