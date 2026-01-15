import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import {
    PaymentMethod,
    PaymentMailType,
} from '@deps/models/case/withdrawal/case';

import CheckMethod from './check-method';
import { DEFAULT_ADDRESS } from '../../address-entry';
import { SelectedBanking } from '../form-disbursement.types';

// Mock child components
jest.mock('../../address-entry', () => ({
    __esModule: true,
    default: ({
        onDataChange,
        initialAddress,
        isFormStateReadOnly,
        isPayeeAddress,
        isAddressLine2Required,
    }: any) => (
        <div data-testid="address-entry">
            <input
                data-testid="address-input"
                value={initialAddress?.addressLine1 || ''}
                onChange={(e) =>
                    onDataChange({
                        ...initialAddress,
                        addressLine1: e.target.value,
                    })
                }
                disabled={isFormStateReadOnly}
            />
            <span data-testid="is-payee-address">
                {isPayeeAddress ? 'true' : 'false'}
            </span>
            <span data-testid="is-address-line2-required">
                {isAddressLine2Required ? 'true' : 'false'}
            </span>
        </div>
    ),
}));

jest.mock('../bank-text-field-v2', () => ({
    __esModule: true,
    default: ({
        fieldName,
        fieldLabel,
        onDataChange,
        value,
        isFormStateReadOnly,
    }: any) => (
        <div data-testid={`text-field-${fieldName}`}>
            <label htmlFor={fieldName}>{fieldLabel}</label>
            <input
                id={fieldName}
                data-testid={fieldName}
                value={value}
                onChange={(e) => onDataChange(e.target.value, fieldName)}
                disabled={isFormStateReadOnly}
            />
        </div>
    ),
}));

jest.mock('../bank-checkbox-v2', () => ({
    __esModule: true,
    default: ({
        fieldName,
        fieldLabel,
        onDataChange,
        value,
        isFormStateReadOnly,
        classNames,
    }: any) => (
        <div data-testid={`checkbox-field-${fieldName}`}>
            <label htmlFor={fieldName}>{fieldLabel}</label>
            <input
                type="checkbox"
                id={fieldName}
                data-testid={fieldName}
                checked={value || false}
                onChange={() => onDataChange()}
                disabled={isFormStateReadOnly}
            />
            <span data-testid={`checkbox-classnames-${fieldName}`}>
                {classNames}
            </span>
        </div>
    ),
}));

describe('CheckMethod', () => {
    const mockConfig = {
        fields: [
            {
                fieldType: 'text',
                fieldName: 'payeeName',
                fieldLabel: 'Payee Name',
                classNames: 'col-span-2',
            },
            {
                fieldType: 'address',
                fieldName: 'payeeAddress',
                fieldLabel: 'Payee Address',
                classNames: 'col-span-4',
                isAddressLine2Required: false,
            },
            {
                fieldType: 'checkbox',
                fieldName: 'differentPayee',
                fieldLabel: 'Different Payee or Address',
                classNames: 'col-span-1',
            },
        ],
    };

    const defaultDisbursementInfo = {
        payee: {
            payeeName: { text: 'John Doe' },
            address: DEFAULT_ADDRESS,
        },
        isDifferentPayeeOrAddress: { text: false },
    };

    const defaultProps = {
        config: mockConfig,
        isFormStateReadOnly: false,
        defaultDisbursementInfo,
        setDefaultDisbursementInfo: jest.fn(),
    };

    const createBankDetails = (
        paymentMethod: PaymentMethod | PaymentMailType | '' = '',
        selectedBanking: SelectedBanking | '' = ''
    ) =>
        ({
            isBankSelected: false,
            bankingInFile: [],
            selectedBanking: selectedBanking,
            paymentMethod,
        } as any);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render a form element', () => {
            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod {...defaultProps} />
                </FormDataContext.Provider>
            );

            const form = document.querySelector('form');
            expect(form).toBeVisible();
            expect(form).toHaveClass('grid', 'grid-cols-3', 'gap-4', 'mt-4');
        });

        it('should render text field when config has text field type', () => {
            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod {...defaultProps} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('text-field-payeeName')).toBeVisible();
            expect(screen.getByTestId('payeeName')).toBeVisible();
        });

        it('should render address entry when config has address field type', () => {
            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod {...defaultProps} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('address-entry')).toBeVisible();
        });

        it('should render checkbox when config has checkbox field type', () => {
            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod {...defaultProps} />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByTestId('checkbox-field-differentPayee')
            ).toBeVisible();
            expect(screen.getByTestId('differentPayee')).toBeVisible();
        });

        it('should not render any fields when config.fields is empty', () => {
            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod {...defaultProps} config={{ fields: [] }} />
                </FormDataContext.Provider>
            );

            expect(
                screen.queryByTestId('text-field-payeeName')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId('address-entry')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId('checkbox-field-differentPayee')
            ).not.toBeInTheDocument();
        });

        it('should not render any fields when config.fields is undefined', () => {
            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod {...defaultProps} config={{}} />
                </FormDataContext.Provider>
            );

            expect(
                screen.queryByTestId('text-field-payeeName')
            ).not.toBeInTheDocument();
        });

        it('should return null for unknown field types', () => {
            const configWithUnknownField = {
                fields: [
                    {
                        fieldType: 'unknown-type',
                        fieldName: 'unknownField',
                        fieldLabel: 'Unknown',
                    },
                ],
            };

            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod
                        {...defaultProps}
                        config={configWithUnknownField}
                    />
                </FormDataContext.Provider>
            );

            // The div wrapper is rendered but no child content
            const form = document.querySelector('form');
            expect(form?.children.length).toBe(1);
            expect(form?.children[0].children.length).toBe(0);
        });
    });

    describe('Text Field - handleTextChange', () => {
        it('should call setFormDisbursement when text field value changes', () => {
            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        setFormDisbursement,
                        bankDetails: createBankDetails(PaymentMailType.Check),
                    }}
                >
                    <CheckMethod
                        {...defaultProps}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const textInput = screen.getByTestId('payeeName');
            fireEvent.change(textInput, { target: { value: 'Jane Smith' } });

            expect(setFormDisbursement).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });

        it('should update payee field in formDisbursement with new value', () => {
            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        setFormDisbursement,
                        bankDetails: createBankDetails(PaymentMailType.Check),
                    }}
                >
                    <CheckMethod
                        {...defaultProps}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const textInput = screen.getByTestId('payeeName');
            fireEvent.change(textInput, { target: { value: 'Jane Smith' } });

            const updateFn = setFormDisbursement.mock.calls[0][0];
            const prevState = {
                payee: {
                    payeeName: { text: 'John Doe' },
                },
            };
            const result = updateFn(prevState);

            expect(result.payee.payeeName.text).toBe('Jane Smith');
        });

        it('should call setDefaultDisbursementInfo when text field value changes', () => {
            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        setFormDisbursement,
                        bankDetails: createBankDetails(PaymentMailType.Check),
                    }}
                >
                    <CheckMethod
                        {...defaultProps}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const textInput = screen.getByTestId('payeeName');
            fireEvent.change(textInput, { target: { value: 'Jane Smith' } });

            expect(setDefaultDisbursementInfo).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });

        it('should update payee field in defaultDisbursementInfo based on payment method', () => {
            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        setFormDisbursement,
                        bankDetails: createBankDetails(PaymentMailType.Check),
                    }}
                >
                    <CheckMethod
                        {...defaultProps}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const textInput = screen.getByTestId('payeeName');
            fireEvent.change(textInput, { target: { value: 'Jane Smith' } });

            const updateFn = setDefaultDisbursementInfo.mock.calls[0][0];
            const prevState = {
                [PaymentMailType.Check]: {
                    payee: {
                        payeeName: { text: 'John Doe' },
                    },
                },
            };
            const result = updateFn(prevState);

            expect(result[PaymentMailType.Check].payee.payeeName.text).toBe(
                'Jane Smith'
            );
        });

        it('should display the correct value from defaultDisbursementInfo', () => {
            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod {...defaultProps} />
                </FormDataContext.Provider>
            );

            const textInput = screen.getByTestId('payeeName');
            expect(textInput).toHaveValue('John Doe');
        });

        it('should display empty string when payee field is undefined', () => {
            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod
                        {...defaultProps}
                        defaultDisbursementInfo={{ payee: {} }}
                    />
                </FormDataContext.Provider>
            );

            const textInput = screen.getByTestId('payeeName');
            expect(textInput).toHaveValue('');
        });
    });

    describe('Address Field - handleAddressChange', () => {
        it('should render AddressEntry with correct initial address', () => {
            const addressConfig = {
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
                        isAddressLine2Required: false,
                    },
                ],
            };

            const disbursementInfo = {
                payee: {
                    address: { addressLine1: '123 Main St' },
                },
            };

            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod
                        {...defaultProps}
                        config={addressConfig}
                        defaultDisbursementInfo={disbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const addressInput = screen.getByTestId('address-input');
            expect(addressInput).toHaveValue('123 Main St');
        });

        it('should call setFormDisbursement when address changes', () => {
            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();
            const addressConfig = {
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
                        isAddressLine2Required: false,
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        setFormDisbursement,
                        bankDetails: createBankDetails(PaymentMailType.Check),
                    }}
                >
                    <CheckMethod
                        {...defaultProps}
                        config={addressConfig}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const addressInput = screen.getByTestId('address-input');
            fireEvent.change(addressInput, {
                target: { value: '456 Oak Ave' },
            });

            expect(setFormDisbursement).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });

        it('should update payee address in formDisbursement', () => {
            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();
            const addressConfig = {
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
                        isAddressLine2Required: false,
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        setFormDisbursement,
                        bankDetails: createBankDetails(PaymentMailType.Check),
                    }}
                >
                    <CheckMethod
                        {...defaultProps}
                        config={addressConfig}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const addressInput = screen.getByTestId('address-input');
            fireEvent.change(addressInput, {
                target: { value: '456 Oak Ave' },
            });

            const updateFn = setFormDisbursement.mock.calls[0][0];
            const prevState = {
                payee: {
                    address: { addressLine1: '123 Main St' },
                },
            };
            const result = updateFn(prevState);

            expect(result.payee.address.addressLine1).toBe('456 Oak Ave');
        });

        it('should call setDefaultDisbursementInfo when address changes', () => {
            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();
            const addressConfig = {
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
                        isAddressLine2Required: false,
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        setFormDisbursement,
                        bankDetails: createBankDetails(PaymentMailType.Check),
                    }}
                >
                    <CheckMethod
                        {...defaultProps}
                        config={addressConfig}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const addressInput = screen.getByTestId('address-input');
            fireEvent.change(addressInput, {
                target: { value: '456 Oak Ave' },
            });

            expect(setDefaultDisbursementInfo).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });

        it('should update payee address in defaultDisbursementInfo based on payment method', () => {
            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();
            const addressConfig = {
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
                        isAddressLine2Required: false,
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        setFormDisbursement,
                        bankDetails: createBankDetails(PaymentMailType.Check),
                    }}
                >
                    <CheckMethod
                        {...defaultProps}
                        config={addressConfig}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const addressInput = screen.getByTestId('address-input');
            fireEvent.change(addressInput, {
                target: { value: '456 Oak Ave' },
            });

            const updateFn = setDefaultDisbursementInfo.mock.calls[0][0];
            const prevState = {
                [PaymentMailType.Check]: {
                    payee: {
                        address: { addressLine1: '123 Main St' },
                    },
                },
            };
            const result = updateFn(prevState);

            expect(
                result[PaymentMailType.Check].payee.address.addressLine1
            ).toBe('456 Oak Ave');
        });

        it('should pass isPayeeAddress as true to AddressEntry', () => {
            const addressConfig = {
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
                        isAddressLine2Required: false,
                    },
                ],
            };

            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod {...defaultProps} config={addressConfig} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('is-payee-address')).toHaveTextContent(
                'true'
            );
        });

        it('should pass isAddressLine2Required from config to AddressEntry', () => {
            const addressConfig = {
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
                        isAddressLine2Required: true,
                    },
                ],
            };

            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod {...defaultProps} config={addressConfig} />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByTestId('is-address-line2-required')
            ).toHaveTextContent('true');
        });

        it('should apply classNames or default col-span-4 to address wrapper', () => {
            const addressConfig = {
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
                        isAddressLine2Required: false,
                    },
                ],
            };

            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod {...defaultProps} config={addressConfig} />
                </FormDataContext.Provider>
            );

            const addressWrapper =
                screen.getByTestId('address-entry').parentElement;
            expect(addressWrapper).toHaveClass('col-span-4');
        });

        it('should apply custom classNames when provided', () => {
            const addressConfig = {
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
                        isAddressLine2Required: false,
                    },
                ],
            };

            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod
                        {...defaultProps}
                        config={addressConfig}
                        classNames="custom-class"
                    />
                </FormDataContext.Provider>
            );

            const addressWrapper =
                screen.getByTestId('address-entry').parentElement;
            expect(addressWrapper).toHaveClass('custom-class');
        });
    });

    describe('Checkbox Field - handleCheckBoxChange', () => {
        it('should render checkbox with correct value from defaultDisbursementInfo', () => {
            const checkboxConfig = {
                fields: [
                    {
                        fieldType: 'checkbox',
                        fieldName: 'differentPayee',
                        fieldLabel: 'Different Payee',
                    },
                ],
            };

            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod
                        {...defaultProps}
                        config={checkboxConfig}
                        defaultDisbursementInfo={{
                            isDifferentPayeeOrAddress: { text: true },
                        }}
                    />
                </FormDataContext.Provider>
            );

            const checkbox = screen.getByTestId('differentPayee');
            expect(checkbox).toBeChecked();
        });

        it('should call setDefaultDisbursementInfo when checkbox is clicked', () => {
            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();
            const checkboxConfig = {
                fields: [
                    {
                        fieldType: 'checkbox',
                        fieldName: 'differentPayee',
                        fieldLabel: 'Different Payee',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        setFormDisbursement,
                    }}
                >
                    <CheckMethod
                        {...defaultProps}
                        config={checkboxConfig}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const checkbox = screen.getByTestId('differentPayee');
            fireEvent.click(checkbox);

            expect(setDefaultDisbursementInfo).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });

        it('should toggle isDifferentPayeeOrAddress from false to true', () => {
            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();
            const checkboxConfig = {
                fields: [
                    {
                        fieldType: 'checkbox',
                        fieldName: 'differentPayee',
                        fieldLabel: 'Different Payee',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        setFormDisbursement,
                    }}
                >
                    <CheckMethod
                        {...defaultProps}
                        config={checkboxConfig}
                        defaultDisbursementInfo={{
                            isDifferentPayeeOrAddress: { text: false },
                        }}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const checkbox = screen.getByTestId('differentPayee');
            fireEvent.click(checkbox);

            const updateFn = setDefaultDisbursementInfo.mock.calls[0][0];
            const prevState = {
                isDifferentPayeeOrAddress: { text: false },
            };
            const result = updateFn(prevState);

            expect(result.isDifferentPayeeOrAddress.text).toBe(true);
        });

        it('should toggle isDifferentPayeeOrAddress from true to false', () => {
            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();
            const checkboxConfig = {
                fields: [
                    {
                        fieldType: 'checkbox',
                        fieldName: 'differentPayee',
                        fieldLabel: 'Different Payee',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        setFormDisbursement,
                    }}
                >
                    <CheckMethod
                        {...defaultProps}
                        config={checkboxConfig}
                        defaultDisbursementInfo={{
                            isDifferentPayeeOrAddress: { text: true },
                        }}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const checkbox = screen.getByTestId('differentPayee');
            fireEvent.click(checkbox);

            const updateFn = setDefaultDisbursementInfo.mock.calls[0][0];
            const prevState = {
                isDifferentPayeeOrAddress: { text: true },
            };
            const result = updateFn(prevState);

            expect(result.isDifferentPayeeOrAddress.text).toBe(false);
        });

        it('should call setFormDisbursement when checkbox is clicked', () => {
            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();
            const checkboxConfig = {
                fields: [
                    {
                        fieldType: 'checkbox',
                        fieldName: 'differentPayee',
                        fieldLabel: 'Different Payee',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        setFormDisbursement,
                    }}
                >
                    <CheckMethod
                        {...defaultProps}
                        config={checkboxConfig}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const checkbox = screen.getByTestId('differentPayee');
            fireEvent.click(checkbox);

            expect(setFormDisbursement).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });

        it('should update isDifferentPayeeOrAddress in formDisbursement', () => {
            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();
            const checkboxConfig = {
                fields: [
                    {
                        fieldType: 'checkbox',
                        fieldName: 'differentPayee',
                        fieldLabel: 'Different Payee',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        setFormDisbursement,
                    }}
                >
                    <CheckMethod
                        {...defaultProps}
                        config={checkboxConfig}
                        defaultDisbursementInfo={{
                            isDifferentPayeeOrAddress: { text: false },
                        }}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const checkbox = screen.getByTestId('differentPayee');
            fireEvent.click(checkbox);

            const updateFn = setFormDisbursement.mock.calls[0][0];
            const prevState = {
                isDifferentPayeeOrAddress: { text: false },
            };
            const result = updateFn(prevState);

            expect(result.isDifferentPayeeOrAddress.text).toBe(true);
        });

        it('should pass classNames to BankCheckboxV2', () => {
            const checkboxConfig = {
                fields: [
                    {
                        fieldType: 'checkbox',
                        fieldName: 'differentPayee',
                        fieldLabel: 'Different Payee',
                    },
                ],
            };

            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod
                        {...defaultProps}
                        config={checkboxConfig}
                        classNames="checkbox-custom-class"
                    />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByTestId('checkbox-classnames-differentPayee')
            ).toHaveTextContent('checkbox-custom-class');
        });
    });

    describe('Read-only state', () => {
        it('should disable text input when isFormStateReadOnly is true', () => {
            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod {...defaultProps} isFormStateReadOnly={true} />
                </FormDataContext.Provider>
            );

            const textInput = screen.getByTestId('payeeName');
            expect(textInput).toBeDisabled();
        });

        it('should disable address input when isFormStateReadOnly is true', () => {
            const addressConfig = {
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
                        isAddressLine2Required: false,
                    },
                ],
            };

            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod
                        {...defaultProps}
                        config={addressConfig}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            const addressInput = screen.getByTestId('address-input');
            expect(addressInput).toBeDisabled();
        });

        it('should disable checkbox when isFormStateReadOnly is true', () => {
            const checkboxConfig = {
                fields: [
                    {
                        fieldType: 'checkbox',
                        fieldName: 'differentPayee',
                        fieldLabel: 'Different Payee',
                    },
                ],
            };

            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod
                        {...defaultProps}
                        config={checkboxConfig}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            const checkbox = screen.getByTestId('differentPayee');
            expect(checkbox).toBeDisabled();
        });
    });

    describe('Field classNames', () => {
        it('should apply field classNames to wrapper div', () => {
            const configWithClassNames = {
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'payeeName',
                        fieldLabel: 'Payee Name',
                        classNames: 'col-span-2 custom-class',
                    },
                ],
            };

            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod
                        {...defaultProps}
                        config={configWithClassNames}
                    />
                </FormDataContext.Provider>
            );

            const wrapper = screen.getByTestId(
                'text-field-payeeName'
            ).parentElement;
            expect(wrapper).toHaveClass('col-span-2', 'custom-class');
        });

        it('should handle empty classNames gracefully', () => {
            const configWithEmptyClassNames = {
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'payeeName',
                        fieldLabel: 'Payee Name',
                        classNames: '',
                    },
                ],
            };

            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod
                        {...defaultProps}
                        config={configWithEmptyClassNames}
                    />
                </FormDataContext.Provider>
            );

            const wrapper = screen.getByTestId(
                'text-field-payeeName'
            ).parentElement;
            expect(wrapper).toBeVisible();
        });
    });

    describe('Multiple fields rendering', () => {
        it('should render all field types together', () => {
            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod {...defaultProps} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('text-field-payeeName')).toBeVisible();
            expect(screen.getByTestId('address-entry')).toBeVisible();
            expect(
                screen.getByTestId('checkbox-field-differentPayee')
            ).toBeVisible();
        });

        it('should render multiple text fields', () => {
            const multiTextConfig = {
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'firstName',
                        fieldLabel: 'First Name',
                    },
                    {
                        fieldType: 'text',
                        fieldName: 'lastName',
                        fieldLabel: 'Last Name',
                    },
                ],
            };

            const multiFieldDisbursementInfo = {
                payee: {
                    firstName: { text: 'John' },
                    lastName: { text: 'Doe' },
                },
            };

            render(
                <FormDataContext.Provider value={defaultFormDataContext}>
                    <CheckMethod
                        {...defaultProps}
                        config={multiTextConfig}
                        defaultDisbursementInfo={multiFieldDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('text-field-firstName')).toBeVisible();
            expect(screen.getByTestId('text-field-lastName')).toBeVisible();
            expect(screen.getByTestId('firstName')).toHaveValue('John');
            expect(screen.getByTestId('lastName')).toHaveValue('Doe');
        });
    });
});
