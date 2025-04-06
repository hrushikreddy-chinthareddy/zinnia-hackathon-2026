import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { v4 as uuidV4 } from 'uuid';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import PaymentStep, { PaymentStepSetState } from '@deps/components/workflows/payment-step/payment-step';
import PayorStep, { PayorStepSetState } from '@deps/components/workflows/payor-step/payor-step';
import StartStep, { StartStepSetState } from '@deps/components/workflows/start-step/start-step';
import Amount from '@deps/containers/financial-transactions/premium/new-premium/amount/amount';
import Confirm from '@deps/containers/financial-transactions/premium/new-premium/confirm/confirm';
import Summary from '@deps/containers/financial-transactions/premium/new-premium/summary/summary';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import { usePremium } from '@deps/contexts/transactions/NewPremiumContext';
import { Processes } from '@deps/models/case/case';
import { PaymentForm, Policy } from '@deps/models/policy/sor-policy';
import { validateOneTimePremium } from '@deps/queries/api/bpm';
import { NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import WorkflowContainer from '../../../workflow-container/workflow-container';
import { TransactionType } from '@zinnia/api-types/types/sor';
import { TransactionStep } from '@deps/types/segment-analytics';

export type NewPremiumContainerProps = {
    policy: Policy;
};

const NewPremiumContainer = ({ policy }: NewPremiumContainerProps) => {
    const { t } = useTranslation();
    const { premium, setPremium } = usePremium();

    const startLabel = t('newPremium.start.label');
    const amountLabel = t('newPremium.amount.label');
    const payorLabel = t('newPremium.payor.label');
    const paymentLabel = t('newPremium.payment.label');
    const summaryLabel = t('newPremium.summary.label');
    const confirmLabel = t('newPremium.confirm.label');

    const validateCall = () =>
        validateOneTimePremium(policy.product?.planCode, policy.policyNumber, {
            caseId: premium.caseId || '',
            correlationId: uuidV4(),
            effectiveDate: dayjs(premium.effectiveDate, NUMERIC_DATE_FORMAT).format(ZAHARA_API_DATE_FORMAT),
            reverseInitiator: premium.reverseInitiator,
            transactionAmounts: {
                requestedAmount: Number(premium.paymentAmount),
            },
            payor: {
                bankId: premium.paymentBankId,
                partyId: premium.payorPartyId,
                paymentForm: PaymentForm.ACH,
            },
        });

    const steps: Step[] = [
        {
            ariaLabel: startLabel,
            component: (
                <StartStep
                    parentPage={ParentPage.Premiums}
                    policy={policy}
                    processType={Processes.OneTimePremium}
                    setState={setPremium as StartStepSetState}
                    state={premium}
                    title={t('newPremium.start.title') as string}
                    subtitle={t('newPremium.start.subtitle') as string}
                    trackEventProps={{ type: TransactionType.PAYMENT_ONE_TIME_PREMIUM, step: TransactionStep.Start }}
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
                <PayorStep
                    parentPage={ParentPage.Premiums}
                    policy={policy}
                    setState={setPremium as PayorStepSetState}
                    state={premium}
                    trackEventProps={{ type: TransactionType.PAYMENT_ONE_TIME_PREMIUM, step: TransactionStep.Payor }}
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
                    parentPage={ParentPage.Premiums}
                    policy={policy}
                    setState={setPremium as unknown as PaymentStepSetState}
                    state={premium}
                    validateTransaction={validateCall}
                    trackEventProps={{ type: TransactionType.PAYMENT_ONE_TIME_PREMIUM, step: TransactionStep.Payment }}
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

export default NewPremiumContainer;
