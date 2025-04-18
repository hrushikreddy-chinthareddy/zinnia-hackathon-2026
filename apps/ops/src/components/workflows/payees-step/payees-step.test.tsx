import { fireEvent, render, screen } from '@testing-library/react';
import { FilingStatus, PartyRole, Policy } from '@zinnia/api-types/types/sor';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';

import PayeesStep from './payees-step';

jest.mock('@deps/contexts/WorkflowContainerContext', () => ({
    useWorkflow: jest.fn().mockReturnValue({
        goToNext: jest.fn(),
    }),
}));

const mockPolicy = {
    parties: [
        { partyId: 'Party_PO_Owner_1', firstName: 'John', lastName: 'Doe' },
        { partyId: 'Party_PI_1', firstName: 'Jane', lastName: 'Doe' },
    ],
    partyRoles: [
        { partyId: 'Party_PO_Owner_1', partyRole: PartyRole.OWNER },
        { partyId: 'Party_PI_1', partyRole: PartyRole.INSURED },
    ],
    policyNumber: '123456',
} as Policy;

let state = { payeePartyId: '', payeeFullName: '', payeeFilingStatus: FilingStatus.DEFAULT, payeeTaxJurisdiction: '', currentStepIndex: 1 };
const setState = jest.fn().mockImplementation(callback => {
    state = callback(state);
});

describe.skip('PayeesStep component', () => {
    it('renders payees correctly', () => {
        render(<PayeesStep parentPage={ParentPage.Premiums} policy={mockPolicy} setState={setState} state={state} />);

        expect(screen.getByText('workflows.payeesStep.title')).toBeInTheDocument();
        expect(screen.getByText('workflows.payeesStep.subLabel')).toBeInTheDocument();

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();

        expect(screen.getByText('workflows.payeesStep.add')).toBeInTheDocument();

        expect(screen.getByText('general.continue')).toBeInTheDocument();
        expect(screen.getByText('general.leaveTransaction')).toBeInTheDocument();
    });

    it('updates state when a payee step is loaded', () => {
        render(<PayeesStep parentPage={ParentPage.Premiums} policy={mockPolicy} setState={setState} state={state} />);

        expect(state).toEqual({
            currentStepIndex: 1,
            payeesFullName: 'John Doe',
            payeesPartyId: 'Party_PO_Owner_1',
        });
    });

    it('does not show form error when continue is clicked after selecting a payee', () => {
        const { rerender } = render(<PayeesStep parentPage={ParentPage.Premiums} policy={mockPolicy} setState={setState} state={state} />);

        // rerender to reflect state updates from useeffect
        rerender(<PayeesStep parentPage={ParentPage.Premiums} policy={mockPolicy} setState={setState} state={state} />);

        fireEvent.click(screen.getByText('general.continue'));

        expect(screen.queryByText('workflows.payeesStep.error')).not.toBeInTheDocument();
    });

    it('shows form error when continue is clicked without selecting a payee', async () => {
        const { rerender } = render(<PayeesStep parentPage={ParentPage.Premiums} policy={mockPolicy} setState={setState} state={state} />);

        // rerender to reflect state updates from useeffect
        rerender(<PayeesStep parentPage={ParentPage.Premiums} policy={mockPolicy} setState={setState} state={state} />);

        fireEvent.click(screen.getByText('John Doe'));

        // rerender to reflect state updates from click
        rerender(<PayeesStep parentPage={ParentPage.Premiums} policy={mockPolicy} setState={setState} state={state} />);

        fireEvent.click(screen.getByText('general.continue'));

        expect(screen.getByText('workflows.payeesStep.error')).toBeInTheDocument();
    });
});
