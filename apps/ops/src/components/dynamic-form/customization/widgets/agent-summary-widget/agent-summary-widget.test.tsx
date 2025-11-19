import { render, screen, waitFor } from '@testing-library/react';

import { validateAgentTransaction } from '@deps/queries/api/web-non-financial';
import { browserLogInfo, browserLogError } from '@deps/utils/browser-logging';

import SummaryWidget from './agent-summary-widget';

// Mock dependencies
jest.mock('@deps/queries/api/web-non-financial');
jest.mock('@deps/utils/browser-logging');
jest.mock(
    '@deps/containers/bene-change/components/steps/summary/summary-step.helpers',
    () => ({
        getTagVariant: jest.fn((action: string) => {
            const variants: Record<string, any> = {
                ADD: { tagText: 'Add', tagVariant: 'success' },
                UPDATE: { tagText: 'Update', tagVariant: 'warning' },
                DELETE: { tagText: 'Delete', tagVariant: 'error' },
                NONE: { tagText: 'No Change', tagVariant: 'neutral' },
            };
            return (
                variants[action] || {
                    tagText: 'Unknown',
                    tagVariant: 'neutral',
                }
            );
        }),
    })
);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                submitWithErrorsText:
                    'Submit with errors and create a NIGO task for the appropriate team to follow up on.',
                missingCheckToConfirm: 'Please confirm to proceed with errors.',
                bpm500Error: 'An unexpected error occurred during validation.',
                validation: 'Validating...',
                reviewMessage: 'Review the changes below.',
                status400subtitle:
                    "Hm, we found an issue when checking this policy's rules. Review the error below.",
                externalId: 'External ID',
                agentType: 'Agent Type',
                allocation: 'Allocation',
            };
            return translations[key] || key;
        },
    }),
}));

jest.mock(
    '@xd/utils/dist',
    () => ({
        toTitleCase: (str: string) => {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        },
    }),
    { virtual: true }
);

// Mock components
jest.mock('@deps/components/banner-alert/banner-alert', () => ({
    __esModule: true,
    default: ({ children, variant, canDismiss }: any) => (
        <div
            data-testid="banner-alert"
            data-variant={variant}
            data-can-dismiss={canDismiss}
        >
            {children}
        </div>
    ),
    BannerVariant: {
        Error: 'error',
        Warning: 'warning',
        Success: 'success',
        Info: 'info',
    },
}));

jest.mock('@deps/components/checkbox/checkbox-text/checkbox-text', () => ({
    __esModule: true,
    default: ({ label, checked, onChange }: any) => (
        <div data-testid="checkbox-text">
            <input
                type="checkbox"
                data-testid="checkbox-input"
                checked={checked}
                onChange={onChange}
                aria-label={label}
            />
            <label>{label}</label>
        </div>
    ),
}));

jest.mock('@deps/components/typography/typography', () => ({
    __esModule: true,
    default: ({ children, className, variant }: any) => (
        <div
            data-testid="typography"
            className={className}
            data-variant={variant}
        >
            {children}
        </div>
    ),
    TypographyVariant: {
        BodySm: 'body-sm',
    },
}));

jest.mock('@zinnia/bloom/components', () => ({
    Tag: ({ text, variant, className }: any) => (
        <span data-testid="tag" data-variant={variant} className={className}>
            {text}
        </span>
    ),
    TagVariant: {
        Success: 'success',
        Warning: 'warning',
        Error: 'error',
        Neutral: 'neutral',
    },
    AssistiveText: ({ text, variant, className }: any) => (
        <div
            data-testid="assistive-text"
            data-variant={variant}
            className={className}
        >
            {text}
        </div>
    ),
    AssistiveTextVariant: {
        Error: 'error',
    },
}));

describe('SummaryWidget', () => {
    const mockSetSubmitEnabled = jest.fn();
    const mockValidateAgentTransaction =
        validateAgentTransaction as jest.MockedFunction<
            typeof validateAgentTransaction
        >;
    const mockBrowserLogInfo = browserLogInfo as jest.MockedFunction<
        typeof browserLogInfo
    >;
    const mockBrowserLogError = browserLogError as jest.MockedFunction<
        typeof browserLogError
    >;

    const createMockProps = (customData: any = {}) => ({
        id: 'summary-widget',
        name: 'summary',
        label: 'Summary',
        value: undefined,
        disabled: false,
        readonly: false,
        required: false,
        onChange: jest.fn(),
        onBlur: jest.fn(),
        onFocus: jest.fn(),
        schema: {},
        uiSchema: {},
        options: {},
        registry: {
            fields: {},
            widgets: {},
            templates: {},
            rootSchema: {},
            formContext: {},
        } as any,
        formContext: {
            customData: {
                partyUpdates: [],
                planCode: 'TEST',
                policyNumber: '12345',
                issueResolved: true,
                signatures: [{ isSignedPresent: true, signDate: '2024-01-01' }],
                ...customData,
            },
            setSubmitEnabled: mockSetSubmitEnabled,
        },
    });

    beforeEach(() => {
        jest.clearAllMocks();
        console.log = jest.fn();
    });

    describe('Component Rendering', () => {
        it('should render the widget with default state', () => {
            const props = createMockProps();
            render(<SummaryWidget {...props} />);
            expect(screen.getByTestId('typography')).toBeInTheDocument();
        });

        it('should render in readonly mode', () => {
            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            firstName: 'John',
                            lastName: 'Doe',
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });
            props.readonly = true;
            render(<SummaryWidget {...props} />);
            expect(screen.getByTestId('typography')).toBeInTheDocument();
        });

        it('should not call validation API in readonly mode', () => {
            const props = createMockProps();
            props.readonly = true;
            render(<SummaryWidget {...props} />);
            expect(mockValidateAgentTransaction).not.toHaveBeenCalled();
        });
    });

    describe('Validation API - IGO Scenarios', () => {
        it('should call validation API on mount with valid data', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'success',
                data: {},
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            firstName: 'John',
                            lastName: 'Doe',
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(mockValidateAgentTransaction).toHaveBeenCalledWith({
                    planCode: 'TEST',
                    policyNumber: '12345',
                    partyUpdates: [
                        {
                            action: 'ADD',
                            partyRole: 'PRIMARYWRITINGAGENT',
                            party: {
                                firstName: 'John',
                                lastName: 'Doe',
                                agentExternalId: 'EXT123',
                                partyPercentage: 100,
                            },
                        },
                    ],
                    signatures: [
                        { isSignedPresent: true, signDate: '2024-01-01' },
                    ],
                });
            });
        });

        it('should use default signatures when not provided', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'success',
                data: {},
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
                signatures: undefined,
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(mockValidateAgentTransaction).toHaveBeenCalledWith(
                    expect.objectContaining({
                        signatures: [
                            { isSignedPresent: false, signDate: null },
                        ],
                    })
                );
            });
        });

        it('should handle successful validation response', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'success',
                data: {},
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(mockBrowserLogInfo).toHaveBeenCalledWith(
                    'AGENT CHANGE PAPER FORM : VALIDATION succeeded',
                    expect.objectContaining({
                        planCode: 'TEST',
                        policyNumber: '12345',
                    })
                );
            });
        });

        it('should handle validation error response', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'error',
                data: {
                    validationResult: [
                        {
                            error: 'Invalid agent',
                            errorCode: 'ERR001',
                            resolution: 'Please check agent details',
                        },
                    ],
                },
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(mockBrowserLogError).toHaveBeenCalledWith(
                    'AGENT CHANGE PAPER FORM : VALIDATION failed',
                    expect.objectContaining({
                        planCode: 'TEST',
                        policyNumber: '12345',
                        validationErrors: 1,
                    })
                );
            });
        });

        it('should handle validation API exception', async () => {
            const error = new Error('Network error');
            mockValidateAgentTransaction.mockRejectedValue(error);

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(mockBrowserLogError).toHaveBeenCalledWith(
                    'AGENT CHANGE PAPER FORM :: Validation API call failed',
                    expect.objectContaining({
                        error,
                        planCode: 'TEST',
                        policyNumber: '12345',
                        correlationId: undefined,
                    })
                );
            });
        });

        it('should log correlationId from direct error property', async () => {
            const error = {
                correlationId: 'corr-123-direct',
                message: 'API Error',
            };
            mockValidateAgentTransaction.mockRejectedValue(error);

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(mockBrowserLogError).toHaveBeenCalledWith(
                    'AGENT CHANGE PAPER FORM :: Validation API call failed',
                    expect.objectContaining({
                        error,
                        planCode: 'TEST',
                        policyNumber: '12345',
                        correlationId: 'corr-123-direct',
                    })
                );
            });
        });

        it('should log correlationId from nested response.data property', async () => {
            const error = {
                response: {
                    data: {
                        correlationId: 'corr-456-nested',
                        message: 'Validation failed',
                    },
                },
                message: 'Request failed',
            };
            mockValidateAgentTransaction.mockRejectedValue(error);

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(mockBrowserLogError).toHaveBeenCalledWith(
                    'AGENT CHANGE PAPER FORM :: Validation API call failed',
                    expect.objectContaining({
                        error,
                        planCode: 'TEST',
                        policyNumber: '12345',
                        correlationId: 'corr-456-nested',
                    })
                );
            });
        });

        it('should prioritize direct correlationId over nested one', async () => {
            const error = {
                correlationId: 'corr-direct-priority',
                response: {
                    data: {
                        correlationId: 'corr-nested-ignored',
                    },
                },
            };
            mockValidateAgentTransaction.mockRejectedValue(error);

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(mockBrowserLogError).toHaveBeenCalledWith(
                    'AGENT CHANGE PAPER FORM :: Validation API call failed',
                    expect.objectContaining({
                        correlationId: 'corr-direct-priority',
                    })
                );
            });
        });

        it('should skip validation when missing required data', () => {
            const props = createMockProps({
                planCode: undefined,
                policyNumber: '12345',
                partyUpdates: [],
            });

            render(<SummaryWidget {...props} />);

            expect(mockValidateAgentTransaction).not.toHaveBeenCalled();
            expect(mockBrowserLogInfo).toHaveBeenCalledWith(
                'AGENT CHANGE PAPER FORM :: ::Skipping validation - missing required data',
                expect.any(Object)
            );
        });

        it('should skip validation when issueResolved is false', () => {
            const props = createMockProps({
                issueResolved: false,
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            expect(mockValidateAgentTransaction).not.toHaveBeenCalled();
        });
    });

    describe('Validation Errors Rendering', () => {
        it('should render validation errors when validation fails', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'error',
                data: {
                    validationResult: [
                        {
                            error: 'Invalid agent',
                            errorCode: 'ERR001',
                            resolution: 'Please check agent details',
                        },
                        {
                            error: 'Missing information',
                            errorCode: 'ERR002',
                            resolution: 'Provide required information',
                        },
                    ],
                },
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                const banners = screen.getAllByTestId('banner-alert');
                expect(banners.length).toBeGreaterThanOrEqual(2);
                expect(screen.getByText('Invalid agent')).toBeInTheDocument();
                expect(
                    screen.getByText(/Please check agent details/)
                ).toBeInTheDocument();
            });
        });

        it('should render generic error when validationResult is not an array', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'error',
                data: { validationResult: null },
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(
                    screen.getByText(
                        'An unexpected error occurred during validation.'
                    )
                ).toBeInTheDocument();
            });
        });

        it('should not render validation errors when validating', () => {
            mockValidateAgentTransaction.mockImplementation(
                () =>
                    new Promise((resolve) =>
                        setTimeout(
                            () => resolve({ status: 'success', data: {} }),
                            1000
                        )
                    )
            );

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);
            expect(
                screen.queryByTestId('banner-alert')
            ).not.toBeInTheDocument();
        });

        it('should not render validation errors when validation succeeds', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'success',
                data: {},
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() =>
                expect(mockValidateAgentTransaction).toHaveBeenCalled()
            );
            expect(
                screen.queryByText(
                    'An unexpected error occurred during validation.'
                )
            ).not.toBeInTheDocument();
        });
    });

    describe('Decline Reasons - NIGO Scenarios', () => {
        it('should render decline reasons with main reason', () => {
            const props = createMockProps({
                issueResolved: false,
                declineReason: [
                    {
                        value: 'NM.ATP.001',
                        category: 'Authorization',
                        reason: 'Missing Authorization Form',
                        detailedReason: 'The authorization form is missing',
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            expect(
                screen.getByText('Missing Authorization Form')
            ).toBeInTheDocument();
            expect(screen.getByText(/Code: NM.ATP.001/)).toBeInTheDocument();
        });

        it('should render decline reasons with exceptionSubRefs', () => {
            const props = createMockProps({
                issueResolved: false,
                declineReason: [
                    {
                        value: 'NM.ATP.002',
                        category: 'Validation',
                        reason: 'Invalid Information',
                        detailedReason: 'Information is invalid',
                        exceptionSubRefs: [
                            { subNigoId: 'SUB001', value: 'Invalid signature' },
                            { subNigoId: 'SUB002', value: 'Missing date' },
                        ],
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            expect(screen.getByText('Invalid signature')).toBeInTheDocument();
            expect(screen.getByText('Missing date')).toBeInTheDocument();
            expect(screen.getByText(/SUB001/)).toBeInTheDocument();
            expect(screen.getByText(/SUB002/)).toBeInTheDocument();
        });

        it('should render decline reasons without errorCode', () => {
            const props = createMockProps({
                issueResolved: false,
                declineReason: [
                    {
                        value: '',
                        category: 'General',
                        reason: 'General Error',
                        detailedReason: 'A general error occurred',
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            expect(screen.getByText('General Error')).toBeInTheDocument();
            expect(screen.queryByText(/Code:/)).not.toBeInTheDocument();
        });

        it('should render generic error when declineReason is not an array', () => {
            const props = createMockProps({
                issueResolved: false,
                declineReason: null,
            });

            render(<SummaryWidget {...props} />);
            expect(
                screen.getByText(
                    'An unexpected error occurred during validation.'
                )
            ).toBeInTheDocument();
        });

        it('should render multiple decline reasons', () => {
            const props = createMockProps({
                issueResolved: false,
                declineReason: [
                    {
                        value: 'NM.ATP.001',
                        category: 'Auth',
                        reason: 'Missing Form',
                        detailedReason: 'Form missing',
                    },
                    {
                        value: 'NM.ATP.002',
                        category: 'Validation',
                        reason: 'Invalid Data',
                        detailedReason: 'Data invalid',
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            expect(screen.getByText('Missing Form')).toBeInTheDocument();
            expect(screen.getByText('Invalid Data')).toBeInTheDocument();
        });

        it('should handle exceptionSubRefs without subNigoId', () => {
            const props = createMockProps({
                issueResolved: false,
                declineReason: [
                    {
                        value: 'NM.ATP.003',
                        category: 'Validation',
                        reason: 'Invalid Information',
                        detailedReason: 'Information is invalid',
                        exceptionSubRefs: [
                            { subNigoId: '', value: 'Error without ID' },
                        ],
                    },
                ],
            });

            render(<SummaryWidget {...props} />);
            expect(screen.getByText('Error without ID')).toBeInTheDocument();
        });
    });

    describe('Agent List Rendering', () => {
        it('should render agent list when validation succeeds', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'success',
                data: {},
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            firstName: 'John',
                            lastName: 'Doe',
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(screen.getByText(/john doe/i)).toBeInTheDocument();
                expect(screen.getByText('EXT123')).toBeInTheDocument();
                expect(screen.getByText('Writing agent')).toBeInTheDocument();
                expect(screen.getByText('100%')).toBeInTheDocument();
            });
        });

        it('should render multiple agents', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'success',
                data: {},
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            firstName: 'John',
                            lastName: 'Doe',
                            agentExternalId: 'EXT123',
                            partyPercentage: 50,
                        },
                    },
                    {
                        action: 'UPDATE',
                        partyRole: 'PRIMARYSERVICINGAGENT',
                        party: {
                            firstName: 'Jane',
                            lastName: 'Smith',
                            agentExternalId: 'EXT456',
                            partyPercentage: 50,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(screen.getByText(/john doe/i)).toBeInTheDocument();
                expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
                expect(screen.getByText('Writing agent')).toBeInTheDocument();
                expect(screen.getByText('Servicing agent')).toBeInTheDocument();
            });
        });

        it('should format agent name with external ID when name is missing', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'success',
                data: {},
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            firstName: '',
                            lastName: '',
                            agentExternalId: 'EXT789',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(screen.getByText('Ext. ID: EXT789')).toBeInTheDocument();
            });
        });

        it('should handle agent with only firstName', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'success',
                data: {},
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            firstName: 'John',
                            lastName: '',
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(screen.getByText('John')).toBeInTheDocument();
            });
        });

        it('should display 0% when partyPercentage is missing', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'success',
                data: {},
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            firstName: 'John',
                            lastName: 'Doe',
                            agentExternalId: 'EXT123',
                            partyPercentage: undefined,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(screen.getByText('0%')).toBeInTheDocument();
            });
        });

        it('should not render agent list when validation fails', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'error',
                data: {
                    validationResult: [
                        {
                            error: 'Invalid agent',
                            errorCode: 'ERR001',
                            resolution: 'Check details',
                        },
                    ],
                },
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            firstName: 'John',
                            lastName: 'Doe',
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(screen.queryByText('John doe')).not.toBeInTheDocument();
            });
        });

        it('should render agent list in readonly mode', () => {
            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'DELETE',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            firstName: 'John',
                            lastName: 'Doe',
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });
            props.readonly = true;

            render(<SummaryWidget {...props} />);
            expect(screen.getByText(/john doe/i)).toBeInTheDocument();
        });

        it('should format unknown agent role', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'success',
                data: {},
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'UNKNOWN_ROLE',
                        party: {
                            firstName: 'John',
                            lastName: 'Doe',
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(screen.getByText(/unknown role/i)).toBeInTheDocument();
            });
        });
    });

    describe('Checkbox Functionality', () => {
        it('should render checkbox when validation fails', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'error',
                data: {
                    validationResult: [
                        {
                            error: 'Invalid agent',
                            errorCode: 'ERR001',
                            resolution: 'Check details',
                        },
                    ],
                },
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(
                    screen.getByTestId('checkbox-input')
                ).toBeInTheDocument();
            });
        });

        it('should render checkbox for NIGO scenarios', () => {
            const props = createMockProps({
                issueResolved: false,
                declineReason: [
                    {
                        value: 'NM.ATP.001',
                        category: 'Auth',
                        reason: 'Missing Form',
                        detailedReason: 'Form missing',
                    },
                ],
            });

            render(<SummaryWidget {...props} />);
            expect(screen.getByTestId('checkbox-input')).toBeInTheDocument();
        });

        it('should handle checkbox change and hide error message', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'error',
                data: {
                    validationResult: [
                        {
                            error: 'Invalid agent',
                            errorCode: 'ERR001',
                            resolution: 'Check details',
                        },
                    ],
                },
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            const { rerender } = render(<SummaryWidget {...props} />);

            await waitFor(() => {
                const checkbox = screen.getByTestId('checkbox-input');
                expect(checkbox).toBeInTheDocument();
            });
        });
    });

    describe('Form Submission Control', () => {
        it('should enable submit when validation succeeds in IGO scenario', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'success',
                data: {},
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });

        it('should disable submit when validation fails and checkbox not checked', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'error',
                data: {
                    validationResult: [
                        {
                            error: 'Invalid agent',
                            errorCode: 'ERR001',
                            resolution: 'Check details',
                        },
                    ],
                },
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(false);
            });
        });

        it('should not call setSubmitEnabled in readonly mode', () => {
            const props = createMockProps();
            props.readonly = true;

            render(<SummaryWidget {...props} />);
            expect(mockSetSubmitEnabled).not.toHaveBeenCalled();
        });

        it('should not call setSubmitEnabled when formContext.setSubmitEnabled is undefined', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'success',
                data: {},
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });
            delete (props.formContext as any).setSubmitEnabled;

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(mockValidateAgentTransaction).toHaveBeenCalled();
            });
        });
    });

    describe('Title Message', () => {
        it('should show validation message when validating', () => {
            mockValidateAgentTransaction.mockImplementation(
                () =>
                    new Promise((resolve) =>
                        setTimeout(
                            () => resolve({ status: 'success', data: {} }),
                            1000
                        )
                    )
            );

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);
            expect(screen.getByText('Validating...')).toBeInTheDocument();
        });

        it('should show review message when validation succeeds', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'success',
                data: {},
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(
                    screen.getByText('Review the changes below.')
                ).toBeInTheDocument();
            });
        });

        it('should show error message when validation fails', async () => {
            mockValidateAgentTransaction.mockResolvedValue({
                status: 'error',
                data: {
                    validationResult: [
                        {
                            error: 'Invalid agent',
                            errorCode: 'ERR001',
                            resolution: 'Check details',
                        },
                    ],
                },
            });

            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });

            render(<SummaryWidget {...props} />);

            await waitFor(() => {
                expect(
                    screen.getByText(
                        "Hm, we found an issue when checking this policy's rules. Review the error below."
                    )
                ).toBeInTheDocument();
            });
        });

        it('should show NIGO message when issueResolved is false', () => {
            const props = createMockProps({
                issueResolved: false,
                declineReason: [
                    {
                        value: 'NM.ATP.001',
                        category: 'Auth',
                        reason: 'Missing Form',
                        detailedReason: 'Form missing',
                    },
                ],
            });

            render(<SummaryWidget {...props} />);
            expect(
                screen.getByText(
                    'Hm, we found an issue with the form. Review the error below.'
                )
            ).toBeInTheDocument();
        });

        it('should not show title message in readonly mode', () => {
            const props = createMockProps({
                partyUpdates: [
                    {
                        action: 'ADD',
                        partyRole: 'PRIMARYWRITINGAGENT',
                        party: {
                            agentExternalId: 'EXT123',
                            partyPercentage: 100,
                        },
                    },
                ],
            });
            props.readonly = true;

            render(<SummaryWidget {...props} />);
            expect(screen.queryByText('Validating...')).not.toBeInTheDocument();
            expect(
                screen.queryByText('Review the changes below.')
            ).not.toBeInTheDocument();
        });
    });
});
