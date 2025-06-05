import { TFunctionDetailedResult } from 'i18next';
import { TFunction } from 'next-i18next';

import { SignatureBonusFields } from '@deps/components/otp-withdrawal-form/signature-validation/signature-validation-parts/signature-parts';
import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { statesAndTerritories } from '@deps/helpers/states.helpers';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    AccountType,
    AddressTypes,
    AmountType,
    BankDetails,
    FormParty,
    FormProgram,
    FormSignature,
    PartyRoles,
    PaymentMailType,
    PaymentMethod,
    PhoneTypes,
    ProgramSubType,
    ProgramType,
    SignatureWithdrawal,
    WithdrawalType,
} from '@deps/models/case/withdrawal/case';
import { DEFAULT_DISBURSEMENT_UPDATE, DisbursementParts, DEFAULT_BANK_DETAILS } from '@deps/models/case/withdrawal/disbursement-types';

import getFlicConfig, { WithdrawalSelectionValues } from './flic-withdrawal-form.helpers';

jest.mock('@deps/components/otp-withdrawal-form/form-program/form-program.helpers', () => {
    const originalModule = jest.requireActual('@deps/components/otp-withdrawal-form/form-program/form-program.helpers');
    return {
        ...originalModule,
        getDefaultFormProgramValues: () => {
            return { thisIsMocked: true };
        },
    };
});

jest.mock('@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers', () => {
    const originalModule = jest.requireActual('@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers');
    return {
        ...originalModule,
        getDefaultFormDisbursementValues: () => {
            return { thisIsMocked: true };
        },
    };
});

describe.skip('FLIC withdrawal form config', () => {
    const t: TFunction = (key: string | string[]) => key as unknown as TFunctionDetailedResult<string>;
    const flicConfig = getFlicConfig(t);
    describe('Config existence', () => {
        it('should return an object with the correct configuration options', () => {
            expect(flicConfig.cslnCheckStates).toBeDefined();
            expect(flicConfig.formSubtypeOptions).toBeDefined();
            expect(flicConfig.formValidation).toBeDefined();
            expect(flicConfig.fundWithdrawnMethodOptions).toBeDefined();
            expect(flicConfig.partialWithdrawalOptions).toBeDefined();
            expect(flicConfig.signaturesConfig).toBeDefined();
            expect(flicConfig.disbursementOptions).toBeDefined();
            expect(flicConfig.formPartyConfigs).toBeDefined();
        });
    });

    describe('disbursementOptions', () => {
        const { disbursementOptions } = flicConfig;
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
            isDirectDeposit: {
                text: true,
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
            reEnterAccountNumber: '',
            reEnterBankRoutingNumber: '',
        };

        describe('payload generation', () => {
            it('should generate a correct payload for an eft selection', () => {
                const eftOption = disbursementOptions.find(option => option.value === PaymentMethod.EFT);
                expect(eftOption?.generatePayloadFromSelection(bankingDetails)).toEqual({
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
                            nameOnBankAccount: bankingDetails.accountHolder ?? '',
                            routingNumber: bankingDetails.bankRoutingNumber,
                            bankFurtherCreditAccount: bankingDetails.bankFurtherCreditAccount,
                            bankFurtherCreditName: bankingDetails.bankFurtherCreditName,
                            reEnterAccountNumber: '',
                            reEnterBankRoutingNumber: '',
                        },
                    ],
                    voidCheck: bankingDetails?.isVoidCheckAttached,
                    doesCheckMeetSecRequiremnt: bankingDetails?.doesCheckMeetSecurityRequirements,
                });
            });
            it('should generate a correct payload for a wire selection', () => {
                const wireOption = disbursementOptions.find(option => option.value === PaymentMethod.Wire);
                expect(wireOption?.generatePayloadFromSelection(bankingDetails)).toEqual({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMethod.Wire },
                    paymentMailType: { text: null },
                    bank: [
                        {
                            ...DEFAULT_BANK_DETAILS,
                            accountNumber: bankingDetails.accountNumber,
                            accountType: {
                                text: bankingDetails.accountType,
                            },
                            bankName: bankingDetails.bankName,
                            nameOnBankAccount: bankingDetails.accountHolder ?? '',
                            routingNumber: bankingDetails.bankRoutingNumber,
                            bankFurtherCreditAccount: bankingDetails.bankFurtherCreditAccount,
                            bankFurtherCreditName: bankingDetails.bankFurtherCreditName,
                            reEnterAccountNumber: '',
                            reEnterBankRoutingNumber: '',
                        },
                    ],
                    voidCheck: bankingDetails?.isVoidCheckAttached,
                    doesCheckMeetSecRequiremnt: bankingDetails?.doesCheckMeetSecurityRequirements,
                });
            });
            it('should generate a correct payload for a check selection', () => {
                const checkOption = disbursementOptions.find(option => option.value === PaymentMailType.Check);
                expect(checkOption?.generatePayloadFromSelection(bankingDetails)).toEqual({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: null },
                });
            });
            it('should generate a correct payload for an expressCheck selection', () => {
                const expressCheckOption = disbursementOptions.find(option => option.value === PaymentMailType.ExpressCheck);
                expect(expressCheckOption?.generatePayloadFromSelection(bankingDetails)).toEqual({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: PaymentMailType.ExpressCheck },
                });
            });
        });
    });

    describe('formValidation', () => {
        const { formValidation } = flicConfig;
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

    describe('identifySelectedFormProgramOption', () => {
        it('should correctly identify the selected form program option', () => {
            const formProgram: FormProgram = {
                withdrawType: { text: WithdrawalType.Gross },
                programType: { text: ProgramType.WITHDRAWAL },
                programSubType: { text: ProgramSubType.TotalFreeWithdrawal },
                partialAmount: { text: '1000', amountType: AmountType.Dollar },
                partialNetAmount: { text: '900', amountType: AmountType.Dollar },
                partialGrossAmount: { text: '', amountType: AmountType.Dollar },
                gmwbAmount: { text: '', amountType: AmountType.Percent },
            };

            const selectedOption = flicConfig.identifySelectedFormProgramOption(formProgram);

            expect(selectedOption.selectedOption).toBe(WithdrawalSelectionValues.GrossWithdrawal);
            expect(selectedOption.amount).toBe('1000');
        });

        it('should generate the payload for a total free withdrawal option correctly', () => {
            const formProgram: FormProgram = {
                programType: { text: ProgramType.TotalFreeAmt },
                withdrawType: { text: WithdrawalType.Gross },
                programSubType: { text: ProgramSubType.TotalFreeWithdrawal },
                partialAmount: { text: '1000', amountType: AmountType.Dollar },
                partialNetAmount: { text: '900', amountType: AmountType.Dollar },
                partialGrossAmount: { text: '', amountType: AmountType.Dollar },
                gmwbAmount: { text: '', amountType: AmountType.Percent },
            };

            const selectedOption = flicConfig.identifySelectedFormProgramOption(formProgram);

            const payload = flicConfig.partialWithdrawalOptions
                .find(option => option.value === selectedOption.selectedOption)
                ?.generatePayloadFromSelection();

            expect(payload?.programType?.text).toBe(ProgramType.TotalFreeAmt);
            expect(payload?.programSubType?.text).toBe(ProgramSubType.TotalFreeWithdrawal);
        });

        it('should generate the payload for a net withdrawal option correctly', () => {
            const formProgram: FormProgram = {
                programType: { text: ProgramType.WITHDRAWAL },
                withdrawType: { text: WithdrawalType.Net },
                partialAmount: { text: '100', amountType: AmountType.Dollar },
                partialNetAmount: { text: '100', amountType: AmountType.Dollar },
                partialGrossAmount: { text: '', amountType: AmountType.Dollar },
                gmwbAmount: { text: '', amountType: AmountType.Percent },
                programSubType: { text: '' },
            };

            const expectedPayload = {
                selectedOption: WithdrawalSelectionValues.NetWithdrawal,
                amount: '100',
            };

            const actualPayload = flicConfig.identifySelectedFormProgramOption(formProgram);

            expect(actualPayload).toEqual(expectedPayload);
        });

        it('should generate the payload for a gross withdrawal option correctly', () => {
            const formProgram: FormProgram = {
                programType: { text: ProgramType.WITHDRAWAL },
                withdrawType: { text: WithdrawalType.Gross },
                partialAmount: { text: '200', amountType: AmountType.Dollar },
                partialGrossAmount: { text: '200', amountType: AmountType.Dollar },
                partialNetAmount: { text: '', amountType: AmountType.Dollar },
                gmwbAmount: { text: '', amountType: AmountType.Percent },
                programSubType: { text: '' },
            };

            const expectedPayload = {
                selectedOption: WithdrawalSelectionValues.GrossWithdrawal,
                amount: '200',
            };

            const actualPayload = flicConfig.identifySelectedFormProgramOption(formProgram);

            expect(actualPayload).toEqual(expectedPayload);
        });
        it('should handle a null or undefined form program correctly', () => {
            const formProgram = null as unknown as FormProgram;

            const selectedOption = flicConfig.identifySelectedFormProgramOption(formProgram);

            expect(selectedOption.selectedOption).toBeNull();
            expect(selectedOption.amount).toBe('');
        });
    });

    describe('partialWithdrawalOptions', () => {
        describe('payload generation', () => {
            const { partialWithdrawalOptions } = flicConfig;
            it('should correctly generate a payload for the Total Free Withdrawal selection', () => {
                const totalFree = partialWithdrawalOptions.find(option => option.value === WithdrawalSelectionValues.TotalFreeWithdrawal);
                const totalFreePayload = totalFree?.generatePayloadFromSelection(null);
                expect(totalFreePayload).toEqual({
                    thisIsMocked: true,
                    withdrawType: { text: WithdrawalType.Gross },
                    programType: { text: ProgramType.TotalFreeAmt },
                    programSubType: { text: ProgramSubType.TotalFreeWithdrawal },
                });
            });
            it('should correctly generate a payload for the Net Withdrawal selection', () => {
                const netWithdrawal = partialWithdrawalOptions.find(option => option.value === WithdrawalSelectionValues.NetWithdrawal);
                const netWithdrawalPayload = netWithdrawal?.generatePayloadFromSelection('12345');
                expect(netWithdrawalPayload).toEqual({
                    thisIsMocked: true,
                    withdrawType: { text: WithdrawalType.Net },
                    programType: { text: ProgramType.NetWithdrawal },
                    partialAmount: { text: '12345', amountType: AmountType.Dollar },
                    partialNetAmount: { text: '12345', amountType: AmountType.Dollar },
                });
            });
            it('should correctly generate a payload for the Gross Withdrawal selection', () => {
                const grossWithdrawal = partialWithdrawalOptions.find(option => option.value === WithdrawalSelectionValues.GrossWithdrawal);
                const grossPayload = grossWithdrawal?.generatePayloadFromSelection('23456');
                console.log(grossPayload);
                expect(grossPayload).toEqual({
                    thisIsMocked: true,
                    withdrawType: { text: WithdrawalType.Gross },
                    programType: { text: ProgramType.GrossWithdrawal },
                    partialAmount: { text: '23456', amountType: AmountType.Dollar },
                    partialGrossAmount: { text: '23456', amountType: AmountType.Dollar },
                });
            });
        });
    });

    describe('signaturesConfig', () => {
        const { signaturesConfig } = flicConfig;
        describe('Owner signature', () => {
            const ownerConfig = signaturesConfig.find(sigConfig => sigConfig.signatureType === SignatureValidationTypeWithdrawal.Owner);
            it('should be in the config', () => {
                expect(ownerConfig).toBeTruthy();
                expect(ownerConfig?.fields).toHaveLength(4);
            });
        });

        describe('Joint owner signature', () => {
            const jointOwnerConfig = signaturesConfig.find(
                sigConfig => sigConfig.signatureType === SignatureValidationTypeWithdrawal.JointOwner
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

                expect(jointOwnerConfig?.shouldDisplay?.({ formParty: jointOwner } as OtpWithdrawalFormState)).toBeTruthy();
                expect(jointOwnerConfig?.shouldDisplay?.({ formParty: owner } as OtpWithdrawalFormState)).toBeFalsy();
            });
        });

        describe('Beneficiary signature', () => {
            it('should be in the config', () => {
                const beneficiaryConfig = signaturesConfig.find(
                    sigConfig => sigConfig.signatureType === SignatureValidationTypeWithdrawal.IrrevocableBeneficiary
                );
                expect(beneficiaryConfig).toBeTruthy();
                expect(beneficiaryConfig?.fields).toHaveLength(4);
            });
        });

        describe.skip('Spouse signature', () => {
            const spouseConfig = signaturesConfig.find(sigConfig => sigConfig.signatureType === SignatureValidationTypeWithdrawal.Spouse);
            it('should be in the config', () => {
                expect(spouseConfig).toBeTruthy();
                expect(spouseConfig?.fields).toHaveLength(3);
            });

            it.skip('should have shouldDisplay logic', () => {
                expect(
                    spouseConfig?.shouldDisplay?.({ ownerStateOfResidence: statesAndTerritories.ARIZONA } as OtpWithdrawalFormState)
                ).toBeTruthy();
                expect(
                    spouseConfig?.shouldDisplay?.({ ownerStateOfResidence: statesAndTerritories.GUAM } as OtpWithdrawalFormState)
                ).toBeFalsy();
            });

            it('should have a bonusField (Spousal Consent', () => {
                expect(spouseConfig?.bonusField).toEqual(SignatureBonusFields.SpousalConsent);
            });
        });
    });
});
