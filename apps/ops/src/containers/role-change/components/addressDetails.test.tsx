import { render, screen, fireEvent } from '@testing-library/react';

import { RoleChangeProvider } from '@deps/contexts/RoleChangeContext';
import { AddressType, Country, State } from '@zinnia/api-types/types/sor';

import AddressDetails from './addressDetails';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
    }),
}));

jest.mock(
    '@deps/containers/people-data-cards/address-card/side-sheet/side-sheet-address.helpers',
    () => {
        const originalModule = jest.requireActual(
            '@deps/containers/people-data-cards/address-card/side-sheet/side-sheet-address.helpers'
        );

        return {
            ...originalModule,
            getNewAddressTypeOptions: () => [
                { value: AddressType.RESIDENCE, label: 'Residence' },
                { value: AddressType.BUSINESS, label: 'Business' },
            ],
            AdditionalAddressLine: (props: {
                show?: boolean;
                value?: string;
                onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
                'data-testid'?: string;
                label?: string;
                disabled?: boolean;
                removeAddressLine?: () => void;
                'aria-label'?: string;
            }) => {
                if (!props.show) return null;
                return (
                    <div data-testid={props['data-testid']}>
                        <label>{props.label}</label>
                        <input
                            value={props.value || ''}
                            onChange={props.onChange}
                            disabled={props.disabled}
                            aria-label={props['aria-label']}
                            data-testid={`${props['data-testid']}-input`}
                        />
                    </div>
                );
            },
        };
    }
);

jest.mock('@deps/helpers/states.helpers', () => ({
    getStateCodes: () => ['CA', 'NY'],
}));

const baseProps = {
    addressDetails: {
        addressType: AddressType.RESIDENCE,
        country: Country.US,
        addressLine1: '123 Main St',
        addressLine2: '',
        addressLine3: '',
        city: 'Test City',
        state: State.CA,
        zipCode: '12345',
        zipCodeExtension: '6789',
        remove: false,
        isPreferred: 0,
    },
    handleAddressChange: jest.fn(),
    index: 0,
    isReadOnly: false,
    role: 'Owner',
    onPreferredAddressChange: jest.fn(),
    disablePreferredAddress: false,
    showPreferredCheckbox: false,
};

describe('AddressDetails', () => {
    beforeEach(() => {
        baseProps.handleAddressChange.mockClear();
    });

    it('renders all main fields and radio buttons', () => {
        render(
            <RoleChangeProvider>
                <AddressDetails {...baseProps} />
            </RoleChangeProvider>
        );
        expect(screen.getByLabelText('labels.address')).toBeInTheDocument();
        expect(screen.getByLabelText('labels.city')).toBeInTheDocument();
        expect(screen.getByLabelText('labels.zip')).toBeInTheDocument();
        expect(
            screen.getByLabelText('labels.removeAddress')
        ).toBeInTheDocument();
    });

    it('calls handleAddressChange on address line 1 input', () => {
        render(
            <RoleChangeProvider>
                <AddressDetails {...baseProps} />
            </RoleChangeProvider>
        );
        const input = screen.getByLabelText('labels.address');
        fireEvent.change(input, { target: { value: '456 Broadway' } });
        expect(baseProps.handleAddressChange).toHaveBeenCalledWith(
            'addresses',
            0,
            'addressLine1',
            '456 Broadway'
        );
    });

    it('calls handleAddressChange on city input', () => {
        render(
            <RoleChangeProvider>
                <AddressDetails {...baseProps} />
            </RoleChangeProvider>
        );
        const input = screen.getByLabelText('labels.city');
        fireEvent.change(input, { target: { value: 'New City' } });
        expect(baseProps.handleAddressChange).toHaveBeenCalledWith(
            'addresses',
            0,
            'city',
            'New City'
        );
    });

    it('calls handleAddressChange on zip input and splits zip+ext', () => {
        render(
            <RoleChangeProvider>
                <AddressDetails {...baseProps} />
            </RoleChangeProvider>
        );
        const input = screen.getByLabelText('labels.zip');
        fireEvent.change(input, { target: { value: '543216789' } });
        expect(baseProps.handleAddressChange).toHaveBeenCalledWith(
            'addresses',
            0,
            'zipCode',
            '54321'
        );
        expect(baseProps.handleAddressChange).toHaveBeenCalledWith(
            'addresses',
            0,
            'zipCodeExtension',
            '6789'
        );
    });

    it('calls handleAddressChange on address type change', () => {
        render(
            <RoleChangeProvider>
                <AddressDetails {...baseProps} />
            </RoleChangeProvider>
        );
        const businessRadio = screen.getByLabelText('Business');
        fireEvent.click(businessRadio);
        expect(baseProps.handleAddressChange).toHaveBeenCalledWith(
            'addresses',
            0,
            'addressType',
            AddressType.BUSINESS
        );
    });

    it('shows and interacts with AdditionalAddressLine 2 and 3 if present', () => {
        const propsWithLines = {
            ...baseProps,
            addressDetails: {
                ...baseProps.addressDetails,
                addressLine2: 'Suite 2',
                addressLine3: 'Floor 3',
            },
        };

        const { debug } = render(
            <RoleChangeProvider>
                <AddressDetails {...propsWithLines} />
            </RoleChangeProvider>
        );

        debug();

        expect(screen.getByTestId('address-line2')).toBeInTheDocument();
        expect(screen.getByTestId('address-line3')).toBeInTheDocument();

        const line2Input = screen.getByTestId('address-line2-input');
        fireEvent.change(line2Input, { target: { value: 'New Suite 2' } });
        expect(baseProps.handleAddressChange).toHaveBeenCalledWith(
            'addresses',
            0,
            'addressLine2',
            'New Suite 2'
        );
    });

    it('calls handleAddressChange on removeAddress checkbox', () => {
        render(
            <RoleChangeProvider>
                <AddressDetails {...baseProps} />
            </RoleChangeProvider>
        );
        const checkbox = screen.getByLabelText('labels.removeAddress');
        fireEvent.click(checkbox);
        expect(baseProps.handleAddressChange).toHaveBeenCalledWith(
            'addresses',
            0,
            'remove',
            expect.anything()
        );
    });
});
