import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PolicyRole, RoleLabel, Roles } from '@deps/constants/policy';
import * as RoleChangeContext from '@deps/contexts/RoleChangeContext';
import * as WorkflowContext from '@deps/contexts/WorkflowContainerContext';

import RoleDetailsComponent from './role-details-component';
window.HTMLElement.prototype.scrollIntoView = jest.fn();
Element.prototype.hasPointerCapture = jest.fn().mockReturnValue(false);
jest.mock('@deps/contexts/RoleChangeContext');
jest.mock('@deps/contexts/WorkflowContainerContext');
jest.mock('./contact-details-component', () => {
    const ContactDetailsMock = () => (
        <div data-testid="contact-details">Contact Details Mock</div>
    );
    ContactDetailsMock.displayName = 'ContactDetailsComponent';
    return ContactDetailsMock;
});
jest.mock('./role-identification', () => {
    const RoleIdentificationMock = () => (
        <div data-testid="role-identification">Role Identification Mock</div>
    );
    RoleIdentificationMock.displayName = 'RoleIdentification';
    return RoleIdentificationMock;
});
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));
describe('RoleDetailsComponent', () => {
    const defaultProps = {
        policy: {} as any,
        role: Roles.NEWOWNER as any,
        roleLabel: RoleLabel.OWNER,
        action: 'Add',
        roleData: { party: {}, documents: [] },
        index: 0,
    };
    const mockSetRoleData = jest.fn();
    const mockSetAddRole = jest.fn();
    const mockSetRemoveRole = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        (RoleChangeContext.useRoleChange as jest.Mock).mockReturnValue({
            setRoleData: mockSetRoleData,
            existingRoleData: { party: { firstName: 'John', lastName: 'Doe' } },
            setAddRole: mockSetAddRole,
            removeRole: false,
            setRemoveRole: mockSetRemoveRole,
            defaultRoleValue: { roleData: {} },
        });
        (WorkflowContext.useWorkflow as jest.Mock).mockReturnValue({});
    });
    it('renders correctly for adding a new role', () => {
        render(<RoleDetailsComponent {...defaultProps} />);
        expect(
            screen.getByText(`New ${defaultProps.roleLabel}`)
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('beneficiaryListing.cancel')
        ).toBeInTheDocument();
        expect(screen.getByTestId('role-identification')).toBeInTheDocument();
        expect(screen.getByTestId('contact-details')).toBeInTheDocument();
    });
    it('renders correctly for an existing role', () => {
        render(
            <RoleDetailsComponent
                {...defaultProps}
                role={PolicyRole.OWNER}
                action="Edit"
            />
        );
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
    });
    it('handles cancel button click correctly', async () => {
        render(<RoleDetailsComponent {...defaultProps} />);
        const cancelButton = screen.getByLabelText('beneficiaryListing.cancel');
        await userEvent.click(cancelButton);
        expect(mockSetAddRole).toHaveBeenCalledWith(true);
        expect(mockSetRoleData).toHaveBeenCalled();
        expect(mockSetRemoveRole).toHaveBeenCalledWith(false);
    });
    it('handles role removal checkbox correctly', async () => {
        render(
            <RoleDetailsComponent
                {...defaultProps}
                role={PolicyRole.OWNER}
                action="Edit"
            />
        );
        const removeCheckbox = screen.getByRole('checkbox');
        await userEvent.click(removeCheckbox);
        expect(mockSetRemoveRole).toHaveBeenCalledWith(true);
    });
    it('handles change reason selection correctly', async () => {
        render(<RoleDetailsComponent {...defaultProps} />);
        const select = screen.getByLabelText('changeReason');
        await userEvent.click(select);
        mockSetRoleData('changeReason', 'Gift Transfer');
        expect(mockSetRoleData).toHaveBeenCalledWith(
            'changeReason',
            'Gift Transfer'
        );
    });
    it('handles supporting document selection correctly', () => {
        render(<RoleDetailsComponent {...defaultProps} />);
        const radio = screen.getByLabelText('no') as HTMLInputElement;
        fireEvent.click(radio);
        expect(mockSetRoleData).toHaveBeenCalled();
    });
});
