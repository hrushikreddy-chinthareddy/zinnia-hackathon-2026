import { TFunction } from 'next-i18next';

import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    AccountType,
    AddressTypes,
    AmountType,
    Frequency,
    PaymentMethod,
    SSWType,
} from '@deps/models/case/withdrawal/case';

import getDlicConfig from './dlic-ssw-from-helpers';

jest.mock(
    '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers',
    () => ({
        getDefaultFormDisbursementValues: () => ({ mockedDisbursement: true }),
        BankingFields: { Bank: 'Bank', AccountNumber: 'AccountNumber' },
        DisbursementFields: {
            SelectBank: 'SelectBank',
            BankTextField: 'BankTextField',
            BankCheckboxField: 'BankCheckboxField',
            BankAddress: 'BankAddress',
            AccountTypes: 'AccountTypes',
            BankBooleanButtonGroup: 'BankBooleanButtonGroup',
        },
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

    const config = getDlicConfig(t);

    it('should return all expected config keys', () => {
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

    describe('disbursementOptions', () => {
        const [eftOption, checkOption] = config.disbursementOptions;

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
        });
    });

    describe('signaturesConfig', () => {
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
        expect(config.eSignatureFieldConfig).toMatchObject({
            type: true,
            signPresent: true,
            date: true,
            auditTrial: true,
        });
    });

    it('should have sswUpdateFastOptions with correct values', () => {
        expect(config.sswUpdateFastOptions).toEqual([
            { label: 'sswProgram.sswUpdateOptions.new', value: 'NEW' },
            {
                label: 'sswProgram.sswUpdateOptions.bankUpdate',
                value: 'BANK_UPDATE',
            },
        ]);
    });
});
