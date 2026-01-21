import { render, screen, fireEvent } from '@testing-library/react';

import { EmailType } from '@zinnia/api-types/types/sor';

import EmailDetails from './emailDetails';
jest.mock('@deps/contexts/RoleChangeContext', () => ({
    useRoleChange: () => ({
        currentErrors: {},
        roleData: {},
        existingRoleData: {},
        setRoleData: jest.fn(),
    }),
}));

jest.mock(
    '@deps/containers/people-data-cards/email-card/side-sheet/side-sheet-email.helpers',
    () => ({
        getEmailTypes: () => [
            { value: EmailType.PERSONAL, label: 'Personal' },
            { value: EmailType.BUSINESS, label: 'Business' },
        ],
        Errors: {},
    })
);
const baseProps = {
    emailDetails: {
        emailAddress: 'test@example.com',
        emailType: EmailType.PERSONAL,
        remove: false,
        isPreferred: 0,
    },
    handleEmailChange: jest.fn(),
    index: 0,
    role: 'user',
    isReadOnly: false,
    onPreferredEmailChange: jest.fn(),
    disablePreferredEmail: false,
    showPreferredCheckbox: false,
};
describe('EmailDetails', () => {
    beforeEach(() => {
        baseProps.handleEmailChange.mockClear();
    });
    it('renders all fields and controls', () => {
        render(<EmailDetails {...baseProps} />);
        const radios = screen.getAllByRole('radio');
        expect(radios.length).toBe(2);
        expect(screen.getByLabelText('Personal')).toBeInTheDocument();
        expect(screen.getByLabelText('Business')).toBeInTheDocument();
        expect(screen.getByLabelText('labels.email')).toBeInTheDocument();
        expect(screen.getByLabelText('labels.remove')).toBeInTheDocument();
    });
    it('calls handleEmailChange on email type change', () => {
        render(<EmailDetails {...baseProps} />);
        const businessRadio = screen.getByLabelText('Business');
        fireEvent.click(businessRadio);
        expect(baseProps.handleEmailChange).toHaveBeenLastCalledWith(
            'emails',
            0,
            'emailType',
            EmailType.BUSINESS
        );
    });
    it('calls handleEmailChange on email address change', () => {
        render(<EmailDetails {...baseProps} />);
        const input = screen.getByLabelText('labels.email');
        fireEvent.change(input, { target: { value: 'new@example.com' } });
        expect(baseProps.handleEmailChange).toHaveBeenLastCalledWith(
            'emails',
            0,
            'emailAddress',
            'new@example.com'
        );
    });
    it('calls handleEmailChange on remove checkbox', () => {
        render(<EmailDetails {...baseProps} />);
        const checkbox = screen.getByLabelText('labels.remove');
        fireEvent.click(checkbox);
        expect(baseProps.handleEmailChange).toHaveBeenLastCalledWith(
            'emails',
            0,
            'remove',
            expect.anything()
        );
    });
});
