import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import { AccountType, PaymentMethod } from '@deps/models/case/withdrawal/case';

import DtccMethod from './dtcc-method';
import { BankingFields } from '../../form-disbursement/form-disbursement.helpers';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

// Mock the BankTextFieldV2 component to expose props for testing
jest.mock('../bank-text-field-v2', () => ({
    __esModule: true,
    default: ({
        fieldName,
        fieldLabel,
        onDataChange,
        value,
        isFormStateReadOnly,
        isBankingField,
        error,
        validator,
    }: any) => (
        <div data-testid={`text-field-wrapper-${fieldName}`}>
            <label htmlFor={fieldName}>{fieldLabel}</label>
            <input
                id={fieldName}
                data-testid={fieldName}
                value={value}
                onChange={(e) => onDataChange(e.target.value, fieldName)}
                disabled={isFormStateReadOnly}
            />
            <span data-testid={`is-banking-field-${fieldName}`}>
                {isBankingField ? 'true' : 'false'}
            </span>
            <span data-testid={`error-${fieldName}`}>{error || ''}</span>
            <span data-testid={`has-validator-${fieldName}`}>
                {validator ? 'true' : 'false'}
            </span>
        </div>
    ),
}));

// Mock the DtccSelectParticipantId component since Autocomplete doesn't support data-testid
jest.mock('../dtcc-select-participant-id', () => ({
    __esModule: true,
    default: ({
        fieldName,
        fieldLabel,
        onDataChange,
        value,
        isFormStateReadOnly,
    }: any) => (
        <div data-testid={`select-field-wrapper-${fieldName}`}>
            <label htmlFor={fieldName}>{fieldLabel}</label>
            <select
                id={fieldName}
                data-testid={fieldName}
                value={value}
                onChange={(e) => onDataChange(e.target.value)}
                disabled={isFormStateReadOnly}
            >
                <option value="">Select</option>
                <option value="0443">Test Company</option>
                <option value="PARTICIPANT_002">Participant 002</option>
            </select>
        </div>
    ),
}));

afterEach(() => {
    jest.clearAllMocks();
});

describe('DtccMethod Component', () => {
    const mockSetFormDisbursement = jest.fn();
    const mockSetDefaultDisbursementInfo = jest.fn();

    const defaultFormDisbursement = {
        paymentMethod: { text: PaymentMethod.DTCC },
        paymentMailType: { text: null },
        bank: [
            {
                accountNumber: '',
                accountType: { text: AccountType.Checking },
                bankContactPerson: '',
                bankFurtherCreditAccount: '',
                bankFurtherCreditName: '',
                bankInfoCompleteInd: '',
                bankLocation: '',
                bankName: '',
                bankPhone: '',
                nameOnBankAccount: '',
                routingNumber: '',
                maskedAccountNumber: null,
                isDirectDeposit: { text: true },
            },
        ],
        paymentToBrokerageAccount: false,
        brokerage: null,
        payeeType: '',
        voidCheck: null,
        doesCheckMeetSecRequiremnt: null,
        participantId: { text: null },
        payee: {
            name: { text: null },
            addresses: [],
            contractNumber: { text: null },
        },
        upsAccount: null,
        emailDeliveryNotification: { text: false },
        isDifferentPayeeOrAddress: { text: false },
    };

    const defaultBankDetails = {
        paymentMethod: PaymentMethod.DTCC,
        isBankSelected: false,
        bankingInFile: null,
        selectedBanking: '',
    };

    const defaultConfig = {
        fields: [
            {
                fieldName: 'name',
                fieldLabel: 'Payee Name',
                fieldType: 'text',
                classNames: 'col-start-1',
            },
            {
                fieldName: BankingFields.ParticipantId,
                fieldLabel: 'Participant ID',
                fieldType: 'select',
                classNames: 'col-start-2',
            },
            {
                fieldName: BankingFields.ContractNumber,
                fieldLabel: 'Contract Number',
                fieldType: 'text',
                classNames: 'col-start-1',
                error: 'Contract number is required',
                validator: () => true,
            },
        ],
    };

    const defaultDisbursementInfo = {
        payee: {
            name: { text: 'Test Payee Name' },
            contractNumber: { text: 'CONTRACT-123' },
        },
        participantId: { text: '0443' },
    };

    const renderComponent = (overrides = {}) => {
        const contextValue = {
            ...defaultFormDataContext,
            formDisbursement: defaultFormDisbursement,
            bankDetails: defaultBankDetails,
            setFormDisbursement: mockSetFormDisbursement,
            ...overrides,
        };

        return render(
            <FormDataContext.Provider value={contextValue as any}>
                <DtccMethod
                    config={defaultConfig}
                    isFormStateReadOnly={false}
                    defaultDisbursementInfo={defaultDisbursementInfo}
                    setDefaultDisbursementInfo={mockSetDefaultDisbursementInfo}
                />
            </FormDataContext.Provider>
        );
    };

    beforeEach(() => {
        mockSetFormDisbursement.mockClear();
        mockSetDefaultDisbursementInfo.mockClear();
    });

    describe('Rendering', () => {
        it('should render a form element with correct grid classes', () => {
            const { container } = renderComponent();

            const form = container.querySelector('form');
            expect(form).toBeVisible();
            expect(form).toHaveClass('grid', 'grid-cols-3', 'gap-4', 'mt-4');
        });

        it('should render all configured fields', () => {
            renderComponent();

            expect(screen.getByTestId('name')).toBeVisible();
            expect(
                screen.getByTestId(BankingFields.ParticipantId)
            ).toBeVisible();
            expect(
                screen.getByTestId(BankingFields.ContractNumber)
            ).toBeVisible();
        });

        it('should render text field when config has text field type', () => {
            renderComponent();

            expect(screen.getByTestId('text-field-wrapper-name')).toBeVisible();
            expect(screen.getByTestId('name')).toBeVisible();
        });

        it('should render select field when config has select field type', () => {
            renderComponent();

            expect(
                screen.getByTestId(
                    `select-field-wrapper-${BankingFields.ParticipantId}`
                )
            ).toBeVisible();
            expect(
                screen.getByTestId(BankingFields.ParticipantId)
            ).toBeVisible();
        });

        it('should not render any fields when config.fields is empty', () => {
            render(
                <FormDataContext.Provider
                    value={
                        {
                            ...defaultFormDataContext,
                            formDisbursement: defaultFormDisbursement,
                            bankDetails: defaultBankDetails,
                            setFormDisbursement: mockSetFormDisbursement,
                        } as any
                    }
                >
                    <DtccMethod
                        config={{ fields: [] }}
                        isFormStateReadOnly={false}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        setDefaultDisbursementInfo={
                            mockSetDefaultDisbursementInfo
                        }
                    />
                </FormDataContext.Provider>
            );

            expect(
                screen.queryByTestId('text-field-wrapper-name')
            ).not.toBeInTheDocument();
            expect(
                screen.queryByTestId(
                    `select-field-wrapper-${BankingFields.ParticipantId}`
                )
            ).not.toBeInTheDocument();
        });

        it('should not render any fields when config.fields is undefined', () => {
            render(
                <FormDataContext.Provider
                    value={
                        {
                            ...defaultFormDataContext,
                            formDisbursement: defaultFormDisbursement,
                            bankDetails: defaultBankDetails,
                            setFormDisbursement: mockSetFormDisbursement,
                        } as any
                    }
                >
                    <DtccMethod
                        config={{}}
                        isFormStateReadOnly={false}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        setDefaultDisbursementInfo={
                            mockSetDefaultDisbursementInfo
                        }
                    />
                </FormDataContext.Provider>
            );

            expect(
                screen.queryByTestId('text-field-wrapper-name')
            ).not.toBeInTheDocument();
        });

        it('should return null for unknown field types', () => {
            const configWithUnknownField = {
                fields: [
                    {
                        fieldType: 'unknown-type',
                        fieldName: 'unknownField',
                        fieldLabel: 'Unknown',
                        classNames: '',
                    },
                ],
            };

            const { container } = render(
                <FormDataContext.Provider
                    value={
                        {
                            ...defaultFormDataContext,
                            formDisbursement: defaultFormDisbursement,
                            bankDetails: defaultBankDetails,
                            setFormDisbursement: mockSetFormDisbursement,
                        } as any
                    }
                >
                    <DtccMethod
                        config={configWithUnknownField}
                        isFormStateReadOnly={false}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        setDefaultDisbursementInfo={
                            mockSetDefaultDisbursementInfo
                        }
                    />
                </FormDataContext.Provider>
            );

            // The div wrapper is rendered but no child content
            const form = container.querySelector('form');
            expect(form?.children.length).toBe(1);
            expect(form?.children[0].children.length).toBe(0);
        });
    });

    describe('Text Field Changes - handleTextChange', () => {
        it('should call setFormDisbursement when text field value changes', () => {
            renderComponent();

            const nameField = screen.getByTestId('name');
            fireEvent.change(nameField, { target: { value: 'New Payee' } });

            expect(mockSetFormDisbursement).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });

        it('should update formDisbursement.payee when text field changes', () => {
            renderComponent();

            const nameField = screen.getByTestId('name');
            fireEvent.change(nameField, { target: { value: 'Test Payee' } });

            expect(mockSetFormDisbursement).toHaveBeenCalled();

            // Get the updater function passed to setFormDisbursement
            const updaterFn = mockSetFormDisbursement.mock.calls[0][0];
            const previousState = {
                ...defaultFormDisbursement,
                payee: { name: { text: '' } },
                bank: [{ accountNumber: '' }],
            };
            const result = updaterFn(previousState);

            expect(result.payee.name).toEqual({ text: 'Test Payee' });
        });

        it('should update bank[0].accountNumber when contractNumber field changes', () => {
            renderComponent();

            const contractNumberField = screen.getByTestId(
                BankingFields.ContractNumber
            );
            fireEvent.change(contractNumberField, {
                target: { value: 'CONTRACT123' },
            });

            expect(mockSetFormDisbursement).toHaveBeenCalled();

            // Get the updater function and verify it updates bank[0].accountNumber
            const updaterFn = mockSetFormDisbursement.mock.calls[0][0];
            const previousState = {
                ...defaultFormDisbursement,
                payee: { contractNumber: { text: '' } },
                bank: [{ accountNumber: '' }],
            };
            const result = updaterFn(previousState);

            // Verify both payee.contractNumber and bank[0].accountNumber are updated
            expect(result.payee.contractNumber).toEqual({
                text: 'CONTRACT123',
            });
            expect(result.bank[0].accountNumber).toBe('CONTRACT123');
        });

        it('should call setDefaultDisbursementInfo when text field value changes', () => {
            renderComponent();

            const nameField = screen.getByTestId('name');
            fireEvent.change(nameField, { target: { value: 'Test Payee' } });

            expect(mockSetDefaultDisbursementInfo).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });

        it('should update defaultDisbursementInfo when text field changes', () => {
            renderComponent();

            const nameField = screen.getByTestId('name');
            fireEvent.change(nameField, { target: { value: 'Test Payee' } });

            expect(mockSetDefaultDisbursementInfo).toHaveBeenCalled();

            // Verify the updater function updates the correct path
            const updaterFn = mockSetDefaultDisbursementInfo.mock.calls[0][0];
            const previousState = {
                [PaymentMethod.DTCC]: {
                    payee: { name: { text: '' } },
                },
            };
            const result = updaterFn(previousState);

            expect(result[PaymentMethod.DTCC].payee.name).toEqual({
                text: 'Test Payee',
            });
        });

        it('should display the correct value from defaultDisbursementInfo', () => {
            renderComponent();

            const nameField = screen.getByTestId('name');
            expect(nameField).toHaveValue('Test Payee Name');
        });

        it('should display empty string when payee field is undefined', () => {
            render(
                <FormDataContext.Provider
                    value={
                        {
                            ...defaultFormDataContext,
                            formDisbursement: defaultFormDisbursement,
                            bankDetails: defaultBankDetails,
                            setFormDisbursement: mockSetFormDisbursement,
                        } as any
                    }
                >
                    <DtccMethod
                        config={defaultConfig}
                        isFormStateReadOnly={false}
                        defaultDisbursementInfo={{ payee: {} }}
                        setDefaultDisbursementInfo={
                            mockSetDefaultDisbursementInfo
                        }
                    />
                </FormDataContext.Provider>
            );

            const nameField = screen.getByTestId('name');
            expect(nameField).toHaveValue('');
        });

        it('should pass isBankingField as false to BankTextFieldV2', () => {
            renderComponent();

            expect(
                screen.getByTestId('is-banking-field-name')
            ).toHaveTextContent('false');
        });

        it('should pass error prop to BankTextFieldV2 when provided', () => {
            renderComponent();

            expect(
                screen.getByTestId(`error-${BankingFields.ContractNumber}`)
            ).toHaveTextContent('Contract number is required');
        });

        it('should pass validator prop to BankTextFieldV2 when provided', () => {
            renderComponent();

            expect(
                screen.getByTestId(
                    `has-validator-${BankingFields.ContractNumber}`
                )
            ).toHaveTextContent('true');
        });
    });

    describe('Participant ID Changes - handleParticipantIdChange', () => {
        it('should render DtccSelectParticipantId with correct value', () => {
            renderComponent();

            const participantIdField = screen.getByTestId(
                BankingFields.ParticipantId
            );
            expect(participantIdField).toHaveValue('0443');
        });

        it('should call setFormDisbursement when participant ID changes', () => {
            renderComponent();

            const participantIdField = screen.getByTestId(
                BankingFields.ParticipantId
            );

            fireEvent.change(participantIdField, {
                target: { value: 'PARTICIPANT_002' },
            });

            expect(mockSetFormDisbursement).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });

        it('should update formDisbursement.participantId when participant ID changes', () => {
            renderComponent();

            const participantIdField = screen.getByTestId(
                BankingFields.ParticipantId
            );

            fireEvent.change(participantIdField, {
                target: { value: 'PARTICIPANT_002' },
            });

            expect(mockSetFormDisbursement).toHaveBeenCalled();

            // Get the updater function and verify it updates participantId
            const updaterFn = mockSetFormDisbursement.mock.calls[0][0];
            const previousState = {
                ...defaultFormDisbursement,
                participantId: { text: '' },
            };
            const result = updaterFn(previousState);

            expect(result.participantId).toEqual({ text: 'PARTICIPANT_002' });
        });

        it('should call setDefaultDisbursementInfo when participant ID changes', () => {
            renderComponent();

            const participantIdField = screen.getByTestId(
                BankingFields.ParticipantId
            );

            fireEvent.change(participantIdField, {
                target: { value: 'PARTICIPANT_002' },
            });

            expect(mockSetDefaultDisbursementInfo).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });

        it('should update defaultDisbursementInfo.participantId when participant ID changes', () => {
            renderComponent();

            const participantIdField = screen.getByTestId(
                BankingFields.ParticipantId
            );

            fireEvent.change(participantIdField, {
                target: { value: 'PARTICIPANT_002' },
            });

            expect(mockSetDefaultDisbursementInfo).toHaveBeenCalled();

            // Verify the updater function updates the correct path
            const updaterFn = mockSetDefaultDisbursementInfo.mock.calls[0][0];
            const previousState = {
                [PaymentMethod.DTCC]: {
                    participantId: { text: '' },
                },
            };
            const result = updaterFn(previousState);

            expect(result[PaymentMethod.DTCC].participantId).toEqual({
                text: 'PARTICIPANT_002',
            });
        });

        it('should display empty string when participantId is undefined', () => {
            render(
                <FormDataContext.Provider
                    value={
                        {
                            ...defaultFormDataContext,
                            formDisbursement: defaultFormDisbursement,
                            bankDetails: defaultBankDetails,
                            setFormDisbursement: mockSetFormDisbursement,
                        } as any
                    }
                >
                    <DtccMethod
                        config={defaultConfig}
                        isFormStateReadOnly={false}
                        defaultDisbursementInfo={{}}
                        setDefaultDisbursementInfo={
                            mockSetDefaultDisbursementInfo
                        }
                    />
                </FormDataContext.Provider>
            );

            const participantIdField = screen.getByTestId(
                BankingFields.ParticipantId
            );
            expect(participantIdField).toHaveValue('');
        });
    });

    describe('Read-Only Mode', () => {
        it('should disable text input when isFormStateReadOnly is true', () => {
            render(
                <FormDataContext.Provider
                    value={
                        {
                            ...defaultFormDataContext,
                            formDisbursement: defaultFormDisbursement,
                            bankDetails: defaultBankDetails,
                            setFormDisbursement: mockSetFormDisbursement,
                        } as any
                    }
                >
                    <DtccMethod
                        config={defaultConfig}
                        isFormStateReadOnly={true}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        setDefaultDisbursementInfo={
                            mockSetDefaultDisbursementInfo
                        }
                    />
                </FormDataContext.Provider>
            );

            const nameField = screen.getByTestId('name');
            expect(nameField).toBeDisabled();
        });

        it('should disable select input when isFormStateReadOnly is true', () => {
            render(
                <FormDataContext.Provider
                    value={
                        {
                            ...defaultFormDataContext,
                            formDisbursement: defaultFormDisbursement,
                            bankDetails: defaultBankDetails,
                            setFormDisbursement: mockSetFormDisbursement,
                        } as any
                    }
                >
                    <DtccMethod
                        config={defaultConfig}
                        isFormStateReadOnly={true}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        setDefaultDisbursementInfo={
                            mockSetDefaultDisbursementInfo
                        }
                    />
                </FormDataContext.Provider>
            );

            const participantIdField = screen.getByTestId(
                BankingFields.ParticipantId
            );
            expect(participantIdField).toBeDisabled();
        });

        it('should enable text input when isFormStateReadOnly is false', () => {
            renderComponent();

            const nameField = screen.getByTestId('name');
            expect(nameField).not.toBeDisabled();
        });

        it('should enable select input when isFormStateReadOnly is false', () => {
            renderComponent();

            const participantIdField = screen.getByTestId(
                BankingFields.ParticipantId
            );
            expect(participantIdField).not.toBeDisabled();
        });
    });

    describe('Contract Number to Account Number Sync', () => {
        it('should sync contractNumber value to bank[0].accountNumber for DTCC payments', () => {
            renderComponent();

            const contractNumberField = screen.getByTestId(
                BankingFields.ContractNumber
            );
            const testContractNumber = 'DTCC-CONTRACT-12345';

            fireEvent.change(contractNumberField, {
                target: { value: testContractNumber },
            });

            // Verify setFormDisbursement was called
            expect(mockSetFormDisbursement).toHaveBeenCalledTimes(1);

            // Execute the updater function to verify the state transformation
            const updaterFn = mockSetFormDisbursement.mock.calls[0][0];
            const mockPreviousState = {
                payee: {
                    name: { text: 'Existing Name' },
                    contractNumber: { text: '' },
                },
                bank: [
                    {
                        accountNumber: '',
                        bankName: 'Test Bank',
                    },
                ],
            };

            const newState = updaterFn(mockPreviousState);

            // Assert: payee.contractNumber is updated
            expect(newState.payee.contractNumber).toEqual({
                text: testContractNumber,
            });

            // Assert: bank[0].accountNumber is also updated (the bug fix)
            expect(newState.bank[0].accountNumber).toBe(testContractNumber);

            // Assert: other bank properties are preserved
            expect(newState.bank[0].bankName).toBe('Test Bank');
        });

        it('should preserve existing payee properties when updating contractNumber', () => {
            renderComponent();

            const contractNumberField = screen.getByTestId(
                BankingFields.ContractNumber
            );

            fireEvent.change(contractNumberField, {
                target: { value: 'NEW-CONTRACT' },
            });

            const updaterFn = mockSetFormDisbursement.mock.calls[0][0];
            const mockPreviousState = {
                payee: {
                    name: { text: 'Existing Payee Name' },
                    addresses: [{ city: 'Test City' }],
                    contractNumber: { text: 'OLD-CONTRACT' },
                },
                bank: [{ accountNumber: 'OLD-ACCOUNT' }],
            };

            const newState = updaterFn(mockPreviousState);

            // Assert: other payee properties are preserved
            expect(newState.payee.name).toEqual({
                text: 'Existing Payee Name',
            });
            expect(newState.payee.addresses).toEqual([{ city: 'Test City' }]);
        });
    });

    describe('Field classNames', () => {
        it('should apply field classNames to wrapper div for text field', () => {
            const configWithClassNames = {
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'name',
                        fieldLabel: 'Payee Name',
                        classNames: 'col-span-2 custom-class',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={
                        {
                            ...defaultFormDataContext,
                            formDisbursement: defaultFormDisbursement,
                            bankDetails: defaultBankDetails,
                            setFormDisbursement: mockSetFormDisbursement,
                        } as any
                    }
                >
                    <DtccMethod
                        config={configWithClassNames}
                        isFormStateReadOnly={false}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        setDefaultDisbursementInfo={
                            mockSetDefaultDisbursementInfo
                        }
                    />
                </FormDataContext.Provider>
            );

            const wrapper = screen.getByTestId(
                'text-field-wrapper-name'
            ).parentElement;
            expect(wrapper).toHaveClass('col-span-2', 'custom-class');
        });

        it('should apply classNames to select field wrapper', () => {
            const configWithClassNames = {
                fields: [
                    {
                        fieldType: 'select',
                        fieldName: BankingFields.ParticipantId,
                        fieldLabel: 'Participant ID',
                        classNames: 'col-span-3 select-class',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={
                        {
                            ...defaultFormDataContext,
                            formDisbursement: defaultFormDisbursement,
                            bankDetails: defaultBankDetails,
                            setFormDisbursement: mockSetFormDisbursement,
                        } as any
                    }
                >
                    <DtccMethod
                        config={configWithClassNames}
                        isFormStateReadOnly={false}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        setDefaultDisbursementInfo={
                            mockSetDefaultDisbursementInfo
                        }
                    />
                </FormDataContext.Provider>
            );

            const wrapper = screen.getByTestId(
                `select-field-wrapper-${BankingFields.ParticipantId}`
            ).parentElement;
            expect(wrapper).toHaveClass('col-span-3', 'select-class');
        });

        it('should handle empty classNames gracefully', () => {
            const configWithEmptyClassNames = {
                fields: [
                    {
                        fieldType: 'text',
                        fieldName: 'name',
                        fieldLabel: 'Payee Name',
                        classNames: '',
                    },
                ],
            };

            render(
                <FormDataContext.Provider
                    value={
                        {
                            ...defaultFormDataContext,
                            formDisbursement: defaultFormDisbursement,
                            bankDetails: defaultBankDetails,
                            setFormDisbursement: mockSetFormDisbursement,
                        } as any
                    }
                >
                    <DtccMethod
                        config={configWithEmptyClassNames}
                        isFormStateReadOnly={false}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        setDefaultDisbursementInfo={
                            mockSetDefaultDisbursementInfo
                        }
                    />
                </FormDataContext.Provider>
            );

            const wrapper = screen.getByTestId(
                'text-field-wrapper-name'
            ).parentElement;
            expect(wrapper).toBeVisible();
        });
    });

    describe('Multiple fields rendering', () => {
        it('should render all field types together', () => {
            renderComponent();

            expect(screen.getByTestId('text-field-wrapper-name')).toBeVisible();
            expect(
                screen.getByTestId(
                    `text-field-wrapper-${BankingFields.ContractNumber}`
                )
            ).toBeVisible();
            expect(
                screen.getByTestId(
                    `select-field-wrapper-${BankingFields.ParticipantId}`
                )
            ).toBeVisible();
        });

        it('should render multiple text fields with correct values', () => {
            renderComponent();

            expect(screen.getByTestId('name')).toHaveValue('Test Payee Name');
            expect(
                screen.getByTestId(BankingFields.ContractNumber)
            ).toHaveValue('CONTRACT-123');
        });

        it('should maintain field order from config', () => {
            renderComponent();

            const form = document.querySelector('form');
            const children = form?.children;

            // Check order: name, participantId, contractNumber
            expect(
                children?.[0].querySelector('[data-testid="name"]')
            ).toBeVisible();
            expect(
                children?.[1].querySelector(
                    `[data-testid="${BankingFields.ParticipantId}"]`
                )
            ).toBeVisible();
            expect(
                children?.[2].querySelector(
                    `[data-testid="${BankingFields.ContractNumber}"]`
                )
            ).toBeVisible();
        });
    });

    describe('defaultDisbursementInfo - null/undefined/empty value handling', () => {
        it('should handle null payee in defaultDisbursementInfo', () => {
            render(
                <FormDataContext.Provider
                    value={
                        {
                            ...defaultFormDataContext,
                            formDisbursement: defaultFormDisbursement,
                            bankDetails: defaultBankDetails,
                            setFormDisbursement: mockSetFormDisbursement,
                        } as any
                    }
                >
                    <DtccMethod
                        config={defaultConfig}
                        isFormStateReadOnly={false}
                        defaultDisbursementInfo={{ payee: null }}
                        setDefaultDisbursementInfo={
                            mockSetDefaultDisbursementInfo
                        }
                    />
                </FormDataContext.Provider>
            );

            const nameField = screen.getByTestId('name');
            expect(nameField).toHaveValue('');
        });

        it('should handle undefined defaultDisbursementInfo fields', () => {
            render(
                <FormDataContext.Provider
                    value={
                        {
                            ...defaultFormDataContext,
                            formDisbursement: defaultFormDisbursement,
                            bankDetails: defaultBankDetails,
                            setFormDisbursement: mockSetFormDisbursement,
                        } as any
                    }
                >
                    <DtccMethod
                        config={defaultConfig}
                        isFormStateReadOnly={false}
                        defaultDisbursementInfo={{
                            payee: {
                                name: undefined,
                            },
                        }}
                        setDefaultDisbursementInfo={
                            mockSetDefaultDisbursementInfo
                        }
                    />
                </FormDataContext.Provider>
            );

            const nameField = screen.getByTestId('name');
            expect(nameField).toHaveValue('');
        });

        it('should handle missing text property in field value', () => {
            render(
                <FormDataContext.Provider
                    value={
                        {
                            ...defaultFormDataContext,
                            formDisbursement: defaultFormDisbursement,
                            bankDetails: defaultBankDetails,
                            setFormDisbursement: mockSetFormDisbursement,
                        } as any
                    }
                >
                    <DtccMethod
                        config={defaultConfig}
                        isFormStateReadOnly={false}
                        defaultDisbursementInfo={{
                            payee: {
                                name: {},
                            },
                        }}
                        setDefaultDisbursementInfo={
                            mockSetDefaultDisbursementInfo
                        }
                    />
                </FormDataContext.Provider>
            );

            const nameField = screen.getByTestId('name');
            expect(nameField).toHaveValue('');
        });

        it('should preserve existing payee fields when updating one field', () => {
            renderComponent();

            const nameField = screen.getByTestId('name');
            fireEvent.change(nameField, { target: { value: 'Updated Name' } });

            const updaterFn = mockSetFormDisbursement.mock.calls[0][0];
            const prevState = {
                payee: {
                    name: { text: 'Original Name' },
                    contractNumber: { text: 'Existing Contract' },
                },
                bank: [{ accountNumber: '' }],
            };
            const result = updaterFn(prevState);

            expect(result.payee.name.text).toBe('Updated Name');
            expect(result.payee.contractNumber.text).toBe('Existing Contract');
        });

        it('should handle empty config gracefully', () => {
            const { container } = render(
                <FormDataContext.Provider
                    value={
                        {
                            ...defaultFormDataContext,
                            formDisbursement: defaultFormDisbursement,
                            bankDetails: defaultBankDetails,
                            setFormDisbursement: mockSetFormDisbursement,
                        } as any
                    }
                >
                    <DtccMethod
                        config={{ fields: [] }}
                        isFormStateReadOnly={false}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        setDefaultDisbursementInfo={
                            mockSetDefaultDisbursementInfo
                        }
                    />
                </FormDataContext.Provider>
            );

            const form = container.querySelector('form');
            expect(form).toBeVisible();
            expect(form?.children.length).toBe(0);
        });
    });
});
