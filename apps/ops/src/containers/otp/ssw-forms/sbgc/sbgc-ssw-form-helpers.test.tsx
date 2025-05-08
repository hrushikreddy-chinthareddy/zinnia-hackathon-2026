import { renderHook } from '@testing-library/react';
import { TFunctionDetailedResult } from 'i18next';
import { TFunction } from 'next-i18next';

import { getDefaultSSWFormProgramValues } from '@deps/components/otp-withdrawal-form/ssw-program/ssw-form-program.helpers';
import { SSWProgram } from '@deps/components/otp-withdrawal-form/ssw-program/ssw-row';
import {
    AccountType,
    AmountType,
    BankDetails,
    Frequency,
    PaymentMailType,
    PaymentMethod,
    SSWType,
} from '@deps/models/case/withdrawal/case';
import { DEFAULT_DISBURSEMENT_UPDATE, DisbursementParts, DEFAULT_BANK_DETAILS } from '@deps/models/case/withdrawal/disbursement-types';

import usesSbgcConfig from './sbgc-ssw-form-helpers';

jest.mock('@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers', () => {
    const originalModule = jest.requireActual('@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers');
    return {
        ...originalModule,
        getDefaultFormDisbursementValues: () => {
            return { thisIsMocked: true };
        },
    };
});

jest.mock('@deps/components/otp-withdrawal-form/ssw-program/ssw-form-program.helpers', () => {
    const originalModule = jest.requireActual('@deps/components/otp-withdrawal-form/ssw-program/ssw-form-program.helpers');
    return {
        ...originalModule,
        getDefaultSSWFormProgramValues: () => {
            return { thisIsMocked: true };
        },
    };
});

describe('SBGC SSW form config', () => {
    const t: TFunction = (key: string | string[]) => key as unknown as TFunctionDetailedResult<string>;

    const {
        result: { current },
    } = renderHook(() => usesSbgcConfig(t));

    describe('Config existence validation', () => {
        it('should return an object with the correct configuration options', () => {
            expect(current.disbursementOptions).toBeDefined();
            expect(current.formPartyConfigs).toBeDefined();
            expect(current.signaturesConfig).toBeDefined();
            expect(current.fundWithdrawnMethodOptions).toBeDefined();
            expect(current.reasonOptions).toBeDefined();
            expect(current.systematicWithdrawalOptions).toBeDefined();
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
            reEnterAccountNumber: '',
            reEnterBankRoutingNumber: '',
        };

        describe('payload generation', () => {
            it('should generate a correct payload for an eft bank type full selection', () => {
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

            it('should generate a correct payload for a check selection', () => {
                const checkOption = disbursementOptions.find(option => option.value === PaymentMailType.Check);
                expect(checkOption?.generatePayloadFromSelection(bankingDetails)).toEqual({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: null },
                });
            });
        });
    });

    describe('Systematic Withdrawal Options', () => {
        const { systematicWithdrawalOptions } = current;

        it('should correctly generate payload for a FixDollar option', () => {
            const formProgram = {
                amount: { text: '100' },
                frequency: { text: Frequency.Monthly },
                startDate: { text: '2020-01-01' },
                duration: { text: '1' },
            };

            const option = systematicWithdrawalOptions.find(option => option.value === SSWType.FixDollar);
            expect(option?.generateSSWPayloadFromSelection(formProgram as SSWProgram)).toEqual({
                thisIsMocked: true,
                ...getDefaultSSWFormProgramValues(),
                programSubType: { text: SSWType.FixDollar },
                programFrequency: {
                    frequency: formProgram.frequency,
                    beginDate: formProgram.startDate,
                    fixedPeriodYear: { text: null },
                    duration: formProgram.duration,
                },
                programAmount: { text: formProgram.amount?.text, amountType: AmountType.Dollar },
            });
        });

        it('should correctly generate payload for a FixPeriod option', () => {
            const formProgram = {
                frequency: { text: Frequency.Monthly },
                startDate: { text: '2020-01-01' },
                depleteFundYears: { text: '12' },
            };

            const option = systematicWithdrawalOptions.find(option => option.value === SSWType.FixPeriod);
            expect(option?.generateSSWPayloadFromSelection(formProgram as SSWProgram)).toEqual({
                thisIsMocked: true,
                ...getDefaultSSWFormProgramValues(),
                programSubType: { text: SSWType.FixPeriod },
                programFrequency: {
                    frequency: formProgram.frequency,
                    beginDate: formProgram.startDate,
                    fixedPeriodYear: formProgram.depleteFundYears,
                    duration: { text: null },
                },
            });
        });

        it('should correctly generate payload for a AnnualFree option', () => {
            const formProgram = {
                frequency: { text: Frequency.Monthly },
                startDate: { text: '2020-01-01' },
                duration: { text: '12' },
            };

            const option = systematicWithdrawalOptions.find(option => option.value === SSWType.AnnualFree);
            expect(option?.generateSSWPayloadFromSelection(formProgram as SSWProgram)).toEqual({
                thisIsMocked: true,
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

        it('should correctly generate payload for a InterestEarningDividendsGains option', () => {
            const formProgram = {
                frequency: { text: Frequency.Monthly },
                startDate: { text: '2020-01-01' },
                duration: { text: '12' },
            };

            const option = systematicWithdrawalOptions.find(option => option.value === SSWType.InterestEarningDividendsGains);
            expect(option?.generateSSWPayloadFromSelection(formProgram as SSWProgram)).toEqual({
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
});
