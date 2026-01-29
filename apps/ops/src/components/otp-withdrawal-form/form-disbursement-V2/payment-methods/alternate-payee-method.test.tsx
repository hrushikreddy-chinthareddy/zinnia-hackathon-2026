import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { PaymentMethod } from '@deps/models/case/withdrawal/case';

import AlternatePayeeMethod from './alternate-payee-method';
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
        isAddressLine2Required,
    }: {
        onDataChange: (val: any) => void;
        isFormStateReadOnly: boolean;
        initialAddress: any;
        isAddressLine2Required?: boolean;
    }) => (
        <div data-testid="address-entry">
            <span data-testid="address-read-only">
                {isFormStateReadOnly ? 'read-only' : 'editable'}
            </span>
            <span data-testid="initial-address">
                {JSON.stringify(initialAddress)}
            </span>
            <span data-testid="address-line2-required">
                {isAddressLine2Required ? 'required' : 'not-required'}
            </span>
            <button
                type="button"
                data-testid="update-address-btn"
                onClick={() =>
                    onDataChange({
                        line1: '456 Payee Street',
                        city: 'Payee City',
                        state: 'CA',
                        zip: '90210',
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

describe('AlternatePayeeMethod', () => {
    const defaultProps = {
        config: {
            value: PaymentMethod.AlternatePayeeAddress,
            fields: [],
        },
        isFormStateReadOnly: false,
        defaultDisbursementInfo: {
            payee: {
                name: { text: '' },
                contractNumber: { text: '' },
                fboDetails: { text: '' },
                taxId: { text: '' },
            },
            brokerage: {},
            address: null,
        },
        setDefaultDisbursementInfo: jest.fn(),
    };

    const createBankDetails = (
        paymentMethod: PaymentMethod | '' = '',
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
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                    }}
                >
                    <AlternatePayeeMethod {...defaultProps} />
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
                        fieldName: 'name',
                        fieldLabel: 'Payee Name',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                    }}
                >
                    <AlternatePayeeMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('bank-text-field-name')).toBeVisible();
        });

        it('should render address field when config has it', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
                        fieldLabel: 'Payee Address',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                    }}
                >
                    <AlternatePayeeMethod {...defaultProps} config={config} />
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
                        fieldName: 'someCheckbox',
                        fieldLabel: 'Some Checkbox',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                    }}
                >
                    <AlternatePayeeMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByTestId('bank-checkbox-someCheckbox')
            ).toBeVisible();
        });

        it('should render multiple fields from config', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'name',
                        fieldLabel: 'Payee Name',
                    },
                    {
                        fieldType: 'text',
                        fieldName: 'contractNumber',
                        fieldLabel: 'Contract Number',
                    },
                    {
                        fieldType: 'text',
                        fieldName: 'taxId',
                        fieldLabel: 'Tax ID',
                    },
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
                        fieldLabel: 'Address',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                    }}
                >
                    <AlternatePayeeMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('bank-text-field-name')).toBeVisible();
            expect(
                screen.getByTestId('bank-text-field-contractNumber')
            ).toBeVisible();
            expect(screen.getByTestId('bank-text-field-taxId')).toBeVisible();
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
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                    }}
                >
                    <AlternatePayeeMethod {...defaultProps} config={config} />
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
                        fieldName: 'name',
                        fieldLabel: 'Payee Name',
                    },
                ],
            };

            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                        setFormDisbursement,
                    }}
                >
                    <AlternatePayeeMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const input = screen.getByTestId('input-name');
            fireEvent.change(input, { target: { value: 'John Doe' } });

            expect(setFormDisbursement).toHaveBeenCalled();
            expect(setDefaultDisbursementInfo).toHaveBeenCalled();
        });

        it('should convert name field to uppercase', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'name',
                        fieldLabel: 'Payee Name',
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
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                        setFormDisbursement,
                    }}
                >
                    <AlternatePayeeMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            const input = screen.getByTestId('input-name');
            fireEvent.change(input, { target: { value: 'john doe' } });

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({ payee: {} });
            expect(result.payee.name.text).toBe('JOHN DOE');
        });

        it('should convert contractNumber field to uppercase', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'contractNumber',
                        fieldLabel: 'Contract Number',
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
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                        setFormDisbursement,
                    }}
                >
                    <AlternatePayeeMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            const input = screen.getByTestId('input-contractNumber');
            fireEvent.change(input, { target: { value: 'abc123' } });

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({ payee: {} });
            expect(result.payee.contractNumber.text).toBe('ABC123');
        });

        it('should convert fboDetails field to uppercase', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'fboDetails',
                        fieldLabel: 'FBO Details',
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
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                        setFormDisbursement,
                    }}
                >
                    <AlternatePayeeMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            const input = screen.getByTestId('input-fboDetails');
            fireEvent.change(input, { target: { value: 'fbo info' } });

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({ payee: {} });
            expect(result.payee.fboDetails.text).toBe('FBO INFO');
        });

        it('should NOT convert taxId field to uppercase', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'taxId',
                        fieldLabel: 'Tax ID',
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
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                        setFormDisbursement,
                    }}
                >
                    <AlternatePayeeMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            const input = screen.getByTestId('input-taxId');
            fireEvent.change(input, { target: { value: '123-45-6789' } });

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({ payee: {} });
            expect(result.payee.taxId.text).toBe('123-45-6789');
        });

        it('should correctly update defaultDisbursementInfo with payment method key', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'name',
                        fieldLabel: 'Payee Name',
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
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                        setFormDisbursement: jest.fn(),
                    }}
                >
                    <AlternatePayeeMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const input = screen.getByTestId('input-name');
            fireEvent.change(input, { target: { value: 'test payee' } });

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({
                [PaymentMethod.AlternatePayeeAddress]: {
                    payee: {},
                },
            });
            expect(
                result[PaymentMethod.AlternatePayeeAddress].payee.name.text
            ).toBe('TEST PAYEE');
        });
    });

    describe('handleAddressChange', () => {
        it('should update formDisbursement when address changes', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
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
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                        setFormDisbursement,
                    }}
                >
                    <AlternatePayeeMethod
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

        it('should correctly update payee address in formDisbursement', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
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
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                        setFormDisbursement,
                    }}
                >
                    <AlternatePayeeMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('update-address-btn'));

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({
                payee: { address: null },
                brokerage: {},
            });
            expect(result.payee.address).toEqual({
                line1: '456 Payee Street',
                city: 'Payee City',
                state: 'CA',
                zip: '90210',
            });
        });

        it('should correctly update defaultDisbursementInfo with address', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
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
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                        setFormDisbursement: jest.fn(),
                    }}
                >
                    <AlternatePayeeMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('update-address-btn'));

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({
                [PaymentMethod.AlternatePayeeAddress]: {
                    payee: { address: null },
                },
            });
            expect(
                result[PaymentMethod.AlternatePayeeAddress].payee.address
            ).toEqual({
                line1: '456 Payee Street',
                city: 'Payee City',
                state: 'CA',
                zip: '90210',
            });
        });

        it('should pass isAddressLine2Required to AddressEntry', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
                        fieldLabel: 'Address',
                        isAddressLine2Required: true,
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                    }}
                >
                    <AlternatePayeeMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByTestId('address-line2-required')
            ).toHaveTextContent('required');
        });
    });

    describe('Checkbox handling', () => {
        it('should update formDisbursement when checkbox changes', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'checkbox',
                        fieldName: 'someCheckbox',
                        fieldLabel: 'Some Checkbox',
                    },
                ],
            };

            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                        setFormDisbursement,
                    }}
                >
                    <AlternatePayeeMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const checkbox = screen.getByTestId('checkbox-someCheckbox');
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
                        fieldName: 'name',
                        fieldLabel: 'Payee Name',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                    }}
                >
                    <AlternatePayeeMethod
                        {...defaultProps}
                        config={config}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('input-name')).toBeDisabled();
        });

        it('should pass isFormStateReadOnly to checkbox fields', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'checkbox',
                        fieldName: 'someCheckbox',
                        fieldLabel: 'Some Checkbox',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                    }}
                >
                    <AlternatePayeeMethod
                        {...defaultProps}
                        config={config}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('checkbox-someCheckbox')).toBeDisabled();
        });

        it('should pass isFormStateReadOnly to address entry', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
                        fieldLabel: 'Address',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                    }}
                >
                    <AlternatePayeeMethod
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
        it('should display payee name from defaultDisbursementInfo', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'name',
                        fieldLabel: 'Payee Name',
                    },
                ],
            };

            const defaultDisbursementInfo = {
                payee: {
                    name: { text: 'EXISTING PAYEE' },
                },
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                    }}
                >
                    <AlternatePayeeMethod
                        {...defaultProps}
                        config={config}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('input-name')).toHaveValue(
                'EXISTING PAYEE'
            );
        });

        it('should display empty string when payee field text is undefined', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'name',
                        fieldLabel: 'Payee Name',
                    },
                ],
            };

            const defaultDisbursementInfo = {
                payee: {
                    name: {},
                },
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                    }}
                >
                    <AlternatePayeeMethod
                        {...defaultProps}
                        config={config}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('input-name')).toHaveValue('');
        });

        it('should display empty string when payee is undefined', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'name',
                        fieldLabel: 'Payee Name',
                    },
                ],
            };

            const defaultDisbursementInfo = {
                payee: undefined,
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                    }}
                >
                    <AlternatePayeeMethod
                        {...defaultProps}
                        config={config}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('input-name')).toHaveValue('');
        });
    });

    describe('classNames prop', () => {
        it('should apply classNames to address wrapper', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'address',
                        fieldName: 'payeeAddress',
                        fieldLabel: 'Address',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                    }}
                >
                    <AlternatePayeeMethod
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
                        fieldName: 'payeeAddress',
                        fieldLabel: 'Address',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            PaymentMethod.AlternatePayeeAddress,
                            SelectedBanking.OnFile
                        ),
                    }}
                >
                    <AlternatePayeeMethod
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
