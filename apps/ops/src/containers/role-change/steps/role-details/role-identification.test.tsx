import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PartyType } from '@zinnia/api-types/types/sor';

import RoleIdentification from './role-identification';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                male: 'Male',
                female: 'Female',
            };
            return translations[key] || key;
        },
    }),
}));

jest.mock('@deps/contexts/RoleChangeContext', () => ({
    useRoleChange: () => ({
        roleData: {
            party: {
                partyType: PartyType.INDIVIDUAL,
                firstName: 'John',
                middleName: 'A',
                lastName: 'Doe',
                gender: 'Male',
                prefix: '',
                suffix: '',
                dateOfBirth: '2000-01-01',
                identifications: [
                    {
                        usCitizen: 'Yes',
                        identificationValue: '123456789',
                    },
                ],
            },
            relationshipToParty: '',
        },
        existingRoleData: {},
    }),
}));

const defaultProps = {
    handleChange: jest.fn(),
    handleIdentificationChange: jest.fn(),
    isReadOnly: false,
    role: 'NEWOWNER',
    index: 0,
    existingRoleData: { undefined },
    policy: { undefined },
    handleFilesChange: jest.fn(),
    uploadedFiles: [],
};

describe('RoleIdentification Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders identification section', () => {
        render(<RoleIdentification {...defaultProps} />);
        expect(screen.getByText('Identification')).toBeInTheDocument();
        screen.getByText('partyType');
    });

    it('handles party type change', () => {
        render(<RoleIdentification {...defaultProps} />);
        const radio = screen.getByText('partyOptions.individual');
        fireEvent.click(radio);
        expect(defaultProps.handleChange).toHaveBeenCalledWith(
            'partyType',
            'INDIVIDUAL'
        );
    });

    it('handles relationship to party change', async () => {
        window.HTMLElement.prototype.scrollIntoView = jest.fn();
        Element.prototype.hasPointerCapture = jest.fn().mockReturnValue(false);

        render(<RoleIdentification {...defaultProps} />);

        const select = screen.getByLabelText('relationshipParty');

        await userEvent.click(select);

        defaultProps.handleChange('relationshipToParty', 'TRUSTEE');

        expect(defaultProps.handleChange).toHaveBeenCalledWith(
            'relationshipToParty',
            'TRUSTEE'
        );
    });

    it('handles SSN change', () => {
        render(<RoleIdentification {...defaultProps} />);
        const ssnField = screen.getByLabelText('ssn');
        fireEvent.change(ssnField, { target: { value: '987654321' } });
        expect(defaultProps.handleIdentificationChange).toHaveBeenCalledWith(
            'identifications',
            0,
            'identificationValue',
            '987654321'
        );
    });

    it('handles gender selection', () => {
        render(<RoleIdentification {...defaultProps} />);
        const maleRadio = screen.getByLabelText('Male');
        fireEvent.click(maleRadio);
        expect(defaultProps.handleChange).toHaveBeenCalledWith(
            'gender',
            'MALE'
        );
    });

    it('handles date of birth change', () => {
        render(<RoleIdentification {...defaultProps} />);
        const dobField = screen.getByLabelText('dateOfBirth');
        fireEvent.change(dobField, { target: { value: '11092011' } });
        expect(defaultProps.handleChange).toHaveBeenCalledWith(
            'dateOfBirth',
            '11092011'
        );
    });
});
