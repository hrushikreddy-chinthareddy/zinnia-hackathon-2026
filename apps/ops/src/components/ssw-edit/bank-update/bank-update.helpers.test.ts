import dayjs from 'dayjs';

import { DocumentData } from '@deps/models/case/document';
import {
    BankUpdateType,
    ChannelType,
    ContributionType,
} from '@deps/models/case/enums';
import {
    AccountType,
    ActiveWithdrawalCase,
    Carrier,
    FormComment,
    FormDisbursement,
    FormSignature,
} from '@deps/models/case/withdrawal/case';
import { DisbursementParts } from '@deps/models/case/withdrawal/disbursement-types';
import { ZAHARA_API_DATE_FORMAT } from '@deps/types/constants';

import * as sswEditHelpers from '../ssw-edit-helpers';
import { getBankUpdatePayload } from './bank-update.helpers';

// Mock the ssw-edit-helpers module
jest.mock('../ssw-edit-helpers', () => ({
    getDocumentSource: jest.fn(),
}));

describe('getBankUpdatePayload', () => {
    // Mock data setup
    const mockDocumentDate = '1/15/2024 10:30:00 AM';
    const expectedFormattedDate = dayjs(
        mockDocumentDate,
        'M/D/YYYY hh:mm:ss A'
    ).format(ZAHARA_API_DATE_FORMAT);
    const expectedFormattedDateTime = dayjs(
        mockDocumentDate,
        'M/D/YYYY hh:mm:ss A'
    ).format('YYYY-MM-DDTHH:mm:ss:Z');

    const createMockInitialForm = (carrier: Carrier): ActiveWithdrawalCase =>
        ({
            carrier,
            caseId: 'case-123',
            taskId: 'task-456',
            taskType: 'BANK_UPDATE',
            data: {
                contractNum: 'CONTRACT-001',
                existingField: 'existing-value',
            },
        } as unknown as ActiveWithdrawalCase);

    const mockBankUpdateDetails: DisbursementParts = {
        accountNumber: '123456789',
        accountType: AccountType.Checking,
        bankName: 'Test Bank',
        accountHolder: 'John Doe',
        bankRoutingNumber: '987654321',
        bankType: ContributionType.Disbursement,
        doesCheckMeetSecurityRequirements: true,
        isVoidCheckAttached: true,
        // Required properties from DisbursementParts interface
        bankContactPerson: '',
        bankFurtherCreditAccount: '',
        bankFurtherCreditName: '',
        bankLocation: '',
        bankPhone: '',
        nameOnBankAccount: 'John Doe',
        firstTimeExpressCheck: null,
        isWireApprovalPresent: null,
        address: {} as any,
        acordAttached: null,
        companyName: '',
        participantId: null,
        payeeName: null,
        contractNumber: null,
        taxId: null,
        zip: '',
        emailDeliveryNotification: false,
        isDifferentPayeeOrAddress: false,
        maskedAccountNumber: null,
        accountName: null,
        emailNotification: null,
        selectIfPayeeIsDifferent: false,
        isDirectDepositValid: null,
        fboDetails: '',
        consentAvailable: null,
        ChooseBankingType: '',
        isPayeeFinancialIns: false,
        isAnnuitant: false,
        isPayeeCharity: false,
        isThirdPartyDisbursement: false,
        isAddressDifferent: false,
    };

    const mockFormDisbursement: FormDisbursement = {
        paymentMethod: { text: 'EFT' },
        bank: [
            {
                accountNumber: 'SBGC-ACC-111',
                accountType: { text: AccountType.Savings },
                bankName: 'SBGC Bank',
                nameOnBankAccount: 'SBGC Account Holder',
                routingNumber: 'SBGC-RTN-222',
            },
        ],
        bankVerification: {
            isVerified: true,
            verificationDate: '2024-01-15',
        },
    } as unknown as FormDisbursement;

    const mockFormSignature: FormSignature = {
        signatures: [
            {
                signType: { text: 'Owner' },
                isSigned: true,
                signDate: '2024-01-15',
            },
        ],
    } as unknown as FormSignature;

    const mockDocument: DocumentData = {
        documentNumber: 'DOC-EMAIL-123',
        source: 'Email',
        dateReceived: mockDocumentDate,
        caseId: 'onbase-case-789',
    } as unknown as DocumentData;

    const mockFormComment: FormComment = {
        comment: 'Test comment',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Bank data source based on carrier', () => {
        it('should use formDisbursement bank data for SBGC carrier', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.SBGC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            const bankData = result.formRequest.formUpdateData.bank[0];
            expect(bankData.accountNumber).toBe('SBGC-ACC-111');
            expect(bankData.accountType.text).toBe(AccountType.Savings);
            expect(bankData.bankName).toBe('SBGC Bank');
            expect(bankData.nameOnBankAccount).toBe('SBGC Account Holder');
            expect(bankData.routingNumber).toBe('SBGC-RTN-222');
        });

        it('should use bankUpdateDetails for non-SBGC carriers', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.DLIC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            const bankData = result.formRequest.formUpdateData.bank[0];
            expect(bankData.accountNumber).toBe('123456789');
            expect(bankData.accountType.text).toBe(AccountType.Checking);
            expect(bankData.bankName).toBe('Test Bank');
            expect(bankData.nameOnBankAccount).toBe('John Doe');
            expect(bankData.routingNumber).toBe('987654321');
        });

        it('should include bankVerification for SBGC carrier', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.SBGC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            expect(result.formRequest.formUpdateData.bankVerification).toEqual({
                isVerified: true,
                verificationDate: '2024-01-15',
            });
        });

        it('should not include bankVerification for non-SBGC carriers', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.DLIC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            expect(
                result.formRequest.formUpdateData.bankVerification
            ).toBeUndefined();
        });
    });

    describe('Security requirements field applicability', () => {
        it.each([Carrier.USAA, Carrier.GLCO, Carrier.ULPC])(
            'should set doesCheckMeetSecRequiremnt to null for %s carrier',
            (carrier) => {
                (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                    ChannelType.Email
                );

                const result = getBankUpdatePayload(
                    createMockInitialForm(carrier),
                    mockBankUpdateDetails,
                    mockFormDisbursement,
                    mockFormSignature,
                    mockDocument,
                    BankUpdateType.BankUpdate,
                    mockFormComment
                );

                expect(
                    result.formRequest.formUpdateData.doesCheckMeetSecRequiremnt
                ).toBeNull();
            }
        );

        it.each([Carrier.DLIC, Carrier.FLIC])(
            'should include doesCheckMeetSecRequiremnt value for %s carrier',
            (carrier) => {
                (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                    ChannelType.Email
                );

                const result = getBankUpdatePayload(
                    createMockInitialForm(carrier),
                    mockBankUpdateDetails,
                    mockFormDisbursement,
                    mockFormSignature,
                    mockDocument,
                    BankUpdateType.BankUpdate,
                    mockFormComment
                );

                expect(
                    result.formRequest.formUpdateData.doesCheckMeetSecRequiremnt
                ).toBe(true);
            }
        );
    });

    describe('Void check field applicability', () => {
        it.each([Carrier.USAA, Carrier.GLCO, Carrier.ULPC])(
            'should set voidCheck to null for %s carrier',
            (carrier) => {
                (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                    ChannelType.Email
                );

                const result = getBankUpdatePayload(
                    createMockInitialForm(carrier),
                    mockBankUpdateDetails,
                    mockFormDisbursement,
                    mockFormSignature,
                    mockDocument,
                    BankUpdateType.BankUpdate,
                    mockFormComment
                );

                expect(result.formRequest.formUpdateData.voidCheck).toBeNull();
            }
        );

        it.each([Carrier.DLIC, Carrier.FLIC])(
            'should include voidCheck value for %s carrier',
            (carrier) => {
                (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                    ChannelType.Email
                );

                const result = getBankUpdatePayload(
                    createMockInitialForm(carrier),
                    mockBankUpdateDetails,
                    mockFormDisbursement,
                    mockFormSignature,
                    mockDocument,
                    BankUpdateType.BankUpdate,
                    mockFormComment
                );

                expect(result.formRequest.formUpdateData.voidCheck).toBe(true);
            }
        );
    });

    describe('Form signature based on document source', () => {
        it('should include formSignature when document source is Email', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.DLIC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            expect(result.formRequest.formSignature).toEqual(mockFormSignature);
        });

        it('should set formSignature to null when document source is Phone', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Phone
            );

            const phoneDocument = {
                ...mockDocument,
                documentNumber: 'DOC-MAN-456',
            };

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.DLIC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                phoneDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            expect(result.formRequest.formSignature).toBeNull();
        });
    });

    describe('Form source and metadata', () => {
        it('should correctly format source data', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.DLIC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            expect(result.formRequest.formSource).toEqual({
                channel: { text: 'Email' },
                businessKey: 'DOC-EMAIL-123',
                receivedDate: expectedFormattedDate,
                receivedDateTime: expectedFormattedDateTime,
                sourceSysId: 'ONBASE',
            });
        });

        it('should correctly set form metadata based on carrier', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.DLIC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            expect(result.formRequest.formData).toEqual({
                formExtName: 'DLIC_UPDATE_DIGITAL_FORM',
                metaData: {
                    formType: 'DLIC_UPDATE_DIGITAL_FORM',
                    formId: null,
                    formNumber: '',
                },
            });
        });
    });

    describe('Update type and common fields', () => {
        it('should set updateType to BankUpdate', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.DLIC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            expect(result.formRequest.formUpdateData.updateType).toBe(
                BankUpdateType.BankUpdate
            );
        });

        it('should set updateType to BankTerminate', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.DLIC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankTerminate,
                mockFormComment
            );

            expect(result.formRequest.formUpdateData.updateType).toBe(
                BankUpdateType.BankTerminate
            );
        });

        it('should include contractNumber from initialForm', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.DLIC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            expect(result.formRequest.formUpdateData.contractNumber).toBe(
                'CONTRACT-001'
            );
        });

        it('should set programs to null', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.DLIC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            expect(result.formRequest.formUpdateData.programs).toBeNull();
        });
    });

    describe('Spread of initial form data', () => {
        it('should spread initialForm.data into result', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.DLIC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            expect((result as any).existingField).toBe('existing-value');
            expect(result.contractNum).toBe('CONTRACT-001');
        });

        it('should include onbaseCaseId from document', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.DLIC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            expect(result.onbaseCaseId).toBe('onbase-case-789');
        });

        it('should include formComment in formRequest', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.DLIC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            expect(result.formRequest.formComment).toEqual({
                comment: 'Test comment',
            });
        });
    });

    describe('Null form fields', () => {
        it('should set all non-applicable form fields to null', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.DLIC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            expect(result.formRequest.formDisbursement).toBeNull();
            expect(result.formRequest.formDistribution).toBeNull();
            expect(result.formRequest.formFullSurrenderAck).toBeNull();
            expect(result.formRequest.formIrsData).toBeNull();
            expect(result.formRequest.formOL4753Data).toBeNull();
            expect(result.formRequest.formLoan).toBeNull();
            expect(result.formRequest.formParty).toBeNull();
            expect(result.formRequest.formProgram).toBeNull();
            expect(result.formRequest.formRestriction).toBeNull();
            expect(result.formRequest.formTaxWithholding).toBeNull();
            expect(result.formRequest.formTpaAuthorization).toBeNull();
            expect(result.formRequest.formSurrenderingCompany).toBeNull();
            expect(result.formRequest.formAdditionalWaivers).toBeNull();
            expect(result.formRequest.formSpecialInstruction).toBeNull();
            expect(result.formRequest.ownerAcknowledgement).toBeNull();
            expect(result.formRequest.formNigos).toBeNull();
        });
    });

    describe('Edge cases', () => {
        it('should handle formDisbursement with bank as non-array', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const nonArrayBankDisbursement = {
                ...mockFormDisbursement,
                bank: {
                    accountNumber: 'NON-ARRAY-ACC',
                    accountType: { text: AccountType.Checking },
                    bankName: 'Non Array Bank',
                    nameOnBankAccount: 'Non Array Holder',
                    routingNumber: 'NON-ARRAY-RTN',
                },
            } as unknown as FormDisbursement;

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.SBGC),
                mockBankUpdateDetails,
                nonArrayBankDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            const bankData = result.formRequest.formUpdateData.bank[0];
            expect(bankData.accountNumber).toBe('NON-ARRAY-ACC');
        });

        it('should use default bankType when not provided in bankUpdateDetails', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const detailsWithoutBankType = {
                ...mockBankUpdateDetails,
                bankType: undefined,
            };

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.DLIC),
                detailsWithoutBankType,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            const bankData = result.formRequest.formUpdateData.bank[0];
            expect(bankData.bankType).toBe(ContributionType.Disbursement);
        });
    });

    describe('Full payload structure validation', () => {
        it('should generate correct complete payload for non-SBGC carrier with Email source', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.DLIC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            // Assert complete payload structure
            expect(result).toEqual({
                // Spread from initialForm.data
                contractNum: 'CONTRACT-001',
                existingField: 'existing-value',
                // Added fields
                onbaseCaseId: 'onbase-case-789',
                formRequest: {
                    formComment: { comment: 'Test comment' },
                    formData: {
                        formExtName: 'DLIC_UPDATE_DIGITAL_FORM',
                        metaData: {
                            formType: 'DLIC_UPDATE_DIGITAL_FORM',
                            formId: null,
                            formNumber: '',
                        },
                    },
                    formSource: {
                        channel: { text: 'Email' },
                        businessKey: 'DOC-EMAIL-123',
                        receivedDate: expectedFormattedDate,
                        receivedDateTime: expectedFormattedDateTime,
                        sourceSysId: 'ONBASE',
                    },
                    formUpdateData: {
                        updateType: BankUpdateType.BankUpdate,
                        contractNumber: 'CONTRACT-001',
                        bank: [
                            {
                                accountNumber: '123456789',
                                accountType: { text: AccountType.Checking },
                                bankName: 'Test Bank',
                                nameOnBankAccount: 'John Doe',
                                routingNumber: '987654321',
                                bankType: ContributionType.Disbursement,
                            },
                        ],
                        programs: null,
                        doesCheckMeetSecRequiremnt: true,
                        voidCheck: true,
                    },
                    formDisbursement: null,
                    formDistribution: null,
                    formFullSurrenderAck: null,
                    formIrsData: null,
                    formOL4753Data: null,
                    formLoan: null,
                    formParty: null,
                    formProgram: null,
                    formRestriction: null,
                    formSignature: mockFormSignature,
                    formTaxWithholding: null,
                    formTpaAuthorization: null,
                    formSurrenderingCompany: null,
                    formAdditionalWaivers: null,
                    formSpecialInstruction: null,
                    ownerAcknowledgement: null,
                    formNigos: null,
                },
            });
        });

        it('should generate correct complete payload for SBGC carrier', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Email
            );

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.SBGC),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                mockDocument,
                BankUpdateType.BankUpdate,
                mockFormComment
            );

            // Assert complete payload structure for SBGC
            expect(result).toEqual({
                contractNum: 'CONTRACT-001',
                existingField: 'existing-value',
                onbaseCaseId: 'onbase-case-789',
                formRequest: {
                    formComment: { comment: 'Test comment' },
                    formData: {
                        formExtName: 'SBGC_UPDATE_DIGITAL_FORM',
                        metaData: {
                            formType: 'SBGC_UPDATE_DIGITAL_FORM',
                            formId: null,
                            formNumber: '',
                        },
                    },
                    formSource: {
                        channel: { text: 'Email' },
                        businessKey: 'DOC-EMAIL-123',
                        receivedDate: expectedFormattedDate,
                        receivedDateTime: expectedFormattedDateTime,
                        sourceSysId: 'ONBASE',
                    },
                    formUpdateData: {
                        updateType: BankUpdateType.BankUpdate,
                        contractNumber: 'CONTRACT-001',
                        bank: [
                            {
                                accountNumber: 'SBGC-ACC-111',
                                accountType: { text: AccountType.Savings },
                                bankName: 'SBGC Bank',
                                nameOnBankAccount: 'SBGC Account Holder',
                                routingNumber: 'SBGC-RTN-222',
                                bankType: ContributionType.Disbursement,
                            },
                        ],
                        programs: null,
                        bankVerification: {
                            isVerified: true,
                            verificationDate: '2024-01-15',
                        },
                    },
                    formDisbursement: null,
                    formDistribution: null,
                    formFullSurrenderAck: null,
                    formIrsData: null,
                    formOL4753Data: null,
                    formLoan: null,
                    formParty: null,
                    formProgram: null,
                    formRestriction: null,
                    formSignature: mockFormSignature,
                    formTaxWithholding: null,
                    formTpaAuthorization: null,
                    formSurrenderingCompany: null,
                    formAdditionalWaivers: null,
                    formSpecialInstruction: null,
                    ownerAcknowledgement: null,
                    formNigos: null,
                },
            });
        });

        it('should generate correct complete payload for USAA carrier (null security fields) with Phone source', () => {
            (sswEditHelpers.getDocumentSource as jest.Mock).mockReturnValue(
                ChannelType.Phone
            );

            const phoneDocument = {
                ...mockDocument,
                documentNumber: 'DOC-MAN-456',
                source: 'Phone',
            };

            const result = getBankUpdatePayload(
                createMockInitialForm(Carrier.USAA),
                mockBankUpdateDetails,
                mockFormDisbursement,
                mockFormSignature,
                phoneDocument,
                BankUpdateType.BankTerminate,
                mockFormComment
            );

            // Assert complete payload structure for USAA with Phone source
            expect(result).toEqual({
                contractNum: 'CONTRACT-001',
                existingField: 'existing-value',
                onbaseCaseId: 'onbase-case-789',
                formRequest: {
                    formComment: { comment: 'Test comment' },
                    formData: {
                        formExtName: 'USAA_UPDATE_DIGITAL_FORM',
                        metaData: {
                            formType: 'USAA_UPDATE_DIGITAL_FORM',
                            formId: null,
                            formNumber: '',
                        },
                    },
                    formSource: {
                        channel: { text: 'Phone' },
                        businessKey: 'DOC-MAN-456',
                        receivedDate: expectedFormattedDate,
                        receivedDateTime: expectedFormattedDateTime,
                        sourceSysId: 'ONBASE',
                    },
                    formUpdateData: {
                        updateType: BankUpdateType.BankTerminate,
                        contractNumber: 'CONTRACT-001',
                        bank: [
                            {
                                accountNumber: '123456789',
                                accountType: { text: AccountType.Checking },
                                bankName: 'Test Bank',
                                nameOnBankAccount: 'John Doe',
                                routingNumber: '987654321',
                                bankType: ContributionType.Disbursement,
                            },
                        ],
                        programs: null,
                        doesCheckMeetSecRequiremnt: null,
                        voidCheck: null,
                    },
                    formDisbursement: null,
                    formDistribution: null,
                    formFullSurrenderAck: null,
                    formIrsData: null,
                    formOL4753Data: null,
                    formLoan: null,
                    formParty: null,
                    formProgram: null,
                    formRestriction: null,
                    formSignature: null, // null because Phone source
                    formTaxWithholding: null,
                    formTpaAuthorization: null,
                    formSurrenderingCompany: null,
                    formAdditionalWaivers: null,
                    formSpecialInstruction: null,
                    ownerAcknowledgement: null,
                    formNigos: null,
                },
            });
        });
    });
});
