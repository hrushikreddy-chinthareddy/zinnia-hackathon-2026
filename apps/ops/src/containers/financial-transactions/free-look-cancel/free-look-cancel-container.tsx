import router from 'next/router';
import { useTranslation } from 'next-i18next';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import EffectiveDate from '@deps/components/workflows/effective-date-step/effective-date-step';
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
import { validateFreeLookCancellation } from '@deps/queries/api/bpm';
import { TransactionStep } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import { Policy, TransactionType } from '@zinnia/api-types/types/sor';

import Confirm from './confirm/confirm';
import { buildFreeLookCancelRequestBody } from './free-look-cancel.helpers';
import Summary from './summary/summary';

const FreeLookCancelContainer = ({ policy }: { policy: Policy }) => {
    const { t } = useTranslation();
    const { withdrawal, setWithdrawal } = useWithdrawal();
    const { featureFlags } = useOptimizely();

    const wireCheckPaymentsEnabled =
        featureFlags[FEATURE_FLAGS.WITHDRAWAL_WIRE_CHECK_PAYMENTS];

    const startLabel = t('cancelFreeLook.start.label');
    const dateLabel = t('cancelFreeLook.date.label');
    const payeeLabel = t('withdrawals.payee.label');
    const paymentLabel = t('withdrawals.payment.label');
    const summaryLabel = t('withdrawals.summary.label');
    const confirmLabel = t('withdrawals.confirm.label');

    const validateCall = async () => {
        const requestBody = buildFreeLookCancelRequestBody(
            withdrawal,
            wireCheckPaymentsEnabled
        );

        return validateFreeLookCancellation(
            policy.product?.planCode,
            policy.policyNumber,
            requestBody
        );
    };
    const correlationIdFromRoute =
        typeof router?.query?.correlationId === 'string'
            ? router?.query?.correlationId
            : undefined;

    const steps: Step[] = [
        {
            component: (
                <StartStep
                    parentPage={ParentPage.Withdrawals}
                    policy={policy}
                    processType={Processes.Withdrawal}
                    setState={setWithdrawal as StartStepSetState}
                    state={withdrawal}
                    title={t('cancelFreeLook.start.title') as string}
                    trackEventProps={{
                        type: TransactionType.FREE_LOOK_CANCELLATION,
                        step: TransactionStep.Start,
                    }}
                    processSubType={[Processes.FreeLookCancellation]}
                    correlationId={correlationIdFromRoute}
                />
            ),
            screenReaderLabel: startLabel,
            index: 0,
            text: startLabel,
        },
        {
            component: (
                <EffectiveDate
                    effectiveDate={withdrawal.effectiveDate}
                    policy={policy}
                    setEffectiveDate={(date) =>
                        setWithdrawal({ ...withdrawal, effectiveDate: date })
                    }
                />
            ),
            screenReaderLabel: dateLabel,
            index: 1,
            text: dateLabel,
        },
        {
            component: (
                <PayeesStep
                    parentPage={ParentPage.Withdrawals}
                    policy={policy as Policy}
                    setState={setWithdrawal as PayeesStepSetState}
                    state={withdrawal}
                    trackEventProps={{
                        type: TransactionType.FREE_LOOK_CANCELLATION,
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
                    parentPage={ParentPage.Withdrawals}
                    policy={policy}
                    setState={setWithdrawal as PaymentStepSetState}
                    state={withdrawal}
                    validateTransaction={validateCall}
                    transactionName={TransactionName.Freelook}
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

export default FreeLookCancelContainer;
