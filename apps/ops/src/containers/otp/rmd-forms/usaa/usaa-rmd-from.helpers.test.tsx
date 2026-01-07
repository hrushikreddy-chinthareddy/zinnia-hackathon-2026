import { TFunction } from 'next-i18next';

import { BankingFields } from '@deps/components/otp-withdrawal-form/form-disbursement/form-disbursement.helpers';
import {
    FormDisbursement,
    FormParts,
    FormProgram,
    PaymentMethod,
} from '@deps/models/case/withdrawal/case';

import getUsaaRmdWithdrawalConfig from './usaa-rmd-from.helpers';

jest.mock('../../withdrawal-forms/utils/form-validator.helpers', () => ({
    ...jest.requireActual(
        '../../withdrawal-forms/utils/form-validator.helpers'
    ),
    validateSignESign: jest.fn(() => ({})),
}));

describe('getUsaaRmdWithdrawalConfig', () => {
    const mockT = jest.fn((key: string) => key) as unknown as TFunction;
    // isValidationV2Enabled = false uses rmdFormValidation (v1)
    const { formValidation } = getUsaaRmdWithdrawalConfig(mockT, false, false);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('rmdFormValidation (isValidationV2Enabled = false)', () => {
        describe('EFT/Wire payment method validation', () => {
            const createFormDisbursement = (
                overrides: Partial<{
                    paymentMethod: PaymentMethod;
                    bankName: string;
                    accountNumber: string;
                    reEnterAccountNumber: string;
                    routingNumber: string;
                    reEnterBankRoutingNumber: string;
                }>
            ): FormDisbursement =>
                ({
                    paymentMethod: {
                        text: overrides.paymentMethod ?? PaymentMethod.EFT,
                    },
                    bank: [
                        {
                            bankName: overrides.bankName ?? '',
                            accountNumber: overrides.accountNumber ?? '12345',
                            reEnterAccountNumber:
                                overrides.reEnterAccountNumber ?? '12345',
                            routingNumber: overrides.routingNumber ?? '987654',
                            reEnterBankRoutingNumber:
                                overrides.reEnterBankRoutingNumber ?? '987654',
                        },
                    ],
                } as FormDisbursement);

            it('should return account number mismatch error when EFT payment with empty bank name and mismatched account numbers', () => {
                const formDisbursement = createFormDisbursement({
                    paymentMethod: PaymentMethod.EFT,
                    bankName: '',
                    accountNumber: '12345',
                    reEnterAccountNumber: '54321',
                });

                const errors = formValidation({ formDisbursement });

                expect(errors[BankingFields.ReEnterAccountNumber]).toBe(
                    'formValidation.accountNumberDoesNotMatch'
                );
            });

            it('should return routing number mismatch error when EFT payment with empty bank name and mismatched routing numbers', () => {
                const formDisbursement = createFormDisbursement({
                    paymentMethod: PaymentMethod.EFT,
                    bankName: '',
                    routingNumber: '111111',
                    reEnterBankRoutingNumber: '222222',
                });

                const errors = formValidation({ formDisbursement });

                expect(errors[BankingFields.ReEnterBankRoutingNumber]).toBe(
                    'formValidation.routingNumberDoesNotMatch'
                );
            });

            it('should return account number mismatch error when Wire payment with empty bank name and mismatched account numbers', () => {
                const formDisbursement = createFormDisbursement({
                    paymentMethod: PaymentMethod.Wire,
                    bankName: '',
                    accountNumber: '12345',
                    reEnterAccountNumber: '54321',
                });

                const errors = formValidation({ formDisbursement });

                expect(errors[BankingFields.ReEnterAccountNumber]).toBe(
                    'formValidation.accountNumberDoesNotMatch'
                );
            });

            it('should return routing number mismatch error when Wire payment with empty bank name and mismatched routing numbers', () => {
                const formDisbursement = createFormDisbursement({
                    paymentMethod: PaymentMethod.Wire,
                    bankName: '',
                    routingNumber: '111111',
                    reEnterBankRoutingNumber: '222222',
                });

                const errors = formValidation({ formDisbursement });

                expect(errors[BankingFields.ReEnterBankRoutingNumber]).toBe(
                    'formValidation.routingNumberDoesNotMatch'
                );
            });

            it('should return both account and routing number errors when both are mismatched', () => {
                const formDisbursement = createFormDisbursement({
                    paymentMethod: PaymentMethod.EFT,
                    bankName: '',
                    accountNumber: '12345',
                    reEnterAccountNumber: '54321',
                    routingNumber: '111111',
                    reEnterBankRoutingNumber: '222222',
                });

                const errors = formValidation({ formDisbursement });

                expect(errors[BankingFields.ReEnterAccountNumber]).toBe(
                    'formValidation.accountNumberDoesNotMatch'
                );
                expect(errors[BankingFields.ReEnterBankRoutingNumber]).toBe(
                    'formValidation.routingNumberDoesNotMatch'
                );
            });

            it('should NOT return errors when bank name is provided (not empty)', () => {
                const formDisbursement = createFormDisbursement({
                    paymentMethod: PaymentMethod.EFT,
                    bankName: 'Bank of America',
                    accountNumber: '12345',
                    reEnterAccountNumber: '54321', // mismatched but should not error
                    routingNumber: '111111',
                    reEnterBankRoutingNumber: '222222', // mismatched but should not error
                });

                const errors = formValidation({ formDisbursement });

                expect(
                    errors[BankingFields.ReEnterAccountNumber]
                ).toBeUndefined();
                expect(
                    errors[BankingFields.ReEnterBankRoutingNumber]
                ).toBeUndefined();
            });

            it('should NOT return errors when account and routing numbers match', () => {
                const formDisbursement = createFormDisbursement({
                    paymentMethod: PaymentMethod.EFT,
                    bankName: '',
                    accountNumber: '12345',
                    reEnterAccountNumber: '12345',
                    routingNumber: '987654',
                    reEnterBankRoutingNumber: '987654',
                });

                const errors = formValidation({ formDisbursement });

                expect(
                    errors[BankingFields.ReEnterAccountNumber]
                ).toBeUndefined();
                expect(
                    errors[BankingFields.ReEnterBankRoutingNumber]
                ).toBeUndefined();
            });

            it('should NOT validate banking fields for non-EFT/Wire payment methods', () => {
                const formDisbursement = createFormDisbursement({
                    paymentMethod: PaymentMethod.Direct,
                    bankName: '',
                    accountNumber: '12345',
                    reEnterAccountNumber: '54321', // mismatched
                    routingNumber: '111111',
                    reEnterBankRoutingNumber: '222222', // mismatched
                });

                const errors = formValidation({ formDisbursement });

                expect(
                    errors[BankingFields.ReEnterAccountNumber]
                ).toBeUndefined();
                expect(
                    errors[BankingFields.ReEnterBankRoutingNumber]
                ).toBeUndefined();
            });
        });

        describe('RMD programs validation', () => {
            it('should return error when rmdPrograms array is empty', () => {
                const formProgram = {
                    rmd: {
                        rmdPrograms: [],
                    },
                } as unknown as FormProgram;

                const errors = formValidation({
                    formProgram,
                });

                expect(errors['rmdMinimumRequiredProgram']).toBe(
                    'rmdMethod.rmdWarnings.minimumRequiredProgram'
                );
            });

            it('should NOT return error when rmdPrograms has at least one item', () => {
                const formProgram = {
                    rmd: {
                        rmdPrograms: [{ someField: 'value' }],
                    },
                } as unknown as FormProgram;

                const errors = formValidation({
                    formProgram,
                });

                expect(errors['rmdMinimumRequiredProgram']).toBeUndefined();
            });

            it('should NOT return error when rmdPrograms is undefined', () => {
                const formProgram = {
                    rmd: undefined,
                } as unknown as FormProgram;

                const errors = formValidation({
                    formProgram,
                });

                expect(errors['rmdMinimumRequiredProgram']).toBeUndefined();
            });

            it('should NOT return error when formProgram is undefined', () => {
                const errors = formValidation({
                    formProgram: undefined,
                });

                expect(errors['rmdMinimumRequiredProgram']).toBeUndefined();
            });
        });

        describe('combined validation scenarios', () => {
            it('should return multiple errors when multiple validations fail', () => {
                const formParts: Partial<FormParts> = {
                    formDisbursement: {
                        paymentMethod: { text: PaymentMethod.EFT },
                        bank: [
                            {
                                bankName: '',
                                accountNumber: '12345',
                                reEnterAccountNumber: '54321',
                                routingNumber: '111111',
                                reEnterBankRoutingNumber: '222222',
                            },
                        ],
                    } as FormDisbursement,
                    formProgram: {
                        rmd: {
                            rmdPrograms: [],
                        },
                    } as unknown as FormProgram,
                };

                const errors = formValidation(formParts);

                expect(errors[BankingFields.ReEnterAccountNumber]).toBe(
                    'formValidation.accountNumberDoesNotMatch'
                );
                expect(errors[BankingFields.ReEnterBankRoutingNumber]).toBe(
                    'formValidation.routingNumberDoesNotMatch'
                );
                expect(errors['rmdMinimumRequiredProgram']).toBe(
                    'rmdMethod.rmdWarnings.minimumRequiredProgram'
                );
            });

            it('should return no errors when all validations pass', () => {
                const formParts: Partial<FormParts> = {
                    formDisbursement: {
                        paymentMethod: { text: PaymentMethod.EFT },
                        bank: [
                            {
                                bankName: '',
                                accountNumber: '12345',
                                reEnterAccountNumber: '12345',
                                routingNumber: '987654',
                                reEnterBankRoutingNumber: '987654',
                            },
                        ],
                    } as FormDisbursement,
                    formProgram: {
                        rmd: {
                            rmdPrograms: [{ someField: 'value' }],
                        },
                    } as unknown as FormProgram,
                };

                const errors = formValidation(formParts);

                expect(
                    errors[BankingFields.ReEnterAccountNumber]
                ).toBeUndefined();
                expect(
                    errors[BankingFields.ReEnterBankRoutingNumber]
                ).toBeUndefined();
                expect(errors['rmdMinimumRequiredProgram']).toBeUndefined();
            });
        });
    });

    describe('rmdFormValidation (isValidationV2Enabled = true, DTCC enabled)', () => {
        // isValidationV2Enabled = true uses rmdFormValidationV2 which includes DTCC validation
        const { formValidation } = getUsaaRmdWithdrawalConfig(
            mockT,
            true,
            true
        );

        const createDtccFormDisbursement = (
            overrides: Partial<{
                participantId: string | null;
                contractNumber: string;
            }>
        ): FormDisbursement =>
            ({
                paymentMethod: { text: PaymentMethod.DTCC },
                participantId: {
                    text: overrides.participantId ?? null,
                },
                bank: [
                    {
                        accountNumber: overrides.contractNumber ?? '',
                        bankName: 'Test Bank',
                    },
                ],
            } as FormDisbursement);

        describe('DTCC validation', () => {
            it('should return error when participantId is "0000" and contractNumber is "0000"', () => {
                const formDisbursement = createDtccFormDisbursement({
                    participantId: '0000',
                    contractNumber: '0000',
                });

                const errors = formValidation({ formDisbursement });

                expect(errors[BankingFields.ContractNumber]).toBe(
                    'formValidation.participantIdCannotBeSubmitted'
                );
            });

            it('should return error when participantId is provided but contractNumber is empty', () => {
                const formDisbursement = createDtccFormDisbursement({
                    participantId: '1234',
                    contractNumber: '',
                });

                const errors = formValidation({ formDisbursement });

                expect(errors[BankingFields.ContractNumber]).toBe(
                    'formValidation.contractNumberRequired'
                );
            });

            it('should NOT return error when participantId and contractNumber are valid', () => {
                const formDisbursement = createDtccFormDisbursement({
                    participantId: '1234',
                    contractNumber: '5678',
                });

                const errors = formValidation({ formDisbursement });

                expect(errors[BankingFields.ContractNumber]).toBeUndefined();
            });

            it('should NOT return error when participantId is empty', () => {
                const formDisbursement = createDtccFormDisbursement({
                    participantId: '',
                    contractNumber: '',
                });

                const errors = formValidation({ formDisbursement });

                expect(errors[BankingFields.ContractNumber]).toBeUndefined();
            });

            it('should NOT return error when participantId is null', () => {
                const formDisbursement = createDtccFormDisbursement({
                    participantId: null,
                    contractNumber: '',
                });

                const errors = formValidation({ formDisbursement });

                expect(errors[BankingFields.ContractNumber]).toBeUndefined();
            });

            it('should NOT return "0000" error when only participantId is "0000" but contractNumber is different', () => {
                const formDisbursement = createDtccFormDisbursement({
                    participantId: '0000',
                    contractNumber: '1234',
                });

                const errors = formValidation({ formDisbursement });

                // Should not trigger the "participantIdCannotBeSubmitted" error
                expect(errors[BankingFields.ContractNumber]).toBeUndefined();
            });

            it('should NOT return "0000" error when only contractNumber is "0000" but participantId is different', () => {
                const formDisbursement = createDtccFormDisbursement({
                    participantId: '1234',
                    contractNumber: '0000',
                });

                const errors = formValidation({ formDisbursement });

                // Should not trigger the "participantIdCannotBeSubmitted" error
                expect(errors[BankingFields.ContractNumber]).toBeUndefined();
            });
        });

        describe('DTCC disabled (isValidationV2Enabled = true, isDtccSectionEnabled = false)', () => {
            const { formValidation: formValidationWithoutDtcc } =
                getUsaaRmdWithdrawalConfig(mockT, false, true);

            it('should NOT validate DTCC fields when isDtccSectionEnabled is false', () => {
                const formDisbursement = createDtccFormDisbursement({
                    participantId: '0000',
                    contractNumber: '0000',
                });

                const errors = formValidationWithoutDtcc({
                    formDisbursement,
                });

                // DTCC validation should be skipped when isDtccSectionEnabled is false
                expect(errors[BankingFields.ContractNumber]).toBeUndefined();
            });
        });
    });
});
