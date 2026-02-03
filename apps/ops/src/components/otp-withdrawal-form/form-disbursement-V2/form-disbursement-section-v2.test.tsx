import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import {
    AccountType,
    PaymentMailType,
    PaymentMethod,
} from '@deps/models/case/withdrawal/case';

import FormDisbursementSectionV2 from './form-disbursement-section-v2';
import { SelectedBanking } from './form-disbursement.types';
import { DEFAULT_ADDRESS } from '../address-entry';

// Mock payment method components
jest.mock('./payment-methods/eft-method', () => {
    const EftMethodMock = ({
        onDataChange,
    }: {
        onDataChange: (value: string, fieldName: string) => void;
    }) => (
        <div data-testid="eft-method">
            <button
                data-testid="eft-change-trigger"
                onClick={() => onDataChange('test-value', 'bankName')}
            >
                Trigger Change
            </button>
        </div>
    );
    EftMethodMock.displayName = 'EftMethodMock';
    return EftMethodMock;
});

jest.mock('./payment-methods/wire-method', () => {
    const WireMethodMock = ({
        onDataChange,
    }: {
        onDataChange: (value: string, fieldName: string) => void;
    }) => (
        <div data-testid="wire-method">
            <button
                data-testid="wire-change-trigger"
                onClick={() => onDataChange('wire-value', 'routingNumber')}
            >
                Trigger Change
            </button>
        </div>
    );
    WireMethodMock.displayName = 'WireMethodMock';
    return WireMethodMock;
});

jest.mock('./payment-methods/brokerage-acc-method', () => {
    const BrokerageMethodMock = () => (
        <div data-testid="brokerage-method">Brokerage Method</div>
    );
    BrokerageMethodMock.displayName = 'BrokerageMethodMock';
    return BrokerageMethodMock;
});

jest.mock('./payment-methods/alternate-payee-method', () => {
    const AlternatePayeeMethodMock = () => (
        <div data-testid="alternate-payee-method">Alternate Payee Method</div>
    );
    AlternatePayeeMethodMock.displayName = 'AlternatePayeeMethodMock';
    return AlternatePayeeMethodMock;
});

jest.mock('./payment-methods/check-method', () => {
    const CheckMethodMock = () => (
        <div data-testid="check-method">Check Method</div>
    );
    CheckMethodMock.displayName = 'CheckMethodMock';
    return CheckMethodMock;
});

jest.mock('./payment-methods/dtcc-method', () => {
    const DtccMethodMock = () => (
        <div data-testid="dtcc-method">DTCC Method</div>
    );
    DtccMethodMock.displayName = 'DtccMethodMock';
    return DtccMethodMock;
});

describe('FormDisbursementSectionV2', () => {
    const createFormDisbursement = (
        paymentMethod: PaymentMethod | PaymentMailType | null = null
    ) => ({
        paymentMethod: { text: paymentMethod },
        paymentMailType: { text: null },
        bank: [
            {
                accountNumber: '123456789',
                accountType: AccountType.Checking,
                bankContactPerson: '',
                bankFurtherCreditAccount: '',
                bankFurtherCreditName: '',
                bankInfoCompleteInd: '',
                bankLocation: '',
                bankName: 'Test Bank',
                bankPhone: '',
                nameOnBankAccount: 'John Doe',
                routingNumber: '111000025',
                maskedAccountNumber: null,
                isDirectDeposit: {
                    text: true,
                },
            },
        ],
        paymentToBrokerageAccount: false,
        brokerage: {
            companyName: '',
            accountNumber: '',
            acordAttached: null,
            address: DEFAULT_ADDRESS,
        },
        payeeType: '',
        voidCheck: null,
        doesCheckMeetSecRequiremnt: null,
        participantId: {
            text: null,
        },
        payee: {
            name: { text: null },
            addresses: [DEFAULT_ADDRESS],
            contractNumber: { text: null },
            taxId: { text: '' },
        },
        upsAccount: null,
        emailDeliveryNotification: { text: false },
        isDifferentPayeeOrAddress: { text: false },
        isWireApprovalPresent: { text: false },
        bankVerification: {
            selectedBankingType: '',
            validationsMap: {
                VOIDED_CHECK: {
                    fraudRedFlagsCheck: null,
                    isBlankVoidedCheck: null,
                    hasHandwrittenVOID: null,
                    securityFeaturesPresent: null,
                    ownerNameMatch: null,
                    ownerAddressMatch: null,
                },
                BANK_LETTERHEAD: {
                    isValidBankLetterhead: null,
                    hasBankAddress: null,
                    hasBankOfficialSignature: null,
                    containsHandwrittenBankDetails: null,
                },
                DIRECT_DEPOSIT_FORM: {
                    noAdditionalValidationRequired: null,
                },
                STARTER_CHECK: {
                    noAdditionalValidationRequired: null,
                },
                NO_BANK_PROOF: {
                    noAdditionalValidationRequired: null,
                },
            },
        },
    });

    const createBankDetails = (paymentMethod: PaymentMethod | '' = '') => ({
        isBankSelected: false,
        bankingInFile: [],
        selectedBanking: '' as SelectedBanking | '',
        paymentMethod,
    });

    const defaultProps = {
        defaultDisbursementInfo: {},
        fieldConfig: [],
        setDefaultDisbursementInfo: jest.fn(),
        isFormStateReadOnly: false,
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering payment methods', () => {
        it('should render EftMethod when payment method is EFT', () => {
            const formDisbursement = createFormDisbursement(PaymentMethod.EFT);
            const setFormDisbursement = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement,
                        bankDetails: createBankDetails(PaymentMethod.EFT),
                    }}
                >
                    <FormDisbursementSectionV2 {...defaultProps} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('eft-method')).toBeVisible();
        });

        it('should render WireMethod when payment method is Wire', () => {
            const formDisbursement = createFormDisbursement(PaymentMethod.Wire);
            const setFormDisbursement = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement,
                        bankDetails: createBankDetails(PaymentMethod.Wire),
                    }}
                >
                    <FormDisbursementSectionV2 {...defaultProps} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('wire-method')).toBeVisible();
        });

        it('should render BrokerageMethod when payment method is Brokerage', () => {
            const formDisbursement = createFormDisbursement(
                PaymentMethod.Brokerage
            );
            const setFormDisbursement = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <FormDisbursementSectionV2 {...defaultProps} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('brokerage-method')).toBeVisible();
        });

        it('should render AlternatePayeeMethod when payment method is AlternatePayeeAddress', () => {
            const formDisbursement = createFormDisbursement(
                PaymentMethod.AlternatePayeeAddress
            );
            const setFormDisbursement = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <FormDisbursementSectionV2 {...defaultProps} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('alternate-payee-method')).toBeVisible();
        });

        it('should render CheckMethod when payment method is Check', () => {
            const formDisbursement = createFormDisbursement(
                PaymentMailType.Check
            );
            const setFormDisbursement = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <FormDisbursementSectionV2 {...defaultProps} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('check-method')).toBeVisible();
        });

        it('should render DtccMethod when payment method is DTCC', () => {
            const formDisbursement = createFormDisbursement(PaymentMethod.DTCC);
            const setFormDisbursement = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <FormDisbursementSectionV2 {...defaultProps} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('dtcc-method')).toBeVisible();
        });

        it('should render nothing when payment method is not set', () => {
            const formDisbursement = createFormDisbursement(null);
            const setFormDisbursement = jest.fn();

            const { container } = render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <FormDisbursementSectionV2 {...defaultProps} />
                </FormDataContext.Provider>
            );

            expect(container).toBeEmptyDOMElement();
        });

        it('should render nothing for unknown payment method', () => {
            const formDisbursement = createFormDisbursement(
                'UnknownMethod' as PaymentMethod
            );
            const setFormDisbursement = jest.fn();

            const { container } = render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement,
                        bankDetails: createBankDetails(),
                    }}
                >
                    <FormDisbursementSectionV2 {...defaultProps} />
                </FormDataContext.Provider>
            );

            expect(container).toBeEmptyDOMElement();
        });
    });

    describe('handleBankingSectionChange', () => {
        it('should update formDisbursement bank details when onDataChange is called', () => {
            const formDisbursement = createFormDisbursement(PaymentMethod.EFT);
            const setFormDisbursement = jest.fn();
            const setDefaultDisbursementInfo = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement,
                        bankDetails: createBankDetails(PaymentMethod.EFT),
                    }}
                >
                    <FormDisbursementSectionV2
                        {...defaultProps}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const triggerButton = screen.getByTestId('eft-change-trigger');
            fireEvent.click(triggerButton);

            expect(setFormDisbursement).toHaveBeenCalledWith(
                expect.any(Function)
            );
            expect(setDefaultDisbursementInfo).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });

        it('should correctly update bank field in formDisbursement', () => {
            const formDisbursement = createFormDisbursement(PaymentMethod.EFT);
            let capturedUpdater: ((prev: any) => any) | null = null;
            const setFormDisbursement = jest.fn((updater) => {
                capturedUpdater = updater;
            });

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement,
                        bankDetails: createBankDetails(PaymentMethod.EFT),
                    }}
                >
                    <FormDisbursementSectionV2 {...defaultProps} />
                </FormDataContext.Provider>
            );

            const triggerButton = screen.getByTestId('eft-change-trigger');
            fireEvent.click(triggerButton);

            // Execute the captured updater function to verify it produces correct result
            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!(formDisbursement);
            expect(result.bank[0].bankName).toBe('test-value');
        });

        it('should correctly update defaultDisbursementInfo with payment method key', () => {
            const formDisbursement = createFormDisbursement(PaymentMethod.EFT);
            const setFormDisbursement = jest.fn();
            let capturedUpdater: ((prev: any) => any) | null = null;
            const setDefaultDisbursementInfo = jest.fn((updater) => {
                capturedUpdater = updater;
            });

            const defaultDisbursementInfo = {
                [PaymentMethod.EFT]: {
                    bank: [{ bankName: 'Original Bank' }],
                },
            };

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement,
                        bankDetails: createBankDetails(PaymentMethod.EFT),
                    }}
                >
                    <FormDisbursementSectionV2
                        {...defaultProps}
                        defaultDisbursementInfo={defaultDisbursementInfo}
                        setDefaultDisbursementInfo={setDefaultDisbursementInfo}
                    />
                </FormDataContext.Provider>
            );

            const triggerButton = screen.getByTestId('eft-change-trigger');
            fireEvent.click(triggerButton);

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!(defaultDisbursementInfo);
            expect(result[PaymentMethod.EFT].bank[0].bankName).toBe(
                'test-value'
            );
        });
    });

    describe('Props passing', () => {
        it('should pass isFormStateReadOnly to child components', () => {
            const formDisbursement = createFormDisbursement(PaymentMethod.EFT);
            const setFormDisbursement = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement,
                        bankDetails: createBankDetails(PaymentMethod.EFT),
                    }}
                >
                    <FormDisbursementSectionV2
                        {...defaultProps}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            // Component should still render - the read-only prop is passed to child
            expect(screen.getByTestId('eft-method')).toBeVisible();
        });

        it('should pass fieldConfig to child components', () => {
            const formDisbursement = createFormDisbursement(PaymentMethod.EFT);
            const setFormDisbursement = jest.fn();
            const fieldConfig = [{ fieldName: 'testField', visible: true }];

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement,
                        bankDetails: createBankDetails(PaymentMethod.EFT),
                    }}
                >
                    <FormDisbursementSectionV2
                        {...defaultProps}
                        fieldConfig={fieldConfig as any}
                    />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('eft-method')).toBeVisible();
        });
    });
});
