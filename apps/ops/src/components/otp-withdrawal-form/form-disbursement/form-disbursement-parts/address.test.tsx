import '@testing-library/jest-dom';
import { cleanup, render, screen } from '@testing-library/react';

import {
    Address,
    AddressTypes,
    AccountType,
} from '@deps/models/case/withdrawal/case';
import { DisbursementParts } from '@deps/models/case/withdrawal/disbursement-types';

import { BankingFields } from '../form-disbursement.helpers';
import BankAddress from './address';
import { DEFAULT_ADDRESS } from '../../address-entry';

// Store the last props passed to AddressEntry for testing
let lastAddressEntryProps: Record<string, unknown> = {};

// Mock AddressEntry to capture all props
jest.mock('../../address-entry', () => {
    const MockAddressEntry = (props: {
        initialAddress: Address;
        isFormStateReadOnly: boolean;
        isPayeeAddress: boolean;
        isAddressLine2Required: boolean;
        onDataChange: (address: Address) => void;
    }) => {
        // Store props for test assertions
        lastAddressEntryProps = { ...props };
        return (
            <div
                data-testid="address-entry"
                data-initial-address={JSON.stringify(props.initialAddress)}
                data-is-form-state-read-only={String(props.isFormStateReadOnly)}
                data-is-payee-address={String(props.isPayeeAddress)}
                data-is-address-line2-required={String(
                    props.isAddressLine2Required
                )}
            >
                Mock Address Entry
            </div>
        );
    };
    MockAddressEntry.displayName = 'MockAddressEntry';
    return {
        __esModule: true,
        default: MockAddressEntry,
        DEFAULT_ADDRESS: {
            addressLine1: '',
            addressLine2: null,
            addressLine3: null,
            addressLine4: null,
            addressType: 'DEFAULT',
            city: null,
            country: null,
            state: '',
            zip: '',
            zipPlusFour: null,
            isAddressChanged: false,
        },
    };
});

// Helper to get the last props passed to AddressEntry
const getLastAddressEntryProps = () => lastAddressEntryProps;

afterEach(cleanup);

// Factory function to create mock DisbursementParts with sensible defaults
const createMockDisbursementParts = (
    overrides: Partial<DisbursementParts> = {}
): DisbursementParts => ({
    accountNumber: '',
    reEnterAccountNumber: '',
    accountType: AccountType.Checking,
    bankContactPerson: '',
    bankFurtherCreditAccount: '',
    bankFurtherCreditName: '',
    bankRoutingNumber: '',
    reEnterBankRoutingNumber: '',
    bankLocation: '',
    bankName: '',
    bankPhone: '',
    nameOnBankAccount: '',
    isVoidCheckAttached: null,
    firstTimeExpressCheck: null,
    isWireApprovalPresent: null,
    doesCheckMeetSecurityRequirements: null,
    address: DEFAULT_ADDRESS,
    acordAttached: null,
    companyName: '',
    participantId: null,
    payeeName: null,
    contractNumber: null,
    taxId: null,
    zip: '',
    emailDeliveryNotification: false,
    isDifferentPayeeOrAddress: false,
    maskedAccountNumber: null,
    accountHolder: null,
    accountName: null,
    emailNotification: null,
    isDirectDepositValid: null,
    fboDetails: '',
    consentAvailable: null,
    ChooseBankingType: '',
    selectIfPayeeIsDifferent: false,
    isPayeeFinancialIns: false,
    isAnnuitant: false,
    isPayeeCharity: false,
    isThirdPartyDisbursement: false,
    isAddressDifferent: false,
    ...overrides,
});

describe('BankAddress Component', () => {
    const mockOnDataChange = jest.fn();
    const mockAnnuitantAddress: Address = {
        addressLine1: '123 Annuitant St',
        addressLine2: 'Apt 1',
        addressLine3: null,
        addressLine4: null,
        addressType: 'DEFAULT' as AddressTypes,
        city: 'Annuitant City',
        state: 'CA',
        zip: '90210',
        zipPlusFour: null,
        country: 'USA',
    };

    const mockDisbursementAddress: Address = {
        addressLine1: '456 Test St',
        addressLine2: null,
        addressLine3: null,
        addressLine4: null,
        addressType: 'DEFAULT' as AddressTypes,
        city: 'Test City',
        state: 'NY',
        zip: '10001',
        zipPlusFour: null,
        country: 'USA',
    };

    const defaultProps = {
        fieldName: BankingFields.Address,
        fieldLabel: 'Address',
        classNames: 'col-span-3',
        isFormStateReadOnly: false,
        onDataChange: mockOnDataChange,
        disbursementInformation: createMockDisbursementParts({
            address: mockDisbursementAddress,
        }),
    };

    beforeEach(() => {
        mockOnDataChange.mockClear();
    });

    it('should render the AddressEntry component', () => {
        render(<BankAddress {...defaultProps} />);

        expect(screen.getByTestId('address-entry')).toBeInTheDocument();
    });

    describe('Address selection based on isAnnuitant flag', () => {
        it('should use annuitantAddress when isAnnuitant is true and annuitantAddress is provided', () => {
            render(
                <BankAddress
                    {...defaultProps}
                    disbursementInformation={createMockDisbursementParts({
                        address: mockDisbursementAddress,
                        isAnnuitant: true,
                    })}
                    annuitantAddress={mockAnnuitantAddress}
                />
            );

            const addressEntry = screen.getByTestId('address-entry');
            const initialAddress = JSON.parse(
                addressEntry.getAttribute('data-initial-address') || '{}'
            );

            expect(initialAddress.addressLine1).toBe('123 Annuitant St');
            expect(initialAddress.city).toBe('Annuitant City');
        });

        it('should use disbursementInformation.address when isAnnuitant is false', () => {
            render(
                <BankAddress
                    {...defaultProps}
                    disbursementInformation={createMockDisbursementParts({
                        address: mockDisbursementAddress,
                        isAnnuitant: false,
                    })}
                    annuitantAddress={mockAnnuitantAddress}
                />
            );

            const addressEntry = screen.getByTestId('address-entry');
            const initialAddress = JSON.parse(
                addressEntry.getAttribute('data-initial-address') || '{}'
            );

            expect(initialAddress.addressLine1).toBe('456 Test St');
            expect(initialAddress.city).toBe('Test City');
        });

        it('should use disbursementInformation.address when annuitantAddress is not provided', () => {
            render(
                <BankAddress
                    {...defaultProps}
                    disbursementInformation={createMockDisbursementParts({
                        address: mockDisbursementAddress,
                        isAnnuitant: true,
                    })}
                />
            );

            const addressEntry = screen.getByTestId('address-entry');
            const initialAddress = JSON.parse(
                addressEntry.getAttribute('data-initial-address') || '{}'
            );

            expect(initialAddress.addressLine1).toBe('456 Test St');
        });
    });

    describe('Key generation for AddressEntry remounting', () => {
        it('should use default key when no disbursement flags are set', () => {
            // When flags are undefined (not in the object), default key is used
            const disbursementWithoutFlags = {
                ...createMockDisbursementParts({
                    address: mockDisbursementAddress,
                }),
            };
            // Remove the flags to simulate legacy behavior
            delete (disbursementWithoutFlags as Partial<DisbursementParts>)
                .isAnnuitant;
            delete (disbursementWithoutFlags as Partial<DisbursementParts>)
                .isPayeeFinancialIns;
            delete (disbursementWithoutFlags as Partial<DisbursementParts>)
                .isPayeeCharity;
            delete (disbursementWithoutFlags as Partial<DisbursementParts>)
                .isThirdPartyDisbursement;
            delete (disbursementWithoutFlags as Partial<DisbursementParts>)
                .isAddressDifferent;

            const { rerender } = render(
                <BankAddress
                    {...defaultProps}
                    disbursementInformation={
                        disbursementWithoutFlags as DisbursementParts
                    }
                />
            );

            // Re-render with same undefined flags - should not cause remount
            rerender(
                <BankAddress
                    {...defaultProps}
                    disbursementInformation={
                        disbursementWithoutFlags as DisbursementParts
                    }
                />
            );

            expect(screen.getByTestId('address-entry')).toBeInTheDocument();
        });

        it('should generate different keys for different disbursement options', () => {
            // Test that different flag combinations produce predictable behavior
            const annuitantDisbursement = createMockDisbursementParts({
                address: mockDisbursementAddress,
                isAnnuitant: true,
                isPayeeFinancialIns: false,
                isPayeeCharity: false,
                isThirdPartyDisbursement: false,
                isAddressDifferent: false,
            });

            const financialInstitutionDisbursement =
                createMockDisbursementParts({
                    address: mockDisbursementAddress,
                    isAnnuitant: false,
                    isPayeeFinancialIns: true,
                    isPayeeCharity: false,
                    isThirdPartyDisbursement: false,
                    isAddressDifferent: false,
                });

            // Render with Annuitant option
            const { rerender } = render(
                <BankAddress
                    {...defaultProps}
                    disbursementInformation={annuitantDisbursement}
                    annuitantAddress={mockAnnuitantAddress}
                />
            );

            let addressEntry = screen.getByTestId('address-entry');
            let initialAddress = JSON.parse(
                addressEntry.getAttribute('data-initial-address') || '{}'
            );
            expect(initialAddress.addressLine1).toBe('123 Annuitant St');

            // Re-render with Financial Institution option - should get different address
            rerender(
                <BankAddress
                    {...defaultProps}
                    disbursementInformation={financialInstitutionDisbursement}
                    annuitantAddress={mockAnnuitantAddress}
                />
            );

            addressEntry = screen.getByTestId('address-entry');
            initialAddress = JSON.parse(
                addressEntry.getAttribute('data-initial-address') || '{}'
            );
            expect(initialAddress.addressLine1).toBe('456 Test St');
        });

        it('should remount AddressEntry when switching from Annuitant to another option', () => {
            const annuitantDisbursement = createMockDisbursementParts({
                address: mockDisbursementAddress,
                isAnnuitant: true,
                isPayeeFinancialIns: false,
                isPayeeCharity: false,
                isThirdPartyDisbursement: false,
                isAddressDifferent: false,
            });

            const charityDisbursement = createMockDisbursementParts({
                address: mockDisbursementAddress,
                isAnnuitant: false,
                isPayeeFinancialIns: false,
                isPayeeCharity: true,
                isThirdPartyDisbursement: false,
                isAddressDifferent: false,
            });

            const { rerender } = render(
                <BankAddress
                    {...defaultProps}
                    disbursementInformation={annuitantDisbursement}
                    annuitantAddress={mockAnnuitantAddress}
                />
            );

            // Switch to Charity option
            rerender(
                <BankAddress
                    {...defaultProps}
                    disbursementInformation={charityDisbursement}
                    annuitantAddress={mockAnnuitantAddress}
                />
            );

            // The key should have changed, causing AddressEntry to get the new address
            const addressEntry = screen.getByTestId('address-entry');
            const initialAddress = JSON.parse(
                addressEntry.getAttribute('data-initial-address') || '{}'
            );
            expect(initialAddress.addressLine1).toBe('456 Test St');
        });

        it('should handle switching back to Annuitant after selecting another option', () => {
            const annuitantDisbursement = createMockDisbursementParts({
                address: DEFAULT_ADDRESS,
                isAnnuitant: true,
                isPayeeFinancialIns: false,
                isPayeeCharity: false,
                isThirdPartyDisbursement: false,
                isAddressDifferent: false,
            });

            const ownerAddressDisbursement = createMockDisbursementParts({
                address: DEFAULT_ADDRESS,
                isAnnuitant: false,
                isPayeeFinancialIns: false,
                isPayeeCharity: false,
                isThirdPartyDisbursement: false,
                isAddressDifferent: false,
            });

            // Start with Annuitant
            const { rerender } = render(
                <BankAddress
                    {...defaultProps}
                    disbursementInformation={annuitantDisbursement}
                    annuitantAddress={mockAnnuitantAddress}
                />
            );

            let addressEntry = screen.getByTestId('address-entry');
            let initialAddress = JSON.parse(
                addressEntry.getAttribute('data-initial-address') || '{}'
            );
            expect(initialAddress.addressLine1).toBe('123 Annuitant St');

            // Switch to Owner Address
            rerender(
                <BankAddress
                    {...defaultProps}
                    disbursementInformation={ownerAddressDisbursement}
                    annuitantAddress={mockAnnuitantAddress}
                />
            );

            addressEntry = screen.getByTestId('address-entry');
            initialAddress = JSON.parse(
                addressEntry.getAttribute('data-initial-address') || '{}'
            );
            expect(initialAddress.addressLine1).toBe('');

            // Switch back to Annuitant - should get annuitant address again
            rerender(
                <BankAddress
                    {...defaultProps}
                    disbursementInformation={annuitantDisbursement}
                    annuitantAddress={mockAnnuitantAddress}
                />
            );

            addressEntry = screen.getByTestId('address-entry');
            initialAddress = JSON.parse(
                addressEntry.getAttribute('data-initial-address') || '{}'
            );
            expect(initialAddress.addressLine1).toBe('123 Annuitant St');
        });
    });

    describe('Backward compatibility', () => {
        it('should work when disbursementInformation is undefined', () => {
            render(
                <BankAddress
                    {...defaultProps}
                    disbursementInformation={
                        undefined as unknown as DisbursementParts
                    }
                />
            );

            expect(screen.getByTestId('address-entry')).toBeInTheDocument();
        });

        it('should use default key when no flags are defined (legacy implementations)', () => {
            // Legacy implementations might not set any of the disbursement flags
            const legacyDisbursement = {
                ...createMockDisbursementParts({
                    address: mockDisbursementAddress,
                }),
            };
            // Remove the flags to simulate legacy behavior
            delete (legacyDisbursement as Partial<DisbursementParts>)
                .isAnnuitant;
            delete (legacyDisbursement as Partial<DisbursementParts>)
                .isPayeeFinancialIns;
            delete (legacyDisbursement as Partial<DisbursementParts>)
                .isPayeeCharity;
            delete (legacyDisbursement as Partial<DisbursementParts>)
                .isThirdPartyDisbursement;
            delete (legacyDisbursement as Partial<DisbursementParts>)
                .isAddressDifferent;

            render(
                <BankAddress
                    {...defaultProps}
                    disbursementInformation={
                        legacyDisbursement as DisbursementParts
                    }
                />
            );

            const addressEntry = screen.getByTestId('address-entry');
            const initialAddress = JSON.parse(
                addressEntry.getAttribute('data-initial-address') || '{}'
            );
            expect(initialAddress.addressLine1).toBe('456 Test St');
        });
    });

    describe('setAddress callback', () => {
        it('should call onDataChange with updated address when AddressEntry triggers onDataChange', () => {
            render(<BankAddress {...defaultProps} />);

            // Get the onDataChange callback passed to AddressEntry
            const addressEntryOnDataChange = getLastAddressEntryProps()
                .onDataChange as (address: Address) => void;

            // Simulate AddressEntry calling onDataChange with a new address
            const newAddress: Address = {
                addressLine1: '789 New St',
                addressLine2: 'Suite 100',
                addressLine3: null,
                addressLine4: null,
                addressType: 'DEFAULT' as AddressTypes,
                city: 'New City',
                state: 'TX',
                zip: '75001',
                zipPlusFour: null,
                country: 'USA',
            };
            addressEntryOnDataChange(newAddress);

            // Verify onDataChange was called
            expect(mockOnDataChange).toHaveBeenCalledTimes(1);

            // Verify the callback function updates the address correctly
            const updateFn = mockOnDataChange.mock.calls[0][0];
            const existingData = {
                someField: 'value',
                address: mockDisbursementAddress,
            };
            const result = updateFn(existingData);

            expect(result).toEqual({
                someField: 'value',
                address: newAddress,
            });
        });

        it('should preserve other data when updating address', () => {
            render(<BankAddress {...defaultProps} />);

            const addressEntryOnDataChange = getLastAddressEntryProps()
                .onDataChange as (address: Address) => void;

            const newAddress: Address = {
                addressLine1: '999 Updated St',
                addressLine2: null,
                addressLine3: null,
                addressLine4: null,
                addressType: 'DEFAULT' as AddressTypes,
                city: 'Updated City',
                state: 'FL',
                zip: '33101',
                zipPlusFour: null,
                country: 'USA',
            };
            addressEntryOnDataChange(newAddress);

            const updateFn = mockOnDataChange.mock.calls[0][0];
            const existingData = {
                accountNumber: '12345',
                bankName: 'Test Bank',
                isAnnuitant: true,
                address: mockDisbursementAddress,
            };
            const result = updateFn(existingData);

            // Verify all existing fields are preserved
            expect(result.accountNumber).toBe('12345');
            expect(result.bankName).toBe('Test Bank');
            expect(result.isAnnuitant).toBe(true);
            // And address is updated
            expect(result.address).toEqual(newAddress);
        });
    });

    describe('Props passed to AddressEntry', () => {
        describe('isFormStateReadOnly prop', () => {
            it('should pass isFormStateReadOnly=false to AddressEntry when not read-only', () => {
                render(
                    <BankAddress
                        {...defaultProps}
                        isFormStateReadOnly={false}
                    />
                );

                const addressEntry = screen.getByTestId('address-entry');
                expect(
                    addressEntry.getAttribute('data-is-form-state-read-only')
                ).toBe('false');
            });

            it('should pass isFormStateReadOnly=true to AddressEntry when read-only', () => {
                render(
                    <BankAddress {...defaultProps} isFormStateReadOnly={true} />
                );

                const addressEntry = screen.getByTestId('address-entry');
                expect(
                    addressEntry.getAttribute('data-is-form-state-read-only')
                ).toBe('true');
            });
        });

        describe('isAddressLine2Required prop', () => {
            it('should default isAddressLine2Required to false when not provided', () => {
                // defaultProps doesn't include isAddressLine2Required, so it should default to false
                render(<BankAddress {...defaultProps} />);

                const addressEntry = screen.getByTestId('address-entry');
                expect(
                    addressEntry.getAttribute('data-is-address-line2-required')
                ).toBe('false');
            });

            it('should pass isAddressLine2Required=true to AddressEntry when specified', () => {
                render(
                    <BankAddress
                        {...defaultProps}
                        isAddressLine2Required={true}
                    />
                );

                const addressEntry = screen.getByTestId('address-entry');
                expect(
                    addressEntry.getAttribute('data-is-address-line2-required')
                ).toBe('true');
            });

            it('should pass isAddressLine2Required=false to AddressEntry when explicitly set', () => {
                render(
                    <BankAddress
                        {...defaultProps}
                        isAddressLine2Required={false}
                    />
                );

                const addressEntry = screen.getByTestId('address-entry');
                expect(
                    addressEntry.getAttribute('data-is-address-line2-required')
                ).toBe('false');
            });
        });

        describe('isPayeeAddress prop', () => {
            it('should always pass isPayeeAddress=true to AddressEntry', () => {
                render(<BankAddress {...defaultProps} />);

                const addressEntry = screen.getByTestId('address-entry');
                expect(addressEntry.getAttribute('data-is-payee-address')).toBe(
                    'true'
                );
            });

            it('should pass isPayeeAddress=true regardless of other props', () => {
                render(
                    <BankAddress
                        {...defaultProps}
                        disbursementInformation={createMockDisbursementParts({
                            address: mockDisbursementAddress,
                            isAnnuitant: true,
                        })}
                        annuitantAddress={mockAnnuitantAddress}
                        isFormStateReadOnly={true}
                        isAddressLine2Required={true}
                    />
                );

                const addressEntry = screen.getByTestId('address-entry');
                expect(addressEntry.getAttribute('data-is-payee-address')).toBe(
                    'true'
                );
            });
        });
    });

    describe('Container styling', () => {
        it('should apply custom classNames when provided', () => {
            const { container } = render(
                <BankAddress
                    {...defaultProps}
                    classNames="col-span-3 custom-class"
                />
            );

            const wrapperDiv = container.firstChild as HTMLElement;
            expect(wrapperDiv.className).toBe('col-span-3 custom-class');
        });

        it('should apply default classNames "col-span-4" when classNames is not provided', () => {
            const propsWithoutClassNames = { ...defaultProps };
            delete (propsWithoutClassNames as Partial<typeof defaultProps>)
                .classNames;

            const { container } = render(
                <BankAddress {...propsWithoutClassNames} />
            );

            const wrapperDiv = container.firstChild as HTMLElement;
            expect(wrapperDiv.className).toBe('col-span-4');
        });

        it('should apply default classNames when classNames is empty string', () => {
            const { container } = render(
                <BankAddress {...defaultProps} classNames="" />
            );

            const wrapperDiv = container.firstChild as HTMLElement;
            // Empty string is falsy, so default 'col-span-4' should be used
            expect(wrapperDiv.className).toBe('col-span-4');
        });
    });
});
