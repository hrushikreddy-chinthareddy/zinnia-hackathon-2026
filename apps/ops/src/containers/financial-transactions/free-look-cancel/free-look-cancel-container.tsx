import router from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMemo, useCallback } from 'react';

import PageLoader, {
    PageLoaderVariant,
} from '@deps/components/page-loader/page-loader';
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
import { useCasesQuery } from '@deps/hooks/useCasesQuery';
import { Processes } from '@deps/models/case/case';
import { validateFreeLookCancellation } from '@deps/queries/api/bpm';
import { TransactionStep } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    Policy,
    SchemaEnum as TransactionTypeSchemaEnum,
} from '@zinnia/api-types/types/sor';

import Confirm from './confirm/confirm';
import { buildFreeLookCancelRequestBody } from './free-look-cancel.helpers';
import Summary from './summary/summary';

const FreeLookCancelContainer = ({ policy }: { policy: Policy }) => {
    const { t } = useTranslation();
    const { withdrawal, setWithdrawal } = useWithdrawal();
    const { featureFlags } = useOptimizely();

    const wireCheckPaymentsEnabled =
        featureFlags[FEATURE_FLAGS.WITHDRAWAL_WIRE_CHECK_PAYMENTS];

    const processSubType = [Processes.FreeLookCancellation];
    const { data: casesResponse, isLoading } = useCasesQuery({
        policyNumber: policy.policyNumber,
        process: [Processes.Withdrawal],
        requestSubType: processSubType,
        enabled: !!policy.policyNumber && !!featureFlags,
    });
    const hasCases =
        Array.isArray(casesResponse?.data) && casesResponse.data.length > 0;

    const startLabel = t('cancelFreeLook.start.label');
    const dateLabel = t('cancelFreeLook.date.label');
    const payeeLabel = t('withdrawals.payee.label');
    const paymentLabel = t('withdrawals.payment.label');
    const summaryLabel = t('withdrawals.summary.label');
    const confirmLabel = t('withdrawals.confirm.label');

    const validateCall = useCallback(async () => {
        const requestBody = buildFreeLookCancelRequestBody(
            withdrawal,
            wireCheckPaymentsEnabled
        );

        return validateFreeLookCancellation(
            policy.product?.planCode,
            policy.policyNumber,
            requestBody
        );
    }, [
        withdrawal,
        wireCheckPaymentsEnabled,
        policy.product?.planCode,
        policy.policyNumber,
    ]);
    const correlationIdFromRoute =
        typeof router?.query?.correlationId === 'string'
            ? router?.query?.correlationId
            : undefined;

    const steps: Step[] = useMemo(
        () => [
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
                            type: TransactionTypeSchemaEnum.FREE_LOOK_CANCELLATION,
                            step: TransactionStep.Start,
                        }}
                        processSubType={[Processes.FreeLookCancellation]}
                        correlationId={correlationIdFromRoute}
                    />
                ),
                screenReaderLabel: startLabel,
                index: 0,
                text: startLabel,
                isVisible: () => hasCases,
            },
            {
                component: (
                    <EffectiveDate
                        effectiveDate={withdrawal.effectiveDate}
                        policy={policy}
                        setEffectiveDate={(date) =>
                            setWithdrawal({
                                ...withdrawal,
                                effectiveDate: date,
                            })
                        }
                    />
                ),
                screenReaderLabel: dateLabel,
                index: 1,
                text: dateLabel,
                isVisible: () => true,
            },
            {
                component: (
                    <PayeesStep
                        parentPage={ParentPage.Withdrawals}
                        policy={policy as Policy}
                        setState={setWithdrawal as PayeesStepSetState}
                        state={withdrawal}
                        trackEventProps={{
                            type: TransactionTypeSchemaEnum.FREE_LOOK_CANCELLATION,
                            step: TransactionStep.Payees,
                        }}
                    />
                ),
                screenReaderLabel: payeeLabel,
                index: 2,
                text: payeeLabel,
                isVisible: () => true,
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
                isVisible: () => true,
            },
            {
                component: <Summary policy={policy} />,
                screenReaderLabel: summaryLabel,
                index: 4,
                text: summaryLabel,
                isVisible: () => true,
            },
            {
                component: <Confirm policy={policy} />,
                screenReaderLabel: confirmLabel,
                index: 5,
                text: confirmLabel,
                isVisible: () => true,
            },
        ],
        [
            policy,
            setWithdrawal,
            withdrawal,
            t,
            hasCases,
            startLabel,
            dateLabel,
            payeeLabel,
            paymentLabel,
            summaryLabel,
            confirmLabel,
            wireCheckPaymentsEnabled,
            validateCall,
            correlationIdFromRoute,
        ]
    );

    const filteredSteps: Step[] = useMemo(
        () =>
            steps
                .filter((item: any) => item.isVisible?.())
                .map((item: any, index: number) => ({ ...item, index })),
        [steps]
    );

    return (
        <>
            {isLoading ? (
                <PageLoader variant={PageLoaderVariant.Center} />
            ) : (
                <WorkflowContainer policy={policy} steps={filteredSteps} />
            )}
        </>
    );
};

export default FreeLookCancelContainer;
