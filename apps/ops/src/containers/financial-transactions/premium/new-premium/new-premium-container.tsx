import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
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
import { CarrierCode, FarmersPlanCodes } from '@deps/constants/policy';
import Amount from '@deps/containers/financial-transactions/premium/new-premium/amount/amount';
import Confirm from '@deps/containers/financial-transactions/premium/new-premium/confirm/confirm';
import Summary from '@deps/containers/financial-transactions/premium/new-premium/summary/summary';
import { checkCustomPolicy } from '@deps/containers/policy-details/policy-details.helpers';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import WorkflowContainer from '@deps/containers/workflow-container/workflow-container';
import { usePremium } from '@deps/contexts/transactions/NewPremiumContext';
import { Processes } from '@deps/models/case/case';
import { validateOneTimePremium } from '@deps/queries/api/bpm';
import { TransactionStep } from '@deps/types/segment-analytics';
import {
    Policy,
    SchemaEnum as TransactionTypeSchemaEnum,
} from '@zinnia/api-types/types/sor';

import { buildNewPremiumRequestBody } from './new-premium.helpers';

export type NewPremiumContainerProps = {
    policy: Policy;
};

dayjs.extend(utc);

const NewPremiumContainer = ({ policy }: NewPremiumContainerProps) => {
    const { t } = useTranslation();
    const { premium, setPremium } = usePremium();

    const startLabel = t('newPremium.start.label');
    const amountLabel = t('newPremium.amount.label');
    const payorLabel = t('newPremium.payor.label');
    const paymentLabel = t('newPremium.payment.label');
    const summaryLabel = t('newPremium.summary.label');
    const confirmLabel = t('newPremium.confirm.label');

    const validateCall = () => {
        const query = buildNewPremiumRequestBody(premium);

        return validateOneTimePremium(
            policy.product?.planCode,
            policy.policyNumber,
            query
        );
    };

    const customFarmerCheck = checkCustomPolicy(
        policy,
        CarrierCode.Farmers,
        FarmersPlanCodes
    );

    const steps: Step[] = [
        {
            component: (
                <StartStep
                    parentPage={ParentPage.Premiums}
                    policy={policy}
                    processType={Processes.OneTimePremium}
                    setState={setPremium as StartStepSetState}
                    state={premium}
                    title={t('newPremium.start.title') as string}
                    subtitle={t('newPremium.start.subtitle') as string}
                    trackEventProps={{
                        type: TransactionTypeSchemaEnum.PAYMENT_ONE_TIME_PREMIUM,
                        step: TransactionStep.Start,
                    }}
                />
            ),
            screenReaderLabel: startLabel,
            index: 0,
            text: startLabel,
        },
        {
            component: (
                <Amount policy={policy} customFarmerCheck={customFarmerCheck} />
            ),
            screenReaderLabel: amountLabel,
            index: 1,
            text: amountLabel,
        },
        {
            component: (
                <PayorStep
                    parentPage={ParentPage.Premiums}
                    policy={policy}
                    setState={setPremium as PayorStepSetState}
                    state={premium}
                    trackEventProps={{
                        type: TransactionTypeSchemaEnum.PAYMENT_ONE_TIME_PREMIUM,
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
                    parentPage={ParentPage.Premiums}
                    policy={policy}
                    setState={setPremium as unknown as PaymentStepSetState}
                    state={premium}
                    validateTransaction={validateCall}
                    trackEventProps={{
                        type: TransactionTypeSchemaEnum.PAYMENT_ONE_TIME_PREMIUM,
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

export default NewPremiumContainer;
