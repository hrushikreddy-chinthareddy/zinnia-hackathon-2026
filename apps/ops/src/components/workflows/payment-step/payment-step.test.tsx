import { fireEvent, render, screen } from '@testing-library/react';
import { Policy } from '@zinnia/api-types/types/sor';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';

import PaymentStep from './payment-step';
import { PaymentState } from './types';

jest.mock('@deps/contexts/WorkflowContainerContext', () => ({
    useWorkflow: jest.fn().mockReturnValue({
        goToNext: jest.fn(),
    }),
}));

const mockPolicy = {
    parties: [
        {
            partyId: 'Party_PI_1',
            bankDetails: [
                {
                    accountType: 'CHECKING',
                    accountNumber: '123456',
                    bankId: 'Bank_1',
                    branchName: 'Branch A',
                    startDate: '2024-01-01',
                },
            ],
        },
    ],
    policyNumber: '123456',
} as Policy;

let state: PaymentState = {
    paymentAccountNumber: '',
    paymentBranchName: '',
    paymentBankId: '',
    payorPartyId: 'Party_PI_1',
    paymentAmount: '',
    effectiveDate: '',
};
const setState = jest.fn().mockImplementation((callback) => {
    state = callback(state);
});

describe('PaymentStep component', () => {
    it.skip('renders PaymentStep correctly', () => {
        render(
            <PaymentStep
                parentPage={ParentPage.Premiums}
                policy={mockPolicy}
                setState={setState}
                state={state}
            />
        );

        expect(
            screen.getByText('workflows.paymentStep.heading')
        ).toBeInTheDocument();
        expect(
            screen.getByText('workflows.paymentStep.label')
        ).toBeInTheDocument();

        expect(screen.getByText('BRANCH A')).toBeInTheDocument();
        expect(
            screen.getByText('Bankaccounttype.checking account')
        ).toBeInTheDocument();
        expect(
            screen.getByText('People.card.bankoptions.accountnumber')
        ).toBeInTheDocument();
        expect(
            screen.getByText('people.card.bankOptions.endingIn3456')
        ).toBeInTheDocument();

        expect(
            screen.getByText('workflows.paymentStep.add')
        ).toBeInTheDocument();

        expect(screen.getByText('general.continue')).toBeInTheDocument();
        expect(
            screen.getByText('general.leaveTransaction')
        ).toBeInTheDocument();
    });

    it.skip('updates state when a PaymentStep is loaded', () => {
        render(
            <PaymentStep
                parentPage={ParentPage.Premiums}
                policy={mockPolicy}
                setState={setState}
                state={state}
            />
        );

        expect(state).toEqual({
            currentStepIndex: 2,
            paymentAccountNumber: '123456',
            paymentBranchName: 'Branch A',
            paymentBankId: 'Bank_1',
            payorPartyId: 'Party_PI_1',
        });
    });

    it.skip('does not show form error when continue is clicked after selecting a payment', () => {
        const { rerender } = render(
            <PaymentStep
                parentPage={ParentPage.Premiums}
                policy={mockPolicy}
                setState={setState}
                state={state}
            />
        );

        // rerender to reflect state updates from useeffect
        rerender(
            <PaymentStep
                parentPage={ParentPage.Premiums}
                policy={mockPolicy}
                setState={setState}
                state={state}
            />
        );

        fireEvent.click(screen.getByText('general.continue'));

        expect(
            screen.queryByText('workflows.paymentStep.error')
        ).not.toBeInTheDocument();
    });

    it.skip('shows form error when continue is clicked without selecting a payment', async () => {
        const { rerender } = render(
            <PaymentStep
                parentPage={ParentPage.Premiums}
                policy={mockPolicy}
                setState={setState}
                state={state}
            />
        );

        // rerender to reflect state updates from useeffect
        rerender(
            <PaymentStep
                parentPage={ParentPage.Premiums}
                policy={mockPolicy}
                setState={setState}
                state={state}
            />
        );

        fireEvent.click(screen.getByText('BRANCH A'));

        // rerender to reflect state updates from click
        rerender(
            <PaymentStep
                parentPage={ParentPage.Premiums}
                policy={mockPolicy}
                setState={setState}
                state={state}
            />
        );

        fireEvent.click(screen.getByText('general.continue'));

        expect(
            screen.getByText('workflows.paymentStep.error')
        ).toBeInTheDocument();
    });
});
