import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { TFunctionDetailedResult } from 'i18next';
import { TFunction } from 'next-i18next';

import getFlicConfig from '@deps/containers/otp/withdrawal-forms/flic-withdrawal-form.helpers';
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
    QualTypes,
} from '@deps/models/case/withdrawal/case';
import { PaymentMethodOption } from '@deps/models/case/withdrawal/disbursement-types';

import FormDisbursement, { getBankFieldsList } from './form-disbursement';
import { BankingFields } from './form-disbursement.helpers';
import { DEFAULT_ADDRESS } from '../address-entry';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {
            language: DEFAULT_LOCALE,
        },
    }),
}));
afterEach(() => {
    jest.clearAllMocks();
});
describe('Form Disbursment Updated Component', () => {
    describe('FLIC Form', () => {
        const t: TFunction = (key: string | string[]) =>
            key as unknown as TFunctionDetailedResult<string>;

        const flicCOnfiguration = getFlicConfig(t, QualTypes.CustInhIRA);
        const generateEFTPayload = jest.fn(() => {
            return {} as FormDisbursementType;
        });
        const generateWirePayload = jest.fn(() => {
            return {} as FormDisbursementType;
        });
        const generateCheckPayload = jest.fn(() => {
            return {} as FormDisbursementType;
        });
        const generateExpressCheckPayload = jest.fn(() => {
            return {} as FormDisbursementType;
        });

        const disbursementOptions: PaymentMethodOption[] = [
            {
                label: 'caseWithdrawal.request.distributionMethod.eft',
                value: PaymentMethod.EFT,
                fields:
                    flicCOnfiguration.disbursementOptions.find(
                        (option) => option.value === PaymentMethod.EFT
                    )?.fields || null,
                generatePayloadFromSelection: generateEFTPayload,
                getDefaultPayload: jest.fn(),
            },
            {
                label: 'caseWithdrawal.request.distributionMethod.wire',
                value: PaymentMethod.Wire,
                getDefaultPayload: jest.fn(),
                fields:
                    flicCOnfiguration.disbursementOptions.find(
                        (option) => option.value === PaymentMethod.Wire
                    )?.fields || null,

                generatePayloadFromSelection: generateWirePayload,
            },
            {
                label: 'caseWithdrawal.request.distributionMethod.sendCheck',
                value: PaymentMailType.Check,
                getDefaultPayload: jest.fn(),
                fields:
                    flicCOnfiguration.disbursementOptions.find(
                        (option) => option.value === PaymentMailType.Check
                    )?.fields || null,
                generatePayloadFromSelection: generateCheckPayload,
            },
            {
                label: 'caseWithdrawal.request.distributionMethod.overnightCheck',
                value: PaymentMailType.ExpressCheck,
                getDefaultPayload: jest.fn(),
                fields:
                    flicCOnfiguration.disbursementOptions.find(
                        (option) =>
                            option.value === PaymentMailType.ExpressCheck
                    )?.fields || null,
                generatePayloadFromSelection: generateExpressCheckPayload,
            },
            {
                label: 'caseWithdrawal.request.distributionMethod.dtcc',
                value: PaymentMethod.DTCC,
                getDefaultPayload: jest.fn(),
                fields:
                    flicCOnfiguration.disbursementOptions.find(
                        (option) => option.value === PaymentMethod.DTCC
                    )?.fields || null,
                generatePayloadFromSelection: generateExpressCheckPayload,
            },
        ];

        it('should render the title', () => {
            const formDisbursement = {
                paymentMethod: { text: null },
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
            };
            let setMethodArgs;
            const setMockData = jest.fn((cb) => {
                setMethodArgs = cb(formDisbursement);
                return setMethodArgs;
            });

            const parties = [
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

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                        parties,
                    }}
                >
                    <FormDisbursement options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const sectionTitle = screen.getByText('distributionMethod');
            expect(sectionTitle).toBeInTheDocument();
            expect(sectionTitle.tagName).toBe('H3');
        });

        it('should render all the disbursement options', () => {
            const formDisbursement = {
                paymentMethod: { text: null },
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
            };
            let setMethodArgs;
            const setMockData = jest.fn((cb) => {
                setMethodArgs = cb(formDisbursement);
                return setMethodArgs;
            });

            const parties = [
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

            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        parties,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                    }}
                >
                    <FormDisbursement options={disbursementOptions} />
                </FormDataContext.Provider>
            );
            const eftOptionElement = screen.getByText(
                'caseWithdrawal.request.distributionMethod.eft'
            );
            expect(eftOptionElement).toBeInTheDocument();

            const wireOptionElement = screen.getByText(
                'caseWithdrawal.request.distributionMethod.wire'
            );
            expect(wireOptionElement).toBeInTheDocument();

            const sendCheckOptionElement = screen.getByText(
                'caseWithdrawal.request.distributionMethod.sendCheck'
            );
            expect(sendCheckOptionElement).toBeInTheDocument();

            const expressCheckOptionElement = screen.getByText(
                'caseWithdrawal.request.distributionMethod.overnightCheck'
            );
            expect(expressCheckOptionElement).toBeInTheDocument();

            const dtccOptionElement = screen.getByText(
                'caseWithdrawal.request.distributionMethod.dtcc'
            );
            expect(dtccOptionElement).toBeInTheDocument();
            // bank details should not load
            const isVoidCheckAttachedElement =
                screen.queryByText(`isVoidCheckAttached`);
            expect(isVoidCheckAttachedElement).not.toBeInTheDocument();

            const sectionTitle = screen.queryByText(
                `doesCheckMeetSecurityRequirements`
            );
            expect(sectionTitle).not.toBeInTheDocument();

            const bankNameElement = screen.queryByTestId(`bankName`);
            expect(bankNameElement).not.toBeInTheDocument();

            const bankRoutingNumberElement =
                screen.queryByTestId(`bankRoutingNumber`);
            expect(bankRoutingNumberElement).not.toBeInTheDocument();

            const accountNumberElement = screen.queryByTestId(`accountNumber`);
            expect(accountNumberElement).not.toBeInTheDocument();

            const furtherAcNameElement = screen.queryByTestId(
                'bankFurtherCreditAccount'
            );
            expect(furtherAcNameElement).not.toBeInTheDocument();

            const furtherAcNumberElement = screen.queryByTestId(
                'bankFurtherCreditName'
            );
            expect(furtherAcNumberElement).not.toBeInTheDocument();
        });

        it('should render payload correctly on sendCheck option selection', () => {
            const formDisbursement = {
                paymentMethod: { text: PaymentMethod.DTCC },
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
                        bankName: '',
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
            };
            let setMethodArgs;
            const setMockData = jest.fn((cb) => {
                setMethodArgs = cb(formDisbursement);
                return setMethodArgs;
            });
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                    }}
                >
                    <FormDisbursement options={disbursementOptions} />
                </FormDataContext.Provider>
            );
            const sendCheckOptionElement = screen.getByTestId(
                `button-group-label-test-id-caseWithdrawal.request.distributionMethod.sendCheck`
            );

            jest.clearAllMocks();
            fireEvent.click(sendCheckOptionElement);

            expect(setMockData).toHaveBeenCalled();
            expect(generateCheckPayload).toHaveBeenCalledWith(undefined);
        });

        it('should render payload correctly on expressCheck option selection', () => {
            const formDisbursement = {
                paymentMethod: { text: PaymentMethod.DTCC },
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
                        bankName: '',
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
            };
            let setMethodArgs;
            const setMockData = jest.fn((cb) => {
                setMethodArgs = cb(formDisbursement);
                return setMethodArgs;
            });
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                    }}
                >
                    <FormDisbursement options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const expressCheckOptionElement = screen.getByTestId(
                `button-group-label-test-id-caseWithdrawal.request.distributionMethod.overnightCheck`
            );
            fireEvent.click(expressCheckOptionElement);

            expect(setMockData).toHaveBeenCalled();
            expect(generateExpressCheckPayload).toHaveBeenCalledWith(undefined);
        });

        it('should render payload correctly on DTCC option selection', () => {
            const formDisbursement = {
                paymentMethod: { text: PaymentMethod.DTCC },
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
                        bankName: '',
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
            };
            let setMethodArgs;
            const setMockData = jest.fn((cb) => {
                setMethodArgs = cb(formDisbursement);
                return setMethodArgs;
            });
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultFormDataContext,
                        currentFormState: CaseStatus.Pending,
                        formDisbursement,
                        setFormDisbursement: setMockData,
                    }}
                >
                    <FormDisbursement options={disbursementOptions} />
                </FormDataContext.Provider>
            );

            const dtccOptionElement = screen.getByTestId(
                `button-group-label-test-id-caseWithdrawal.request.distributionMethod.dtcc`
            );
            fireEvent.click(dtccOptionElement);

            expect(setMockData).toHaveBeenCalled();
            expect(generateExpressCheckPayload).toHaveBeenCalledWith(undefined);
        });

        // returns all fields when isFormStateReadOnly is false and existingBankSelected is false
        it('should return all fields when isFormStateReadOnly is false and existingBankSelected is false', () => {
            const fields = [
                { fieldName: BankingFields.BankName, component: <></> },
                {
                    fieldName: BankingFields.BankRoutingNumber,
                    component: <></>,
                },
                {
                    fieldName: BankingFields.ReEnterBankRoutingNumber,
                    component: <></>,
                },
                { fieldName: BankingFields.AccountNumber, component: <></> },
                {
                    fieldName: BankingFields.ReEnterAccountNumber,
                    component: <></>,
                },
            ];

            const existingBankSelected = false;
            const isFormStateReadOnly = false;

            const result = getBankFieldsList(
                fields as any,
                existingBankSelected,
                isFormStateReadOnly
            );
            expect(result).toEqual(fields);
        });

        it('should return less fields when isFormStateReadOnly is true', () => {
            const fields = [
                { fieldName: BankingFields.BankName, component: <></> },
                {
                    fieldName: BankingFields.BankRoutingNumber,
                    component: <></>,
                },
                {
                    fieldName: BankingFields.ReEnterBankRoutingNumber,
                    component: <></>,
                },
                { fieldName: BankingFields.AccountNumber, component: <></> },
                {
                    fieldName: BankingFields.ReEnterAccountNumber,
                    component: <></>,
                },
            ];

            const existingBankSelected = false;
            const isFormStateReadOnly = true;

            const result = getBankFieldsList(
                fields as any,
                existingBankSelected,
                isFormStateReadOnly
            );
            expect(result).not.toEqual(fields);
        });

        it('should return less fields when existingBankSelected is true', () => {
            const fields = [
                { fieldName: BankingFields.BankName, component: <></> },
                {
                    fieldName: BankingFields.BankRoutingNumber,
                    component: <></>,
                },
                {
                    fieldName: BankingFields.ReEnterBankRoutingNumber,
                    component: <></>,
                },
                { fieldName: BankingFields.AccountNumber, component: <></> },
                {
                    fieldName: BankingFields.ReEnterAccountNumber,
                    component: <></>,
                },
            ];

            const existingBankSelected = true;
            const isFormStateReadOnly = false;

            const result = getBankFieldsList(
                fields as any,
                existingBankSelected,
                isFormStateReadOnly
            );
            expect(result).not.toEqual(fields);
        });
    });
});
