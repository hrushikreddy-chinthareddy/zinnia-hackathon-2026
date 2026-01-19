import { render, screen } from '@testing-library/react';
import { TFunctionDetailedResult } from 'i18next';
import { TFunction } from 'next-i18next';

import { FormDataContext } from '@deps/contexts/OtpWithdrawalFormContext';
import { Carrier } from '@deps/models/case/withdrawal/case';

import DlicWithdrawalForm from './dlic-withdrawal-form';

// Mock next-i18next
jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key as unknown as TFunctionDetailedResult<string>,
    }),
}));

// Mock the helper hook
jest.mock('./dlic-withdrawal-form-helpers', () => ({
    __esModule: true,
    default: jest.fn((_t: TFunction) => ({
        formPartyConfigs: [
            {
                partyRoleType: 'Primary',
                title: 'Primary Owner',
                fields: [
                    { fieldName: 'firstName', fieldLabel: 'First Name' },
                    { fieldName: 'lastName', fieldLabel: 'Last Name' },
                ],
            },
        ],
        signaturesConfig: [
            {
                signatureType: 'Primary',
                fields: [
                    { fieldName: 'signatureType', fieldLabel: 'Type' },
                    { fieldName: 'name', fieldLabel: 'Name' },
                ],
            },
        ],
        signaturesNotaryConfig: [
            {
                signatureType: 'Notary',
                fields: [
                    { fieldName: 'signatureType', fieldLabel: 'Type' },
                    { fieldName: 'name', fieldLabel: 'Name' },
                ],
            },
        ],
        formValidation: jest.fn(() => ({})),
        identifySelectedFormProgramOption: jest.fn(() => ({
            selectedOption: 'partial',
            amount: '1000',
        })),
        additionalWithholdingAmountConfig: {},
        partialWithdrawalOptions: [
            { label: 'Partial Withdrawal', value: 'partial' },
        ],
        disbursementOptions: [
            { label: 'Check', value: 'check' },
            { label: 'EFT', value: 'eft' },
        ],
        fundWithdrawnMethodOptions: [
            { label: 'Pro-rata', value: 'prorata' },
            { label: 'Specify Funds', value: 'specifyFunds' },
        ],
        selectOneOptions: [
            { label: 'Immediately', value: 'immediately' },
            { label: 'As of Date', value: 'asOfDate' },
        ],
        w4pSignaturesConfig: [
            { component: 'SignatureType', key: 'w4p-owner-type' },
        ],
        eSignatureFieldConfig: {
            type: true,
            signPresent: true,
            date: true,
            auditTrial: true,
        },
        reasonOptions: [
            { label: 'Death Inherited IRA', value: 'deathInheritedIRA' },
        ],
        hasPreviousNigoPlanCodes: ['674', '722'],
    })),
}));

// Mock child components
jest.mock('@deps/components/otp-withdrawal-form/form-party/form-party', () => {
    const MockFormParties = () => (
        <div data-testid="form-parties">Form Parties</div>
    );
    MockFormParties.displayName = 'MockFormParties';
    return MockFormParties;
});

jest.mock(
    '@deps/components/otp-withdrawal-form/form-restriction/distribution-reason',
    () => {
        const MockDistributionReason = () => (
            <div data-testid="distribution-reason">Distribution Reason</div>
        );
        MockDistributionReason.displayName = 'MockDistributionReason';
        return MockDistributionReason;
    }
);

jest.mock(
    '@deps/components/otp-withdrawal-form/form-program/form-program-partial-withdrawal',
    () => {
        const MockFormProgramPartialWithdrawal = () => (
            <div data-testid="form-program-partial-withdrawal">
                Form Program Partial Withdrawal
            </div>
        );
        MockFormProgramPartialWithdrawal.displayName =
            'MockFormProgramPartialWithdrawal';
        return MockFormProgramPartialWithdrawal;
    }
);

jest.mock(
    '@deps/components/otp-withdrawal-form/distribution-instructions/form-distribution',
    () => {
        const MockFormDistribution = () => (
            <div data-testid="form-distribution">Form Distribution</div>
        );
        MockFormDistribution.displayName = 'MockFormDistribution';
        return MockFormDistribution;
    }
);

jest.mock('@deps/components/otp-withdrawal-form/tax-withholdings', () => {
    const MockTaxWithholdings = () => (
        <div data-testid="tax-withholdings">Tax Withholdings</div>
    );
    MockTaxWithholdings.displayName = 'MockTaxWithholdings';
    return MockTaxWithholdings;
});

jest.mock('@deps/components/otp-withdrawal-form/state-w4-form', () => {
    const MockStateW4Form = () => (
        <div data-testid="state-w4-form">State W4 Form</div>
    );
    MockStateW4Form.displayName = 'MockStateW4Form';
    return MockStateW4Form;
});

jest.mock(
    '@deps/components/otp-withdrawal-form/form-disbursement-V2/form-disbursement-v2',
    () => {
        const MockFormDisbursementV2 = () => (
            <div data-testid="form-disbursement-v2">Form Disbursement V2</div>
        );
        MockFormDisbursementV2.displayName = 'MockFormDisbursementV2';
        return MockFormDisbursementV2;
    }
);

jest.mock(
    '@deps/components/otp-withdrawal-form/signature-validation/signature-validations',
    () => {
        const MockSignatureValidations = () => (
            <div data-testid="signature-validations">Signature Validations</div>
        );
        MockSignatureValidations.displayName = 'MockSignatureValidations';
        return MockSignatureValidations;
    }
);

jest.mock(
    '@deps/components/otp-withdrawal-form/e-signature-validation/e-signature-validation',
    () => {
        const MockESignatureValidation = () => (
            <div data-testid="e-signature-validation">
                E-Signature Validation
            </div>
        );
        MockESignatureValidation.displayName = 'MockESignatureValidation';
        return MockESignatureValidation;
    }
);

jest.mock('@deps/components/side-sheet/diary-notes/diary-notes-alert', () => {
    const MockDiaryNotesWarning = () => (
        <div data-testid="diary-notes-warning">Diary Notes Warning</div>
    );
    MockDiaryNotesWarning.displayName = 'MockDiaryNotesWarning';
    return MockDiaryNotesWarning;
});

jest.mock(
    '@deps/components/previous-nigo-check/has-previous-nigo-check',
    () => {
        const MockHasPreviousNigo = () => (
            <div data-testid="has-previous-nigo">Has Previous Nigo</div>
        );
        MockHasPreviousNigo.displayName = 'MockHasPreviousNigo';
        return MockHasPreviousNigo;
    }
);

// Mock isAllowedState utility
jest.mock('@deps/utils/renderStateW4', () => ({
    isAllowedState: jest.fn((state: string) => state === 'CA'),
}));

describe('DlicWithdrawalForm', () => {
    const mockSetFormValidator = jest.fn();
    const mockSetFormData = jest.fn();
    const mockSetFormProgram = jest.fn();
    const mockSetFormESignatureData = jest.fn();

    const defaultContextValue = {
        // Required properties from OtpWithdrawalFormState
        formData: {},
        formDisbursement: {},
        formDistribution: {},
        formErrors: {},
        formWarnings: {},
        formFullSurrenderAck: {},
        formIrsData: [],
        formOL4753Data: null,
        formLoan: {},
        formParty: {
            parties: [
                {
                    addresses: [{ state: 'CA' }],
                },
            ],
        },
        formProgram: {
            isPrevNigoChecked: false,
        },
        formRestriction: {},
        formSignature: {},
        formSource: {},
        formTaxWithholding: {},
        formTpaAuthorization: {},
        formAdditionalWaivers: [],
        formSpecialInstruction: {},
        formNigos: {},
        formReindexingData: {},
        formComment: {},
        fundWithdrawnMethod: '',
        initialForm: {
            carrier: Carrier.DLIC,
        },
        ownerStateOfResidence: 'CA',
        formSurrenderingCompany: {},
        contractIssueState: '',
        parties: [],
        partyRoles: [],
        currentFormState: 'Draft',
        isFormStateReadOnly: false,
        formBeneInfo: {},
        formPeriodicPension: {},
        formEsignatureData: null,
        policySystematicPrograms: [],
        BankDetails: {},
        featureFlags: {},
        formValidator: jest.fn(() => ({})),
        ownerAcknowledgement: undefined,
        // Setter functions
        setBankDetails: jest.fn(),
        setFormPeriodicPension: jest.fn(),
        setFormData: mockSetFormData,
        setFormDisbursement: jest.fn(),
        setFormDistribution: jest.fn(),
        setFormErrors: jest.fn(),
        setFormWarnings: jest.fn(),
        setFormFullSurrenderAck: jest.fn(),
        setFormIrsData: jest.fn(),
        setFormLoan: jest.fn(),
        setFormParty: jest.fn(),
        setFormProgram: mockSetFormProgram,
        setFormRestriction: jest.fn(),
        setFormSignature: jest.fn(),
        setFormSource: jest.fn(),
        setFormTaxWithholding: jest.fn(),
        setFormTpaAuthorization: jest.fn(),
        setFormValidator: mockSetFormValidator,
        setFundWithdrawnMethod: jest.fn(),
        setOwnerStateOfResidence: jest.fn(),
        setFormSurrenderingCompany: jest.fn(),
        setFormOL4753Data: jest.fn(),
        setFormSpecialInstruction: jest.fn(),
        setOwnerAcknowledgement: jest.fn(),
        setFormNigos: jest.fn(),
        setFormReindexingData: jest.fn(),
        setFormComment: jest.fn(),
        setFormBeneInfo: jest.fn(),
        setFormESignatureData: mockSetFormESignatureData,
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Component Rendering & Initialization', () => {
        it('should render without errors', () => {
            const { container } = render(
                <FormDataContext.Provider value={defaultContextValue}>
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            expect(container).toBeTruthy();
        });

        it('should render all required child components', () => {
            render(
                <FormDataContext.Provider value={defaultContextValue}>
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('form-parties')).toBeInTheDocument();
            expect(
                screen.getByTestId('distribution-reason')
            ).toBeInTheDocument();
            expect(
                screen.getByTestId('form-program-partial-withdrawal')
            ).toBeInTheDocument();
            expect(screen.getByTestId('form-distribution')).toBeInTheDocument();
            expect(screen.getByTestId('tax-withholdings')).toBeInTheDocument();
            expect(
                screen.getByTestId('form-disbursement-v2')
            ).toBeInTheDocument();
            // There are two signature validations components (regular and notary)
            expect(screen.getAllByTestId('signature-validations')).toHaveLength(
                2
            );
            expect(
                screen.getByTestId('e-signature-validation')
            ).toBeInTheDocument();
        });

        it('should render DiaryNotesWarning when form is not read-only', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        isFormStateReadOnly: false,
                    }}
                >
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            expect(
                screen.getByTestId('diary-notes-warning')
            ).toBeInTheDocument();
        });

        it('should not render DiaryNotesWarning when form is read-only', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        isFormStateReadOnly: true,
                    }}
                >
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            expect(
                screen.queryByTestId('diary-notes-warning')
            ).not.toBeInTheDocument();
        });
    });

    describe('Context Values Access', () => {
        it('should access isFormStateReadOnly context value', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        isFormStateReadOnly: true,
                    }}
                >
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            // DiaryNotesWarning should not be rendered when read-only
            expect(
                screen.queryByTestId('diary-notes-warning')
            ).not.toBeInTheDocument();
        });

        it('should access formParty context value for owner state of residence', () => {
            const { rerender } = render(
                <FormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        formParty: {
                            parties: [
                                {
                                    addresses: [{ state: 'CA' }],
                                },
                            ],
                        },
                    }}
                >
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            // State W4 form should render for CA (allowed state)
            expect(screen.getByTestId('state-w4-form')).toBeInTheDocument();

            // Re-render with non-allowed state
            rerender(
                <FormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        formParty: {
                            parties: [
                                {
                                    addresses: [{ state: 'TX' }],
                                },
                            ],
                        },
                    }}
                >
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            // State W4 form should not render for TX (not allowed state)
            expect(
                screen.queryByTestId('state-w4-form')
            ).not.toBeInTheDocument();
        });
    });

    describe('Form Validator Initialization', () => {
        it('should set form validator on component mount', () => {
            render(
                <FormDataContext.Provider value={defaultContextValue}>
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            // Verify that setFormValidator was called
            expect(mockSetFormValidator).toHaveBeenCalledTimes(1);
            // Verify that it was called with a function
            expect(mockSetFormValidator).toHaveBeenCalledWith(
                expect.any(Function)
            );
        });

        it('should only set form validator once on mount', () => {
            const { rerender } = render(
                <FormDataContext.Provider value={defaultContextValue}>
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            expect(mockSetFormValidator).toHaveBeenCalledTimes(1);

            // Re-render the component
            rerender(
                <FormDataContext.Provider
                    value={{ ...defaultContextValue, planCode: '456' }}
                >
                    <DlicWithdrawalForm planCode="456" />
                </FormDataContext.Provider>
            );

            // Should still only be called once (due to empty dependency array)
            expect(mockSetFormValidator).toHaveBeenCalledTimes(1);
        });
    });

    describe('Form Data Initialization Effect', () => {
        it('should set formData with correct formExtName and metaData on mount', () => {
            render(
                <FormDataContext.Provider value={defaultContextValue}>
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            // Verify that setFormData was called
            expect(mockSetFormData).toHaveBeenCalled();

            // Get the function that was passed to setFormData
            const setFormDataCall = mockSetFormData.mock.calls[0][0];
            const result = setFormDataCall({});

            // Verify the structure of the data being set
            expect(result).toMatchObject({
                formExtName: 'DLIC_REDEMPTION_DIGITAL_FORM',
                metaData: {
                    formType: 'DLIC_REDEMPTION_DIGITAL_FORM',
                    formId: null,
                    formNumber: '',
                },
            });
        });

        it('should use carrier from initialForm if available', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        initialForm: {
                            carrier: 'CUSTOM_CARRIER' as any,
                        },
                    }}
                >
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            const setFormDataCall = mockSetFormData.mock.calls[0][0];
            const result = setFormDataCall({});

            expect(result.formExtName).toBe(
                'CUSTOM_CARRIER_REDEMPTION_DIGITAL_FORM'
            );
            expect(result.metaData.formType).toBe(
                'CUSTOM_CARRIER_REDEMPTION_DIGITAL_FORM'
            );
        });

        it('should default to DLIC carrier if initialForm.carrier is not available', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        initialForm: {},
                    }}
                >
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            const setFormDataCall = mockSetFormData.mock.calls[0][0];
            const result = setFormDataCall({});

            expect(result.formExtName).toBe('DLIC_REDEMPTION_DIGITAL_FORM');
            expect(result.metaData.formType).toBe(
                'DLIC_REDEMPTION_DIGITAL_FORM'
            );
        });
    });

    describe('HasPreviousNigo Component Rendering', () => {
        it('should render HasPreviousNigo for plan code 674', () => {
            render(
                <FormDataContext.Provider value={defaultContextValue}>
                    <DlicWithdrawalForm planCode="674" />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('has-previous-nigo')).toBeInTheDocument();
        });

        it('should render HasPreviousNigo for plan code 722', () => {
            render(
                <FormDataContext.Provider value={defaultContextValue}>
                    <DlicWithdrawalForm planCode="722" />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('has-previous-nigo')).toBeInTheDocument();
        });

        it('should not render HasPreviousNigo for other plan codes', () => {
            render(
                <FormDataContext.Provider value={defaultContextValue}>
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            expect(
                screen.queryByTestId('has-previous-nigo')
            ).not.toBeInTheDocument();
        });
    });

    describe('StateW4Form Conditional Rendering', () => {
        it('should render StateW4Form when owner state is allowed', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        formParty: {
                            parties: [
                                {
                                    addresses: [{ state: 'CA' }],
                                },
                            ],
                        },
                    }}
                >
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            expect(screen.getByTestId('state-w4-form')).toBeInTheDocument();
        });

        it('should not render StateW4Form when owner state is not allowed', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        formParty: {
                            parties: [
                                {
                                    addresses: [{ state: 'NY' }],
                                },
                            ],
                        },
                    }}
                >
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            expect(
                screen.queryByTestId('state-w4-form')
            ).not.toBeInTheDocument();
        });

        it('should handle missing owner state gracefully', () => {
            render(
                <FormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        formParty: {
                            parties: [],
                        },
                    }}
                >
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            // Should not render when no state is available
            expect(
                screen.queryByTestId('state-w4-form')
            ).not.toBeInTheDocument();
        });
    });

    describe('Signature Validations Rendering', () => {
        it('should render two SignatureValidations components', () => {
            render(
                <FormDataContext.Provider value={defaultContextValue}>
                    <DlicWithdrawalForm planCode="123" />
                </FormDataContext.Provider>
            );

            // Should render both signature validations (regular and notary)
            const signatureValidations = screen.getAllByTestId(
                'signature-validations'
            );
            expect(signatureValidations).toHaveLength(2);
        });
    });
});
