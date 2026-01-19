import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { PaymentMethod } from '@deps/models/case/withdrawal/case';

import BrokerageMethod from './brokerage-acc-method';
import { SelectedBanking } from '../form-disbursement.types';

// Mock child components
jest.mock('../bank-text-field-v2', () => {
    const BankTextFieldV2Mock = ({
        fieldName,
        fieldLabel,
        onDataChange,
        value,
        isFormStateReadOnly,
    }: {
        fieldName: string;
        fieldLabel: string;
        onDataChange: (value: any, fieldName: string) => void;
        value: string;
        isFormStateReadOnly: boolean;
    }) => (
        <div data-testid={`bank-text-field-${fieldName}`}>
            <label>{fieldLabel}</label>
            <input
                data-testid={`input-${fieldName}`}
                value={value}
                disabled={isFormStateReadOnly}
                onChange={(e) => onDataChange(e.target.value, fieldName)}
            />
        </div>
    );
    BankTextFieldV2Mock.displayName = 'BankTextFieldV2Mock';
    return BankTextFieldV2Mock;
});

jest.mock('../bank-checkbox-v2', () => {
    const BankCheckboxV2Mock = ({
        fieldName,
        fieldLabel,
        onDataChange,
        value,
        isFormStateReadOnly,
    }: {
        fieldName: string;
        fieldLabel: string;
        onDataChange: (value: any, fieldName: string) => void;
        value: boolean;
        isFormStateReadOnly: boolean;
    }) => (
        <div data-testid={`bank-checkbox-${fieldName}`}>
            <label>{fieldLabel}</label>
            <input
                type="checkbox"
                data-testid={`checkbox-${fieldName}`}
                checked={value || false}
                disabled={isFormStateReadOnly}
                onChange={(e) => onDataChange(e.target.checked, fieldName)}
            />
        </div>
    );
    BankCheckboxV2Mock.displayName = 'BankCheckboxV2Mock';
    return BankCheckboxV2Mock;
});

jest.mock('../../address-entry', () => {
    const AddressEntryMock = ({
        onDataChange,
        isFormStateReadOnly,
        initialAddress,
    }: {
        onDataChange: (val: any) => void;
        isFormStateReadOnly: boolean;
        initialAddress: any;
    }) => (
        <div data-testid="address-entry">
            <span data-testid="address-read-only">
                {isFormStateReadOnly ? 'read-only' : 'editable'}
            </span>
            <span data-testid="initial-address">
                {JSON.stringify(initialAddress)}
            </span>
            <button
                type="button"
                data-testid="update-address-btn"
                onClick={() =>
                    onDataChange({
                        line1: '123 New Street',
                        city: 'New City',
                        state: 'NY',
                        zip: '10001',
                    })
                }
            >
                Update Address
            </button>
        </div>
    );
    AddressEntryMock.displayName = 'AddressEntryMock';
    return AddressEntryMock;
});

describe('BrokerageMethod', () => {
    const defaultProps = {
        config: {
            value: PaymentMethod.Brokerage,
            fields: [],
        },
        isFormStateReadOnly: false,
        defaultDisbursementInfo: {
            brokerage: {
                companyName: '',
                accountNumber: '',
                acordAttached: false,
            },
            address: null,
        },
        setDefaultDisbursementInfo: jest.fn(),
    };

    const createBankDetails = (
        paymentMethod: PaymentMethod = PaymentMethod.Brokerage,
        selectedBanking: SelectedBanking | '' = ''
    ) => ({
        isBankSelected: false,
        bankingInFile: null,
        selectedBanking: selectedBanking,
        paymentMethod,
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render without crashing', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <BrokerageMethod {...defaultProps} />
                </FormDataContext.Provider>
            );

            const form = document.querySelector('form');
            expect(form).toBeVisible();
        });

        it('should render text field when config has it', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'companyName',
                        fieldLabel: 'Company Name',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <BrokerageMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByTestId('bank-text-field-companyName')
            ).toBeVisible();
        });

        it('should render address field when config has it', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'brokerageAddress',
                        fieldLabel: 'Brokerage Address',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <BrokerageMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('address-entry')).toBeVisible();
        });

        it('should render checkbox field when config has it', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'checkbox',
                        fieldName: 'acordAttached',
                        fieldLabel: 'ACORD Attached',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <BrokerageMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByTestId('bank-checkbox-acordAttached')
            ).toBeVisible();
        });

        it('should render multiple fields from config', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'companyName',
                        fieldLabel: 'Company Name',
                    },
                    {
                        fieldType: 'text',
                        fieldName: 'accountNumber',
                        fieldLabel: 'Account Number',
                    },
                    {
                        fieldType: 'checkbox',
                        fieldName: 'acordAttached',
                        fieldLabel: 'ACORD Attached',
                    },
                    {
                        fieldType: 'address',
                        fieldName: 'brokerageAddress',
                        fieldLabel: 'Address',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <BrokerageMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByTestId('bank-text-field-companyName')
            ).toBeVisible();
            expect(
                screen.getByTestId('bank-text-field-accountNumber')
            ).toBeVisible();
            expect(
                screen.getByTestId('bank-checkbox-acordAttached')
            ).toBeVisible();
            expect(screen.getByTestId('address-entry')).toBeVisible();
        });

        it('should return null for unknown field type', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'unknown-type',
                        fieldName: 'unknown',
                        fieldLabel: 'Unknown',
                    },
                ],
            };

            const { container } = render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <BrokerageMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(container.querySelector('form')).toBeVisible();
        });
    });

    describe('handleTextChange', () => {
        it('should update formDisbursement when text field changes', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'companyName',
                        fieldLabel: 'Company Name',
                    },
                ],
            };

            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setFormDisbursement,
                    }}
                >
                    <BrokerageMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const input = screen.getByTestId('input-companyName');
            fireEvent.change(input, { target: { value: 'New Company' } });

            expect(setFormDisbursement).toHaveBeenCalled();
            expect(setDefaultDisbursementInfo).toHaveBeenCalled();
        });

        it('should correctly update brokerage field in formDisbursement', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'companyName',
                        fieldLabel: 'Company Name',
                    },
                ],
            };

            let capturedUpdater: ((pv: any) => any) | null = null;
            const setFormDisbursement = jest.fn((updater) => {
                capturedUpdater = updater;
            });

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setFormDisbursement,
                    }}
                >
                    <BrokerageMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            const input = screen.getByTestId('input-companyName');
            fireEvent.change(input, { target: { value: 'Test Company' } });

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({
                brokerage: { companyName: '', accountNumber: '' },
            });
            expect(result.brokerage.companyName).toBe('Test Company');
        });

        it('should correctly update defaultDisbursementInfo with payment method key', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'accountNumber',
                        fieldLabel: 'Account Number',
                    },
                ],
            };

            let capturedUpdater: ((pv: any) => any) | null = null;
            const setDefaultDisbursementInfo = jest.fn((updater) => {
                capturedUpdater = updater;
            });

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setFormDisbursement: jest.fn(),
                    }}
                >
                    <BrokerageMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const input = screen.getByTestId('input-accountNumber');
            fireEvent.change(input, { target: { value: '123456789' } });

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({
                [PaymentMethod.Brokerage]: {
                    brokerage: { accountNumber: '' },
                },
            });
            expect(
                result[PaymentMethod.Brokerage].brokerage.accountNumber
            ).toBe('123456789');
        });
    });

    describe('handleAddressChange', () => {
        it('should update formDisbursement when address changes', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'brokerageAddress',
                        fieldLabel: 'Address',
                    },
                ],
            };

            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setFormDisbursement,
                    }}
                >
                    <BrokerageMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('update-address-btn'));

            expect(setFormDisbursement).toHaveBeenCalled();
            expect(setDefaultDisbursementInfo).toHaveBeenCalled();
        });

        it('should correctly update brokerage address in formDisbursement', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'brokerageAddress',
                        fieldLabel: 'Address',
                    },
                ],
            };

            let capturedUpdater: ((pv: any) => any) | null = null;
            const setFormDisbursement = jest.fn((updater) => {
                capturedUpdater = updater;
            });

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setFormDisbursement,
                    }}
                >
                    <BrokerageMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('update-address-btn'));

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({
                brokerage: { address: null },
            });
            expect(result.brokerage.address).toEqual({
                line1: '123 New Street',
                city: 'New City',
                state: 'NY',
                zip: '10001',
            });
        });

        it('should correctly update defaultDisbursementInfo with address', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'brokerageAddress',
                        fieldLabel: 'Address',
                    },
                ],
            };

            let capturedUpdater: ((pv: any) => any) | null = null;
            const setDefaultDisbursementInfo = jest.fn((updater) => {
                capturedUpdater = updater;
            });

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setFormDisbursement: jest.fn(),
                    }}
                >
                    <BrokerageMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('update-address-btn'));

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({
                [PaymentMethod.Brokerage]: {
                    brokerage: { address: null },
                },
            });
            expect(result[PaymentMethod.Brokerage].brokerage.address).toEqual({
                line1: '123 New Street',
                city: 'New City',
                state: 'NY',
                zip: '10001',
            });
        });
    });

    describe('Checkbox handling', () => {
        it('should update formDisbursement when checkbox changes', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'checkbox',
                        fieldName: 'acordAttached',
                        fieldLabel: 'ACORD Attached',
                    },
                ],
            };

            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setFormDisbursement,
                    }}
                >
                    <BrokerageMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const checkbox = screen.getByTestId('checkbox-acordAttached');
            fireEvent.click(checkbox);

            expect(setFormDisbursement).toHaveBeenCalled();
            expect(setDefaultDisbursementInfo).toHaveBeenCalled();
        });
    });

    describe('Read-only state', () => {
        it('should pass isFormStateReadOnly to text fields', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'companyName',
                        fieldLabel: 'Company Name',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <BrokerageMethod
                        {...defaultProps}
                        config={config}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('input-companyName')).toBeDisabled();
        });

        it('should pass isFormStateReadOnly to checkbox fields', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'checkbox',
                        fieldName: 'acordAttached',
                        fieldLabel: 'ACORD Attached',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <BrokerageMethod
                        {...defaultProps}
                        config={config}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('checkbox-acordAttached')).toBeDisabled();
        });

        it('should pass isFormStateReadOnly to address entry', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'brokerageAddress',
                        fieldLabel: 'Address',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <BrokerageMethod
                        {...defaultProps}
                        config={config}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('address-read-only')).toHaveTextContent(
                'read-only'
            );
        });
    });

    describe('Field values', () => {
        it('should display company name from defaultDisbursementInfo', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'companyName',
                        fieldLabel: 'Company Name',
                    },
                ],
            };

            const defaultDisbursementInfo = {
                brokerage: {
                    companyName: 'Existing Company',
                    accountNumber: '',
                },
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <BrokerageMethod
                        {...defaultProps}
                        config={config}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('input-companyName')).toHaveValue(
                'Existing Company'
            );
        });

        it('should display checkbox value from defaultDisbursementInfo', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'checkbox',
                        fieldName: 'acordAttached',
                        fieldLabel: 'ACORD Attached',
                    },
                ],
            };

            const defaultDisbursementInfo = {
                brokerage: {
                    acordAttached: true,
                },
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <BrokerageMethod
                        {...defaultProps}
                        config={config}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('checkbox-acordAttached')).toBeChecked();
        });

        it('should display empty string when brokerage field is undefined', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'companyName',
                        fieldLabel: 'Company Name',
                    },
                ],
            };

            const defaultDisbursementInfo = {
                brokerage: undefined,
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <BrokerageMethod
                        {...defaultProps}
                        config={config}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('input-companyName')).toHaveValue('');
        });
    });

    describe('classNames prop', () => {
        it('should apply classNames to address wrapper', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'brokerageAddress',
                        fieldLabel: 'Address',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <BrokerageMethod
                        {...defaultProps}
                        config={config}
                        classNames="custom-address-class"
                    />
                </FormDataContext.Provider>
            );

            const addressWrapper =
                screen.getByTestId('address-entry').parentElement;
            expect(addressWrapper).toHaveClass('custom-address-class');
        });

        it('should use default col-span-4 when classNames not provided for address', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'brokerageAddress',
                        fieldLabel: 'Address',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <BrokerageMethod
                        {...defaultProps}
                        config={config}
                        classNames={undefined}
                    />
                </FormDataContext.Provider>
            );

            const addressWrapper =
                screen.getByTestId('address-entry').parentElement;
            expect(addressWrapper).toHaveClass('col-span-4');
        });
    });
});
