import { renderHook } from '@testing-library/react';
import { TFunctionDetailedResult } from 'i18next';
import { TFunction } from 'next-i18next';

import { AccountType, BankDetails, PaymentMailType, PaymentMethod } from '@deps/models/case/withdrawal/case';
import { DEFAULT_DISBURSEMENT_UPDATE, DisbursementParts, DEFAULT_BANK_DETAILS } from '@deps/models/case/withdrawal/disbursement-types';

import useDlicConfig from './dlic-withdrawal-form-helper';

jest.mock('@deps/components/otp-withdrawal-form/form-program/form-program.helper', () => {
    const originalModule = jest.requireActual('@deps/components/otp-withdrawal-form/form-program/form-program.helper');
    return {
        ...originalModule,
        getDefaultFormProgramValues: () => {
            return { thisIsMocked: true };
        },
    };
});

jest.mock('@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helper', () => {
    const originalModule = jest.requireActual('@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helper');
    return {
        ...originalModule,
        getDefaultFormDisbursementValues: () => {
            return { thisIsMocked: true };
        },
    };
});

describe('Dlic withdrawal form config', () => {
    const t: TFunction = (key: string | string[]) => key as unknown as TFunctionDetailedResult<string>;

    const {
        result: { current },
    } = renderHook(() => useDlicConfig(t));

    describe('Config existence', () => {
        it('should return an object with the correct configuration options', () => {
            expect(current.signaturesConfig).toBeDefined();
            expect(current.signaturesNotaryConfig).toBeDefined();
            expect(current.fundWithdrawnMethodOptions).toBeDefined();
            expect(current.partialWithdrawalOptions).toBeDefined();
            expect(current.identifySelectedFormProgramOption).toBeDefined();
            expect(current.disbursementOptions).toBeDefined();
            expect(current.formPartyConfigs).toBeDefined();
            expect(current.selectOneOptions).toBeDefined();
            expect(current.cslnCheckStates).toBeDefined();
        });
    });

    describe('disbursementOptions', () => {
        const { disbursementOptions } = current;
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
                            isDirectDepositValid: { text: bankingDetails.isDirectDepositValid },
                            bankFurtherCreditAccount: bankingDetails.bankFurtherCreditAccount,
                            bankFurtherCreditName: bankingDetails.bankFurtherCreditName,
                            isDirectDeposit: { text: true },
                            reEnterAccountNumber: '123',
                            reEnterBankRoutingNumber: '123'
                        },
                    ],
                });
            });

            it('should generate a correct payload for an eft bank type masked selection', () => {
                const eftOption = disbursementOptions.find(option => option.value === PaymentMethod.EFT);
                // const eftMasked: BankDetails = { ...DEFAULT_BANK_DETAILS, maskedAccountNumber: '1234', isDirectDeposit: { text: false } };
                expect(eftOption?.generatePayloadFromSelection({ ...bankingDetails, isDirectDeposit: false })).toEqual({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMethod.EFT },
                    paymentMailType: { text: null },
                    bank: [
                        {
                            ...DEFAULT_BANK_DETAILS,
                            maskedAccountNumber: '1234',
                            isDirectDeposit: { text: false },
                        },
                    ],
                });
            });

            it('should generate a correct payload for a wire selection', () => {
                const wireOption = disbursementOptions.find(option => option.value === PaymentMethod.Wire);
                expect(wireOption?.generatePayloadFromSelection(bankingDetails)).toEqual({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMethod.Wire },
                    paymentMailType: { text: null },
                    //bank: [{ ...wireBankDetails, isDirectDeposit: { text: true }, isDirectDepositValid: { text: null } }],
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
                            isDirectDeposit: { text: true },
                            isDirectDepositValid: { text: null },
                            reEnterAccountNumber: '123',
                            reEnterBankRoutingNumber: '123'
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
                    isDifferentPayeeOrAddress: { text: bankingDetails.selectIfPayeeIsDifferent },
                    payee: {
                        name: { text: bankingDetails.payeeName },
                        addresses: [bankingDetails.address],
                        contractNumber: { text: null },
                    },
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
});
