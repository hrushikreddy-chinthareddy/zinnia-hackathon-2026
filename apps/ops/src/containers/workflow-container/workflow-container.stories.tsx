import { Meta } from '@storybook/react';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import { NewPremiumProvider, usePremium } from '@deps/contexts/transactions/NewPremiumContext';
import { mockPolicy } from '@deps/jest/data/mockPolicy';
import { Processes } from '@deps/models/case/case';

import WorkflowContainer from './workflow-container';
import PaymentStep, { PaymentStepSetState } from '../../components/workflows/payment-step/payment-step';
import PayorStep, { PayorStepSetState } from '../../components/workflows/payor-step/payor-step';
import StartStep, { StartStepSetState } from '../../components/workflows/start-step/start-step';
import Confirm from '../financial-transactions/premium/new-premium/confirm/confirm';
import Summary from '../financial-transactions/premium/new-premium/summary/summary';
import { Step } from '../progress-bar-steps/progress-bar-steps-item/progress-bar-steps-item';

export default {
    title: 'Containers/WorkflowContainer',
    component: WorkflowContainer,
} as Meta<typeof WorkflowContainer>;

// eslint-disable-next-line react-hooks/rules-of-hooks
const { premium, setPremium } = usePremium();

// New Premium as Example
// TODO: add component steps in workflow to update this entirely if we want to keep a story for this container
const premiumSteps: Step[] = [
    {
        ariaLabel: 'Start',
        component: (
            <StartStep
                parentPage={ParentPage.Premiums}
                state={premium}
                policy={mockPolicy}
                processType={Processes.OneTimePremium}
                setState={setPremium as StartStepSetState}
                title={'title'}
                subtitle={'subtitle'}
            />
        ),
        screenReaderLabel: 'Start',
        index: 0,
        text: 'Start',
    },
    {
        ariaLabel: 'Payor',
        component: (
            <PayorStep policy={mockPolicy} parentPage={ParentPage.Premiums} state={premium} setState={setPremium as PayorStepSetState} />
        ),
        screenReaderLabel: 'Payor',
        index: 1,
        text: 'Payor',
    },
    {
        ariaLabel: 'Payment',
        component: (
            <PaymentStep
                parentPage={ParentPage.Premiums}
                policy={mockPolicy}
                setState={setPremium as unknown as PaymentStepSetState}
                state={premium}
            />
        ),
        screenReaderLabel: 'Payment',
        index: 2,
        text: 'Payment',
    },
    {
        ariaLabel: 'Summary',
        component: <Summary policy={mockPolicy} />,
        screenReaderLabel: 'Summary',
        index: 3,
        text: 'Summary',
    },
    {
        ariaLabel: 'Confirm',
        component: <Confirm policy={mockPolicy} />,
        screenReaderLabel: 'Confirm',
        index: 4,
        text: 'Confirm',
    },
];

export const OneTimePremium = () => {
    return (
        <NewPremiumProvider>
            <WorkflowContainer policy={mockPolicy} steps={premiumSteps} />
        </NewPremiumProvider>
    );
};
