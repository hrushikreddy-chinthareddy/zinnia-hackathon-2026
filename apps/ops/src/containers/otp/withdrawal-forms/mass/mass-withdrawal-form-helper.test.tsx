import { renderHook } from '@testing-library/react';
import { TFunctionDetailedResult } from 'i18next';
import { TFunction } from 'next-i18next';

import { OtpWithdrawalFormState } from '@deps/contexts/OtpWithdrawalFormContext';
import { SignatureValidationTypeWithdrawal } from '@deps/models/case/renewal/signature-validation';
import {
    AccountType,
    AddressTypes,
    BankDetails,
    FormParty,
    FormSignature,
    PartyRoles,
    PaymentMailType,
    PaymentMethod,
    PhoneTypes,
    SignatureWithdrawal,
} from '@deps/models/case/withdrawal/case';
import { DEFAULT_DISBURSEMENT_UPDATE, DisbursementParts, DEFAULT_BANK_DETAILS } from '@deps/models/case/withdrawal/disbursement-types';

import useMassWithdrawalConfig from './mass-withdrawal-form-helper';

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

describe('Mass withdrawal form config', () => {
    const t: TFunction = (key: string | string[]) => key as unknown as TFunctionDetailedResult<string>;
    const {
        result: { current },
    } = renderHook(() => useMassWithdrawalConfig(t));

    describe('Config existence', () => {
        it('should return an object with the correct configuration options', () => {
            expect(current.getSignaturesConfig).toBeDefined();
            expect(current.fundWithdrawnMethodOptions).toBeDefined();
            expect(current.partialWithdrawalOptions).toBeDefined();
            expect(current.identifySelectedFormProgramOption).toBeDefined();
            expect(current.disbursementOptions).toBeDefined();
            expect(current.formPartyConfigs).toBeDefined();
            expect(current.selectOneOptions).toBeDefined();
        });
    });

    describe('formValidation', () => {
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

    describe('signaturesConfig', () => {
        const { getSignaturesConfig } = current;
        const isKeogh = true;
        describe('Owner signature', () => {
            const ownerConfig = getSignaturesConfig(isKeogh).find(
                sigConfig => sigConfig.signatureType === SignatureValidationTypeWithdrawal.Owner
            );
            it('should be in the config', () => {
                expect(ownerConfig).toBeTruthy();
                expect(ownerConfig?.fields).toHaveLength(4);
            });
        });

        describe('Joint owner signature', () => {
            const jointOwnerConfig = getSignaturesConfig(isKeogh).find(
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

        describe.skip('Spouse signature', () => {
            const signature = {
                signatures: [
                    {
                        isSigned: null,
                        signDate: {
                            text: '',
                        },
                        signExtension: null,
                        signName: null,
                        signOtherTitle: null,
                        signTitle: {
                            text: '',
                        },
                        signTitles: [
                            {
                                text: null,
                            },
                        ],
                        signType: {
                            text: 'Spouse',
                        },
                        spousalConsent: {
                            text: null,
                        },
                    },
                ],
                isSpousalConsentRequired: null,
                isCheckCSNLValid: null,
                signVerificationReason: [
                    {
                        text: 'MARRIED_SUBJECT_TO_ERISA',
                    },
                ],
            };

            const spouseConfig = getSignaturesConfig(isKeogh).find(
                sigConfig => sigConfig.signatureType === SignatureValidationTypeWithdrawal.Spouse
            );
            it('should be in the config', () => {
                expect(spouseConfig).toBeTruthy();
                expect(spouseConfig?.fields).toHaveLength(3);
            });

            it('should have shouldDisplay logic', () => {
                expect(spouseConfig?.shouldDisplay?.({ formSignature: signature } as OtpWithdrawalFormState)).toBeTruthy();
            });
        });
    });

    describe('disbursementOptions', () => {
        const { disbursementOptions } = current;
        const bank: BankDetails = {
            accountNumber: '12345',
            accountType: { text: AccountType.Checking },
            bankContactPerson: 'Fred Mockerson',
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
            payeeName: bank.nameOnBankAccount || '',
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
                    upsAccount: {
                        accountName: { text: bankingDetails.accountName },
                        accountNumber: { text: bankingDetails.accountNumber },
                        zip: { text: bankingDetails.zip },
                    },
                    emailDeliveryNotification: { text: bankingDetails.emailDeliveryNotification },
                });
            });

            it('should generate a correct payload for an alternatePayeeAddress selection', () => {
                const alternatePayeeOption = disbursementOptions.find(option => option.value === PaymentMethod.AlternatePayeeAddress);
                expect(alternatePayeeOption?.generatePayloadFromSelection(bankingDetails)).toEqual({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMethod.AlternatePayeeAddress },
                    payee: {
                        name: {
                            text: bankingDetails.payeeName,
                        },
                        addresses: [bankingDetails.address],
                        contractNumber: {
                            text: null,
                        },
                        taxId: {
                            text: bankingDetails.taxId,
                        },
                    },
                });
            });
        });
    });
});
