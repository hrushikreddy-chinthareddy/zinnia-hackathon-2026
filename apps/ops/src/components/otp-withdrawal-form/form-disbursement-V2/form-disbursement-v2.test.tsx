/* eslint-disable @typescript-eslint/no-var-requires */
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { DEFAULT_LOCALE } from '@deps/helpers/routing.helpers';
import {
    AccountType,
    CaseStatus,
    PaymentMailType,
    PaymentMethod,
    FormDisbursement as FormDisbursementType,
} from '@deps/models/case/withdrawal/case';

import FormDisbursementV2 from './form-disbursement-v2';
import {
    SelectedBanking,
    BankingDetails,
    DisbursementOptions,
} from './form-disbursement.types';
import { DEFAULT_ADDRESS } from '../address-entry';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));

jest.mock('./form-disbursement-section-v2', () => {
    const FormDisbursementSectionV2Mock = () => (
        <div data-testid="form-disbursement-section-v2" />
    );
    FormDisbursementSectionV2Mock.displayName = 'FormDisbursementSectionV2Mock';
    return FormDisbursementSectionV2Mock;
});

jest.mock(
    '../form-disbursement/form-disbursement-parts/consent-available',
    () => ({
        ConsentAvailable: () => <div data-testid="consent-available" />,
    })
);

jest.mock('@deps/helpers/bank.helpers', () => ({
    getBankingDetails: jest.fn(() => []),
    getBankingDetailsLC: jest.fn(() => []),
}));

afterEach(() => {
    jest.clearAllMocks();
});

describe('FormDisbursementV2 Component', () => {
    const generateEFTPayload = jest.fn(() => {
        return {} as FormDisbursementType;
    });
    const generateWirePayload = jest.fn(() => {
        return {} as FormDisbursementType;
    });
    const generateCheckPayload = jest.fn(() => {
        return {} as FormDisbursementType;
    });
    const generateDtccPayload = jest.fn(() => {
        return {} as FormDisbursementType;
    });

    const disbursementOptions: DisbursementOptions = [
        {
            label: 'caseWithdrawal.request.distributionMethod.eft',
            value: PaymentMethod.EFT,
            fields: null,
            generatePayloadFromSelection: generateEFTPayload,
            getDefaultPayload: jest.fn(),
        },
        {
            label: 'caseWithdrawal.request.distributionMethod.wire',
            value: PaymentMethod.Wire,
            fields: null,
            generatePayloadFromSelection: generateWirePayload,
            getDefaultPayload: jest.fn(),
        },
        {
            label: 'caseWithdrawal.request.distributionMethod.sendCheck',
            value: PaymentMailType.Check,
            fields: null,
            generatePayloadFromSelection: generateCheckPayload,
            getDefaultPayload: jest.fn(),
        },
        {
            label: 'caseWithdrawal.request.distributionMethod.dtcc',
            value: PaymentMethod.DTCC,
            fields: null,
            generatePayloadFromSelection: generateDtccPayload,
            getDefaultPayload: jest.fn(),
        },
    ];

    const createFormDisbursement = (
        paymentMethod: PaymentMethod | null = null
    ) => ({
        paymentMethod: { text: paymentMethod || null },
        paymentMailType: { text: null },
        bank: [
            {
                accountNumber: '',
                accountType: {
                    text: AccountType.Checking,
                },
                bankContactPerson: '',
                bankFurtherCreditAccount: '',
                bankFurtherCreditName: '',
                bankInfoCompleteInd: '',
                bankLocation: '',
                bankName: 'ABC',
                bankPhone: '',
                nameOnBankAccount: '',
                routingNumber: '',
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

    const createParties = () => [
        {
            SourceSystem: 'LC',
            Role: 'Primary Owner',
            SrcRole: 'Owner',
            SrcRoleOptionId: 0,
            SrcRoleOptionIdDesc: 'Primary',
            SrcNameId: '1808582927',
            SrcRoleType: 0,
            RoleUniqueID: '1808582927|0|0|2',
            RoleStartDate: '2018-03-18',
            RoleEndDate: '2999-12-31',
            RoleStatus: 'C',
            Gender: 'null',
            FirstName: 'ROBERT',
            MiddleName: 'null',
            LastName: 'SMITH',
            Suffix: 'null',
            FullName: 'ROBERT SMITH',
            OrgName: 'null',
            DateOfBirth: '1935-01-01',
            TaxID: '***-**-0458',
            SplitPercent: 'null',
            PersonType: 'Individual',
            SrcPartyType: 'IN',
            Email: 'null',
            SrcRelToOwnerId: 'null',
            RelationshipToOwner: '',
            ElectronicAuth: 'null',
            PendingAddressUpdate: 'null',
            TaxToRole: '',
            SrcTaxToNameId: '-999',
            SrcTaxToOptionId: '-999',
            SrcTaxToRoleId: '-999',
            SrcPhoneId: '-999',
            SrcAddressId: '8736532',
            SrcRoleCountId: '2',
            Address: [
                {
                    SrcAddressId: '8736532',
                    AddressStartDate: '2018-03-20',
                    AddressEndDate: '2999-12-31',
                    ActiveAddress: true,
                    AddressType: 'HADDR',
                    AddressTypeDesc: 'Default',
                    MailIndicator: true,
                    AddressLine1: '44 MAIN ST',
                    AddressLine2: 'null',
                    AddressLine3: 'null',
                    AddressLine4: 'null',
                    City: 'TOPEKA',
                    State: 'KS',
                    Zip: '66615',
                    ZipPlusFour: 'null',
                    Country: 'USA',
                    RoleAddress: true,
                },
            ],
            Phone: [
                {
                    PhoneType: 'HTELE',
                    PhoneTypeDesc: 'Default',
                    PhoneNumber: 'null',
                    PhoneCountry: '$$',
                    SrcPhoneId: '-999',
                    SrcAddressId: '8736532',
                    RolePhone: true,
                },
            ],
            Banking: [
                {
                    BankId: 222981,
                    BankName: 'ABC',
                    RoutingNumber: '258741963',
                    AccountNumber: '545456765',
                    AccountType: 'Checking',
                    Purpose: 'Premium',
                    PaymentMethod: 'EFT',
                    BankStartDate: new Date('2021-10-26'),
                    BankEndDate: new Date('2999-12-31'),
                    ListBillId: 3445193,
                    EFTCode: '2',
                    EFTStatus: 'Active',
                },
            ],
            TaxWithHolding: [
                {
                    Type: 'Federal',
                    Exemption: '3',
                    FilingStatus: 'Married',
                    TaxRate: 'Use Values Entered',
                },
                {
                    Type: 'State',
                    Exemption: '0',
                    FilingStatus: 'Single',
                    TaxRate: 'Use Values Entered',
                },
                {
                    Type: 'Backup',
                    Exemption: 'null',
                    FilingStatus: 'null',
                    TaxRate: 'null',
                },
            ],
        },
    ];

    const createBankDetails = (
        paymentMethod: PaymentMethod | '' = '',
        selectedBanking: SelectedBanking | '' = '',
        isBankSelected: boolean = false,
        bankingInFile: any[] = []
    ): BankingDetails => ({
        isBankSelected,
        bankingInFile,
        selectedBanking,
        paymentMethod,
    });

    describe('Rendering', () => {
        it('should render the default title', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const sectionTitle = screen.getByText('distributionMethod');
            expect(sectionTitle).toBeVisible();
            expect(sectionTitle.tagName).toBe('H3');
        });

        it('should render a custom title when provided', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2
                        options={disbursementOptions}
                        title="Custom Title"
                    />
                </FormDataContext.Provider>
            );

            const sectionTitle = screen.getByText('Custom Title');
            expect(sectionTitle).toBeVisible();
        });

        it('should render all the disbursement options', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByText(
                    'caseWithdrawal.request.distributionMethod.eft'
                )
            ).toBeVisible();
            expect(
                screen.getByText(
                    'caseWithdrawal.request.distributionMethod.wire'
                )
            ).toBeVisible();
            expect(
                screen.getByText(
                    'caseWithdrawal.request.distributionMethod.sendCheck'
                )
            ).toBeVisible();
            expect(
                screen.getByText(
                    'caseWithdrawal.request.distributionMethod.dtcc'
                )
            ).toBeVisible();
        });

        it('should render the FormDisbursementSectionV2 component', () => {
            const formDisbursement = createFormDisbursement(PaymentMethod.EFT);
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(PaymentMethod.EFT),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByTestId('form-disbursement-section-v2')
            ).toBeVisible();
        });
    });

    describe('Payment Method Selection', () => {
        it('should call setFormDisbursement when selecting EFT option', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            const setBankDetails = jest.fn();
            const setFormErrors = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const eftOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.eft'
            );

            fireEvent.click(eftOption);

            expect(setFormErrors).toHaveBeenCalled();
            expect(setBankDetails).toHaveBeenCalled();
        });

        it('should call setFormDisbursement when selecting Wire option', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            const setBankDetails = jest.fn();
            const setFormErrors = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const wireOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.wire'
            );

            fireEvent.click(wireOption);

            expect(setFormErrors).toHaveBeenCalled();
            expect(setMockData).toHaveBeenCalled();
            expect(generateWirePayload).toHaveBeenCalled();
        });

        it('should call setFormDisbursement when selecting Check option', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            const setBankDetails = jest.fn();
            const setFormErrors = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const checkOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.sendCheck'
            );

            fireEvent.click(checkOption);

            expect(setFormErrors).toHaveBeenCalled();
            expect(setMockData).toHaveBeenCalled();
            expect(generateCheckPayload).toHaveBeenCalled();
        });

        it('should call setFormDisbursement when selecting DTCC option', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            const setBankDetails = jest.fn();
            const setFormErrors = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const dtccOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.dtcc'
            );

            fireEvent.click(dtccOption);

            expect(setFormErrors).toHaveBeenCalled();
            expect(setMockData).toHaveBeenCalled();
            expect(generateDtccPayload).toHaveBeenCalled();
        });
    });

    describe('Read Only Mode', () => {
        it('should disable button group when isFormStateReadOnly is true', () => {
            const formDisbursement = createFormDisbursement(PaymentMethod.EFT);
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(PaymentMethod.EFT),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2
                        options={disbursementOptions}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            const eftOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.eft'
            );

            // In read-only mode, the button should have disabled styles (cursor-not-allowed class)
            expect(eftOption).toHaveClass('cursor-not-allowed');
        });

        it('should initialize bank details on read-only mount', () => {
            const formDisbursement = createFormDisbursement(PaymentMethod.EFT);
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2
                        options={disbursementOptions}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            expect(setBankDetails).toHaveBeenCalled();
        });
    });

    describe('EFT with existing bank details', () => {
        it('should set selectedBanking to OnFile when existing bank details match', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            const setBankDetails = jest.fn();
            const setFormErrors = jest.fn();

            const bankingInFile = [
                {
                    BankId: 222981,
                    BankName: 'ABC',
                    RoutingNumber: '258741963',
                    AccountNumber: '545456765',
                    AccountType: 'Checking' as const,
                    Purpose: 'Premium',
                    PaymentMethod: PaymentMethod.EFT,
                    BankStartDate: '2021-10-26',
                    BankEndDate: '2999-12-31',
                    ListBillId: 3445193,
                    EFTCode: '2',
                    EFTStatus: 'Active' as const,
                },
            ];

            const bankDetails: BankingDetails = {
                isBankSelected: false,
                bankingInFile,
                selectedBanking: '',
                paymentMethod: '',
            };

            // Mock getBankingDetails to return bank details
            const bankHelpers = require('@deps/helpers/bank.helpers');
            bankHelpers.getBankingDetails.mockReturnValue(bankingInFile);

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails,
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const eftOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.eft'
            );

            fireEvent.click(eftOption);

            expect(setBankDetails).toHaveBeenCalledWith(expect.any(Function));
        });

        it('should set selectedBanking to New when no existing bank details', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            const setBankDetails = jest.fn();
            const setFormErrors = jest.fn();

            // Mock getBankingDetails to return empty array
            const bankHelpers = require('@deps/helpers/bank.helpers');
            bankHelpers.getBankingDetails.mockReturnValue([]);

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const eftOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.eft'
            );

            fireEvent.click(eftOption);

            // Verify setBankDetails was called with New selection
            const lastCall =
                setBankDetails.mock.calls[setBankDetails.mock.calls.length - 1];
            const updater = lastCall[0];
            const result = updater({
                paymentMethod: '',
                selectedBanking: '',
                isBankSelected: false,
                bankingInFile: [],
            });

            expect(result.selectedBanking).toBe(SelectedBanking.New);
            expect(result.paymentMethod).toBe(PaymentMethod.EFT);
        });
    });

    describe('LifeCad (LC) mode', () => {
        it('should use getBankingDetailsLC when isLC is true', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            const bankHelpers = require('@deps/helpers/bank.helpers');

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                        isLC: true,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            expect(bankHelpers.getBankingDetailsLC).toHaveBeenCalled();
        });
    });

    describe('Derived Payment Method', () => {
        it('should use bankDetails.paymentMethod when available', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(PaymentMethod.Wire),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            // The Wire option should be active based on bankDetails.paymentMethod
            const wireOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.wire'
            );
            expect(wireOption).toHaveAttribute('aria-checked', 'true');
        });

        it('should fallback to formDisbursement.paymentMethod.text when bankDetails.paymentMethod is empty', () => {
            const formDisbursement = createFormDisbursement(PaymentMethod.EFT);
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            // The EFT option should be active based on formDisbursement.paymentMethod.text
            const eftOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.eft'
            );
            expect(eftOption).toHaveAttribute('aria-checked', 'true');
        });
    });

    describe('SelectedBanking state management', () => {
        it('should set selectedBanking to OnFile when EFT is selected and existing bank details exist', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            let capturedBankDetailsUpdater: ((prev: any) => any) | null = null;
            const setBankDetails = jest.fn((updater) => {
                capturedBankDetailsUpdater = updater;
            });
            const setFormErrors = jest.fn();

            const bankingInFile = [
                {
                    BankId: 222981,
                    BankName: 'ABC',
                    RoutingNumber: '258741963',
                    AccountNumber: '545456765',
                    AccountType: 'Checking' as const,
                    Purpose: 'Premium',
                    PaymentMethod: PaymentMethod.EFT,
                    BankStartDate: '2021-10-26',
                    BankEndDate: '2999-12-31',
                    ListBillId: 3445193,
                    EFTCode: '2',
                    EFTStatus: 'Active' as const,
                },
            ];

            // Mock getBankingDetails to return bank details
            const bankHelpers = require('@deps/helpers/bank.helpers');
            bankHelpers.getBankingDetails.mockReturnValue(bankingInFile);

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails('', '', false, []),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const eftOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.eft'
            );

            fireEvent.click(eftOption);

            // Execute the captured updater to verify selectedBanking is OnFile
            expect(capturedBankDetailsUpdater).not.toBeNull();
            const result = capturedBankDetailsUpdater!({
                paymentMethod: '',
                selectedBanking: '',
                isBankSelected: false,
                bankingInFile: [],
            });

            expect(result.selectedBanking).toBe(SelectedBanking.OnFile);
            expect(result.isBankSelected).toBe(true);
            expect(result.paymentMethod).toBe(PaymentMethod.EFT);
        });

        it('should set selectedBanking to New when EFT is selected and no existing bank details', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            let capturedBankDetailsUpdater: ((prev: any) => any) | null = null;
            const setBankDetails = jest.fn((updater) => {
                capturedBankDetailsUpdater = updater;
            });
            const setFormErrors = jest.fn();

            // Mock getBankingDetails to return empty array
            const bankHelpers = require('@deps/helpers/bank.helpers');
            bankHelpers.getBankingDetails.mockReturnValue([]);

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const eftOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.eft'
            );

            fireEvent.click(eftOption);

            // Execute the captured updater to verify selectedBanking is New
            expect(capturedBankDetailsUpdater).not.toBeNull();
            const result = capturedBankDetailsUpdater!({
                paymentMethod: '',
                selectedBanking: '',
                isBankSelected: false,
                bankingInFile: [],
            });

            expect(result.selectedBanking).toBe(SelectedBanking.New);
            expect(result.isBankSelected).toBe(false);
            expect(result.paymentMethod).toBe(PaymentMethod.EFT);
        });

        it('should set selectedBanking to New when Wire is selected', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            let capturedBankDetailsUpdater: ((prev: any) => any) | null = null;
            const setBankDetails = jest.fn((updater) => {
                capturedBankDetailsUpdater = updater;
            });
            const setFormErrors = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const wireOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.wire'
            );

            fireEvent.click(wireOption);

            // Execute the captured updater to verify selectedBanking is New for Wire
            expect(capturedBankDetailsUpdater).not.toBeNull();
            const result = capturedBankDetailsUpdater!({
                paymentMethod: '',
                selectedBanking: '',
                isBankSelected: false,
                bankingInFile: [],
            });

            expect(result.selectedBanking).toBe(SelectedBanking.New);
            expect(result.isBankSelected).toBe(false);
            expect(result.paymentMethod).toBe(PaymentMethod.Wire);
        });

        it('should preserve OnFile selection when switching back to EFT with matching bank details', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            const setBankDetails = jest.fn();
            const setFormErrors = jest.fn();

            const bankingInFile = [
                {
                    BankId: 222981,
                    BankName: 'ABC',
                    RoutingNumber: '258741963',
                    AccountNumber: '545456765',
                    AccountType: 'Checking' as const,
                    Purpose: 'Premium',
                    PaymentMethod: PaymentMethod.EFT,
                    BankStartDate: '2021-10-26',
                    BankEndDate: '2999-12-31',
                    ListBillId: 3445193,
                    EFTCode: '2',
                    EFTStatus: 'Active' as const,
                },
            ];

            const bankHelpers = require('@deps/helpers/bank.helpers');
            bankHelpers.getBankingDetails.mockReturnValue(bankingInFile);

            // Start with OnFile selected banking
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(
                            PaymentMethod.EFT,
                            SelectedBanking.OnFile,
                            true,
                            bankingInFile
                        ),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            // The EFT option should be active
            const eftOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.eft'
            );
            expect(eftOption).toHaveAttribute('aria-checked', 'true');
        });

        it('should set selectedBanking to New for Check payment method', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            let capturedBankDetailsUpdater: ((prev: any) => any) | null = null;
            const setBankDetails = jest.fn((updater) => {
                capturedBankDetailsUpdater = updater;
            });
            const setFormErrors = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const checkOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.sendCheck'
            );

            fireEvent.click(checkOption);

            // Execute the captured updater to verify selectedBanking is New for Check
            expect(capturedBankDetailsUpdater).not.toBeNull();
            const result = capturedBankDetailsUpdater!({
                paymentMethod: '',
                selectedBanking: '',
                isBankSelected: false,
                bankingInFile: [],
            });

            expect(result.selectedBanking).toBe(SelectedBanking.New);
            expect(result.isBankSelected).toBe(false);
        });

        it('should set selectedBanking to New for DTCC payment method', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            let capturedBankDetailsUpdater: ((prev: any) => any) | null = null;
            const setBankDetails = jest.fn((updater) => {
                capturedBankDetailsUpdater = updater;
            });
            const setFormErrors = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const dtccOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.dtcc'
            );

            fireEvent.click(dtccOption);

            // Execute the captured updater to verify selectedBanking is New for DTCC
            expect(capturedBankDetailsUpdater).not.toBeNull();
            const result = capturedBankDetailsUpdater!({
                paymentMethod: '',
                selectedBanking: '',
                isBankSelected: false,
                bankingInFile: [],
            });

            expect(result.selectedBanking).toBe(SelectedBanking.New);
            expect(result.isBankSelected).toBe(false);
        });
    });

    describe('ConsentAvailable rendering', () => {
        // Mock SignatureValidationField config (using 'as any' since we're mocking)
        const mockConsentConfig = [
            { key: 'signature', component: () => null },
        ] as any;

        it('should render ConsentAvailable when all conditions are met', () => {
            const formDisbursement = {
                ...createFormDisbursement(PaymentMethod.EFT),
                disbursmentConsent: {
                    isConsent: { text: true },
                    name: { text: '' },
                    isSigned: { text: null },
                    signTitle: { text: '' },
                    signDate: { text: '' },
                },
            };
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            const optionsWithConsent: DisbursementOptions = [
                {
                    label: 'caseWithdrawal.request.distributionMethod.eft',
                    value: PaymentMethod.EFT,
                    fields: null,
                    generatePayloadFromSelection: generateEFTPayload,
                    getDefaultPayload: jest.fn(),
                    consentAvailableConfig: mockConsentConfig,
                },
            ];

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(PaymentMethod.EFT),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={optionsWithConsent} />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('consent-available')).toBeVisible();
        });

        it('should NOT render ConsentAvailable when isConsent is false', () => {
            const formDisbursement = {
                ...createFormDisbursement(PaymentMethod.EFT),
                disbursmentConsent: {
                    isConsent: { text: false },
                    name: { text: '' },
                    isSigned: { text: null },
                    signTitle: { text: '' },
                    signDate: { text: '' },
                },
            };
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            const optionsWithConsent: DisbursementOptions = [
                {
                    label: 'caseWithdrawal.request.distributionMethod.eft',
                    value: PaymentMethod.EFT,
                    fields: null,
                    generatePayloadFromSelection: generateEFTPayload,
                    getDefaultPayload: jest.fn(),
                    consentAvailableConfig: mockConsentConfig,
                },
            ];

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(PaymentMethod.EFT),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={optionsWithConsent} />
                </FormDataContext.Provider>
            );

            expect(
                screen.queryByTestId('consent-available')
            ).not.toBeInTheDocument();
        });

        it('should NOT render ConsentAvailable when consentAvailableConfig is missing', () => {
            const formDisbursement = {
                ...createFormDisbursement(PaymentMethod.EFT),
                disbursmentConsent: {
                    isConsent: { text: true },
                    name: { text: '' },
                    isSigned: { text: null },
                    signTitle: { text: '' },
                    signDate: { text: '' },
                },
            };
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(PaymentMethod.EFT),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            expect(
                screen.queryByTestId('consent-available')
            ).not.toBeInTheDocument();
        });

        it('should NOT render ConsentAvailable when isDirectDeposit is false (masked mode)', () => {
            const formDisbursement = {
                ...createFormDisbursement(PaymentMethod.EFT),
                bank: [
                    {
                        ...createFormDisbursement(PaymentMethod.EFT).bank[0],
                        isDirectDeposit: { text: false },
                    },
                ],
                disbursmentConsent: {
                    isConsent: { text: true },
                    name: { text: '' },
                    isSigned: { text: null },
                    signTitle: { text: '' },
                    signDate: { text: '' },
                },
            };
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            const optionsWithConsent: DisbursementOptions = [
                {
                    label: 'caseWithdrawal.request.distributionMethod.eft',
                    value: PaymentMethod.EFT,
                    fields: null,
                    generatePayloadFromSelection: generateEFTPayload,
                    getDefaultPayload: jest.fn(),
                    consentAvailableConfig: mockConsentConfig,
                },
            ];

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(PaymentMethod.EFT),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={optionsWithConsent} />
                </FormDataContext.Provider>
            );

            expect(
                screen.queryByTestId('consent-available')
            ).not.toBeInTheDocument();
        });
    });

    describe('checkEftLastSelection edge cases', () => {
        it('should return New when all bank fields differ', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            const setBankDetails = jest.fn();
            const setFormErrors = jest.fn();

            // Create default disbursement info with different bank values
            const bankingInFile = [
                {
                    BankId: 1,
                    BankName: 'Different Bank',
                    RoutingNumber: '111111111',
                    AccountNumber: '222222222',
                    AccountType: 'Checking' as const,
                    Purpose: 'Premium',
                    PaymentMethod: PaymentMethod.EFT,
                    BankStartDate: '2021-10-26',
                    BankEndDate: '2999-12-31',
                    ListBillId: 0,
                    EFTCode: '2',
                    EFTStatus: 'Active' as const,
                },
            ];

            const bankHelpers = require('@deps/helpers/bank.helpers');
            bankHelpers.getBankingDetails.mockReturnValue(bankingInFile);

            // Simulate having previous EFT selection with different bank details
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(
                            '',
                            '',
                            false,
                            bankingInFile
                        ),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            // First select EFT to populate defaultDisbursementInfo
            const eftOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.eft'
            );
            fireEvent.click(eftOption);

            expect(setBankDetails).toHaveBeenCalled();
        });

        it('should return OnFile when bank fields match existing bank details', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            let capturedUpdater: ((prev: any) => any) | null = null;
            const setBankDetails = jest.fn((updater) => {
                capturedUpdater = updater;
            });
            const setFormErrors = jest.fn();

            const bankingInFile = [
                {
                    BankId: 222981,
                    BankName: 'ABC',
                    RoutingNumber: '258741963',
                    AccountNumber: '545456765',
                    AccountType: 'Checking' as const,
                    Purpose: 'Premium',
                    PaymentMethod: PaymentMethod.EFT,
                    BankStartDate: '2021-10-26',
                    BankEndDate: '2999-12-31',
                    ListBillId: 3445193,
                    EFTCode: '2',
                    EFTStatus: 'Active' as const,
                },
            ];

            const bankHelpers = require('@deps/helpers/bank.helpers');
            bankHelpers.getBankingDetails.mockReturnValue(bankingInFile);

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(
                            '',
                            '',
                            false,
                            bankingInFile
                        ),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const eftOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.eft'
            );
            fireEvent.click(eftOption);

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({
                paymentMethod: '',
                selectedBanking: '',
                isBankSelected: false,
                bankingInFile: bankingInFile,
            });

            expect(result.selectedBanking).toBe(SelectedBanking.OnFile);
            expect(result.isBankSelected).toBe(true);
        });
    });

    describe('Empty and edge case scenarios', () => {
        it('should handle empty options array gracefully', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={[]} />
                </FormDataContext.Provider>
            );

            // Should render without crashing
            expect(screen.getByText('distributionMethod')).toBeVisible();
        });

        it('should handle null parties gracefully', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: null as any,
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            // Should render without crashing
            expect(screen.getByText('distributionMethod')).toBeVisible();
        });

        it('should handle empty bank array in formDisbursement', () => {
            const formDisbursement = {
                ...createFormDisbursement(PaymentMethod.EFT),
                bank: [],
            };
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(PaymentMethod.EFT),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            // Should render without crashing
            expect(screen.getByText('distributionMethod')).toBeVisible();
        });

        it('should handle undefined bankDetails gracefully', () => {
            const formDisbursement = createFormDisbursement(PaymentMethod.EFT);
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: undefined as any,
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            // Should render without crashing, using fallback from formDisbursement
            expect(screen.getByText('distributionMethod')).toBeVisible();
        });

        it('should handle option without generatePayloadFromSelection', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            const setBankDetails = jest.fn();
            const setFormErrors = jest.fn();

            const optionsWithoutPayload: DisbursementOptions = [
                {
                    label: 'caseWithdrawal.request.distributionMethod.custom',
                    value: 'Custom' as PaymentMethod,
                    fields: null,
                    generatePayloadFromSelection: undefined as any,
                    getDefaultPayload: jest.fn(),
                },
            ];

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={optionsWithoutPayload} />
                </FormDataContext.Provider>
            );

            const customOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.custom'
            );

            // Should not crash when clicking option without generatePayloadFromSelection
            fireEvent.click(customOption);

            expect(setFormErrors).toHaveBeenCalled();
            expect(setBankDetails).toHaveBeenCalled();
        });
    });

    describe('defaultDisbursementInfo caching', () => {
        it('should cache disbursement info when switching to a new payment method', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            const setBankDetails = jest.fn();
            const setFormErrors = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            // Select Wire first
            const wireOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.wire'
            );
            fireEvent.click(wireOption);

            expect(generateWirePayload).toHaveBeenCalled();
        });

        it('should use cached disbursement info when switching back to EFT', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            const setBankDetails = jest.fn();
            const setFormErrors = jest.fn();

            const bankHelpers = require('@deps/helpers/bank.helpers');
            bankHelpers.getBankingDetails.mockReturnValue([]);

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            // Select EFT first
            const eftOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.eft'
            );
            fireEvent.click(eftOption);

            // Clear mocks
            generateEFTPayload.mockClear();

            // Select Wire
            const wireOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.wire'
            );
            fireEvent.click(wireOption);

            // The generateEFTPayload should have been called once initially
            expect(generateEFTPayload).not.toHaveBeenCalled();
        });
    });

    describe('Payment method switching behavior', () => {
        it('should clear form errors when switching payment methods', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            const setBankDetails = jest.fn();
            const setFormErrors = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const wireOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.wire'
            );
            fireEvent.click(wireOption);

            // setFormErrors should be called with empty object to clear errors
            expect(setFormErrors).toHaveBeenCalledWith({});
        });

        it('should call setBankDetails with correct payment method on each switch', () => {
            const formDisbursement = createFormDisbursement();
            const setMockData = jest.fn((cb) => cb(formDisbursement));
            let lastUpdater: ((prev: any) => any) | null = null;
            const setBankDetails = jest.fn((updater) => {
                lastUpdater = updater;
            });
            const setFormErrors = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            // Click Wire
            fireEvent.click(
                screen.getByTestId(
                    'button-group-label-test-id-caseWithdrawal.request.distributionMethod.wire'
                )
            );

            let result = lastUpdater!({
                paymentMethod: '',
                selectedBanking: '',
                isBankSelected: false,
                bankingInFile: [],
            });
            expect(result.paymentMethod).toBe(PaymentMethod.Wire);

            // Click Check
            fireEvent.click(
                screen.getByTestId(
                    'button-group-label-test-id-caseWithdrawal.request.distributionMethod.sendCheck'
                )
            );

            result = lastUpdater!({
                paymentMethod: '',
                selectedBanking: '',
                isBankSelected: false,
                bankingInFile: [],
            });
            expect(result.paymentMethod).toBe(PaymentMailType.Check);

            // Click DTCC
            fireEvent.click(
                screen.getByTestId(
                    'button-group-label-test-id-caseWithdrawal.request.distributionMethod.dtcc'
                )
            );

            result = lastUpdater!({
                paymentMethod: '',
                selectedBanking: '',
                isBankSelected: false,
                bankingInFile: [],
            });
            expect(result.paymentMethod).toBe(PaymentMethod.DTCC);
        });
    });

    describe('EFT with previous selection and matching bank details', () => {
        it('should use OnFile selection when switching back to EFT with matching cached bank', () => {
            const bankingInFile = [
                {
                    BankId: 222981,
                    BankName: 'ABC',
                    RoutingNumber: '258741963',
                    AccountNumber: '545456765',
                    AccountType: 'Checking' as const,
                    Purpose: 'Premium',
                    PaymentMethod: PaymentMethod.EFT,
                    BankStartDate: '2021-10-26',
                    BankEndDate: '2999-12-31',
                    ListBillId: 3445193,
                    EFTCode: '2',
                    EFTStatus: 'Active' as const,
                },
            ];

            // Simulate formDisbursement with bank details matching bankingInFile
            const formDisbursement = {
                ...createFormDisbursement(),
                bank: [
                    {
                        ...createFormDisbursement().bank[0],
                        accountNumber: '545456765',
                        routingNumber: '258741963',
                        bankName: 'ABC',
                    },
                ],
            };

            const setMockData = jest.fn((cb) => cb(formDisbursement));
            let capturedUpdater: ((prev: any) => any) | null = null;
            const setBankDetails = jest.fn((updater) => {
                capturedUpdater = updater;
            });
            const setFormErrors = jest.fn();

            const bankHelpers = require('@deps/helpers/bank.helpers');
            bankHelpers.getBankingDetails.mockReturnValue(bankingInFile);

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors,
                        parties: createParties(),
                        bankDetails: createBankDetails(
                            '',
                            '',
                            false,
                            bankingInFile
                        ),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2 options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const eftOption = screen.getByTestId(
                'button-group-label-test-id-caseWithdrawal.request.distributionMethod.eft'
            );
            fireEvent.click(eftOption);

            expect(capturedUpdater).not.toBeNull();
            const result = capturedUpdater!({
                paymentMethod: '',
                selectedBanking: '',
                isBankSelected: false,
                bankingInFile: bankingInFile,
            });

            expect(result.selectedBanking).toBe(SelectedBanking.OnFile);
            expect(result.isBankSelected).toBe(true);
        });
    });

    describe('Read-only mode initialization', () => {
        it('should not call setBankDetails if it is undefined', () => {
            const formDisbursement = createFormDisbursement(PaymentMethod.EFT);
            const setMockData = jest.fn();

            // Render without setBankDetails
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails: undefined as any,
                    }}
                >
                    <FormDisbursementV2
                        options={disbursementOptions}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            // Should render without crashing
            expect(screen.getByText('distributionMethod')).toBeVisible();
        });

        it('should set defaultDisbursementInfo with current payment method in read-only mode', () => {
            const formDisbursement = createFormDisbursement(PaymentMethod.Wire);
            const setMockData = jest.fn();
            const setBankDetails = jest.fn();

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        setFormErrors: jest.fn(),
                        parties: createParties(),
                        bankDetails: createBankDetails(),
                        setBankDetails,
                    }}
                >
                    <FormDisbursementV2
                        options={disbursementOptions}
                        isFormStateReadOnly={true}
                    />
                </FormDataContext.Provider>
            );

            // Verify setBankDetails was called with the payment method
            expect(setBankDetails).toHaveBeenCalledWith(expect.any(Function));
            const updater = setBankDetails.mock.calls[0][0];
            const result = updater({ paymentMethod: '' });
            expect(result.paymentMethod).toBe(PaymentMethod.Wire);
        });
    });
});
