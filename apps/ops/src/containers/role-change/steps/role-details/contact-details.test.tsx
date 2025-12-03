import { fireEvent, render, screen } from '@testing-library/react';
import dayjs from 'dayjs';

import { PolicyRole } from '@deps/constants/policy';
import * as RoleChangeContext from '@deps/contexts/RoleChangeContext';

import ContactDetailsComponent from './contact-details-component';
jest.mock('@deps/contexts/RoleChangeContext');
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));
jest.mock('../../components/addressDetails', () => {
    const AddressDetailsMock = () => <div>Address Details</div>;
    AddressDetailsMock.displayName = 'AddressDetails';
    return AddressDetailsMock;
});
jest.mock('../../components/phoneDetails', () => {
    const PhoneDetailsMock = () => <div>Phone Details</div>;
    PhoneDetailsMock.displayName = 'PhoneDetails';
    return PhoneDetailsMock;
});
jest.mock('../../components/emailDetails', () => {
    const EmailDetailsMock = () => <div>Email Details</div>;
    EmailDetailsMock.displayName = 'EmailDetails';
    return EmailDetailsMock;
});
jest.mock('../../role-change-helper', () => ({
    ContactOptions: () => [
        { label: 'Email', value: 'EMAIL' },
        { label: 'Phone', value: 'PHONE' },
    ],
}));
jest.mock('@deps/helpers/date.helpers', () => ({
    isEndDated: (endDate: string | null) =>
        !!endDate && dayjs(endDate).isBefore(dayjs()),
}));

const roleData = {
    party: {
        addresses: [
            {
                addressLine1: '123 Main',
                endDate: null,
            },
        ],
        phones: [
            {
                phoneNumber: '555-1234',
                endDate: null,
            },
        ],
        emails: [
            {
                emailAddress: 'test@example.com',
                endDate: null,
            },
        ],
    },
};
describe('ContactDetailsComponent', () => {
    const defaultProps = {
        handleChange: jest.fn(),
        role: PolicyRole.OWNER,
        isReadOnly: false,
    };
    const mockSetRoleData = jest.fn();
    const mockSetExistingRoleData = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(RoleChangeContext, 'useRoleChange').mockImplementation(
            () => ({
                roleData: [] as any,
                setRoleData: mockSetRoleData,
                existingRoleData: [
                    {
                        party: {},
                        documents: [],
                    },
                ],
                setExistingRoleData: mockSetExistingRoleData,
                addRole: true,
                setAddRole: jest.fn(),
                removeRole: false,
                setRemoveRole: jest.fn(),
                currentErrors: {},
                setCurrentErrors: jest.fn(),
            })
        );
    });
    const mockHandleChange = jest.fn();
    const baseProps = {
        handleChange: mockHandleChange,
        role: PolicyRole.OWNER,
        isReadOnly: false,
    };
    it('renders section headings', () => {
        render(<ContactDetailsComponent roleData={undefined} {...baseProps} />);
        expect(screen.getByText('address')).toBeInTheDocument();
        expect(screen.getByText('phone')).toBeInTheDocument();
        expect(screen.getByText('email')).toBeInTheDocument();
    });
    it('renders "Add" buttons for address, phone, and email', () => {
        render(<ContactDetailsComponent roleData={undefined} {...baseProps} />);
        expect(screen.getAllByText('add')).toHaveLength(3);
    });
    it('calls handleChange when preferred contact radio is selected', () => {
        render(<ContactDetailsComponent roleData={undefined} {...baseProps} />);
        const radio = screen.getByLabelText('Email');
        fireEvent.click(radio);
        expect(mockHandleChange).toHaveBeenCalledWith(
            'preferredCommunicationType',
            'EMAIL'
        );
    });
    it('renders address, phone, and email components dynamically', () => {
        (RoleChangeContext.useRoleChange as jest.Mock).mockReturnValue({
            roleData: roleData,
            setRoleData: mockSetRoleData,
            existingRoleData: {
                party: {},
            },
            setExistingRoleData: mockSetExistingRoleData,
        });
        render(
            <ContactDetailsComponent roleData={roleData} {...defaultProps} />
        );
        expect(screen.getByTestId('addressDetails-0')).toBeInTheDocument();
        expect(screen.getByTestId('phoneDetails-0')).toBeInTheDocument();
        expect(screen.getByTestId('emailDetails-0')).toBeInTheDocument();
    });
    it('does not render end-dated contact items', () => {
        (RoleChangeContext.useRoleChange as jest.Mock).mockReturnValue({
            roleData: {
                party: {
                    addresses: [
                        {
                            addressLine1: 'Old Addr',
                            endDate: dayjs()
                                .subtract(1, 'day')
                                .format('YYYY-MM-DD'),
                        },
                    ],
                    phones: [
                        {
                            dialNumber: '0000000000',
                            endDate: dayjs()
                                .subtract(2, 'days')
                                .format('YYYY-MM-DD'),
                        },
                    ],
                    emails: [
                        {
                            emailAddress: 'old@example.com',
                            endDate: dayjs()
                                .subtract(3, 'days')
                                .format('YYYY-MM-DD'),
                        },
                    ],
                    preferredCommunicationType: 'EMAIL',
                },
            },
            setRoleData: mockSetRoleData,
            existingRoleData: {
                party: {},
            },
            setExistingRoleData: mockSetExistingRoleData,
        });
        render(<ContactDetailsComponent roleData={undefined} {...baseProps} />);
        expect(
            screen.queryByTestId('addressDetails-0')
        ).not.toBeInTheDocument();
        expect(screen.queryByTestId('phoneDetails-0')).not.toBeInTheDocument();
        expect(screen.queryByTestId('emailDetails-0')).not.toBeInTheDocument();
    });
});
