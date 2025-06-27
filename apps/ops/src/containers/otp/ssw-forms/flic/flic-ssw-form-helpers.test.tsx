import { renderHook } from '@testing-library/react';
import { TFunctionDetailedResult } from 'i18next';
import { TFunction } from 'next-i18next';

import { SignatureBonusFields } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { getDefaultSSWFormProgramValues } from '@deps/components/otp-withdrawal-form/ssw-program/ssw-form-program.helpers';
import { SSWProgram } from '@deps/components/otp-withdrawal-form/ssw-program/ssw-row';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { statesAndTerritories } from '@deps/helpers/states.helpers';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    AccountType,
    AddressTypes,
    AmountType,
    BankDetails,
    FormParty,
    FormSignature,
    Frequency,
    PartyRoles,
    PaymentMailType,
    PaymentMethod,
    PhoneTypes,
    SignatureWithdrawal,
    SSWType,
} from '@deps/models/case/withdrawal/case';
import {
    DEFAULT_DISBURSEMENT_UPDATE,
    DisbursementParts,
    DEFAULT_BANK_DETAILS,
} from '@deps/models/case/withdrawal/disbursement-types';

import useFlicConfig from './flic-ssw-form-helpers';

jest.mock(
    '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers',
    () => {
        const originalModule = jest.requireActual(
            '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers'
        );
        return {
            ...originalModule,
            getDefaultFormDisbursementValues: () => {
                return { thisIsMocked: true };
            },
        };
    }
);

jest.mock(
    '@deps/components/otp-withdrawal-form/ssw-program/ssw-form-program.helpers',
    () => {
        const originalModule = jest.requireActual(
            '@deps/components/otp-withdrawal-form/ssw-program/ssw-form-program.helpers'
        );
        return {
            ...originalModule,
            getDefaultSSWFormProgramValues: () => {
                return {
                    thisIsMocked: true,
                };
            },
        };
    }
);

describe('#Flic SSW form config', () => {
    const t: TFunction = (key: string | string[]) =>
        key as unknown as TFunctionDetailedResult<string>;

    const {
        result: { current },
    } = renderHook(() => useFlicConfig(t));

    describe('Config existence validation', () => {
        it('should return an object with the correct configuration options', () => {
            expect(current.disbursementOptions).toBeDefined();
            expect(current.formPartyConfigs).toBeDefined();
            expect(current.signaturesConfig).toBeDefined();
            expect(current.fundWithdrawnMethodOptions).toBeDefined();
            expect(current.systematicWithdrawalOptions).toBeDefined();
            expect(current.cslnCheckStates).toBeDefined();
        });
    });

    describe('Disbursement options validation', () => {
        const { disbursementOptions } = current;
        const bank: BankDetails = {
            accountNumber: '12345',
            accountType: { text: AccountType.Checking },
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
        };

        describe('payload generation', () => {
            it('should generate a correct payload for an eft bank type full selection', () => {
                const eftOption = disbursementOptions(
                    Frequency.Monthly,
                    ''
                ).find((option) => option.value === PaymentMethod.EFT);
                expect(
                    eftOption?.generatePayloadFromSelection(bankingDetails)
                ).toEqual({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMethod.EFT },
                    paymentMailType: { text: null },
                    bank: [
                        {
                            ...DEFAULT_BANK_DETAILS,
                            accountNumber: bankingDetails.accountNumber,
                            accountType: {
                                text: bankingDetails.accountType,
                            },
                            bankName: bankingDetails.bankName,
                            nameOnBankAccount:
                                bankingDetails.accountHolder ?? '',
                            routingNumber: bankingDetails.bankRoutingNumber,
                            bankFurtherCreditAccount:
                                bankingDetails.bankFurtherCreditAccount,
                            bankFurtherCreditName:
                                bankingDetails.bankFurtherCreditName,
                        },
                    ],
                    voidCheck: bankingDetails?.isVoidCheckAttached,
                    doesCheckMeetSecRequiremnt:
                        bankingDetails?.doesCheckMeetSecurityRequirements,
                });
            });

            it('should generate a correct payload for a check selection', () => {
                const checkOption = disbursementOptions(
                    Frequency.Annually,
                    ''
                ).find((option) => option.value === PaymentMailType.Check);
                expect(
                    checkOption?.generatePayloadFromSelection(bankingDetails)
                ).toEqual({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: null },
                });
            });

            it('should generate a correct payload for a brokerage selection', () => {
                const brokerageOption = disbursementOptions(
                    Frequency.Monthly,
                    ''
                ).find((option) => option.value === PaymentMethod.Brokerage);

                expect(
                    brokerageOption?.generatePayloadFromSelection(
                        bankingDetails
                    )
                ).toEqual({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMethod.Brokerage },
                    paymentToBrokerageAccount: true,
                    brokerage: {
                        companyName: bankingDetails.companyName || '',
                        accountNumber: bank?.accountNumber || '',
                        acordAttached: null,
                        address: bankingDetails.address,
                    },
                });
            });
        });
    });

    describe('Signatures config validation', () => {
        const { signaturesConfig } = current;
        describe('Owner signature', () => {
            const ownerConfig = signaturesConfig.find(
                (sigConfig) =>
                    sigConfig.signatureType ===
                    SignatureValidationTypeWithdrawal.Owner
            );
            it('should be in the config', () => {
                expect(ownerConfig).toBeTruthy();
                expect(ownerConfig?.fields).toHaveLength(4);
            });
        });

        describe('Joint owner signature', () => {
            const jointOwnerConfig = signaturesConfig.find(
                (sigConfig) =>
                    sigConfig.signatureType ===
                    SignatureValidationTypeWithdrawal.JointOwner
            );
            it('should be in the config', () => {
                expect(jointOwnerConfig).toBeTruthy();
                expect(jointOwnerConfig?.fields).toHaveLength(4);
            });

            it('should have shouldDisplay logic', () => {
                const jointOwner = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.OWNER,
                            firstName: 'JAMES',
                            middleName: 'C',
                            lastName: 'FORD',
                            fullName: 'JAMES C FORD',
                            suffix: '1',
                            dob: { text: null },
                            taxId: '572621420',
                            email: null,
                            employer: null,
                            maritalStatus: {
                                text: null,
                            },
                            addresses: [
                                {
                                    addressLine1: '560 calle de la sierra',
                                    addressLine2: '',
                                    addressLine3: null,
                                    addressLine4: null,
                                    addressType: 'DEFAULT' as AddressTypes,
                                    city: '',
                                    country: null,
                                    state: 'CA',
                                    zip: '92019-1241',
                                    zipPlusFour: '',
                                },
                            ],
                            phones: [
                                {
                                    phoneCountry: 'US',
                                    phoneNumber: '6192001466',
                                    phoneTypeDesc: 'Default',
                                    phoneType: {
                                        text: 'Owner_Phone_Day' as PhoneTypes,
                                    },
                                },
                            ],
                        },
                        {
                            partyRoleType: PartyRoles.JOINT_OWNER,
                            firstName: 'JAMES',
                            middleName: 'C',
                            lastName: 'FORD',
                            fullName: 'JAMES C FORD',
                            suffix: '1',
                            dob: { text: null },
                            taxId: '572621420',
                            email: null,
                            employer: null,
                            maritalStatus: {
                                text: null,
                            },
                            addresses: [],
                            phones: [],
                        },
                    ],
                };

                const owner = {
                    parties: [
                        {
                            partyRoleType: PartyRoles.OWNER,
                            firstName: 'JAMES',
                            middleName: 'C',
                            lastName: 'FORD',
                            fullName: 'JAMES C FORD',
                            suffix: '1',
                            dob: { text: null },
                            taxId: '572621420',
                            email: null,
                            employer: null,
                            maritalStatus: {
                                text: null,
                            },
                            addresses: [
                                {
                                    addressLine1: '560 calle de la sierra',
                                    addressLine2: '',
                                    addressLine3: null,
                                    addressLine4: null,
                                    addressType: 'DEFAULT' as AddressTypes,
                                    city: '',
                                    country: null,
                                    state: 'CA',
                                    zip: '92019-1241',
                                    zipPlusFour: '',
                                },
                            ],
                            phones: [
                                {
                                    phoneCountry: 'US',
                                    phoneNumber: '6192001466',
                                    phoneTypeDesc: 'Default',
                                    phoneType: {
                                        text: 'Owner_Phone_Day' as PhoneTypes,
                                    },
                                },
                            ],
                        },
                    ],
                };

                expect(
                    jointOwnerConfig?.shouldDisplay?.({
                        formParty: jointOwner,
                    } as OtpWithdrawalFormState)
                ).toBeTruthy();
                expect(
                    jointOwnerConfig?.shouldDisplay?.({
                        formParty: owner,
                    } as OtpWithdrawalFormState)
                ).toBeFalsy();
            });
        });

        describe.skip('Spouse signature', () => {
            const spouseConfig = signaturesConfig.find(
                (sigConfig) =>
                    sigConfig.signatureType ===
                    SignatureValidationTypeWithdrawal.Spouse
            );
            it('should be in the config', () => {
                expect(spouseConfig).toBeTruthy();
                expect(spouseConfig?.fields).toHaveLength(3);
            });

            it('should have shouldDisplay logic', () => {
                expect(
                    spouseConfig?.shouldDisplay?.({
                        ownerStateOfResidence: statesAndTerritories.ARIZONA,
                    } as OtpWithdrawalFormState)
                ).toBeTruthy();
                expect(
                    spouseConfig?.shouldDisplay?.({
                        ownerStateOfResidence: statesAndTerritories.GUAM,
                    } as OtpWithdrawalFormState)
                ).toBeFalsy();
            });

            it('should have a bonusField (Spousal Consent', () => {
                expect(spouseConfig?.bonusField).toEqual(
                    SignatureBonusFields.SpousalConsent
                );
            });
        });
    });

    describe('Systematic withdrawal options validation', () => {
        const { systematicWithdrawalOptions } = current;

        it('should correctly generate payload for a FixDollar option', () => {
            const formProgram = {
                amount: { text: '100' },
                frequency: { text: Frequency.Monthly },
                startDate: { text: '2020-01-01' },
                duration: { text: '1' },
            };

            const option = systematicWithdrawalOptions.find(
                (option) => option.value === SSWType.FixDollar
            );
            expect(
                option?.generateSSWPayloadFromSelection(
                    formProgram as SSWProgram
                )
            ).toEqual({
                ...getDefaultSSWFormProgramValues(),
                programSubType: { text: SSWType.FixDollar },
                programFrequency: {
                    frequency: formProgram.frequency,
                    beginDate: formProgram.startDate,
                    fixedPeriodYear: { text: null },
                    duration: formProgram.duration,
                },
                programAmount: {
                    text: formProgram.amount?.text,
                    amountType: AmountType.Dollar,
                },
            });
        });

        it('should correctly generate payload for a AnnualFree option', () => {
            const formProgram = {
                frequency: { text: Frequency.Monthly },
                startDate: { text: '2020-01-01' },
                duration: { text: '12' },
            };

            const option = systematicWithdrawalOptions.find(
                (option) => option.value === SSWType.AnnualFree
            );
            expect(
                option?.generateSSWPayloadFromSelection(
                    formProgram as SSWProgram
                )
            ).toEqual({
                ...getDefaultSSWFormProgramValues(),
                programSubType: { text: SSWType.AnnualFree },
                programFrequency: {
                    frequency: formProgram.frequency,
                    beginDate: formProgram.startDate,
                    duration: formProgram.duration,
                    fixedPeriodYear: { text: null },
                },
            });
        });

        it('should correctly generate payload for a %AV option', () => {
            const formProgram = {
                percent: { text: '100' },
                frequency: { text: Frequency.Monthly },
                startDate: { text: '2020-01-01' },
                duration: { text: '1' },
            };

            const option = systematicWithdrawalOptions.find(
                (option) => option.value === SSWType.PercentOfAmountValue
            );
            expect(
                option?.generateSSWPayloadFromSelection(
                    formProgram as SSWProgram
                )
            ).toEqual({
                ...getDefaultSSWFormProgramValues(),
                programSubType: { text: SSWType.PercentOfAmountValue },
                programFrequency: {
                    frequency: formProgram.frequency,
                    beginDate: formProgram.startDate,
                    fixedPeriodYear: { text: null },
                    duration: formProgram.duration,
                },
                partialPercent: {
                    text: formProgram.percent?.text,
                    amountType: AmountType.Percent,
                },
            });
        });

        it('should correctly generate payload for a InterestEarningDividendsGains option', () => {
            const formProgram = {
                frequency: { text: Frequency.Monthly },
                startDate: { text: '2020-01-01' },
                duration: { text: '12' },
            };

            const option = systematicWithdrawalOptions.find(
                (option) =>
                    option.value === SSWType.InterestEarningDividendsGains
            );
            expect(
                option?.generateSSWPayloadFromSelection(
                    formProgram as SSWProgram
                )
            ).toEqual({
                thisIsMocked: true,
                ...getDefaultSSWFormProgramValues(),
                programSubType: { text: SSWType.InterestEarningDividendsGains },
                programFrequency: {
                    frequency: formProgram.frequency,
                    beginDate: formProgram.startDate,
                    duration: formProgram.duration,
                    fixedPeriodYear: { text: null },
                },
            });
        });
    });

    describe('Form validation', () => {
        const { formValidation } = current;

        const formParty: FormParty = {
            parties: [
                {
                    partyRoleType: PartyRoles.OWNER,
                    firstName: 'Bob',
                    middleName: '',
                    lastName: 'Mockington',
                    fullName: 'Bob Mockington',
                    maritalStatus: { text: null },
                    taxId: '123456',
                    addresses: [
                        {
                            addressLine1: 'blah',
                            addressType: AddressTypes.DEFAULT,
                            city: 'Mockville',
                            state: 'MockState',
                            zip: '12345',
                        },
                    ],
                    phones: [],
                },
            ],
        };

        const signature = {
            signType: { text: SignatureValidationTypeWithdrawal.Owner },
            isSigned: true,
            signDate: { text: null },
            signExtension: { text: null },
            signName: 'blah',
            signTitle: { text: 'mockSignTitle' },
            signTitles: [{ text: null }] as SignatureWithdrawal['signTitles'],
            signOtherTitle: null,
            spousalConsent: { text: false },
            isSignatureValid: true,
            signatureComment: 'signatureComment',
        };
        const formSignature: FormSignature = {
            isSpousalConsentRequired: { text: false },
            signatures: [signature],
        };
        it('should provide no errors for a valid form', () => {
            expect(formValidation({ formParty, formSignature })).toEqual({});
        });
    });
});
