import { TFunction } from 'next-i18next';

import { LifeCadParty } from '@deps/models/case/lifecad-party';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    AccountType,
    Address,
    AddressTypes,
    AmountType,
    FormParty,
    Frequency,
    PaymentMethod,
    PaymentMailType,
    SSWType,
} from '@deps/models/case/withdrawal/case';
import { FEATURE_FLAGS } from '@deps/utils/optimizely/flags';
import {
    Party as SorParty,
    PolicyPartyRoles,
} from '@zinnia/api-types/types/sor';

import getDlicConfig from './dlic-ssw-from-helpers';

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

jest.mock(
    '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers',
    () => ({
        getDefaultFormDisbursementValues: () => ({ mockedDisbursement: true }),
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
        shouldDisplayPayeeName: jest.fn(() => true),
        shouldDisplayAddress: jest.fn(() => true),
    })
);

jest.mock(
    '@deps/components/otp-withdrawal-form/ssw-program/ssw-form-program.helpers',
    () => ({
        getDefaultSSWFormProgramValues: () => ({ mockedSSW: true }),
    })
);

jest.mock('@deps/components/otp-withdrawal-form/address-entry', () => ({
    DEFAULT_ADDRESS: { addressLine1: 'default', addressType: 'DEFAULT' },
}));

jest.mock('../../utils/helper-utils', () => ({
    createValidator: jest.fn(() => jest.fn()),
}));

jest.mock('@deps/models/case/withdrawal/disbursement-types', () => ({
    DEFAULT_DISBURSEMENT_UPDATE: { defaultDisbursement: true },
    DEFAULT_BANK_DETAILS: { defaultBank: true },
    PaymentMethodOption: {},
    FormDisbursementSelections: 'EFT',
    SendCheckOption: {
        Annuitant: 'Annuitant',
        FinancialInstitution: 'FinancialInstitution',
        DifferentAddress: 'DifferentAddress',
        ThirdPartyNotFinancialIns: 'ThirdPartyNotFinancialIns',
    },
}));
jest.mock('@deps/models/case/enums', () => ({
    SswUpdateOption: { NEW: 'NEW', BANK_UPDATE: 'BANK_UPDATE' },
}));
jest.mock('@deps/models/case/renewal/signature-validation', () => ({
    SignatureValidationTypeWithdrawal: 'Owner',
}));
jest.mock('@deps/types/constants', () => ({
    ZAHARA_API_DATE_FORMAT: 'YYYY-MM-DD',
}));

describe('getDlicConfig', () => {
    const t: TFunction = ((key: string) => key) as unknown as TFunction;

    it('should return all expected config keys', () => {
        const config = getDlicConfig(t, false);

        expect(config.formValidation).toBeDefined();
        expect(config.formPartyConfigs).toBeDefined();
        expect(config.systematicWithdrawalOptions).toBeDefined();
        expect(config.fundWithdrawnMethodOptions).toBeDefined();
        expect(config.w4pSignaturesConfig).toBeDefined();
        expect(config.disbursementOptions).toBeDefined();
        expect(config.signaturesConfig).toBeDefined();
        expect(config.signaturesNotaryConfig).toBeDefined();
        expect(config.additionalWithholdingAmountConfig).toBeDefined();
        expect(config.irsSignatureConfig).toBeDefined();
        expect(config.eSignatureFieldConfig).toBeDefined();
        expect(config.sswUpdateFastOptions).toBeDefined();
    });

    describe('disbursementOptions with isDlic3pDisbursementChangesEnabled = false', () => {
        const featureFlags = {
            [FEATURE_FLAGS.DLIC_3P_DISBURSEMENT_CHANGES]: false,
        };
        const config = getDlicConfig(
            t,
            !!featureFlags[FEATURE_FLAGS.DLIC_3P_DISBURSEMENT_CHANGES]
        );
        const emptyFormParty: FormParty = { parties: [] };
        // Call the function to get the array, provide all required arguments
        const [eftOption, checkOption] = config.disbursementOptions(
            emptyFormParty,
            false,
            [],
            []
        );

        it('should generate EFT payload', () => {
            const payload = eftOption.generatePayloadFromSelection({
                accountNumber: '123',
                accountType: AccountType.Checking,
                bankName: 'BankName',
                accountHolder: 'Holder',
                bankFurtherCreditAccount: 'FCAccount',
                bankFurtherCreditName: 'FCName',
                bankRoutingNumber: '987654321',
                isDirectDepositValid: true,
                maskedAccountNumber: null,
                isDirectDeposit: true,
                reEnterAccountNumber: '123',
                reEnterBankRoutingNumber: '987654321',
                bankContactPerson: '',
                bankLocation: '',
                bankPhone: '',
                nameOnBankAccount: '',
                isVoidCheckAttached: null,
                firstTimeExpressCheck: null,
                isWireApprovalPresent: null,
                doesCheckMeetSecurityRequirements: null,
                address: {
                    addressLine1: '',
                    addressType: AddressTypes.DEFAULT,
                    city: null,
                    state: '',
                    zip: '',
                },
                acordAttached: null,
                companyName: '',
                participantId: null,
                payeeName: null,
                contractNumber: null,
                taxId: null,
                zip: '',
                emailDeliveryNotification: false,
                isDifferentPayeeOrAddress: false,
                accountName: null,
                emailNotification: null,
                selectIfPayeeIsDifferent: false,
                fboDetails: '',
                consentAvailable: null,
            } as any);
            expect(payload).toMatchObject({
                mockedDisbursement: true,
                paymentMethod: { text: PaymentMethod.EFT },
                paymentMailType: { text: null },
                bank: expect.any(Array),
            });
        });

        it('should generate Check payload', () => {
            const payload = checkOption.generatePayloadFromSelection({
                payeeName: 'Payee',
                address: {
                    addressLine1: 'addr',
                    addressType: AddressTypes.DEFAULT,
                    city: null,
                    state: '',
                    zip: '',
                },
                selectIfPayeeIsDifferent: true,
                accountNumber: '',
                accountType: '',
                bankContactPerson: '',
                bankFurtherCreditAccount: '',
                bankFurtherCreditName: '',
                bankRoutingNumber: '',
                bankLocation: '',
                bankName: '',
                bankPhone: '',
                nameOnBankAccount: '',
                isVoidCheckAttached: null,
                firstTimeExpressCheck: null,
                isWireApprovalPresent: null,
                doesCheckMeetSecurityRequirements: null,
                acordAttached: null,
                companyName: '',
                participantId: null,
                contractNumber: null,
                taxId: null,
                zip: '',
                emailDeliveryNotification: false,
                isDifferentPayeeOrAddress: false,
                maskedAccountNumber: null,
                accountHolder: null,
                accountName: null,
                emailNotification: null,
                isDirectDepositValid: null,
                fboDetails: '',
                consentAvailable: null,
            } as any);
            expect(payload).toMatchObject({
                mockedDisbursement: true,
                paymentMethod: { text: 'Check' },
                paymentMailType: { text: null },
                isDifferentPayeeOrAddress: { text: true },
                payee: {
                    name: { text: 'Payee' },
                    addresses: [
                        { addressLine1: 'addr', addressType: 'DEFAULT' },
                    ],
                    contractNumber: { text: null },
                },
            });
            // Legacy version does NOT include isAnnuitant or isPayeeFinancialIns
            expect(payload?.isAnnuitant).toBeUndefined();
            expect(payload?.isPayeeFinancialIns).toBeUndefined();
        });

        it('should return 2 disbursement options when flag is false', () => {
            const options = config.disbursementOptions(
                emptyFormParty,
                false,
                [],
                []
            );
            expect(options).toHaveLength(2);
            expect(options[0]).toBeDefined(); // EFT
            expect(options[1]).toBeDefined(); // Check
        });

        it('should render Send Check option with legacy structure when flag is false', () => {
            expect(checkOption).toBeDefined();
            expect(checkOption?.label).toBe('distributionMethod.sendCheck');
            // Legacy version has 3 fields
            expect(checkOption?.fields).toHaveLength(3);
        });
    });

    describe('disbursementOptions with isDlic3pDisbursementChangesEnabled = true', () => {
        const featureFlags = {
            [FEATURE_FLAGS.DLIC_3P_DISBURSEMENT_CHANGES]: true,
        };
        const config = getDlicConfig(
            t,
            !!featureFlags[FEATURE_FLAGS.DLIC_3P_DISBURSEMENT_CHANGES]
        );
        const emptyFormParty: FormParty = { parties: [] };
        const [_eftOption, checkOption] = config.disbursementOptions(
            emptyFormParty,
            false,
            [],
            []
        );

        it('should return 2 disbursement options when flag is true', () => {
            const options = config.disbursementOptions(
                emptyFormParty,
                false,
                [],
                []
            );
            expect(options).toHaveLength(2);
            expect(options[0]).toBeDefined(); // EFT
            expect(options[1]).toBeDefined(); // Check
        });

        it('should render Send Check option with new structure when flag is true', () => {
            expect(checkOption).toBeDefined();
            expect(checkOption?.label).toBe('distributionMethod.sendCheck');
            // New version has 3 fields
            expect(checkOption?.fields).toHaveLength(3);

            // Check for SendCheckSelect field (new version)
            const sendCheckSelectField = checkOption?.fields?.find(
                (field: any) => field.fieldName === 'SendCheckSelect'
            );
            expect(sendCheckSelectField).toBeDefined();

            // Check for PayeeName field with shouldDisplay (new version)
            const payeeNameField: any = checkOption?.fields?.find(
                (field: any) => field.fieldName === 'payeeName'
            );
            expect(payeeNameField).toBeDefined();
            expect(payeeNameField?.shouldDisplay).toBeDefined();
            expect(typeof payeeNameField?.shouldDisplay).toBe('function');

            // Check for Address field with shouldDisplay (new version)
            const addressField: any = checkOption?.fields?.find(
                (field: any) => field.fieldName === 'address'
            );
            expect(addressField).toBeDefined();
            expect(addressField?.shouldDisplay).toBeDefined();
            expect(typeof addressField?.shouldDisplay).toBe('function');
            // annuitantAddress will be undefined when parties array is empty
            expect(addressField?.annuitantAddress).toBeUndefined();
        });

        it('should NOT have SelectIfPayeeIsDifferent field when flag is true', () => {
            const selectIfPayeeField = checkOption?.fields?.find(
                (field: any) => field.fieldName === 'selectIfPayeeIsDifferent'
            );
            expect(selectIfPayeeField).toBeUndefined();
        });

        it('should have SendCheckSelect field when flag is true', () => {
            const sendCheckSelectField = checkOption?.fields?.find(
                (field: any) => field.fieldName === 'SendCheckSelect'
            );
            expect(sendCheckSelectField).toBeDefined();
        });

        it('should generate Check payload with new structure', () => {
            const payload = checkOption.generatePayloadFromSelection({
                payeeName: 'Payee',
                address: {
                    addressLine1: 'addr',
                    addressType: AddressTypes.DEFAULT,
                    city: null,
                    state: '',
                    zip: '',
                },
                isAnnuitant: true,
                isPayeeFinancialIns: false,
                isPayeeCharity: false,
                isAddressDifferent: true,
                isThirdPartyDisbursement: false,
            } as any);
            expect(payload).toMatchObject({
                mockedDisbursement: true,
                paymentMethod: { text: 'Check' },
                paymentMailType: { text: null },
                isAnnuitant: true,
                isPayeeFinancialIns: false,
                isPayeeCharity: false,
                isAddressDifferent: true,
                isThirdPartyDisbursement: false,
                payee: {
                    name: { text: 'Payee' },
                    addresses: [
                        { addressLine1: 'addr', addressType: 'DEFAULT' },
                    ],
                    contractNumber: { text: null },
                },
            });
            // Should NOT have isDifferentPayeeOrAddress in new version
            expect(payload?.isDifferentPayeeOrAddress).toBeUndefined();
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

                const optionsWithParties = config.disbursementOptions(
                    formPartyNoAddress,
                    false,
                    partiesArg(parties),
                    partyRoles as PolicyPartyRoles[]
                );
                // Check option is second (index 1); mock makes value-based find unreliable
                const checkOption = optionsWithParties[1];
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

                const options = config.disbursementOptions(
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

                const options = config.disbursementOptions(
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

                const options = config.disbursementOptions(
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
    });

    describe('signaturesConfig', () => {
        const config = getDlicConfig(t, false);
        it('should have owner config with correct fields', () => {
            const ownerConfig = config.signaturesConfig.find(
                (c) =>
                    c.signatureType === SignatureValidationTypeWithdrawal.Owner
            );
            expect(ownerConfig).toBeDefined();
            expect(ownerConfig?.fields).toHaveLength(4);
        });

        it('should have joint owner config with shouldDisplay logic', () => {
            const jointConfig = config.signaturesConfig.find(
                (c) =>
                    c.signatureType ===
                    SignatureValidationTypeWithdrawal.JointOwner
            );
            expect(jointConfig).toBeDefined();
            expect(jointConfig?.fields).toHaveLength(4);
        });

        it('should have joint owner config with shouldDisplay logic', () => {
            const notaryConfig = config.signaturesConfig.find(
                (c) =>
                    c.signatureType === SignatureValidationTypeWithdrawal.Notary
            );
            expect(notaryConfig).toBeDefined();
            expect(notaryConfig?.fields).toHaveLength(4);
        });
    });

    describe('systematicWithdrawalOptions', () => {
        const config = getDlicConfig(t, false);
        const options = config.systematicWithdrawalOptions('674', true);

        it('should generate FixDollar payload', () => {
            const opt = options.find((o) => o.value === SSWType.FixDollar);
            const payload = opt?.generateSSWPayloadFromSelection({
                amount: {
                    text: '100',
                    amountType: AmountType.Dollar,
                },
                frequency: { text: Frequency.Monthly },
                startDate: { text: '2020-01-01' },
                duration: { text: '1' },
                programSubType: {
                    text: null,
                },
                percent: {
                    text: null,
                    amountType: AmountType.Dollar,
                },
                depleteFundYears: {
                    text: null,
                },
            });
            expect(payload).toMatchObject({
                mockedSSW: true,
                programSubType: { text: SSWType.FixDollar },
                programFrequency: expect.any(Object),
                programAmount: {
                    text: '100',
                    amountType: AmountType.Dollar,
                },
            });
        });

        it('should generate PercentOfAmountValue payload', () => {
            const options2 = config.systematicWithdrawalOptions('674', false);
            const opt = options2.find(
                (o) => o.value === SSWType.PercentOfAmountValue
            );
            const payload = opt?.generateSSWPayloadFromSelection({
                percent: {
                    text: '50',
                    amountType: AmountType.Dollar,
                },
                frequency: { text: Frequency.Monthly },
                startDate: { text: '2020-01-01' },
                duration: { text: '1' },
                programSubType: {
                    text: null,
                },
                amount: {
                    text: null,
                    amountType: AmountType.Dollar,
                },
                depleteFundYears: {
                    text: null,
                },
            });
            expect(payload).toMatchObject({
                mockedSSW: true,
                programSubType: {
                    text: SSWType.PercentOfAmountValue,
                },
                programFrequency: expect.any(Object),
                partialPercent: {
                    text: '50',
                    amountType: AmountType.Percent,
                },
            });
        });

        it('should generate InterestEarningDividendsGains payload', () => {
            const opt = options.find(
                (o) => o.value === SSWType.InterestEarningDividendsGains
            );
            const payload = opt?.generateSSWPayloadFromSelection({
                frequency: { text: Frequency.Monthly },
                startDate: { text: '2020-01-01' },
                duration: { text: '12' },
                programSubType: {
                    text: null,
                },
                amount: {
                    text: null,
                    amountType: AmountType.Dollar,
                },
                percent: {
                    text: null,
                    amountType: AmountType.Dollar,
                },
                depleteFundYears: {
                    text: null,
                },
            });
            expect(payload).toMatchObject({
                mockedSSW: true,
                programSubType: {
                    text: SSWType.InterestEarningDividendsGains,
                },
                programFrequency: expect.any(Object),
            });
        });
    });

    describe('formValidation', () => {
        const config = getDlicConfig(t, false);
        it('should return no errors for valid signature', () => {
            const errors = config.formValidation({
                formSignature: {
                    signatures: [
                        {
                            signType: {
                                text: SignatureValidationTypeWithdrawal.Owner,
                            },
                            isSigned: true,
                            signDate: {
                                text: null,
                            },
                            signExtension: undefined,
                            signName: null,
                            signOtherTitle: null,
                            signTitle: {
                                text: null,
                            },
                            signTitles: [{ text: null }],
                            spousalConsent: {
                                text: null,
                            },
                        },
                    ],
                },
            });
            expect(errors).toEqual({});
        });
        it('should return error for Life Cad where start date is after 28th of the month ', () => {
            const errors = config.formValidation({
                formProgram: {
                    withdrawType: {
                        text: 'Partial',
                    },
                    programType: {
                        text: '',
                    },
                    programSubType: {
                        text: null,
                    },
                    programFrequency: {
                        frequency: {
                            text: Frequency.Monthly,
                        },
                        beginDate: {
                            text: '2020-01-29',
                        },
                        fixedPeriodYear: {
                            text: '',
                        },
                    },
                    partialAmount: {
                        text: null,
                        amountType: AmountType.Dollar,
                    },
                    partialGrossAmount: {
                        text: null,
                        amountType: AmountType.Dollar,
                    },
                    partialNetAmount: {
                        text: null,
                        amountType: AmountType.Dollar,
                    },
                    gmwbAmount: {
                        text: null,
                        amountType: AmountType.Dollar,
                    },
                },
                formSignature: {
                    signatures: [
                        {
                            signType: {
                                text: SignatureValidationTypeWithdrawal.Owner,
                            },
                            isSigned: true,
                            signDate: {
                                text: null,
                            },
                            signExtension: undefined,
                            signName: null,
                            signOtherTitle: null,
                            signTitle: {
                                text: null,
                            },
                            signTitles: [{ text: null }],
                            spousalConsent: {
                                text: null,
                            },
                        },
                    ],
                },
            });
            expect(errors).toEqual({
                systematicStartDate: 'sswProgram.warnings.systematicStartDate',
            });
        });
    });

    it('should have eSignatureFieldConfig with correct keys', () => {
        const config = getDlicConfig(t, false);
        expect(config.eSignatureFieldConfig).toMatchObject({
            type: true,
            signPresent: true,
            date: true,
            auditTrial: true,
        });
    });

    it('should have sswUpdateFastOptions with correct values', () => {
        const config = getDlicConfig(t, false);
        expect(config.sswUpdateFastOptions).toEqual([
            { label: 'sswProgram.sswUpdateOptions.new', value: 'NEW' },
            {
                label: 'sswProgram.sswUpdateOptions.bankUpdate',
                value: 'BANK_UPDATE',
            },
        ]);
    });
});
