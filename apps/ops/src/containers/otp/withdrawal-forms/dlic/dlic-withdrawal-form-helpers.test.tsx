import { renderHook } from '@testing-library/react';
import { TFunctionDetailedResult } from 'i18next';
import { TFunction } from 'next-i18next';

import { DEFAULT_ADDRESS } from '@deps/components/otp-withdrawal-form/address-entry';
import { LifeCadParty } from '@deps/models/case/lifecad-party';
import {
    AccountType,
    Address,
    BankDetails,
    FormParty,
    PaymentMailType,
    PaymentMethod,
    Party,
    PartyRoles,
} from '@deps/models/case/withdrawal/case';
import {
    BankFieldConfig,
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
} from '@deps/models/case/withdrawal/disbursement-types';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    Party as SorParty,
    PolicyPartyRoles,
} from '@zinnia/api-types/types/sor';

// Helper type for disbursementOptions parties arg (LifeCadParty[] | Party[] from API)
type PartiesArg = LifeCadParty[] | SorParty[];

/** Minimal party shape used when testing annuitant address fallback (partyId + addresses only). */
type MockPartyForAddressFallback = {
    partyId: string;
    addresses?: Array<Record<string, unknown>>;
};

/** Cast test mock parties to PartiesArg; disbursementOptions only uses partyId and addresses. */
function partiesArg(parties: MockPartyForAddressFallback[]): PartiesArg {
    return parties as PartiesArg;
}

// Type for field configuration with optional annuitantAddress (for test assertions)
type FieldConfig = Record<string, unknown> & {
    fieldName: string;
    annuitantAddress?: Address;
};

// Mock the helper modules before importing
jest.mock(
    '@deps/components/otp-withdrawal-form/form-program/form-program.helpers',
    () => ({
        getDefaultFormProgramValues: () => {
            return { thisIsMocked: true };
        },
    })
);

jest.mock(
    '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers',
    () => ({
        getDefaultFormDisbursementValues: () => {
            return {
                thisIsMocked: true,
            };
        },
        BankingFields: {
            Bank: 'bank',
            AccountNumber: 'accountNumber',
            PayeeName: 'payeeName',
            Address: 'address',
            SelectIfPayeeIsDifferent: 'selectIfPayeeIsDifferent',
        },
        DisbursementFields: {
            SelectBank: 'SelectBank',
            BankTextField: 'BankTextField',
            BankCheckboxField: 'BankCheckboxField',
            BankAddress: 'BankAddress',
            AccountTypes: 'AccountTypes',
            BankBooleanButtonGroup: 'BankBooleanButtonGroup',
            SendCheckSelect: 'SendCheckSelect',
        },
        updateBankingDetails: jest.fn(),
        shouldDisplayPayeeName: jest.fn(),
        shouldDisplayAddress: jest.fn(),
    })
);

import useDlicConfig from './dlic-withdrawal-form-helpers';

describe('Dlic withdrawal form config', () => {
    const t: TFunction = (key: string | string[]) =>
        key as unknown as TFunctionDetailedResult<string>;

    describe('Config existence', () => {
        it('should return an object with the correct configuration options', () => {
            const {
                result: { current },
            } = renderHook(() => useDlicConfig(t, false));

            expect(current.signaturesConfig).toBeDefined();
            expect(current.signaturesNotaryConfig).toBeDefined();
            expect(current.fundWithdrawnMethodOptions).toBeDefined();
            expect(current.partialWithdrawalOptions).toBeDefined();
            expect(current.identifySelectedFormProgramOption).toBeDefined();
            expect(current.disbursementOptions).toBeDefined();
            expect(current.formPartyConfigs).toBeDefined();
            expect(current.selectOneOptions).toBeDefined();
        });
    });

    describe('disbursementOptions with isDlic3pDisbursementChangesEnabled = false', () => {
        const featureFlags = {
            [FEATURE_FLAGS.DLIC_3P_DISBURSEMENT_CHANGES]: false,
        };
        const {
            result: { current },
        } = renderHook(() =>
            useDlicConfig(
                t,
                !!featureFlags[FEATURE_FLAGS.DLIC_3P_DISBURSEMENT_CHANGES]
            )
        );
        const { disbursementOptions } = current;
        const emptyFormParty: FormParty = { parties: [] };
        const options = disbursementOptions(emptyFormParty, false, [], []);
        const bank: BankDetails = {
            accountNumber: '12345',
            accountType: { text: AccountType.Checking },
            bankContactPerson: 'Fred Mockerson',
            bankFurtherCreditAccount: '23456',
            bankFurtherCreditName: 'Jan Mockington',
            bankInfoCompleteInd: 'Sure',
            bankLocation: 'Mockville',
            bankName: 'Bank of Mockville',
            bankPhone: '867-5309',
            nameOnBankAccount: 'Eli Mockerson',
            routingNumber: '123456789',
            maskedAccountNumber: null,
            isDirectDepositValid: {
                text: null,
            },
        };

        const bankingDetails: DisbursementParts = {
            ...DEFAULT_DISBURSEMENT_UPDATE,
            accountNumber: bank.accountNumber || '',
            accountType: AccountType.Checking,
            bankName: bank.bankName || '',
            accountHolder: bank.nameOnBankAccount || '',
            bankFurtherCreditAccount: bank.bankFurtherCreditAccount || '',
            bankFurtherCreditName: bank.bankFurtherCreditName || '',
            bankRoutingNumber: bank.routingNumber || '',
            isVoidCheckAttached: true,
            doesCheckMeetSecurityRequirements: true,
            payeeName: bank.nameOnBankAccount || '',
            selectIfPayeeIsDifferent: true,
            maskedAccountNumber: '1234',
            isDirectDepositValid: true,
            reEnterAccountNumber: '123',
            reEnterBankRoutingNumber: '123',
        };

        describe('payload generation', () => {
            it('should generate a correct payload for an eft bank type full selection', () => {
                const eftOption = options.find(
                    (option) => option.value === PaymentMethod.EFT
                );

                const result =
                    eftOption?.generatePayloadFromSelection(bankingDetails);
                expect(result).toMatchObject({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMethod.EFT },
                    paymentMailType: { text: null },
                });
                expect(result!.bank[0]).toMatchObject({
                    accountNumber: bankingDetails.accountNumber,
                    accountType: {
                        text: bankingDetails.accountType,
                    },
                    bankName: bankingDetails.bankName,
                    routingNumber: bankingDetails.bankRoutingNumber,
                    reEnterAccountNumber: bankingDetails.reEnterAccountNumber,
                    reEnterBankRoutingNumber:
                        bankingDetails.reEnterBankRoutingNumber,
                });
            });

            it('should generate a correct payload for an eft bank type masked selection', () => {
                const eftOption = options.find(
                    (option) => option.value === PaymentMethod.EFT
                );

                // Create masked account details
                const maskedBankingDetails: DisbursementParts = {
                    ...DEFAULT_DISBURSEMENT_UPDATE,
                    accountNumber: '',
                    accountType: '' as AccountType,
                    bankName: '',
                    bankRoutingNumber: '',
                    isDirectDeposit: false,
                    maskedAccountNumber: '1234',
                };

                const result =
                    eftOption?.generatePayloadFromSelection(
                        maskedBankingDetails
                    );
                expect(result).toMatchObject({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMethod.EFT },
                    paymentMailType: { text: null },
                });
                expect(result!.bank[0]).toMatchObject({
                    isDirectDeposit: { text: false },
                    maskedAccountNumber: '1234',
                });
            });

            it('should generate a correct payload for a wire selection', () => {
                const wireOption = options.find(
                    (option) => option.value === PaymentMethod.Wire
                );

                const result =
                    wireOption?.generatePayloadFromSelection(bankingDetails);
                expect(result).toMatchObject({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMethod.Wire },
                    paymentMailType: { text: null },
                });
                expect(result!.bank[0]).toMatchObject({
                    accountNumber: bankingDetails.accountNumber,
                    accountType: {
                        text: bankingDetails.accountType,
                    },
                    bankName: bankingDetails.bankName,
                    routingNumber: bankingDetails.bankRoutingNumber,
                    reEnterAccountNumber: bankingDetails.reEnterAccountNumber,
                    reEnterBankRoutingNumber:
                        bankingDetails.reEnterBankRoutingNumber,
                });
            });

            it('should generate a correct payload for a check selection', () => {
                const checkOption = options.find(
                    (option) => option.value === PaymentMailType.Check
                );
                const result =
                    checkOption?.generatePayloadFromSelection(bankingDetails);
                expect(result).toMatchObject({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: null },
                    isDifferentPayeeOrAddress: {
                        text: bankingDetails.selectIfPayeeIsDifferent,
                    },
                    payee: {
                        name: { text: bankingDetails.payeeName },
                        addresses: [bankingDetails.address],
                        contractNumber: { text: null },
                    },
                });
                // Legacy version does NOT include isAnnuitant or isPayeeFinancialIns
                expect(result?.isAnnuitant).toBeUndefined();
                expect(result?.isPayeeFinancialIns).toBeUndefined();
            });

            it('should generate a correct payload for an expressCheck selection', () => {
                const expressCheckOption = options.find(
                    (option) => option.value === PaymentMailType.ExpressCheck
                );

                const result =
                    expressCheckOption?.generatePayloadFromSelection(
                        bankingDetails
                    );
                expect(result).toMatchObject({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: PaymentMailType.ExpressCheck },
                });
            });
        });

        it('should render Send Check option with legacy fields when flag is false', () => {
            const checkOption = options.find(
                (option) => option.value === PaymentMailType.Check
            );

            expect(checkOption).toBeDefined();
            expect(checkOption?.label).toBe('distributionMethod.sendCheck');
            expect(checkOption?.fields).toHaveLength(3);

            // Check for SelectIfPayeeIsDifferent field (legacy version)
            const selectIfPayeeField = checkOption?.fields?.find(
                (field: BankFieldConfig) =>
                    field.fieldName === 'selectIfPayeeIsDifferent'
            );
            expect(selectIfPayeeField).toBeDefined();
            expect(selectIfPayeeField?.fieldLabel).toBe(
                'distributionMethod.selectIfDifferentPayee'
            );

            // Check for PayeeName field (no shouldDisplay in legacy version)
            const payeeNameField = checkOption?.fields?.find(
                (field: BankFieldConfig) => field.fieldName === 'payeeName'
            );
            expect(payeeNameField).toBeDefined();
            expect(payeeNameField?.shouldDisplay).toBeUndefined();

            // Check for Address field (no shouldDisplay in legacy version)
            const addressField = checkOption?.fields?.find(
                (field: BankFieldConfig) => field.fieldName === 'address'
            );
            expect(addressField).toBeDefined();
            expect(addressField?.shouldDisplay).toBeUndefined();
        });
    });

    describe('disbursementOptions with isDlic3pDisbursementChangesEnabled = true', () => {
        const featureFlags = {
            [FEATURE_FLAGS.DLIC_3P_DISBURSEMENT_CHANGES]: true,
        };
        const {
            result: { current },
        } = renderHook(() =>
            useDlicConfig(
                t,
                !!featureFlags[FEATURE_FLAGS.DLIC_3P_DISBURSEMENT_CHANGES]
            )
        );
        const { disbursementOptions } = current;
        const emptyFormParty: FormParty = { parties: [] };
        const options = disbursementOptions(emptyFormParty, false, [], []);
        const bank: BankDetails = {
            accountNumber: '12345',
            accountType: { text: AccountType.Checking },
            bankContactPerson: 'Fred Mockerson',
            bankFurtherCreditAccount: '23456',
            bankFurtherCreditName: 'Jan Mockington',
            bankInfoCompleteInd: 'Sure',
            bankLocation: 'Mockville',
            bankName: 'Bank of Mockville',
            bankPhone: '867-5309',
            nameOnBankAccount: 'Eli Mockerson',
            routingNumber: '123456789',
            maskedAccountNumber: null,
            isDirectDepositValid: {
                text: null,
            },
        };

        const bankingDetails: DisbursementParts = {
            ...DEFAULT_DISBURSEMENT_UPDATE,
            accountNumber: bank.accountNumber || '',
            accountType: AccountType.Checking,
            bankName: bank.bankName || '',
            accountHolder: bank.nameOnBankAccount || '',
            bankFurtherCreditAccount: bank.bankFurtherCreditAccount || '',
            bankFurtherCreditName: bank.bankFurtherCreditName || '',
            bankRoutingNumber: bank.routingNumber || '',
            isDirectDeposit: true,
            payeeName: 'Mock Payee',
            address: DEFAULT_ADDRESS,
            selectIfPayeeIsDifferent: true,
            maskedAccountNumber: '1234',
            isDirectDepositValid: true,
            reEnterAccountNumber: '123',
            reEnterBankRoutingNumber: '123',
        };

        it('should return all disbursement options including EFT, Wire, Check, and ExpressCheck', () => {
            expect(options).toHaveLength(4);
            expect(options[0].value).toBe(PaymentMethod.EFT);
            expect(options[1].value).toBe(PaymentMethod.Wire);
            expect(options[2].value).toBe(PaymentMailType.Check);
            expect(options[3].value).toBe(PaymentMailType.ExpressCheck);
        });

        it('should render Send Check option with new fields when flag is true', () => {
            const checkOption = options.find(
                (option) => option.value === PaymentMailType.Check
            );

            expect(checkOption).toBeDefined();
            expect(checkOption?.label).toBe('distributionMethod.sendCheck');
            expect(checkOption?.fields).toHaveLength(3);

            // Check for SendCheckSelect field (new version)
            const sendCheckSelectField = checkOption?.fields?.find(
                (field: FieldConfig) => field.fieldName === 'SendCheckSelect'
            );
            expect(sendCheckSelectField).toBeDefined();

            // Check for PayeeName field with shouldDisplay (new version)
            const payeeNameField = checkOption?.fields?.find(
                (field: BankFieldConfig) => field.fieldName === 'payeeName'
            );
            expect(payeeNameField).toBeDefined();
            expect(payeeNameField?.shouldDisplay).toBeDefined();
            expect(typeof payeeNameField?.shouldDisplay).toBe('function');

            // Check for Address field with shouldDisplay (new version)
            const addressField = checkOption?.fields?.find(
                (field: BankFieldConfig) => field.fieldName === 'address'
            );
            expect(addressField).toBeDefined();
            expect(addressField?.shouldDisplay).toBeDefined();
            expect(typeof addressField?.shouldDisplay).toBe('function');
            // annuitantAddress will be undefined when parties array is empty
            expect(addressField?.annuitantAddress).toBeUndefined();
        });

        it('should NOT have SelectIfPayeeIsDifferent field when flag is true', () => {
            const checkOption = options.find(
                (option) => option.value === PaymentMailType.Check
            );

            const selectIfPayeeField = checkOption?.fields?.find(
                (field: BankFieldConfig) =>
                    field.fieldName === 'selectIfPayeeIsDifferent'
            );
            expect(selectIfPayeeField).toBeUndefined();
        });

        it('should pass annuitantAddress to SendCheckSelect and BankAddress fields when party data is provided', () => {
            const mockAnnuitantAddress = {
                addressLine1: '123 Annuitant St',
                addressLine2: 'Apt 1',
                addressLine3: null,
                addressLine4: null,
                addressType: 'DEFAULT',
                city: 'Annuitant City',
                state: 'CA',
                zip: '90210',
                zipPlusFour: null,
                country: 'USA',
            };

            const formPartyWithAddress: FormParty = {
                parties: [
                    {
                        partyRoleType: PartyRoles.ANNUITANT,
                        addresses: [mockAnnuitantAddress],
                    } as Party,
                ],
            };

            const optionsWithParty = disbursementOptions(
                formPartyWithAddress,
                false,
                [],
                []
            );
            const checkOption = optionsWithParty.find(
                (option) => option.value === PaymentMailType.Check
            );

            // Cast fields to allow accessing annuitantAddress property
            const fields = checkOption?.fields as FieldConfig[] | undefined;

            // Verify SendCheckSelect field receives annuitantAddress
            const sendCheckSelectField = fields?.find(
                (field) => field.fieldName === 'SendCheckSelect'
            );
            expect(sendCheckSelectField).toBeDefined();
            expect(sendCheckSelectField?.annuitantAddress).toEqual(
                mockAnnuitantAddress
            );

            // Verify BankAddress field also receives annuitantAddress
            const addressField = fields?.find(
                (field) => field.fieldName === 'address'
            );
            expect(addressField).toBeDefined();
            expect(addressField?.annuitantAddress).toEqual(
                mockAnnuitantAddress
            );
        });

        describe('building annuitant address from parties when formParty has no address and not LC', () => {
            it('should build annuitantAddress from parties and partyRoles and pass to Check option fields', () => {
                const formPartyNoAddress: FormParty = { parties: [] };
                const partyRoles = [
                    { partyRole: 'ANNUITANT', partyId: 'annuitant-party-1' },
                ];
                const rawPreferredAddress = {
                    preferredAddress: true,
                    addressLine1: '456 Raw API St',
                    addressLine2: 'Suite B',
                    addressLine3: null,
                    addressLine4: null,
                    addressType: 'RESIDENCE',
                    city: 'New York',
                    state: 'NY',
                    zipCode: '10001',
                    zipCodeExtension: '1234',
                    country: 'USA',
                };
                const parties = [
                    {
                        partyId: 'annuitant-party-1',
                        addresses: [rawPreferredAddress],
                    },
                ];

                const optionsWithParties = disbursementOptions(
                    formPartyNoAddress,
                    false,
                    partiesArg(parties),
                    partyRoles as PolicyPartyRoles[]
                );
                const checkOption = optionsWithParties.find(
                    (option) => option.value === PaymentMailType.Check
                );
                const fields = checkOption?.fields as FieldConfig[] | undefined;

                const sendCheckSelectField = fields?.find(
                    (field) => field.fieldName === 'SendCheckSelect'
                );
                const addressField = fields?.find(
                    (field) => field.fieldName === 'address'
                );

                expect(sendCheckSelectField?.annuitantAddress).toBeDefined();
                expect(sendCheckSelectField?.annuitantAddress).toMatchObject({
                    addressLine1: '456 Raw API St',
                    addressLine2: 'Suite B',
                    city: 'New York',
                    zip: '10001',
                    zipPlusFour: '1234',
                    country: 'USA',
                });
                expect(addressField?.annuitantAddress).toBeDefined();
                expect(addressField?.annuitantAddress).toMatchObject({
                    addressLine1: '456 Raw API St',
                    addressLine2: 'Suite B',
                    city: 'New York',
                    zip: '10001',
                    zipPlusFour: '1234',
                    country: 'USA',
                });
            });

            it('should not build address from parties when isLC is true', () => {
                const formPartyNoAddress: FormParty = { parties: [] };
                const partyRoles = [
                    { partyRole: 'ANNUITANT', partyId: 'annuitant-party-1' },
                ];
                const parties = [
                    {
                        partyId: 'annuitant-party-1',
                        addresses: [
                            {
                                preferredAddress: true,
                                addressLine1: '456 St',
                                zipCode: '10001',
                                state: 'NY',
                                city: 'New York',
                                country: 'USA',
                            },
                        ],
                    },
                ];

                const options = disbursementOptions(
                    formPartyNoAddress,
                    true,
                    partiesArg(parties),
                    partyRoles as PolicyPartyRoles[]
                );
                const checkOption = options.find(
                    (option) => option.value === PaymentMailType.Check
                );
                const addressField = (
                    checkOption?.fields as FieldConfig[]
                )?.find((field) => field.fieldName === 'address');

                expect(addressField?.annuitantAddress).toBeUndefined();
            });

            it('should not build address when parties has no matching annuitant', () => {
                const formPartyNoAddress: FormParty = { parties: [] };
                const partyRoles = [
                    { partyRole: 'ANNUITANT', partyId: 'annuitant-party-1' },
                ];
                const parties = [{ partyId: 'other-party', addresses: [] }];

                const options = disbursementOptions(
                    formPartyNoAddress,
                    false,
                    partiesArg(parties),
                    partyRoles as PolicyPartyRoles[]
                );
                const checkOption = options.find(
                    (option) => option.value === PaymentMailType.Check
                );
                const addressField = (
                    checkOption?.fields as FieldConfig[]
                )?.find((field) => field.fieldName === 'address');

                expect(addressField?.annuitantAddress).toBeUndefined();
            });

            it('should not build address when annuitant party has no preferred address', () => {
                const formPartyNoAddress: FormParty = { parties: [] };
                const partyRoles = [
                    { partyRole: 'ANNUITANT', partyId: 'annuitant-party-1' },
                ];
                const parties = [
                    {
                        partyId: 'annuitant-party-1',
                        addresses: [
                            {
                                preferredAddress: false,
                                addressLine1: '456 St',
                                zipCode: '10001',
                                state: 'NY',
                                city: 'New York',
                                country: 'USA',
                            },
                        ],
                    },
                ];

                const options = disbursementOptions(
                    formPartyNoAddress,
                    false,
                    partiesArg(parties),
                    partyRoles as PolicyPartyRoles[]
                );
                const checkOption = options.find(
                    (option) => option.value === PaymentMailType.Check
                );
                const addressField = (
                    checkOption?.fields as FieldConfig[]
                )?.find((field) => field.fieldName === 'address');

                expect(addressField?.annuitantAddress).toBeUndefined();
            });
        });

        describe('payload generation', () => {
            it('should generate a correct payload for an eft bank type full selection', () => {
                const eftOption = options.find(
                    (option) => option.value === PaymentMethod.EFT
                );

                const result =
                    eftOption?.generatePayloadFromSelection(bankingDetails);
                expect(result).toMatchObject({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMethod.EFT },
                    paymentMailType: { text: null },
                });
                expect(result!.bank[0]).toMatchObject({
                    accountNumber: bankingDetails.accountNumber,
                    accountType: {
                        text: bankingDetails.accountType,
                    },
                    bankName: bankingDetails.bankName,
                    routingNumber: bankingDetails.bankRoutingNumber,
                    reEnterAccountNumber: bankingDetails.reEnterAccountNumber,
                    reEnterBankRoutingNumber:
                        bankingDetails.reEnterBankRoutingNumber,
                });
            });

            it('should generate a correct payload for a check selection with new structure', () => {
                const checkOption = options.find(
                    (option) => option.value === PaymentMailType.Check
                );
                const result =
                    checkOption?.generatePayloadFromSelection(bankingDetails);
                expect(result).toMatchObject({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: null },
                    isAnnuitant: bankingDetails.isAnnuitant || false,
                    payee: {
                        name: { text: bankingDetails.payeeName },
                        addresses: [bankingDetails.address],
                        contractNumber: { text: null },
                    },
                });
                // Should NOT have isDifferentPayeeOrAddress in new version
                expect(result?.isDifferentPayeeOrAddress).toBeUndefined();
            });
        });
    });
});
