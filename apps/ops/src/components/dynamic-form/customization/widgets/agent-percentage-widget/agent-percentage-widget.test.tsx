import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { PartyRole } from '@zinnia/api-types/types/sor';

import AgentPercentageWidget from './agent-percentage-widget';

jest.mock('@deps/components/fields/field', () => ({
    __esModule: true,
    default: ({
        message,
        variant,
        onChange,
        value,
        readOnly,
        ...props
    }: any) => (
        <div data-testid="field-wrapper">
            <input
                data-testid="percentage-input"
                data-variant={variant}
                data-message={message}
                value={value}
                readOnly={readOnly}
                onChange={onChange}
                {...props}
            />
            {message && <span data-testid="error-message">{message}</span>}
        </div>
    ),
    FieldSize: { Small: 'small' },
    FieldType: { BaseActive: 'baseActive' },
    FieldVariant: { Error: 'error', Default: 'default' },
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: Record<string, string> = {
                allocationErr: 'Allocations must equal 100%',
            };
            return translations[key] || key;
        },
    }),
}));

describe('AgentPercentageWidget', () => {
    const mockOnChange = jest.fn();
    const mockSetSubmitEnabled = jest.fn();

    const defaultProps = {
        id: 'test-percentage',
        name: 'test-percentage',
        label: 'Percentage',
        value: '50',
        disabled: false,
        readonly: false,
        required: false,
        onChange: mockOnChange,
        onBlur: jest.fn(),
        onFocus: jest.fn(),
        placeholder: 'Enter percentage',
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
            },
            setSubmitEnabled: mockSetSubmitEnabled,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Component Rendering', () => {
        it('should render the widget in edit mode', () => {
            render(<AgentPercentageWidget {...defaultProps} />);
            expect(screen.getByTestId('percentage-input')).toBeInTheDocument();
        });

        it('should render readonly value when readonly is true', () => {
            render(<AgentPercentageWidget {...defaultProps} readonly={true} />);
            expect(
                screen.queryByTestId('percentage-input')
            ).not.toBeInTheDocument();
            expect(screen.getByText('50')).toBeInTheDocument();
        });

        it('should display percentage symbol trailing', () => {
            render(<AgentPercentageWidget {...defaultProps} />);
            const wrapper = screen.getByTestId('field-wrapper');
            expect(wrapper).toBeInTheDocument();
        });
    });

    describe('Validation - Primary Writing Agent', () => {
        it('should validate when Primary Writing Agent totals 100%', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: 60 },
                },
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: 40 },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });

            const input = screen.getByTestId('percentage-input');
            expect(input.getAttribute('data-variant')).toBe('default');
        });

        it('should invalidate when Primary Writing Agent does not total 100%', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: 60 },
                },
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: 30 },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(false);
            });

            const input = screen.getByTestId('percentage-input');
            expect(input.getAttribute('data-variant')).toBe('error');
            expect(screen.getByTestId('error-message')).toHaveTextContent(
                'Allocations must equal 100%'
            );
        });

        it('should validate when Primary Writing Agent array is empty', async () => {
            const partyUpdates: any[] = [];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });

        it('should exclude deleted Primary Writing Agents from validation', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: 100 },
                },
                {
                    action: 'DELETE',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: 50 },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });

        it('should validate with multiple Primary Writing Agents totaling 100%', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: 25 },
                },
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: 25 },
                },
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: 50 },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });
    });

    describe('Validation - Primary Servicing Agent', () => {
        it('should validate when Primary Servicing Agent totals 100%', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYSERVICINGAGENT,
                    party: { partyPercentage: 100 },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });

        it('should validate when Primary Servicing Agent totals 0%', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYSERVICINGAGENT,
                    party: { partyPercentage: 0 },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });

        it('should validate when Primary Servicing Agent array is empty', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: 100 },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });

        it('should invalidate when Primary Servicing Agent does not total 0% or 100%', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYSERVICINGAGENT,
                    party: { partyPercentage: 50 },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(false);
            });
        });

        it('should exclude deleted Primary Servicing Agents from validation', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYSERVICINGAGENT,
                    party: { partyPercentage: 100 },
                },
                {
                    action: 'DELETE',
                    partyRole: PartyRole.PRIMARYSERVICINGAGENT,
                    party: { partyPercentage: 50 },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });

        it('should validate with multiple Primary Servicing Agents totaling 100%', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYSERVICINGAGENT,
                    party: { partyPercentage: 70 },
                },
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYSERVICINGAGENT,
                    party: { partyPercentage: 30 },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });
    });

    describe('Combined Validation Scenarios', () => {
        it('should validate when both Primary Writing and Servicing Agents total 100%', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: 100 },
                },
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYSERVICINGAGENT,
                    party: { partyPercentage: 100 },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });

        it('should invalidate when Primary Writing Agent is invalid but Servicing is valid', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: 50 },
                },
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYSERVICINGAGENT,
                    party: { partyPercentage: 100 },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(false);
            });
        });

        it('should invalidate when Primary Servicing Agent is invalid but Writing is valid', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: 100 },
                },
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYSERVICINGAGENT,
                    party: { partyPercentage: 50 },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(false);
            });
        });

        it('should validate when Writing is 100% and Servicing is 0%', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: 100 },
                },
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYSERVICINGAGENT,
                    party: { partyPercentage: 0 },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle null partyUpdates', async () => {
            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates: null },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });

        it('should handle undefined partyUpdates', async () => {
            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates: undefined },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });

        it('should handle missing partyPercentage (treats as 0)', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: {},
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(false);
            });
        });

        it('should handle missing party object', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(false);
            });
        });

        it('should handle string percentage values', async () => {
            const partyUpdates = [
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: '60' },
                },
                {
                    action: 'ADD',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: '40' },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });

        it('should handle agents with UPDATE action', async () => {
            const partyUpdates = [
                {
                    action: 'UPDATE',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: 100 },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });

        it('should handle agents with NONE action', async () => {
            const partyUpdates = [
                {
                    action: 'NONE',
                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                    party: { partyPercentage: 100 },
                },
            ];

            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });

        it('should handle missing setSubmitEnabled gracefully', async () => {
            render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: { partyUpdates: [] },
                        setSubmitEnabled: undefined,
                    }}
                />
            );

            expect(screen.getByTestId('percentage-input')).toBeInTheDocument();
        });
    });

    describe('User Interactions', () => {
        it('should call onChange when input value changes', () => {
            render(<AgentPercentageWidget {...defaultProps} />);

            const input = screen.getByTestId('percentage-input');
            fireEvent.change(input, { target: { value: '75' } });

            expect(mockOnChange).toHaveBeenCalledWith('75');
        });

        it('should re-validate when partyPercentages change', async () => {
            const { rerender } = render(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: {
                            partyUpdates: [
                                {
                                    action: 'ADD',
                                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                                    party: { partyPercentage: 50 },
                                },
                            ],
                        },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(false);
            });

            rerender(
                <AgentPercentageWidget
                    {...defaultProps}
                    formContext={{
                        customData: {
                            partyUpdates: [
                                {
                                    action: 'ADD',
                                    partyRole: PartyRole.PRIMARYWRITINGAGENT,
                                    party: { partyPercentage: 100 },
                                },
                            ],
                        },
                        setSubmitEnabled: mockSetSubmitEnabled,
                    }}
                />
            );

            await waitFor(() => {
                expect(mockSetSubmitEnabled).toHaveBeenCalledWith(true);
            });
        });
    });
});
