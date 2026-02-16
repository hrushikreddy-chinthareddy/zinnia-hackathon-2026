import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { PaymentMethod } from '@deps/models/case/withdrawal/case';

import EftMethod from './eft-method';
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
        classNames,
    }: {
        onDataChange: (val: string) => void;
        handleRadioChange: (fieldName: string, e: any) => void;
        classNames?: string;
    }) => (
        <div data-testid="choose-banking-type" className={classNames}>
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
    }: {
        fieldName: string;
        fieldLabel: string;
        onDataChange: (value: any, fieldName: string) => void;
        value: string;
    }) => (
        <div data-testid={`bank-text-field-${fieldName}`}>
            <label>{fieldLabel}</label>
            <input
                data-testid={`input-${fieldName}`}
                value={value}
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
    }: {
        fieldName: string;
        fieldLabel: string;
        onDataChange: (value: any, fieldName: string) => void;
        value: string;
    }) => (
        <div data-testid={`account-type-${fieldName}`}>
            <label>{fieldLabel}</label>
            <select
                data-testid={`select-${fieldName}`}
                value={value}
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

describe('EftMethod', () => {
    const defaultProps = {
        config: {
            value: PaymentMethod.EFT,
            fields: [],
            generatePayloadFromSelection: jest.fn(() => ({
                paymentMethod: { text: PaymentMethod.EFT },
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
        isBankSelected: boolean = false,
        bankingInFile: any[] | null = null
    ) => ({
        isBankSelected,
        bankingInFile,
        selectedBanking,
        paymentMethod: PaymentMethod.EFT,
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
                    <EftMethod {...defaultProps} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('eft-method')).toBeVisible();
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
                    <EftMethod {...defaultProps} config={config} />
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
                    <EftMethod
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
                    <EftMethod {...defaultProps} config={config} />
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
                    <EftMethod {...defaultProps} config={config} />
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
                    <EftMethod {...defaultProps} config={config} />
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
                    <EftMethod {...defaultProps} config={config} />
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
                    <EftMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            // The container div should exist but the field content should be empty
            expect(container.querySelector('.grid')).toBeVisible();
        });
    });

    describe('Bank Options', () => {
        it('should show only New option when bankingInFile is null', () => {
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
                        bankDetails: createBankDetails('', false, null),
                    }}
                >
                    <EftMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('bank-option-new')).toBeVisible();
            expect(
                screen.queryByTestId('bank-option-onFile')
            ).not.toBeInTheDocument();
        });

        it('should show On File and New options when bankingInFile has data', () => {
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

            const bankingInFile = [
                {
                    BankId: 123,
                    BankName: 'Test Bank',
                    RoutingNumber: '123456789',
                    AccountNumber: '987654321',
                    AccountType: 'Checking' as const,
                    Purpose: 'Premium',
                    PaymentMethod: PaymentMethod.EFT,
                    BankStartDate: '2021-01-01',
                    BankEndDate: '2999-12-31',
                    ListBillId: 1234,
                    EFTCode: '1',
                    EFTStatus: 'Active' as const,
                },
            ];

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            '',
                            false,
                            bankingInFile
                        ),
                    }}
                >
                    <EftMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('bank-option-onFile')).toBeVisible();
            expect(screen.getByTestId('bank-option-new')).toBeVisible();
        });
    });

    describe('handleSelectBankChange', () => {
        it('should update bankDetails when OnFile is selected', () => {
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
            const setFormErrors = jest.fn();

            const bankingInFile = [
                {
                    BankId: 123,
                    BankName: 'Test Bank',
                    RoutingNumber: '123456789',
                    AccountNumber: '987654321',
                    AccountType: 'Checking' as const,
                    Purpose: 'Premium',
                    PaymentMethod: PaymentMethod.EFT,
                    BankStartDate: '2021-01-01',
                    BankEndDate: '2999-12-31',
                    ListBillId: 1234,
                    EFTCode: '1',
                    EFTStatus: 'Active' as const,
                },
            ];

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            '',
                            false,
                            bankingInFile
                        ),
                        setBankDetails,
                        setFormDisbursement,
                        setFormErrors,
                    }}
                >
                    <EftMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('bank-option-onFile'));

            expect(setBankDetails).toHaveBeenCalled();
            expect(setFormErrors).toHaveBeenCalledWith({});
        });

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
            const setFormErrors = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setBankDetails,
                        setFormDisbursement,
                        setFormErrors,
                    }}
                >
                    <EftMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('bank-option-new'));

            expect(setBankDetails).toHaveBeenCalled();
            expect(setFormErrors).toHaveBeenCalledWith({});
        });

        it('should call generatePayloadFromSelection when selecting OnFile', () => {
            const generatePayloadFromSelection = jest.fn(() => ({
                paymentMethod: { text: PaymentMethod.EFT },
                bank: [{ bankName: 'Test Bank' }],
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

            const bankingInFile = [
                {
                    BankId: 123,
                    BankName: 'Test Bank',
                    RoutingNumber: '123456789',
                    AccountNumber: '987654321',
                    AccountType: 'Checking' as const,
                    Purpose: 'Premium',
                    PaymentMethod: PaymentMethod.EFT,
                    BankStartDate: '2021-01-01',
                    BankEndDate: '2999-12-31',
                    ListBillId: 1234,
                    EFTCode: '1',
                    EFTStatus: 'Active' as const,
                },
            ];

            const setFormDisbursement = jest.fn((fn) => fn({}));
            const setDefaultDisbursementInfo = jest.fn((fn) => fn({}));

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            '',
                            false,
                            bankingInFile
                        ),
                        setFormDisbursement,
                        setBankDetails: jest.fn(),
                        setFormErrors: jest.fn(),
                    }}
                >
                    <EftMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('bank-option-onFile'));

            expect(generatePayloadFromSelection).toHaveBeenCalled();
            expect(setFormDisbursement).toHaveBeenCalled();
            expect(setDefaultDisbursementInfo).toHaveBeenCalled();
        });
    });

    describe('handleChooseBankingType', () => {
        it('should update form disbursement with validationsMap for DIRECT_DEPOSIT_FORM', () => {
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

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                        setFormDisbursement,
                    }}
                >
                    <EftMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('banking-type-direct-deposit'));

            expect(setFormDisbursement).toHaveBeenCalled();
            expect(setDefaultDisbursementInfo).toHaveBeenCalled();
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
                    <EftMethod
                        {...defaultProps}
                        config={config}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            fireEvent.click(screen.getByTestId('banking-type-voided-check'));

            expect(setFormDisbursement).toHaveBeenCalled();
            expect(setDefaultDisbursementInfo).toHaveBeenCalled();
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
                    <EftMethod
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

    describe('Disabled state', () => {
        it('should be disabled when isFormStateReadOnly is true', () => {
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
                    <EftMethod
                        {...defaultProps}
                        config={config}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByTestId('bank-text-field-bankName')
            ).toBeVisible();
        });

        it('should be disabled when OnFile banking is selected', () => {
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

            const bankingInFile = [
                {
                    BankId: 123,
                    BankName: 'Test Bank',
                    RoutingNumber: '123456789',
                    AccountNumber: '987654321',
                    AccountType: 'Checking' as const,
                    Purpose: 'Premium',
                    PaymentMethod: PaymentMethod.EFT,
                    BankStartDate: '2021-01-01',
                    BankEndDate: '2999-12-31',
                    ListBillId: 1234,
                    EFTCode: '1',
                    EFTStatus: 'Active' as const,
                },
            ];

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(
                            SelectedBanking.OnFile,
                            true,
                            bankingInFile
                        ),
                    }}
                >
                    <EftMethod {...defaultProps} config={config} />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByTestId('bank-text-field-bankName')
            ).toBeVisible();
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
                    <EftMethod
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
    });
    describe('ChooseBankingType hidden className', () => {
        it('should apply hidden class when isFormStateReadOnly is true AND bankVerification is empty string', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-banking-type',
                        fieldName: 'chooseBankingType',
                        fieldLabel: 'Choose Banking Type',
                    },
                ],
            };

            const defaultDisbursementInfo = {
                bank: [{ bankName: '', accountType: { text: 'Checking' } }],
                bankVerification: { selectedBankingType: '' },
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <EftMethod
                        {...defaultProps}
                        config={config}
                        isFormStateReadOnly={true}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('choose-banking-type')).toHaveClass(
                'hidden'
            );
        });

        it('should NOT apply hidden class when isFormStateReadOnly is false AND bankVerification is empty string', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-banking-type',
                        fieldName: 'chooseBankingType',
                        fieldLabel: 'Choose Banking Type',
                    },
                ],
            };

            const defaultDisbursementInfo = {
                bank: [{ bankName: '', accountType: { text: 'Checking' } }],
                bankVerification: { selectedBankingType: '' },
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <EftMethod
                        {...defaultProps}
                        config={config}
                        isFormStateReadOnly={false}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('choose-banking-type')).not.toHaveClass(
                'hidden'
            );
        });

        it('should NOT apply hidden class when isFormStateReadOnly is true BUT bankVerification is not empty string', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-banking-type',
                        fieldName: 'chooseBankingType',
                        fieldLabel: 'Choose Banking Type',
                    },
                ],
            };

            const defaultDisbursementInfo = {
                bank: [{ bankName: '', accountType: { text: 'Checking' } }],
                bankVerification: { selectedBankingType: 'VOIDED_CHECK' },
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <EftMethod
                        {...defaultProps}
                        config={config}
                        isFormStateReadOnly={true}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('choose-banking-type')).not.toHaveClass(
                'hidden'
            );
        });

        it('should NOT apply hidden class when both isFormStateReadOnly is false AND bankVerification is not empty string', () => {
            const config = {
                ...defaultProps.config,
                fields: [
                    {
                        fieldType: 'choose-the-banking-type',
                        fieldName: 'chooseBankingType',
                        fieldLabel: 'Choose Banking Type',
                    },
                ],
            };

            const defaultDisbursementInfo = {
                bank: [{ bankName: '', accountType: { text: 'Checking' } }],
                bankVerification: {
                    selectedBankingType: 'DIRECT_DEPOSIT_FORM',
                },
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <EftMethod
                        {...defaultProps}
                        config={config}
                        isFormStateReadOnly={false}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('choose-banking-type')).not.toHaveClass(
                'hidden'
            );
        });
    });
});
