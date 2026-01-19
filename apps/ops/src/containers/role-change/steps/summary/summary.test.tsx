import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslation } from 'next-i18next';

import { PolicyRole } from '@deps/constants/policy';
import { useRoleChange } from '@deps/contexts/RoleChangeContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';

import SummaryStep from './summary-step';
jest.mock('next-i18next', () => ({
    useTranslation: jest.fn(),
}));
jest.mock('@optimizely/optimizely-sdk', () => ({
    createInstance: () => ({
        activate: jest.fn(),
        getVariation: jest.fn(),
    }),
}));
jest.mock('@deps/contexts/RoleChangeContext', () => ({
    useRoleChange: jest.fn(),
}));
jest.mock('@deps/contexts/WorkflowContainerContext', () => ({
    useWorkflow: jest.fn(),
}));
jest.mock('next/router', () => ({
    useRouter: () => ({
        query: {},
        pathname: '/test',
        push: jest.fn(),
        replace: jest.fn(),
    }),
}));
jest.mock(
    '@deps/containers/people-data-cards/address-card/address-card.helpers',
    () => ({
        FormattedAddress: ({ address }: { address?: { line1?: string } }) => (
            <span data-testid="formatted-address">{address?.line1 || ''}</span>
        ),
    })
);
jest.mock(
    '@deps/containers/bene-change/components/steps/summary/beneficiary-summary',
    () => ({
        FormattedEnterprisePhone: ({
            phone,
        }: {
            phone?: { number?: string };
        }) => <span data-testid="formatted-phone">{phone?.number || ''}</span>,
    })
);
beforeAll(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
    jest.restoreAllMocks();
});
describe('SummaryStep', () => {
    const mockGoToNext = jest.fn();
    // Default mock translations
    const mockTranslations = {
        header: 'Summary',
        status200subtitle: 'All good',
        status400subtitle: 'There are errors',
        overview: 'Overview',
        changeReason: 'Change Reason',
        requiredsupportingdocument: 'Supporting Document Attached',
        identification: 'Identification',
        partytype: 'Party Type',
        relationshipcurrent: 'Relationship',
        uscitizen: 'US Citizen',
        ssn: 'SSN',
        gender: 'Gender',
        birthdate: 'Birth Date',
        contactDetails: 'Contact Details',
        'contact.address': 'Address',
        'contact.number': 'Phone',
        'contact.email': 'Email',
        submitWithErrorsText: 'Submit even with errors',
        missingCheckToConfirm: 'Please check to confirm',
        continue: 'Continue',
        internal500Error: 'Server error',
        internal500CTAlinkText: 'Contact support',
        internal500CTAlink: 'https://support.example.com',
    };
    const defaultProps = {
        policy: {} as any,
        role: PolicyRole.OWNER,
        roleLabel: 'Trustee XYZ',
        leaveTransactionLink: '/leave',
    };
    const mockRoleData = {
        party: {
            firstName: 'John',
            middleName: 'A',
            lastName: 'Doe',
            gender: 'male',
            dateOfBirth: '1990-01-01',
            addresses: [
                {
                    addressType: 'Home',
                    line1: '123 Main St',
                    city: 'Anytown',
                    state: 'CA',
                    zip: '12345',
                },
            ],
            phones: [
                { phoneType: 'Mobile', number: '1234567890', remove: false },
            ],
            emails: [{ emailAddress: 'john@example.com', remove: false }],
            partyType: 'Individual',
            identifications: [
                { identificationValue: 'XXX-XX-1234', usCitizen: 'Yes' },
            ],
        },
        changeReason: 'Changed address',
        relationshipToParty: 'Child',
        supportingDocumentAttached: 'Yes',
        validationResponse: {
            status: TransactionResponseStatus.Success,
            validationResult: [],
        },
    };
    const existingRoleData = {
        party: {
            firstName: 'Jane',
            middleName: 'B',
            lastName: 'Smith',
        },
    };
    beforeEach(() => {
        jest.clearAllMocks();
        (useTranslation as jest.Mock).mockImplementation((_, options) => {
            const keyPrefix = options?.keyPrefix || '';
            return {
                t: (key: string) => {
                    const fullKey = keyPrefix ? `${key}` : key;
                    return (
                        mockTranslations[
                            fullKey as keyof typeof mockTranslations
                        ] || fullKey
                    );
                },
            };
        });
        (useWorkflow as jest.Mock).mockReturnValue({
            goToNext: mockGoToNext,
        });
        (useRoleChange as jest.Mock).mockReturnValue({
            roleData: mockRoleData,
            existingRoleData,
        });
    });
    it('renders summary overview with correct role data', () => {
        render(<SummaryStep {...defaultProps} />);
        expect(screen.getByText('Summary')).toBeInTheDocument();
        expect(screen.getByText('All good')).toBeInTheDocument();
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Trustee XYZ')).toBeInTheDocument();
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
        expect(screen.getByText('1234567890')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('XXX-XX-1234')).toBeInTheDocument();
        expect(screen.getByText('Individual')).toBeInTheDocument();
        expect(screen.getByText('Male')).toBeInTheDocument();
    });
    it('calls goToNext on continue when validation succeeds', async () => {
        (useRoleChange as jest.Mock).mockReturnValue({
            roleData: mockRoleData,
            existingRoleData,
        });
        render(<SummaryStep {...defaultProps} />);
        const btn = screen.getByRole('button', { name: /continue/i });
        await userEvent.click(btn);
        expect(mockGoToNext).toHaveBeenCalledTimes(1);
    });
    it('displays error banner and checkbox on validation failure', () => {
        (useRoleChange as jest.Mock).mockReturnValue({
            roleData: {
                ...mockRoleData,
                validationResponse: {
                    status: StatusCode.BadRequest,
                    validationResult: [
                        {
                            error: 'Invalid SSN',
                            resolution: 'Provide correct SSN',
                        },
                    ],
                },
            },
            existingRoleData: {},
        });
        render(<SummaryStep {...defaultProps} />);
        expect(
            screen.getByText('Invalid SSN Provide correct SSN')
        ).toBeInTheDocument();
        expect(screen.getByText('Submit even with errors')).toBeInTheDocument();
    });
    it('prevents continue when unchecked checkbox and shows confirm message', async () => {
        (useRoleChange as jest.Mock).mockReturnValue({
            roleData: {
                ...mockRoleData,
                validationResponse: {
                    status: StatusCode.BadRequest,
                    validationResult: [
                        { error: 'Missing info', resolution: 'Add data' },
                    ],
                },
            },
            existingRoleData: {},
        });
        render(<SummaryStep {...defaultProps} />);
        const btn = screen.getByRole('button', { name: /continue/i });
        await userEvent.click(btn);
        expect(screen.getByText('Please check to confirm')).toBeInTheDocument();
        expect(mockGoToNext).not.toHaveBeenCalled();
    });
    it('allows continue when checkbox is checked despite validation errors', async () => {
        (useRoleChange as jest.Mock).mockReturnValue({
            roleData: {
                ...mockRoleData,
                validationResponse: {
                    status: StatusCode.BadRequest,
                    validationResult: [
                        { error: 'Missing info', resolution: 'Add data' },
                    ],
                },
            },
            existingRoleData: {},
        });
        render(<SummaryStep {...defaultProps} />);
        const cbox = screen.getByRole('checkbox');
        await userEvent.click(cbox);
        const btn = screen.getByRole('button', { name: /continue/i });
        await userEvent.click(btn);
        expect(mockGoToNext).toHaveBeenCalledTimes(1);
    });
});
