import { SystematicProgram, TransactionType, Policy as PolicyView } from '@zinnia/api-types/types/sor';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo } from 'react';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import PayeesStep, { PayeesStepSetState } from '@deps/components/workflows/payees-step/payees-step';
import PaymentStep from '@deps/components/workflows/payment-step/payment-step';
import PaymentStepMoneyOut from '@deps/components/workflows/payment-step/payment-step-money-out';
import { PaymentStepSetState } from '@deps/components/workflows/payment-step/types';
import PayorStep, { PayorStepSetState } from '@deps/components/workflows/payor-step/payor-step';
import StartStep, { StartStepSetState } from '@deps/components/workflows/start-step/start-step';
import { TranslationFiles } from '@deps/config/translations';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import WorkflowContainer from '@deps/containers/workflow-container/workflow-container';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useAutopay } from '@deps/contexts/transactions/AutopayContext';
import { Processes } from '@deps/models/case/case';
import { ArrangementType, Policy, Reason, Status } from '@deps/models/policy/sor-policy';
import { validateSystematicProgramUpdate } from '@deps/queries/api/bpm';
import { TransactionStep } from '@deps/types/segment-analytics';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';

import Amount from './amount/amount';
import WithdrawalAmount from './amount/withdrawalAmount';
import { buildSystematicProgramUpdateRequestBody, buildSystematicWithdrawalProgramUpdateRequestBody } from './autopay.helpers';
import Confirm from './confirm/confirm';
import ManageSummary from './summary/manage-summary';
import SetUpSummary from './summary/set-up-summary';

export type AutopayContainerProps = {
    arrangementType?: ArrangementType;
    isSetUp?: boolean;
    parentPage: ParentPage;
    policy: Policy;
    systematicProgramReason?: Reason;
    translationKeyPrefix: string;
};

const AutopayContainer = ({
    arrangementType,
    policy,
    isSetUp = false,
    parentPage,
    systematicProgramReason,
    translationKeyPrefix,
}: AutopayContainerProps) => {
    const { t } = useTranslation(TranslationFiles.COMMON, { keyPrefix: translationKeyPrefix });
    const { autopay, setAutopay } = useAutopay();

    const startLabel = t('start.label');
    const amountLabel = t('amount.label');
    const payorLabel = t('payor.label');
    const paymentLabel = t('payment.label');
    const summaryLabel = t('summary.label');
    const confirmLabel = t('confirm.label');

    const { featureFlags } = useOptimizely();
    const wireCheckPaymentsEnabled = featureFlags[FEATURE_FLAGS.WITHDRAWAL_WIRE_CHECK_PAYMENTS];

    useEffect(() => {
        setAutopay(prevState => ({
            ...prevState,
            arrangementType,
            parentPage,
            systematicProgramReason,
            translationKeyPrefix,
            isSetUp,
        }));
    }, [arrangementType, isSetUp, parentPage, setAutopay, systematicProgramReason, translationKeyPrefix]);

    const validateCall = async () => {
        const systematicProgram = policy.systematicPrograms?.find(
            sp => sp.reason === systematicProgramReason && sp.status === Status.ACTIVE
        );
        const arrangementId = isSetUp ? '' : systematicProgram?.arrangementId || '';
        const query =
            parentPage == ParentPage.Withdrawals
                ? buildSystematicWithdrawalProgramUpdateRequestBody(autopay, systematicProgram as SystematicProgram)
                : buildSystematicProgramUpdateRequestBody(autopay, systematicProgram as SystematicProgram);
        const response = await validateSystematicProgramUpdate(policy.product?.planCode, policy.policyNumber || '', arrangementId, query);

        return response?.data;
    };

    const transactionType = useMemo(() => {
        if (parentPage === ParentPage.Premiums) {
            return TransactionType.SUBSEQUENT_PREMIUM;
        }
        if (parentPage === ParentPage.Withdrawals) {
            if (isSetUp) {
                return TransactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL_SETUP;
            }
            if (arrangementType === ArrangementType.WITHDRAWAL) {
                return TransactionType.SYSTEMATIC_PARTIAL_WITHDRAWAL_UPDATE;
            }
            return TransactionType.SYSTEMATIC_REQUIRED_MINIMUM_DISTRIBUTION_UPDATE;
        }
        return isSetUp ? TransactionType.SYSTEMATIC_LOAN_REPAYMENT_SETUP : TransactionType.SYSTEMATIC_LOAN_REPAYMENT;
    }, [isSetUp, parentPage, arrangementType]);

    autopay.arrangementType === ArrangementType.WITHDRAWAL ? 'Withdrawal' : 'RMD';

    const steps: Step[] = [
        {
            ariaLabel: startLabel,
            component: (
                <StartStep
                    parentPage={parentPage}
                    policy={policy}
                    processType={Processes.SSW}
                    setState={setAutopay as StartStepSetState}
                    state={autopay}
                    subtitle={!isSetUp && parentPage === ParentPage.Premiums ? (t('start.subtitleManage') as string) : undefined}
                    title={
                        isSetUp
                            ? t('start.titleStart')
                            : `${t('start.titleManage')}${
                                  parentPage === ParentPage.Withdrawals
                                      ? ` ${autopay.arrangementType === ArrangementType.WITHDRAWAL ? 'Withdrawal' : 'RMD'}`
                                      : ''
                              }`
                    }
                    trackEventProps={{ type: transactionType, step: TransactionStep.Start }}
                />
            ),
            screenReaderLabel: startLabel,
            index: 0,
            text: startLabel,
        },
        {
            ariaLabel: amountLabel,
            component: parentPage === ParentPage.Withdrawals ? <WithdrawalAmount policy={policy} /> : <Amount policy={policy} />,
            screenReaderLabel: amountLabel,
            index: 1,
            text: amountLabel,
        },
        {
            ariaLabel: payorLabel,
            component:
                parentPage == ParentPage.Withdrawals ? (
                    <PayeesStep
                        parentPage={ParentPage.Withdrawals}
                        policy={policy as PolicyView}
                        setState={setAutopay as PayeesStepSetState}
                        state={autopay as any}
                        trackEventProps={{ type: transactionType, step: TransactionStep.Payees }}
                    />
                ) : (
                    <PayorStep
                        parentPage={parentPage}
                        policy={policy}
                        setState={setAutopay as PayorStepSetState}
                        state={autopay}
                        trackEventProps={{ type: transactionType, step: TransactionStep.Payor }}
                    />
                ),
            screenReaderLabel: payorLabel,
            index: 2,
            text: payorLabel,
        },
        {
            ariaLabel: paymentLabel,
            component:
                parentPage === ParentPage.Withdrawals ? (
                    wireCheckPaymentsEnabled ? (
                        <PaymentStepMoneyOut
                            parentPage={ParentPage.Withdrawals}
                            policy={policy}
                            setState={setAutopay as PaymentStepSetState}
                            state={autopay}
                            validateTransaction={validateCall}
                        />
                    ) : (
                        <PaymentStep
                            parentPage={ParentPage.Withdrawals}
                            policy={policy}
                            setState={setAutopay as PaymentStepSetState}
                            state={autopay}
                            validateTransaction={validateCall}
                        />
                    )
                ) : (
                    <PaymentStep
                        parentPage={parentPage}
                        policy={policy}
                        setState={setAutopay as unknown as PaymentStepSetState}
                        state={autopay}
                        validateTransaction={validateCall}
                        trackEventProps={{ type: transactionType, step: TransactionStep.Payment }}
                    />
                ),
            screenReaderLabel: paymentLabel,
            index: 3,
            text: paymentLabel,
        },
        {
            ariaLabel: summaryLabel,
            component: isSetUp ? <SetUpSummary policy={policy} /> : <ManageSummary policy={policy} />,
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

export default AutopayContainer;
