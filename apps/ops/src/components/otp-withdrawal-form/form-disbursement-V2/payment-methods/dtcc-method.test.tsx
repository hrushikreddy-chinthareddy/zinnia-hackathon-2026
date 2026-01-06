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

// Mock the DtccSelectParticipantId component since Autocomplete doesn't support data-testid
jest.mock('../dtcc-select-participant-id', () => {
    return function MockDtccSelectParticipantId({
        fieldName,
        onDataChange,
        value,
        isFormStateReadOnly,
    }: any) {
        return (
            <select
                data-testid={fieldName}
                value={value}
                onChange={(e) => onDataChange(e.target.value)}
                disabled={isFormStateReadOnly}
            >
                <option value="">Select</option>
                <option value="0443">Test Company</option>
            </select>
        );
    };
});

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
            },
        ],
    };

    const defaultDisbursementInfo = {
        payee: {
            name: { text: '' },
            contractNumber: { text: '' },
        },
        participantId: { text: '' },
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
        it('should render all configured fields', () => {
            renderComponent();

            expect(screen.getByTestId('name')).toBeInTheDocument();
            expect(
                screen.getByTestId(BankingFields.ParticipantId)
            ).toBeInTheDocument();
            expect(
                screen.getByTestId(BankingFields.ContractNumber)
            ).toBeInTheDocument();
        });

        it('should render fields in a grid layout', () => {
            const { container } = renderComponent();

            const form = container.querySelector('form');
            expect(form).toHaveClass('grid', 'grid-cols-3', 'gap-4', 'mt-4');
        });
    });

    describe('Text Field Changes', () => {
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
    });

    describe('Participant ID Changes', () => {
        it('should update formDisbursement.participantId when participant ID changes', () => {
            renderComponent();

            const participantIdField = screen.getByTestId(
                BankingFields.ParticipantId
            );

            fireEvent.change(participantIdField, {
                target: { value: '0443' },
            });

            expect(mockSetFormDisbursement).toHaveBeenCalled();

            // Get the updater function and verify it updates participantId
            const updaterFn = mockSetFormDisbursement.mock.calls[0][0];
            const previousState = {
                ...defaultFormDisbursement,
                participantId: { text: '' },
            };
            const result = updaterFn(previousState);

            expect(result.participantId).toEqual({ text: '0443' });
        });

        it('should update defaultDisbursementInfo.participantId when participant ID changes', () => {
            renderComponent();

            const participantIdField = screen.getByTestId(
                BankingFields.ParticipantId
            );

            fireEvent.change(participantIdField, {
                target: { value: '0443' },
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
                text: '0443',
            });
        });
    });

    describe('Read-Only Mode', () => {
        it('should pass isFormStateReadOnly to child components', () => {
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
                        config={defaultConfig}
                        isFormStateReadOnly={true}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        setDefaultDisbursementInfo={
                            mockSetDefaultDisbursementInfo
                        }
                    />
                </FormDataContext.Provider>
            );

            // The component should render without errors in read-only mode
            expect(container).toBeInTheDocument();
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

    describe('Field Configuration', () => {
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
            expect(form).toBeInTheDocument();
            expect(form?.children.length).toBe(0);
        });

        it('should skip unknown field types', () => {
            const configWithUnknownType = {
                fields: [
                    {
                        fieldName: 'unknown',
                        fieldLabel: 'Unknown Field',
                        fieldType: 'unknown-type',
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
                        config={configWithUnknownType}
                        isFormStateReadOnly={false}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        setDefaultDisbursementInfo={
                            mockSetDefaultDisbursementInfo
                        }
                    />
                </FormDataContext.Provider>
            );

            // The div wrapper is rendered but contains null (no field rendered)
            const form = container.querySelector('form');
            expect(form?.children.length).toBe(1);
        });
    });
});
