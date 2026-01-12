import { render, screen } from '@testing-library/react';
import { TFunctionDetailedResult } from 'i18next';
import { TFunction } from 'next-i18next';

import { RenewalFormDataContext } from '@deps/contexts/OtpRenewalFormContext';
import { Channel } from '@deps/models/case/renewal/case-renewal';
import { OwnerInformation } from '@deps/models/case/task';

import GlcoRenewalForm from './glco-form';

// Mock next-i18next
jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key as unknown as TFunctionDetailedResult<string>,
    }),
}));

// Mock the helper function
jest.mock('./glco-form.helpers', () => ({
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
        signatureConfigs: [
            {
                signatureType: 'Primary',
                fields: [
                    { fieldName: 'signatureType', fieldLabel: 'Type' },
                    { fieldName: 'name', fieldLabel: 'Name' },
                ],
            },
        ],
        formValidation: jest.fn(() => ({})),
        periodRadioItems: [
            { label: '3 Year', value: '3' },
            { label: '5 Year', value: '5' },
        ],
        transList: [{ label: 'Percentage', value: 'percentage' }],
    })),
}));

// Mock child components
jest.mock('@deps/components/otp-renewal-form/call-receive-date', () => {
    const MockCallReceiveDate = () => (
        <div data-testid="call-receive-date">Call Receive Date</div>
    );
    MockCallReceiveDate.displayName = 'MockCallReceiveDate';
    return MockCallReceiveDate;
});

jest.mock('@deps/components/otp-renewal-form/general-information', () => {
    const MockGeneralInformation = () => (
        <div data-testid="general-information">General Information</div>
    );
    MockGeneralInformation.displayName = 'MockGeneralInformation';
    return MockGeneralInformation;
});

jest.mock(
    '@deps/components/otp-renewal-form/owner-information/owner-information',
    () => {
        const MockOwnerInformation = () => (
            <div data-testid="owner-information">Owner Information</div>
        );
        MockOwnerInformation.displayName = 'MockOwnerInformation';
        return MockOwnerInformation;
    }
);

jest.mock(
    '@deps/components/otp-renewal-form/renewal-period-multi-selection',
    () => {
        const MockRenewalPeriodMultiSection = () => (
            <div data-testid="renewal-period-multi">Renewal Period Multi</div>
        );
        MockRenewalPeriodMultiSection.displayName =
            'MockRenewalPeriodMultiSection';
        return MockRenewalPeriodMultiSection;
    }
);

jest.mock(
    '@deps/components/otp-renewal-form/renewal-period-single-selection',
    () => {
        const MockRenewalPeriodSingleSection = () => (
            <div data-testid="renewal-period-single">Renewal Period Single</div>
        );
        MockRenewalPeriodSingleSection.displayName =
            'MockRenewalPeriodSingleSection';
        return MockRenewalPeriodSingleSection;
    }
);

jest.mock(
    '@deps/components/otp-renewal-form/signature-validation/signature-validation',
    () => {
        const MockSignatureValidations = () => (
            <div data-testid="signature-validations">Signature Validations</div>
        );
        MockSignatureValidations.displayName = 'MockSignatureValidations';
        return MockSignatureValidations;
    }
);

jest.mock('@deps/components/side-sheet/diary-notes/diary-notes-alert', () => {
    const MockDiaryNotesWarning = () => (
        <div data-testid="diary-notes-warning">Diary Notes Warning</div>
    );
    MockDiaryNotesWarning.displayName = 'MockDiaryNotesWarning';
    return MockDiaryNotesWarning;
});

describe('GlcoRenewalForm', () => {
    const mockSetFormValidator = jest.fn();
    const mockSetRenewalRequestSignDate = jest.fn();

    const mockOwnerInformation: OwnerInformation[] = [
        {
            firstName: 'John',
            middleName: 'M',
            lastName: 'Doe',
            fullName: 'John M Doe',
            type: 'Primary',
            signature: {
                title: 'Owner',
                signaturePresent: 'Yes',
                type: 'Primary',
                isValidDate: true,
                signDate: '2024-01-15',
                name: 'John M Doe',
            },
        },
    ];

    const defaultContextValue = {
        // Required properties from OtpRenewalFormState
        initialForm: {},
        parties: [],
        ownerInformation: mockOwnerInformation,
        document: {} as any,
        channel: Channel.Phone,
        renewalRequestSignDate: '2024-01-15',
        subsequentTargetFunds: [],
        transOption: null,
        formErrors: {},
        contractValue: null,
        setContractValue: jest.fn(),
        currentFormState: 'New',
        isFormStateReadOnly: false,
        planCode: '100',
        upfrontNIGO: null,
        isLC: false,
        setUpfrontNIGO: jest.fn(),
        featureFlags: {},
        setCurrentFormState: jest.fn(),
        formValidator: jest.fn(() => ({})),
        setOwnerInformation: jest.fn(),
        setChannel: jest.fn(),
        setSubsequentTargetFunds: jest.fn(),
        setTransOption: jest.fn(),
        setRenewalRequestSignDate: mockSetRenewalRequestSignDate,
        setFormValidator: mockSetFormValidator,
        setFormErrors: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Component Rendering & Initialization', () => {
        it('should render without errors', () => {
            const { container } = render(
                <RenewalFormDataContext.Provider value={defaultContextValue}>
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            expect(container).toBeInTheDocument();
        });

        it('should render all required child components', () => {
            render(
                <RenewalFormDataContext.Provider value={defaultContextValue}>
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            // Check that core components are rendered
            expect(
                screen.getByTestId('general-information')
            ).toBeInTheDocument();
            expect(screen.getByTestId('owner-information')).toBeInTheDocument();
        });

        it('should render DiaryNotesWarning when form is not read-only', () => {
            render(
                <RenewalFormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        isFormStateReadOnly: false,
                    }}
                >
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            expect(
                screen.getByTestId('diary-notes-warning')
            ).toBeInTheDocument();
        });

        it('should not render DiaryNotesWarning when form is read-only', () => {
            render(
                <RenewalFormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        isFormStateReadOnly: true,
                    }}
                >
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            expect(
                screen.queryByTestId('diary-notes-warning')
            ).not.toBeInTheDocument();
        });
    });

    describe('Context Values Access', () => {
        it('should properly access and use channel context value for Phone channel', () => {
            render(
                <RenewalFormDataContext.Provider
                    value={{ ...defaultContextValue, channel: Channel.Phone }}
                >
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            // CallReceiveDate should be rendered for Phone channel
            expect(screen.getByTestId('call-receive-date')).toBeInTheDocument();
            // SignatureValidations should not be rendered for Phone channel
            expect(
                screen.queryByTestId('signature-validations')
            ).not.toBeInTheDocument();
        });

        it('should properly access and use channel context value for Form channel', () => {
            render(
                <RenewalFormDataContext.Provider
                    value={{ ...defaultContextValue, channel: Channel.Form }}
                >
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            // SignatureValidations should be rendered for Form channel
            expect(
                screen.getByTestId('signature-validations')
            ).toBeInTheDocument();
            // CallReceiveDate should not be rendered for Form channel
            expect(
                screen.queryByTestId('call-receive-date')
            ).not.toBeInTheDocument();
        });

        it('should properly access and use isFormStateReadOnly context value', () => {
            const { rerender } = render(
                <RenewalFormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        isFormStateReadOnly: false,
                    }}
                >
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            expect(
                screen.getByTestId('diary-notes-warning')
            ).toBeInTheDocument();

            // Re-render with read-only state
            rerender(
                <RenewalFormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        isFormStateReadOnly: true,
                    }}
                >
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            expect(
                screen.queryByTestId('diary-notes-warning')
            ).not.toBeInTheDocument();
        });

        it('should properly access and use planCode context value for multi-selection (plan 887)', () => {
            render(
                <RenewalFormDataContext.Provider
                    value={{ ...defaultContextValue, planCode: '887' }}
                >
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            // RenewalPeriodMultiSection should be rendered for plan code 887
            expect(
                screen.getByTestId('renewal-period-multi')
            ).toBeInTheDocument();
            expect(
                screen.queryByTestId('renewal-period-single')
            ).not.toBeInTheDocument();
        });

        it('should properly access and use planCode context value for multi-selection (plan 728)', () => {
            render(
                <RenewalFormDataContext.Provider
                    value={{ ...defaultContextValue, planCode: '728' }}
                >
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            // RenewalPeriodMultiSection should be rendered for plan code 728
            expect(
                screen.getByTestId('renewal-period-multi')
            ).toBeInTheDocument();
            expect(
                screen.queryByTestId('renewal-period-single')
            ).not.toBeInTheDocument();
        });

        it('should properly access and use planCode context value for multi-selection (plan 772)', () => {
            render(
                <RenewalFormDataContext.Provider
                    value={{ ...defaultContextValue, planCode: '772' }}
                >
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            // RenewalPeriodMultiSection should be rendered for plan code 772
            expect(
                screen.getByTestId('renewal-period-multi')
            ).toBeInTheDocument();
            expect(
                screen.queryByTestId('renewal-period-single')
            ).not.toBeInTheDocument();
        });

        it('should properly access and use planCode context value for single-selection (other plans)', () => {
            render(
                <RenewalFormDataContext.Provider
                    value={{ ...defaultContextValue, planCode: '100' }}
                >
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            // RenewalPeriodSingleSection should be rendered for other plan codes
            expect(
                screen.getByTestId('renewal-period-single')
            ).toBeInTheDocument();
            expect(
                screen.queryByTestId('renewal-period-multi')
            ).not.toBeInTheDocument();
        });
    });

    describe('Form Validator Initialization', () => {
        it('should set form validator on component mount', () => {
            render(
                <RenewalFormDataContext.Provider value={defaultContextValue}>
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
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
                <RenewalFormDataContext.Provider value={defaultContextValue}>
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            expect(mockSetFormValidator).toHaveBeenCalledTimes(1);

            // Re-render the component
            rerender(
                <RenewalFormDataContext.Provider
                    value={{ ...defaultContextValue, planCode: '887' }}
                >
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            // Should still only be called once (due to empty dependency array)
            expect(mockSetFormValidator).toHaveBeenCalledTimes(1);
        });
    });

    describe('Renewal Request Sign Date Effect', () => {
        it('should update renewal request sign date for Form channel with owner signature', () => {
            render(
                <RenewalFormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        channel: Channel.Form,
                        ownerInformation: mockOwnerInformation,
                    }}
                >
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            // Should be called with the primary owner's signature date
            expect(mockSetRenewalRequestSignDate).toHaveBeenCalledWith(
                '2024-01-15'
            );
        });

        it('should use existing renewalRequestSignDate for Phone channel', () => {
            const phoneDate = '2024-02-20';
            render(
                <RenewalFormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        channel: Channel.Phone,
                        renewalRequestSignDate: phoneDate,
                    }}
                >
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            // Should be called with the existing renewalRequestSignDate
            expect(mockSetRenewalRequestSignDate).toHaveBeenCalledWith(
                phoneDate
            );
        });

        it('should handle missing owner signature date gracefully', () => {
            const ownerWithoutSignDate: OwnerInformation[] = [
                {
                    firstName: 'Jane',
                    middleName: '',
                    lastName: 'Smith',
                    fullName: 'Jane Smith',
                    type: 'Primary',
                    signature: {
                        title: 'Owner',
                        signaturePresent: 'No',
                        type: 'Primary',
                        isValidDate: false,
                        signDate: '',
                        name: 'Jane Smith',
                    },
                },
            ];

            render(
                <RenewalFormDataContext.Provider
                    value={{
                        ...defaultContextValue,
                        channel: Channel.Form,
                        ownerInformation: ownerWithoutSignDate,
                    }}
                >
                    <GlcoRenewalForm />
                </RenewalFormDataContext.Provider>
            );

            // Should be called with empty string when no sign date
            expect(mockSetRenewalRequestSignDate).toHaveBeenCalledWith('');
        });
    });
});
