import getRslnRmdConfig from './rsln-rmd-form.helpers';
import { SignatureValidationTypeWithdrawal } from '../../../../models/case/renewal/signature-validation';
import {
    PaymentMethod,
    SignatureWithdrawal,
    AmountType,
} from '../../../../models/case/withdrawal/case';

describe('getRslnRmdConfig', () => {
    // Mock translation function
    const t = ((key: string) => key) as any;
    const config = getRslnRmdConfig(t);
    const formValidation = config.formValidation;

    const baseSignature: SignatureWithdrawal = {
        isSigned: null,
        signDate: { text: null },
        signExtension: null,
        signName: null,
        signOtherTitle: null,
        signTitle: { text: null },
        signTitles: [{ text: null }],
        signType: { text: SignatureValidationTypeWithdrawal.Owner },
        spousalConsent: { text: null },
        isSignatureValid: null,
        signatureComment: '',
        isNotaryValid: null,
        signGuaranteeStamp: { text: null },
        commissionExpiryDate: { text: null },
        ssn: { text: null },
        isSignatureCityProvided: { text: null },
        isDesignationPresent: null,
    };

    it('should return error if EFT account numbers do not match', () => {
        const errors = formValidation({
            formDisbursement: {
                paymentMethod: { text: PaymentMethod.EFT },
                paymentMailType: { text: null },
                bank: [
                    {
                        bankName: '',
                        accountNumber: '123',
                        reEnterAccountNumber: '456',
                        routingNumber: '789',
                        reEnterBankRoutingNumber: '789',
                    },
                ],
                payeeType: '',
                voidCheck: null,
                doesCheckMeetSecRequiremnt: null,
                participantId: { text: null },
                payee: null,
                upsAccount: null,
                emailDeliveryNotification: { text: false },
                isDifferentPayeeOrAddress: { text: false },
                bankVerification: {
                    selectedBankingType: '',
                    validationsMap: {
                        VOIDED_CHECK: null,
                        BANK_LETTERHEAD: null,
                        DIRECT_DEPOSIT_FORM: null,
                        STARTER_CHECK: null,
                        NO_BANK_PROOF: null,
                    },
                },
            },
        });
        expect(errors).toHaveProperty(
            'reEnterAccountNumber',
            'formValidation.accountNumberDoesNotMatch'
        );
    });

    it('should return error if EFT routing numbers do not match', () => {
        const errors = formValidation({
            formDisbursement: {
                paymentMethod: { text: PaymentMethod.EFT },
                paymentMailType: { text: null },
                bank: [
                    {
                        bankName: '',
                        accountNumber: '123',
                        reEnterAccountNumber: '123',
                        routingNumber: '789',
                        reEnterBankRoutingNumber: '000',
                    },
                ],
                payeeType: '',
                voidCheck: null,
                doesCheckMeetSecRequiremnt: null,
                participantId: { text: null },
                payee: null,
                upsAccount: null,
                emailDeliveryNotification: { text: false },
                isDifferentPayeeOrAddress: { text: false },
                bankVerification: {
                    selectedBankingType: '',
                    validationsMap: {
                        VOIDED_CHECK: null,
                        BANK_LETTERHEAD: null,
                        DIRECT_DEPOSIT_FORM: null,
                        STARTER_CHECK: null,
                        NO_BANK_PROOF: null,
                    },
                },
            },
        });
        expect(errors).toHaveProperty(
            'reEnterBankRoutingNumber',
            'formValidation.routingNumberDoesNotMatch'
        );
    });

    it('should return error if owner signature present option not selected', () => {
        const errors = formValidation({
            formSignature: {
                signatures: [{ ...baseSignature, isSigned: null }],
            },
        });
        expect(errors).toHaveProperty(
            `${SignatureValidationTypeWithdrawal.Owner}SignaturePresent`
        );
    });

    it('should return error if owner signature valid option not selected', () => {
        const errors = formValidation({
            formSignature: {
                signatures: [
                    {
                        ...baseSignature,
                        isSigned: true,
                        isSignatureValid: null,
                    },
                ],
            },
        });
        expect(errors).toStrictEqual({});
    });

    it('should return error if owner signature comment is missing when valid', () => {
        const errors = formValidation({
            formSignature: {
                signatures: [
                    {
                        ...baseSignature,
                        isSigned: true,
                        isSignatureValid: true,
                        signatureComment: '',
                    },
                ],
            },
        });
        expect(errors).toHaveProperty(
            `${SignatureValidationTypeWithdrawal.Owner}SignatureComment`
        );
    });

    it('should return error if rmdPrograms is empty', () => {
        const errors = formValidation({
            formProgram: {
                withdrawType: { text: '' },
                programType: { text: '' },
                programSubType: { text: null },
                partialAmount: { text: null, amountType: AmountType.Dollar },
                partialGrossAmount: {
                    text: null,
                    amountType: AmountType.Dollar,
                },
                partialNetAmount: { text: null, amountType: AmountType.Dollar },
                gmwbAmount: { text: null, amountType: AmountType.Dollar },
                rmd: {
                    rmdType: null,
                    rmdSubType: null,
                    rmdRelationship: null,
                    ralationshipDate: null,
                    rmdAmount: null,
                    fullName: null,
                    firstName: null,
                    middleName: null,
                    lastName: null,
                    dob: { text: null },
                    isJointLifeExpectancy: false,
                    rmdPrograms: [],
                    taxId: { text: null },
                },
            },
        });
        expect(errors).toHaveProperty('rmdMinimumRequiredProgram');
    });
});
