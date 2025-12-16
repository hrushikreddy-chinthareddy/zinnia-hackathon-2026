import { fireEvent, render, screen } from '@testing-library/react';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import { PartyRole, Policy } from '@zinnia/api-types/types/sor';

import PayorStep from './payor-step';

jest.mock('@deps/contexts/WorkflowContainerContext', () => ({
    useWorkflow: jest.fn().mockReturnValue({
        goToNext: jest.fn(),
    }),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: () => {} }),
}));

jest.mock('@deps/pages/create-case', () => ({
    TabOptions: {
        myTasks: 'myTasks',
    },
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

let state = { payorPartyId: '', payorFullName: '', currentStepIndex: 1 };
const setState = jest.fn().mockImplementation((callback) => {
    state = callback(state);
});

describe('PayorStep component', () => {
    it('renders payors correctly', () => {
        render(
            <PayorStep
                parentPage={ParentPage.Premiums}
                policy={mockPolicy}
                setState={setState}
                state={state}
            />
        );

        expect(
            screen.getByText('workflows.payorStep.title')
        ).toBeInTheDocument();
        expect(
            screen.getByText('workflows.payorStep.subLabel')
        ).toBeInTheDocument();

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();

        expect(screen.getByText('workflows.payorStep.add')).toBeInTheDocument();

        expect(screen.getByText('general.continue')).toBeInTheDocument();
        expect(
            screen.getByText('general.leaveTransaction')
        ).toBeInTheDocument();
    });

    it('updates state when a payor step is loaded', () => {
        render(
            <PayorStep
                parentPage={ParentPage.Premiums}
                policy={mockPolicy}
                setState={setState}
                state={state}
            />
        );

        expect(state).toEqual({
            currentStepIndex: 1,
            payorAddress: undefined,
            payorFullName: 'John Doe',
            payorPartyId: 'Party_PO_Owner_1',
        });
    });

    it('does not show form error when continue is clicked after selecting a payor', () => {
        const { rerender } = render(
            <PayorStep
                parentPage={ParentPage.Premiums}
                policy={mockPolicy}
                setState={setState}
                state={state}
            />
        );

        // rerender to reflect state updates from useeffect
        rerender(
            <PayorStep
                parentPage={ParentPage.Premiums}
                policy={mockPolicy}
                setState={setState}
                state={state}
            />
        );

        fireEvent.click(screen.getByText('general.continue'));

        expect(
            screen.queryByText('workflows.payorStep.error')
        ).not.toBeInTheDocument();
    });

    it('shows form error when continue is clicked without selecting a payor', async () => {
        const { rerender } = render(
            <PayorStep
                parentPage={ParentPage.Premiums}
                policy={mockPolicy}
                setState={setState}
                state={state}
            />
        );

        // rerender to reflect state updates from useeffect
        rerender(
            <PayorStep
                parentPage={ParentPage.Premiums}
                policy={mockPolicy}
                setState={setState}
                state={state}
            />
        );

        fireEvent.click(screen.getByText('John Doe'));

        // rerender to reflect state updates from click
        rerender(
            <PayorStep
                parentPage={ParentPage.Premiums}
                policy={mockPolicy}
                setState={setState}
                state={state}
            />
        );

        fireEvent.click(screen.getByText('general.continue'));

        expect(
            screen.getByText('workflows.payorStep.error')
        ).toBeInTheDocument();
    });
});
