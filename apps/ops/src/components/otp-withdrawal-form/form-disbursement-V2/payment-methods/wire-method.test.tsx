import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { PaymentMethod } from '@deps/models/case/withdrawal/case';

import WireMethod from './wire-method';
import { SelectedBanking } from '../form-disbursement.types';

// Mock child components
jest.mock('../choose-bank', () => {
    const ChooseBankMock = ({
        onDataChange,
        selectedValue,
        bankOptions,
    }: {
        onDataChange: (val: string) => void;
        selectedValue: string;
        bankOptions: { label: string; value: string }[];
    }) => (
        <div data-testid="choose-bank">
            <span data-testid="selected-value">{selectedValue}</span>
            {bankOptions.map((option) => (
                <button
                    key={option.value}
                    data-testid={`bank-option-${option.value}`}
                    onClick={() => onDataChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
    ChooseBankMock.displayName = 'ChooseBankMock';
    return ChooseBankMock;
});

jest.mock('../choose-banking-type', () => {
    const ChooseBankingTypeMock = ({
        onDataChange,
        handleRadioChange,
        isFormStateReadOnly,
    }: {
        onDataChange: (val: string) => void;
        handleRadioChange: (fieldName: string, e: any) => void;
        isFormStateReadOnly: boolean;
    }) => (
        <div data-testid="choose-banking-type">
            <span data-testid="read-only-status">
                {isFormStateReadOnly ? 'read-only' : 'editable'}
            </span>
            <button
                data-testid="banking-type-voided-check"
                onClick={() => onDataChange('VOIDED_CHECK')}
            >
                Voided Check
            </button>
            <button
                data-testid="banking-type-direct-deposit"
                onClick={() => onDataChange('DIRECT_DEPOSIT_FORM')}
            >
                Direct Deposit
            </button>
            <button
                data-testid="banking-type-starter-check"
                onClick={() => onDataChange('STARTER_CHECK')}
            >
                Starter Check
            </button>
            <button
                data-testid="banking-type-no-proof"
                onClick={() => onDataChange('NO_BANK_PROOF')}
            >
                No Bank Proof
            </button>
            <button
                data-testid="radio-change-trigger"
                onClick={() =>
                    handleRadioChange('testField', { target: { value: 'yes' } })
                }
            >
                Radio Change
            </button>
        </div>
    );
    ChooseBankingTypeMock.displayName = 'ChooseBankingTypeMock';
    return ChooseBankingTypeMock;
});

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

jest.mock('../account-type-v2', () => {
    const AccountTypesV2Mock = ({
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
        <div data-testid={`account-type-${fieldName}`}>
            <label>{fieldLabel}</label>
            <select
                data-testid={`select-${fieldName}`}
                value={value}
                disabled={isFormStateReadOnly}
                onChange={(e) => onDataChange(e.target.value, fieldName)}
            >
                <option value="Checking">Checking</option>
                <option value="Savings">Savings</option>
            </select>
        </div>
    );
    AccountTypesV2Mock.displayName = 'AccountTypesV2Mock';
    return AccountTypesV2Mock;
});

describe('WireMethod', () => {
    const defaultProps = {
        config: {
            value: PaymentMethod.Wire,
            fields: [],
            generatePayloadFromSelection: jest.fn(() => ({
                paymentMethod: { text: PaymentMethod.Wire },
                bank: [{ bankName: 'Test Bank' }],
            })),
        },
        isFormStateReadOnly: false,
        onDataChange: jest.fn(),
        defaultDisbursementInfo: {
            bank: [{ bankName: '', accountType: { text: 'Checking' } }],
            bankVerification: { selectedBankingType: '' },
        },
        setDefaultDisbursementInfo: jest.fn(),
    };

    const createBankDetails = (
        selectedBanking: SelectedBanking | '' = '',
        paymentMethod: PaymentMethod = PaymentMethod.Wire
    ) => ({
        isBankSelected: false,
        bankingInFile: null,
        selectedBanking,
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
                    <WireMethod {...defaultProps} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('wire-method')).toBeVisible();
        });

        it('should render choose-the-bank field when config has it', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-bank',
                        fieldName: 'selectBank',
                        fieldLabel: 'Select Bank',
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
                    <WireMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('choose-bank')).toBeVisible();
        });

        it('should not render choose-the-bank when isFormStateReadOnly is true', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-bank',
                        fieldName: 'selectBank',
                        fieldLabel: 'Select Bank',
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
                    <WireMethod
                        {...defaultProps}
                        config={config}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.queryByTestId('choose-bank')).not.toBeInTheDocument();
        });

        it('should render choose-the-banking-type field', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-banking-type',
                        fieldName: 'bankingType',
                        fieldLabel: 'Banking Type',
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
                    <WireMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('choose-banking-type')).toBeVisible();
        });

        it('should render text field', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'bankName',
                        fieldLabel: 'Bank Name',
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
                    <WireMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByTestId('bank-text-field-bankName')
            ).toBeVisible();
        });

        it('should render account-type field', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'account-type',
                        fieldName: 'accountType',
                        fieldLabel: 'Account Type',
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
                    <WireMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByTestId('account-type-accountType')
            ).toBeVisible();
        });

        it('should render multiple fields from config', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'bankName',
                        fieldLabel: 'Bank Name',
                    },
                    {
                        fieldType: 'text',
                        fieldName: 'routingNumber',
                        fieldLabel: 'Routing Number',
                    },
                    {
                        fieldType: 'account-type',
                        fieldName: 'accountType',
                        fieldLabel: 'Account Type',
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
                    <WireMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByTestId('bank-text-field-bankName')
            ).toBeVisible();
            expect(
                screen.getByTestId('bank-text-field-routingNumber')
            ).toBeVisible();
            expect(
                screen.getByTestId('account-type-accountType')
            ).toBeVisible();
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
                    <WireMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(container.querySelector('.grid')).toBeVisible();
        });
    });

    describe('Bank Options', () => {
        it('should only show New option (Wire does not support OnFile)', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-bank',
                        fieldName: 'selectBank',
                        fieldLabel: 'Select Bank',
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
                    <WireMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('bank-option-new')).toBeVisible();
            expect(
                screen.queryByTestId('bank-option-onFile')
            ).not.toBeInTheDocument();
        });
    });

    describe('handleChooseBankChange', () => {
        it('should update bankDetails when New is selected', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-bank',
                        fieldName: 'selectBank',
                        fieldLabel: 'Select Bank',
                    },
                ],
            };

            const setBankDetails = jest.fn();
            const setFormDisbursement = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setBankDetails,
                        setFormDisbursement,
                    }}
                >
                    <WireMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('bank-option-new'));

            expect(setBankDetails).toHaveBeenCalled();
        });

        it('should call generatePayloadFromSelection when selecting New', () => {
            const generatePayloadFromSelection = jest.fn(() => ({
                paymentMethod: { text: PaymentMethod.Wire },
                bank: [{ bankName: 'New Wire Bank' }],
            }));

            const config = {
                ...defaultProps.config,
                generatePayloadFromSelection,
                fields: [
                    {
                        fieldType: 'choose-the-bank',
                        fieldName: 'selectBank',
                        fieldLabel: 'Select Bank',
                    },
                ],
            };

            const setFormDisbursement = jest.fn((fn) => fn({}));
            const setDefaultDisbursementInfo = jest.fn((fn) => fn({}));

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setFormDisbursement,
                        setBankDetails: jest.fn(),
                    }}
                >
                    <WireMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('bank-option-new'));

            expect(generatePayloadFromSelection).toHaveBeenCalled();
            expect(setFormDisbursement).toHaveBeenCalled();
            expect(setDefaultDisbursementInfo).toHaveBeenCalled();
        });

        it('should set isBankSelected to false when New is selected', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-bank',
                        fieldName: 'selectBank',
                        fieldLabel: 'Select Bank',
                    },
                ],
            };

            let capturedUpdater: ((pv: any) => any) | null = null;
            const setBankDetails = jest.fn((updater) => {
                capturedUpdater = updater;
            });

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setBankDetails,
                        setFormDisbursement: jest.fn(),
                    }}
                >
                    <WireMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('bank-option-new'));

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({
                isBankSelected: true,
                selectedBanking: '',
            });
            expect(result.isBankSelected).toBe(false);
            expect(result.selectedBanking).toBe(SelectedBanking.New);
        });
    });

    describe('handleChooseBankingType', () => {
        it('should update form disbursement with noAdditionalValidationRequired for DIRECT_DEPOSIT_FORM', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-banking-type',
                        fieldName: 'bankingType',
                        fieldLabel: 'Banking Type',
                    },
                ],
            };

            let capturedUpdater: ((pv: any) => any) | null = null;
            const setFormDisbursement = jest.fn((updater) => {
                capturedUpdater = updater;
            });
            const setDefaultDisbursementInfo = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setFormDisbursement,
                    }}
                >
                    <WireMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('banking-type-direct-deposit'));

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({ bankVerification: {} });
            expect(
                result.bankVerification.validationsMap['DIRECT_DEPOSIT_FORM']
                    .noAdditionalValidationRequired
            ).toBe(true);
        });

        it('should update form disbursement with noAdditionalValidationRequired for STARTER_CHECK', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-banking-type',
                        fieldName: 'bankingType',
                        fieldLabel: 'Banking Type',
                    },
                ],
            };

            let capturedUpdater: ((pv: any) => any) | null = null;
            const setFormDisbursement = jest.fn((updater) => {
                capturedUpdater = updater;
            });
            const setDefaultDisbursementInfo = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setFormDisbursement,
                    }}
                >
                    <WireMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('banking-type-starter-check'));

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({ bankVerification: {} });
            expect(
                result.bankVerification.validationsMap['STARTER_CHECK']
                    .noAdditionalValidationRequired
            ).toBe(true);
        });

        it('should update form disbursement with noAdditionalValidationRequired for NO_BANK_PROOF', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-banking-type',
                        fieldName: 'bankingType',
                        fieldLabel: 'Banking Type',
                    },
                ],
            };

            let capturedUpdater: ((pv: any) => any) | null = null;
            const setFormDisbursement = jest.fn((updater) => {
                capturedUpdater = updater;
            });
            const setDefaultDisbursementInfo = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setFormDisbursement,
                    }}
                >
                    <WireMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('banking-type-no-proof'));

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({ bankVerification: {} });
            expect(
                result.bankVerification.validationsMap['NO_BANK_PROOF']
                    .noAdditionalValidationRequired
            ).toBe(true);
        });

        it('should update form disbursement without noAdditionalValidationRequired for VOIDED_CHECK', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-banking-type',
                        fieldName: 'bankingType',
                        fieldLabel: 'Banking Type',
                    },
                ],
            };

            let capturedUpdater: ((pv: any) => any) | null = null;
            const setFormDisbursement = jest.fn((updater) => {
                capturedUpdater = updater;
            });
            const setDefaultDisbursementInfo = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setFormDisbursement,
                    }}
                >
                    <WireMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('banking-type-voided-check'));

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({ bankVerification: {} });
            expect(result.bankVerification.selectedBankingType).toBe(
                'VOIDED_CHECK'
            );
            expect(result.bankVerification.validationsMap).toBeUndefined();
        });
    });

    describe('handleChooseBankingRadioChange', () => {
        it('should update validationsMap when radio changes', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-banking-type',
                        fieldName: 'bankingType',
                        fieldLabel: 'Banking Type',
                    },
                ],
            };

            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();

            const defaultDisbursementInfo = {
                bank: [{ bankName: '', accountType: { text: 'Checking' } }],
                bankVerification: { selectedBankingType: 'VOIDED_CHECK' },
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setFormDisbursement,
                    }}
                >
                    <WireMethod
                        {...defaultProps}
                        config={config}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('radio-change-trigger'));

            expect(setFormDisbursement).toHaveBeenCalled();
            expect(setDefaultDisbursementInfo).toHaveBeenCalled();
        });
    });

    describe('Read-only state', () => {
        it('should pass isFormStateReadOnly to choose-banking-type', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-banking-type',
                        fieldName: 'bankingType',
                        fieldLabel: 'Banking Type',
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
                    <WireMethod
                        {...defaultProps}
                        config={config}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('read-only-status')).toHaveTextContent(
                'read-only'
            );
        });

        it('should pass isFormStateReadOnly to text fields', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'bankName',
                        fieldLabel: 'Bank Name',
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
                    <WireMethod
                        {...defaultProps}
                        config={config}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('input-bankName')).toBeDisabled();
        });

        it('should pass isFormStateReadOnly to account-type field', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'account-type',
                        fieldName: 'accountType',
                        fieldLabel: 'Account Type',
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
                    <WireMethod
                        {...defaultProps}
                        config={config}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('select-accountType')).toBeDisabled();
        });
    });

    describe('classNames prop', () => {
        it('should apply classNames to choose-the-bank wrapper', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-bank',
                        fieldName: 'selectBank',
                        fieldLabel: 'Select Bank',
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
                    <WireMethod
                        {...defaultProps}
                        config={config}
                        classNames="custom-class"
                    />
                </FormDataContext.Provider>
            );

            const chooseBankWrapper =
                screen.getByTestId('choose-bank').parentElement;
            expect(chooseBankWrapper).toHaveClass('custom-class');
        });

        it('should apply classNames to choose-the-banking-type wrapper', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-banking-type',
                        fieldName: 'bankingType',
                        fieldLabel: 'Banking Type',
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
                    <WireMethod
                        {...defaultProps}
                        config={config}
                        classNames="custom-banking-class"
                    />
                </FormDataContext.Provider>
            );

            const chooseBankingTypeWrapper = screen.getByTestId(
                'choose-banking-type'
            ).parentElement;
            expect(chooseBankingTypeWrapper).toHaveClass(
                'custom-banking-class'
            );
        });
    });

    describe('Field values', () => {
        it('should display bank name from defaultDisbursementInfo', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'bankName',
                        fieldLabel: 'Bank Name',
                    },
                ],
            };

            const defaultDisbursementInfo = {
                bank: [
                    {
                        bankName: 'Wire Bank Name',
                        accountType: { text: 'Checking' },
                    },
                ],
                bankVerification: { selectedBankingType: '' },
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <WireMethod
                        {...defaultProps}
                        config={config}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('input-bankName')).toHaveValue(
                'Wire Bank Name'
            );
        });

        it('should display account type from defaultDisbursementInfo', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'account-type',
                        fieldName: 'accountType',
                        fieldLabel: 'Account Type',
                    },
                ],
            };

            const defaultDisbursementInfo = {
                bank: [{ bankName: '', accountType: { text: 'Savings' } }],
                bankVerification: { selectedBankingType: '' },
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <WireMethod
                        {...defaultProps}
                        config={config}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('select-accountType')).toHaveValue(
                'Savings'
            );
        });
    });
});
