import { render, screen } from '@testing-library/react';

import { Reg60FormContext } from '@deps/contexts/Reg60FormContext';

import MassMutualReg60Form from './mass-mutual-reg60-form';

describe('MassMutualReg60Form', () => {
    const disclosureAuthorizationMock = {
        signatureDate: '2024-03-31',
        expectedAcctValue: 1000,
        product: 'RETIRE_EASE',
        cdscPeriod: '',
    };

    const ownerInfoMock = {
        personalInformation: {
            firstName: 'FRANCES',
            middleName: '',
            lastName: 'MEISNER',
            phoneNumber: '',
            ssNumber: '071545932',
        },
        addressDetails: {
            addressLine1: 'Hill',
            addressLine2: '',
            addressLine3: '',
            city: 'Pun',
            state: 'SC',
            zipCode: '111',
        },
    };

    const agentInfoMock = {
        personalInformation: {
            firstName: 'GREGORY',
            middleName: '',
            lastName: 'LARGE',
            phoneNumber: '',
            ssNumber: '',
        },
        companyName: 'NEW YORK-BOOK 047',
        channel: 'CAS',
        addressDetails: {
            addressLine1: 'Vishu',
            addressLine2: '',
            addressLine3: '',
            city: 'cal',
            state: 'CA',
            zipCode: '333',
        },
    };

    const disclosureMock = {
        proposedAnnuitizationQuote: {
            annuityPaymentAmount: 10.3,
            firstPaymentDate: '',
            paymentFrequency: '',
            incomeOption: '',
            periodCertainYears: '',
        },

        contractComparison: [
            {
                comparisonId: Math.random(),
                comparisonType: 'VARIABLE_TO_FIXED',
                partialRequest: false,
                goodFaithEstimateRequired: false,
                companyName: 'Meta',
                companyPhoneNumber: '989090',
                contractNumber: '99999',
                issueDate: '2024-04-04',
                accountValue: '1111',
                surrenderCharge: {
                    applicable: false,
                },
                mvaAmount: {
                    applicable: false,
                },
                surrenderValue: '1112',
                carrierBenefits: {
                    surrenderBenefit: [
                        {
                            period: '5YEAR',
                            returnGuarRate: '',
                            returnCurrRate: '',
                            return0Prct: 1111,
                            return6Prct: 1112,
                            return12Prct: 1113,
                        },
                        {
                            period: '10YEAR',
                            returnGuarRate: '',
                            returnCurrRate: '',
                            return0Prct: 1114,
                            return6Prct: 1115,
                            return12Prct: '',
                        },
                    ],
                    deathBenefit: [
                        {
                            period: '5YEAR',
                            returnGuarRate: '',
                            returnCurrRate: '',
                            return0Prct: 111,
                            return6Prct: 112,
                            return12Prct: 113,
                        },
                        {
                            period: '10YEAR',
                            returnGuarRate: '',
                            returnCurrRate: '',
                            return0Prct: 444,
                            return6Prct: 555,
                            return12Prct: '',
                        },
                    ],
                },
            },
            {
                comparisonId: Math.random(),
                comparisonType: 'VARIABLE_TO_FIXED',
                partialRequest: false,
                goodFaithEstimateRequired: false,
                companyName: 'Meta',
                companyPhoneNumber: '989090',
                contractNumber: '99999',
                issueDate: '2024-04-04',
                accountValue: '1111',
                surrenderCharge: {
                    applicable: false,
                },
                mvaAmount: {
                    applicable: false,
                },
                surrenderValue: '1112',
                carrierBenefits: {
                    surrenderBenefit: [
                        {
                            period: '5YEAR',
                            returnGuarRate: '',
                            returnCurrRate: '',
                            return0Prct: 1111,
                            return6Prct: 1112,
                            return12Prct: 1113,
                        },
                        {
                            period: '10YEAR',
                            returnGuarRate: '',
                            returnCurrRate: '',
                            return0Prct: 1114,
                            return6Prct: 1115,
                            return12Prct: '',
                        },
                    ],
                    deathBenefit: [
                        {
                            period: '5YEAR',
                            returnGuarRate: '',
                            returnCurrRate: '',
                            return0Prct: 111,
                            return6Prct: 112,
                            return12Prct: 113,
                        },
                        {
                            period: '10YEAR',
                            returnGuarRate: '',
                            returnCurrRate: '',
                            return0Prct: 444,
                            return6Prct: 555,
                            return12Prct: '',
                        },
                    ],
                },
            },
        ],
    };

    const doc = {
        agentNumber: '12345',
        agentTaxId: '098765',
        agentMiddleName: 'kumar',
        agentPhoneNumber: '9090343434',
        firstName: 'Agent',
        lastName: 'vinod',
        middleName: 'kumar',
        phoneNumber: '897654321',
        bdName: 'Epam',
        clientInstitution: '6',
        lob: 'MMBD',
        contract: '571023169',
        externalId: '0470118653',
        documentNumber: '20240213-M-678282',
        processCompanyCode: 'MASS',
        contractStatusCode: null,
        system: null,
        productLine: 'FIXED',
        productName: 'MASSMUTUAL STABLE VOYAGE',
        productCompanyCode: null,
        ssNTaxId: '071545932',
        caseId: '9647741',
        batchId: 'IS5SD66N6A001',
        route: null,
        source: 'ETP',
        sysMailToAddress: null,
        sysMailFromAddress: null,
        agentEmailAddress: 'GLARGE@LENOXADVISORS.COM',
        incomingFaxNumber: null,
        documentDate: '2/13/2024',
        dateReceived: '2/13/2024 8:48:31 AM',
        onBaseDt: null,
        queueName: 'DV - POST COMPLETE',
        transactionType: 'NB REG 60',
        sysDocumentHandle: '15678282',
        documentTypeGroup: 'NEW BUSINESS',
        distributionChannel: 'CAS',
        businessUnit: null,
        productCategory: null,
    };
    const mockContext = {
        formErrors: {},
        disclosureAuthorization: disclosureAuthorizationMock,
        currentPage: 'info',
        ownerInformation: ownerInfoMock,
        agentInformation: agentInfoMock,
        disclosure: disclosureMock,
        setDisclosure: jest.fn(),
        setOwnerInformation: jest.fn(),
        setAgentInformation: jest.fn(),
        setDisclosureAuthorization: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'warn').mockImplementation();
    });

    it('renders without crashing', () => {
        render(
            <Reg60FormContext.Provider value={mockContext as any}>
                <MassMutualReg60Form document={doc as any} planCode="" />
            </Reg60FormContext.Provider>
        );

        expect(screen.getByTestId('info-page')).toBeInTheDocument();
    });

    it('renders the correct content based on currentPage', () => {
        mockContext.currentPage = 'comparison';
        render(
            <Reg60FormContext.Provider value={mockContext as any}>
                <MassMutualReg60Form document={doc as any} planCode="" />
            </Reg60FormContext.Provider>
        );

        expect(screen.getByTestId('disclosure-page')).toBeInTheDocument();
    });
});
