import { render, screen, fireEvent } from '@testing-library/react';
import { PhoneType } from '@zinnia/api-types/types/sor';

import PhoneDetails from './phoneDetails';
jest.mock('@deps/contexts/RoleChangeContext', () => ({
    useRoleChange: () => ({
        currentErrors: {},
        roleData: {},
        existingRoleData: {},
        setRoleData: jest.fn(),
    }),
}));
jest.mock(
    '@deps/containers/people-data-cards/phone-card/side-sheet/side-sheet-phone.helpers',
    () => ({
        getBestTimeOptions: () => [{ value: 'Anytime', label: 'Anytime' }],
        getPhoneTypeOptions: () => [
            { value: PhoneType.MOBILE, label: 'Mobile' },
            { value: PhoneType.BUSINESS, label: 'Business' },
        ],
        getTimeZoneOptions: () => [
            { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
        ],
        countryOptions: [{ value: 'US', label: 'United States' }],
        frequentCountryOptions: [],
        Errors: {},
    })
);

const baseProps = {
    phoneDetails: {
        phoneType: PhoneType.MOBILE,
        areaCode: '123',
        dialNumber: '4567890',
        bestTime: 'Anytime',
        countryCode: '1',
        timezone: 'Asia/Kolkata',
        extension: '',
        remove: false,
        isPreferred: false,
    },
    handlePhoneChange: jest.fn(),
    index: 0,
    role: 'user',
    isReadOnly: false,
    onPreferredPhoneChange: jest.fn,
    disablePreferredPhone: false,
    showPreferredCheckbox: false,
};
describe('PhoneDetails', () => {
    beforeEach(() => {
        baseProps.handlePhoneChange.mockClear();
    });
    it('renders all fields and controls', () => {
        render(<PhoneDetails {...baseProps} />);
        const radios = screen.getAllByRole('radio');
        expect(radios.length).toBe(2);
        expect(screen.getByText('Mobile')).toBeInTheDocument();
        expect(screen.getByText('Business')).toBeInTheDocument();
        expect(screen.getByText('fieldLabels.number')).toBeInTheDocument();
        expect(
            screen.getByLabelText('fieldLabels.bestTime')
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('fieldLabels.timeZone')
        ).toBeInTheDocument();
        expect(
            screen.getByLabelText('fieldLabels.removePhone')
        ).toBeInTheDocument();
    });
    it('calls handlePhoneChange on phone type change', () => {
        render(<PhoneDetails {...baseProps} />);
        const businessRadio = screen.getByText('Business');
        fireEvent.click(businessRadio);
        expect(baseProps.handlePhoneChange).toHaveBeenCalledWith(
            'phones',
            0,
            'phoneType',
            PhoneType.BUSINESS
        );
    });
    it('calls handlePhoneChange on number change', () => {
        render(<PhoneDetails {...baseProps} />);
        const input = screen.getByLabelText('fieldLabels.number');
        fireEvent.change(input, { target: { value: '9876543210' } });
        expect(baseProps.handlePhoneChange).toHaveBeenCalledWith(
            'phones',
            0,
            'areaCode',
            '987'
        );
        expect(baseProps.handlePhoneChange).toHaveBeenCalledWith(
            'phones',
            0,
            'dialNumber',
            '6543210'
        );
    });
    it('calls handlePhoneChange on remove checkbox', () => {
        render(<PhoneDetails {...baseProps} />);
        const checkbox = screen.getByLabelText('fieldLabels.removePhone');
        fireEvent.click(checkbox);
        expect(baseProps.handlePhoneChange).toHaveBeenCalledWith(
            'phones',
            0,
            'remove',
            expect.anything()
        );
    });
    it('renders extension field only for BUSINESS phone type', () => {
        render(
            <PhoneDetails
                {...baseProps}
                phoneDetails={{
                    ...baseProps.phoneDetails,
                    phoneType: PhoneType.BUSINESS,
                }}
            />
        );
        expect(
            screen.getByLabelText('fieldLabels.extension')
        ).toBeInTheDocument();
    });
    it('does not render extension field for MOBILE phone type', () => {
        render(
            <PhoneDetails
                {...baseProps}
                phoneDetails={{
                    ...baseProps.phoneDetails,
                    phoneType: PhoneType.MOBILE,
                }}
            />
        );
        expect(
            screen.queryByLabelText('fieldLabels.extension')
        ).not.toBeInTheDocument();
    });
});
