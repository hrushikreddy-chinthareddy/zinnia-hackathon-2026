import dayjs from 'dayjs';
import { useTranslation } from 'next-i18next';
import { v4 as uuidV4 } from 'uuid';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import PaymentStep, { PaymentStepSetState } from '@deps/components/workflows/payment-step/payment-step';
import PayorStep, { PayorStepSetState } from '@deps/components/workflows/payor-step/payor-step';
import StartStep, { StartStepSetState } from '@deps/components/workflows/start-step/start-step';
import { Step } from '@deps/containers/progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';
import Amount from '@deps/containers/update-premium-autopay-container/amount/amount';
import Confirm from '@deps/containers/update-premium-autopay-container/confirm/confirm';
import Summary from '@deps/containers/update-premium-autopay-container/summary/summary';
import WorkflowContainer from '@deps/containers/workflow-container/workflow-container';
import { ACH, useUpdatePremiumAutopay } from '@deps/contexts/UpdatePremiumAutopayContext';
import { Processes } from '@deps/models/case/case';
import { AmountType, ArrangementType, Policy, Reason } from '@deps/models/policy/sor-policy';
import { validateSystematicProgramUpdate } from '@deps/queries/api/bpm';
import { NUMERIC_DATE_FORMAT, ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

export type UpdatePremiumAutopayContainerProps = {
    policy: Policy;
};

const UpdatePremiumAutopayContainer = ({ policy }: UpdatePremiumAutopayContainerProps) => {
    const { t } = useTranslation();
    const { autopay, setAutopay } = useUpdatePremiumAutopay();

    const startLabel = t('autopay.start.label');
    const amountLabel = t('autopay.amount.label');
    const payorLabel = t('autopay.payor.label');
    const paymentLabel = t('autopay.payment.label');
    const summaryLabel = t('autopay.summary.label');
    const confirmLabel = t('autopay.confirm.label');

    const validateCall = () => {
        const effectiveDateFormatted = dayjs(autopay.effectiveDate, NUMERIC_DATE_FORMAT).format(ZAHARA_API_DATE_FORMAT);
        const systematicProgram = policy.systematicPrograms?.find(sp => sp.reason === Reason.PREMIUM);
        const arrangementId = systematicProgram?.arrangementId || '';

        return validateSystematicProgramUpdate(policy.product?.planCode, policy.policyNumber || '', arrangementId, {
            caseId: autopay.caseId || '',
            correlationId: uuidV4(),
            effectiveDate: dayjs(new Date()).format(ZAHARA_API_DATE_FORMAT),
            reverseInitiator: autopay.reverseInitiator,
            systematicProgram: {
                amount: Number(autopay.paymentAmount),
                arrangementType: ArrangementType.PAYMENT,
                paymentForm: ACH,
                amountType: AmountType.AMOUNT,
                frequency: autopay.frequency,
                startDate: effectiveDateFormatted,
                endDate: systematicProgram?.endDate,
                previousProgramDate: systematicProgram?.previousProgramDate,
                nextProgramDate: effectiveDateFormatted,
                party: {
                    bankId: autopay.paymentBankId,
                    partyId: autopay.payorPartyId,
                },
            },
        });
    };

    const steps: Step[] = [
        {
            ariaLabel: startLabel,
            component: (
                <StartStep
                    parentPage={ParentPage.Premiums}
                    policy={policy}
                    processType={Processes.SSW}
                    setState={setAutopay as StartStepSetState}
                    state={autopay}
                    title={t('autopay.start.title')}
                    subtitle={t('autopay.start.subtitle')}
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
                <PayorStep parentPage={ParentPage.Premiums} policy={policy} setState={setAutopay as PayorStepSetState} state={autopay} />
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
                    setState={setAutopay as unknown as PaymentStepSetState}
                    state={autopay}
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

export default UpdatePremiumAutopayContainer;
