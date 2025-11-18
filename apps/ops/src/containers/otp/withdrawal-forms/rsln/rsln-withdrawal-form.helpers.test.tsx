import { TFunctionDetailedResult } from 'i18next';
import { TFunction } from 'next-i18next';

import { FormEsignatureData } from '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation.helpers';
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
import {
    DisbursementParts,
    DEFAULT_DISBURSEMENT_UPDATE,
    DEFAULT_BANK_DETAILS,
} from '@deps/models/case/withdrawal/disbursement-types';

import getRslnConfig from './rsln-withdrawal-form.helpers';

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

describe('RSLN withdrawal form config', () => {
    const t: TFunction = (key: string | string[]) =>
        key as unknown as TFunctionDetailedResult<string>;
    const rslnConfig = getRslnConfig(t);
    describe('Config existence', () => {
        it('should return an object with the correct configuration options', () => {
            expect(rslnConfig.formValidation).toBeDefined();
            expect(rslnConfig.signaturesConfig).toBeDefined();
            expect(rslnConfig.disbursementOptions).toBeDefined();
            expect(rslnConfig.formPartyConfigs).toBeDefined();
            expect(rslnConfig.reasonOptions).toBeDefined();
        });
    });

    describe('disbursementOptions', () => {
        const { disbursementOptions } = rslnConfig;
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

        const disbursementMockData: DisbursementParts = {
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
                const eftOption = disbursementOptions.find(
                    (option) => option.value === PaymentMethod.EFT
                );
                expect(
                    eftOption?.generatePayloadFromSelection(
                        disbursementMockData
                    )
                ).toEqual({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMethod.EFT },
                    paymentMailType: { text: null },
                    bank: [
                        {
                            ...DEFAULT_BANK_DETAILS,
                            accountNumber: disbursementMockData.accountNumber,
                            accountType: {
                                text: disbursementMockData.accountType,
                            },
                            bankName: disbursementMockData.bankName,
                            nameOnBankAccount:
                                disbursementMockData.accountHolder ?? '',
                            routingNumber:
                                disbursementMockData.bankRoutingNumber,
                            reEnterAccountNumber: '',
                            reEnterBankRoutingNumber: '',
                        },
                    ],
                    voidCheck: disbursementMockData.isVoidCheckAttached,
                    doesCheckMeetSecRequiremnt:
                        disbursementMockData.doesCheckMeetSecurityRequirements,
                });
            });
            it('should generate a correct payload for a wire selection', () => {
                const wireOption = disbursementOptions.find(
                    (option) => option.value === PaymentMethod.Wire
                );
                expect(
                    wireOption?.generatePayloadFromSelection(
                        disbursementMockData
                    )
                ).toEqual({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMethod.Wire },
                    paymentMailType: { text: null },
                    bank: [
                        {
                            ...DEFAULT_BANK_DETAILS,
                            accountNumber: disbursementMockData.accountNumber,
                            accountType: {
                                text: disbursementMockData.accountType,
                            },
                            bankName: disbursementMockData.bankName,
                            nameOnBankAccount:
                                disbursementMockData.accountHolder ?? '',
                            routingNumber:
                                disbursementMockData.bankRoutingNumber,
                            reEnterAccountNumber: '',
                            reEnterBankRoutingNumber: '',
                        },
                    ],
                    voidCheck: disbursementMockData.isVoidCheckAttached,
                    doesCheckMeetSecRequiremnt:
                        disbursementMockData.doesCheckMeetSecurityRequirements,
                    isWireApprovalPresent: {
                        text: disbursementMockData.isWireApprovalPresent,
                    },
                });
            });
            it('should generate a correct payload for a check selection', () => {
                const checkOption = disbursementOptions.find(
                    (option) => option.value === PaymentMailType.Check
                );
                expect(
                    checkOption?.generatePayloadFromSelection(
                        disbursementMockData
                    )
                ).toEqual({
                    thisIsMocked: true,
                    paymentMethod: { text: PaymentMailType.Check },
                    paymentMailType: { text: null },
                });
            });
        });
    });

    describe('formValidation', () => {
        const { formValidation } = rslnConfig;
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
        };
        const formSignature: FormSignature = {
            isSpousalConsentRequired: { text: false },
            signatures: [signature],
        };
        const formESignatureData: FormEsignatureData = {
            isFormESignaturePresent: true,
            eSignatures: [
                {
                    signType: { text: 'Owner' },
                    isSigned: null,
                    signDate: { text: '' },
                    isAuditTrail: null,
                    isAccordForm: null,
                },
            ],
        };
        it('should provide e-signature errors for eSign selected form', () => {
            expect(
                formValidation({ formParty, formSignature, formESignatureData })
            ).toEqual({
                'Owner-e-signature-present':
                    'formValidation.signaturePresentOptionMustBeSelected',
            });
        });
    });

    describe('signaturesConfig', () => {
        const { signaturesConfig } = rslnConfig;
        describe('Owner signature', () => {
            const ownerConfig = signaturesConfig.find(
                (sigConfig) =>
                    sigConfig.signatureType ===
                    SignatureValidationTypeWithdrawal.Owner
            );
            it('should be in the config', () => {
                expect(ownerConfig).toBeTruthy();
                expect(ownerConfig?.fields).toHaveLength(6);
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
                expect(jointOwnerConfig?.fields).toHaveLength(6);
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
    });
});
