import '@testing-library/jest-dom';
// eslint-disable-next-line import/order
import { cleanup, render } from '@testing-library/react';

import {
    FormDataContext,
    defaultFormDataContext,
} from '@deps/contexts/OtpWithdrawalFormContext';
import { TaskType } from '@deps/models/case/task';
import { AccountType, CaseStatus } from '@deps/models/case/withdrawal/case';
import { CaseDetails } from '@deps/models/case/withdrawal/case-data';

import { ConsentAvailable } from './consent-available';
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
                accountType: {
                    text: AccountType.Checking,
                },
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
                    accountType: {
                        text: 'Checking',
                    },
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
});
