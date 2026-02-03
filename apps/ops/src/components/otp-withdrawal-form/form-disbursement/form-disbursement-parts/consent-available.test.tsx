import '@testing-library/jest-dom';
// eslint-disable-next-line import/order
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { TaskType } from '@deps/models/case/task';
import { AccountType, CaseStatus } from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import {
    ConsentAvailable,
    defaultDisbursmentConsent,
    getDisbursmentConsent,
} from './consent-available';
import { DEFAULT_ADDRESS } from '../../address-entry';
import { getDefaultFormDisbursementValues } from '../form-disbursement.helpers';

afterEach(cleanup);

describe('consent Component', () => {
    const formDisbursement = {
        paymentMethod: { text: null },
        paymentMailType: { text: null },
        bank: [
            {
                accountNumber: '',
                accountType: AccountType.Checking,
                bankContactPerson: '',
                bankFurtherCreditAccount: '',
                bankFurtherCreditName: '',
                bankInfoCompleteInd: '',
                bankLocation: '',
                bankName: '',
                bankPhone: '',
                nameOnBankAccount: '',
                routingNumber: '',
                maskedAccountNumber: null,
                isDirectDeposit: {
                    text: true,
                },
            },
        ],
        paymentToBrokerageAccount: false,
        brokerage: {
            companyName: '',
            accountNumber: '',
            acordAttached: null,
            address: DEFAULT_ADDRESS,
        },
        payeeType: '',
        voidCheck: null,
        doesCheckMeetSecRequiremnt: null,
        participantId: {
            text: null,
        },
        payee: {
            name: { text: null },
            addresses: [DEFAULT_ADDRESS],
            contractNumber: { text: null },
            taxId: { text: '' },
        },
        upsAccount: null,
        emailDeliveryNotification: { text: false },
        isDifferentPayeeOrAddress: { text: false },
        isWireApprovalPresent: {
            text: false,
        },
        bankVerification: {
            selectedBankingType: '',
            validationsMap: {
                VOIDED_CHECK: {
                    fraudRedFlagsCheck: null,
                    isBlankVoidedCheck: null,
                    hasHandwrittenVOID: null,
                    securityFeaturesPresent: null,
                    ownerNameMatch: null,
                    ownerAddressMatch: null,
                },
                BANK_LETTERHEAD: {
                    isValidBankLetterhead: null,
                    hasBankAddress: null,
                    hasBankOfficialSignature: null,
                    containsHandwrittenBankDetails: null,
                },
                DIRECT_DEPOSIT_FORM: {
                    noAdditionalValidationRequired: null,
                },
                STARTER_CHECK: {
                    noAdditionalValidationRequired: null,
                },
                NO_BANK_PROOF: {
                    noAdditionalValidationRequired: null,
                },
            },
        },
    };
    it('should render the component with initial signature and name values when provided with valid props', () => {
        const signatureFields = [
            {
                key: '1',
                component: () => <div>Component 1</div>,
                displayLogic: () => true,
            },
            {
                key: '2',
                component: () => <div>Component 2</div>,
                displayLogic: () => true,
            },
            {
                key: '3',
                component: () => <div>Component 3</div>,
                displayLogic: () => true,
            },
        ];

        const isFormStateReadOnly = false;

        const { getByLabelText } = render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    initialForm: {
                        ...CaseDetails,
                        caseId: 'CA0000034607',
                        taskType: TaskType.Withdrawal,
                        source: 'Zinnia.TaskManagement',
                        carrier: 'DLIC',
                        createdDate: '',
                        updatedDate: '',
                        status: CaseStatus.Pending,
                        taskId: '6551c49b18a0092d07bfa9db',
                        data: {
                            ...CaseDetails.data,
                            agentEmailAddress: '',
                            documentNumber: '',
                            onbaseCaseId: '',
                            formRequest: {
                                ...CaseDetails.data.formRequest,

                                formDisbursement: {
                                    ...getDefaultFormDisbursementValues(),
                                    disbursmentConsent: {
                                        isConsent: { text: true },
                                        isSigned: { text: true },
                                        signDate: { text: '2023-10-01' },
                                        name: { text: 'John Doe' },
                                        signTitle: { text: 'Owner' },
                                    },
                                },
                            },
                        },
                    },
                    currentFormState: CaseStatus.Pending,
                    formDisbursement: {
                        ...formDisbursement,
                        disbursmentConsent: {
                            isConsent: { text: true },
                            isSigned: { text: true },
                            signDate: { text: '2023-10-01' },
                            name: { text: 'John Doe' },
                            signTitle: { text: 'Owner' },
                        },
                    },
                }}
            >
                <ConsentAvailable
                    signatureFields={signatureFields}
                    isFormStateReadOnly={isFormStateReadOnly}
                />
            </FormDataContext.Provider>
        );

        expect(
            (getByLabelText(/consentorFullName/i) as HTMLInputElement).value
        ).toBe('John Doe');
    });

    it('should handle null or undefined formDisbursement.disbursmentConsent gracefully', () => {
        const signatureFields = [
            {
                key: '1',
                component: () => <div>Component 1</div>,
                displayLogic: () => true,
            },
            {
                key: '2',
                component: () => <div>Component 2</div>,
                displayLogic: () => true,
            },
            {
                key: '3',
                component: () => <div>Component 3</div>,
                displayLogic: () => true,
            },
        ];

        const isFormStateReadOnly = false;

        const { getByLabelText } = render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    currentFormState: CaseStatus.Pending,
                    formDisbursement: {
                        ...formDisbursement,
                        disbursmentConsent: undefined,
                    },
                }}
            >
                <ConsentAvailable
                    signatureFields={signatureFields}
                    isFormStateReadOnly={isFormStateReadOnly}
                />
            </FormDataContext.Provider>
        );

        expect(
            (getByLabelText(/consentorFullName/i) as HTMLInputElement).value
        ).toBe('');
    });

    // calls onDataChange with correct values when signature or name changes
    it('should call onDataChange with correct values when signature or name changes', () => {
        // Mocking dependencies
        const signatureFields = [
            { key: '1', component: jest.fn(), displayLogic: jest.fn() },
            { key: '2', component: jest.fn(), displayLogic: jest.fn() },
            { key: '3', component: jest.fn(), displayLogic: jest.fn() },
        ];

        const isFormStateReadOnly = false;

        const mockAsOfDateData = {
            paymentMethod: {
                text: 'EFT',
            },
            paymentMailType: {
                text: null,
            },
            bank: [
                {
                    accountNumber: '',
                    accountType: 'Checking',
                    bankContactPerson: '',
                    bankFurtherCreditAccount: '',
                    bankFurtherCreditName: '',
                    bankInfoCompleteInd: '',
                    bankLocation: '',
                    bankName: '',
                    bankPhone: '',
                    nameOnBankAccount: '',
                    routingNumber: '',
                    maskedAccountNumber: null,
                    isDirectDeposit: {
                        text: true,
                    },
                    isDirectDepositValid: {
                        text: null,
                    },
                },
            ],
            payeeType: '',
            doesCheckMeetSecRequiremnt: null,
            paymentToBrokerageAccount: false,
            brokerage: null,
            participantId: {
                text: null,
            },
            payee: null,
            isEmailDeliveryNotificationEnabled: null,
            upsAccount: null,
            voidCheck: null,
            emailDeliveryNotification: {
                text: false,
            },
            isDifferentPayeeOrAddress: {
                text: false,
            },
            disbursmentConsent: {
                isConsent: {
                    text: true,
                },
                name: {
                    text: '',
                },
                isSigned: {
                    text: null,
                },
                signTitle: {
                    text: '',
                },
                signDate: {
                    text: '',
                },
            },
            name: {
                text: 'aasad',
            },
            isSigned: {
                text: null,
            },
            signTitle: {
                text: '',
            },
            signDate: {
                text: '',
            },
        };

        let setMethodArgs;
        const setMockData = jest.fn((cb) => {
            setMethodArgs = cb(mockAsOfDateData);
            return setMethodArgs;
        });

        // Rendering the component
        render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    currentFormState: CaseStatus.Pending,
                    setFormDisbursement: setMockData,
                }}
            >
                <ConsentAvailable
                    signatureFields={signatureFields}
                    isFormStateReadOnly={isFormStateReadOnly}
                />
            </FormDataContext.Provider>
        );

        expect(setMockData).toHaveBeenCalled();

        expect(setMockData).toHaveReturnedWith({
            ...mockAsOfDateData,
            disbursmentConsent: {
                ...mockAsOfDateData.disbursmentConsent,
                isConsent: { text: true },
            },
        });
    });

    it('should render in read-only mode when isFormStateReadOnly is true', () => {
        const signatureFields = [
            {
                key: '1',
                component: () => <div>Component 1</div>,
                displayLogic: () => true,
            },
        ];

        const disbursmentConsentData = {
            isConsent: { text: true },
            isSigned: { text: true },
            signDate: { text: '2023-10-01' },
            name: { text: 'Jane Doe' },
            signTitle: { text: 'Owner' },
        };

        render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    currentFormState: CaseStatus.Pending,
                    initialForm: {
                        data: {
                            formRequest: {
                                formDisbursement: {
                                    disbursmentConsent: disbursmentConsentData,
                                },
                            },
                        },
                    } as any,
                    formDisbursement: {
                        ...formDisbursement,
                        disbursmentConsent: disbursmentConsentData,
                    },
                }}
            >
                <ConsentAvailable
                    signatureFields={signatureFields}
                    isFormStateReadOnly={true}
                />
            </FormDataContext.Provider>
        );

        const nameInput = screen.getByLabelText(
            /consentorFullName/i
        ) as HTMLInputElement;
        expect(nameInput.value).toBe('Jane Doe');
    });

    it('should update name when user types in the name field', () => {
        const signatureFields = [
            {
                key: '1',
                component: () => <div>Component 1</div>,
                displayLogic: () => true,
            },
        ];

        const setFormDisbursement = jest.fn();

        render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    currentFormState: CaseStatus.Pending,
                    formDisbursement: {
                        ...formDisbursement,
                        disbursmentConsent: {
                            isConsent: { text: true },
                            isSigned: { text: null },
                            signDate: { text: '' },
                            name: { text: '' },
                            signTitle: { text: '' },
                        },
                    },
                    setFormDisbursement,
                }}
            >
                <ConsentAvailable
                    signatureFields={signatureFields}
                    isFormStateReadOnly={false}
                />
            </FormDataContext.Provider>
        );

        const nameInput = screen.getByLabelText(
            /consentorFullName/i
        ) as HTMLInputElement;

        fireEvent.change(nameInput, { target: { value: 'New Name' } });

        expect(nameInput.value).toBe('New Name');
    });

    it('should render signature validation components from signatureFields', () => {
        const signatureFields = [
            {
                key: 'test-component',
                component: () => (
                    <div data-testid="test-signature-component">
                        Test Signature
                    </div>
                ),
                displayLogic: () => true,
            },
        ];

        render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    currentFormState: CaseStatus.Pending,
                    formDisbursement: {
                        ...formDisbursement,
                        disbursmentConsent: {
                            isConsent: { text: true },
                            isSigned: { text: null },
                            signDate: { text: '' },
                            name: { text: '' },
                            signTitle: { text: '' },
                        },
                    },
                }}
            >
                <ConsentAvailable
                    signatureFields={signatureFields}
                    isFormStateReadOnly={false}
                />
            </FormDataContext.Provider>
        );

        expect(screen.getByTestId('test-signature-component')).toBeVisible();
    });

    it('should render with empty signatureFields array', () => {
        render(
            <FormDataContext.Provider
                value={{
                    ...defaultFormDataContext,
                    currentFormState: CaseStatus.Pending,
                    formDisbursement: {
                        ...formDisbursement,
                        disbursmentConsent: undefined,
                    },
                }}
            >
                <ConsentAvailable
                    signatureFields={[]}
                    isFormStateReadOnly={false}
                />
            </FormDataContext.Provider>
        );

        expect(screen.getByLabelText(/consentorFullName/i)).toBeVisible();
    });
});

describe('getDisbursmentConsent helper', () => {
    it('should return consentData when isConsent.text is truthy', () => {
        const consentData = {
            isConsent: { text: true },
            name: { text: 'John Doe' },
            isSigned: { text: true },
            signTitle: { text: 'Owner' },
            signDate: { text: '2023-10-01' },
        };

        const result = getDisbursmentConsent(consentData);

        expect(result).toBe(consentData);
    });

    it('should return defaultDisbursmentConsent when isConsent.text is null', () => {
        const consentData = {
            isConsent: { text: null },
            name: { text: 'John Doe' },
            isSigned: { text: true },
            signTitle: { text: 'Owner' },
            signDate: { text: '2023-10-01' },
        };

        const result = getDisbursmentConsent(consentData);

        expect(result).toBe(defaultDisbursmentConsent);
    });

    it('should return defaultDisbursmentConsent when isConsent.text is false', () => {
        const consentData = {
            isConsent: { text: false },
            name: { text: 'John Doe' },
            isSigned: { text: true },
            signTitle: { text: 'Owner' },
            signDate: { text: '2023-10-01' },
        };

        const result = getDisbursmentConsent(consentData);

        expect(result).toBe(defaultDisbursmentConsent);
    });

    it('should return defaultDisbursmentConsent when consentData is undefined', () => {
        const result = getDisbursmentConsent(undefined);

        expect(result).toBe(defaultDisbursmentConsent);
    });
});

describe('defaultDisbursmentConsent', () => {
    it('should have correct default values', () => {
        expect(defaultDisbursmentConsent).toEqual({
            isConsent: { text: null },
            name: { text: '' },
            isSigned: { text: null },
            signTitle: { text: '' },
            signDate: { text: '' },
        });
    });
});
