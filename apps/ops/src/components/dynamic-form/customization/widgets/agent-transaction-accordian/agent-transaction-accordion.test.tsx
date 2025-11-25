import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

import { PartyType } from '@deps/models/policy/sor-policy';

import AgentTransactionAccordion from './agent-transaction-accordion';
import { Action } from './agent-transaction-accordion.types';

jest.mock('@deps/components/checkbox/checkbox-text/checkbox-text', () => ({
    __esModule: true,
    default: ({ id, label, checked, onChange }: any) => (
        <div data-testid={`checkbox-${id}`}>
            <input
                type="checkbox"
                data-testid={`checkbox-input-${id}`}
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                aria-label={label}
            />
            <label>{label}</label>
        </div>
    ),
}));

describe('AgentTransactionAccordion', () => {
    const mockOnChange = jest.fn();
    const mockObjectField = jest.fn(({ formData, onChange }) => (
        <div data-testid="object-field">
            <input
                data-testid="object-field-input"
                value={formData?.party?.partyPercentage || ''}
                onChange={(e) =>
                    onChange({
                        ...formData,
                        party: {
                            ...formData.party,
                            partyPercentage: e.target.value,
                        },
                    })
                }
            />
        </div>
    ));

    const createMockProps = (overrides: any = {}) => ({
        id: 'agent-accordion',
        name: 'agents',
        label: 'Agents',
        value: [],
        disabled: false,
        readonly: false,
        required: false,
        onChange: mockOnChange,
        onBlur: jest.fn(),
        onFocus: jest.fn(),
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    action: { type: 'string' },
                    partyRole: { type: 'string' },
                    party: { type: 'object', properties: {} },
                },
            },
        },
        uiSchema: {
            items: {
                party: { partyPercentage: { 'ui:widget': 'percentage' } },
                partyRole: { 'ui:widget': 'select' },
            },
        },
        options: {
            tabTitle: 'Agent Details',
            showAddBtn: true,
            showDeleteBtn: true,
            hideAccordion: false,
        },
        registry: {
            fields: { ObjectField: mockObjectField },
            widgets: {},
            templates: {},
            rootSchema: {},
            formContext: {},
        } as any,
        formContext: {
            customData: {
                carrier: 'WELB',
                planCode: 'TEST',
                policyNumber: '12345',
            },
        },
        ...overrides,
    });

    const createMockAgent = (overrides: any = {}) => ({
        action: Action.NONE,
        partyRole: 'PRIMARYWRITINGAGENT',
        party: {
            partyType: PartyType.INDIVIDUAL,
            agentExternalId: 'EXT123',
            firstName: 'John',
            lastName: 'Doe',
            partyPercentage: 100,
            startDate: '2024-01-01',
            endDate: null,
        },
        ...overrides,
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Component Rendering', () => {
        it('should render empty accordion when no agents', () => {
            const props = createMockProps();
            render(<AgentTransactionAccordion {...props} />);
            // Should not render any accordion items, but Add button should be present
            expect(screen.queryByText(/Ext. ID:/)).not.toBeInTheDocument();
            expect(screen.getByText('+ Add an Agent')).toBeInTheDocument();
        });

        it('should render accordion with single agent', () => {
            const agent = createMockAgent();
            const props = createMockProps({ value: [agent] });
            render(<AgentTransactionAccordion {...props} />);
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        it('should render accordion with multiple agents', () => {
            const agents = [
                createMockAgent({
                    party: {
                        ...createMockAgent().party,
                        firstName: 'John',
                        lastName: 'Doe',
                    },
                }),
                createMockAgent({
                    party: {
                        ...createMockAgent().party,
                        firstName: 'Jane',
                        lastName: 'Smith',
                        agentExternalId: 'EXT456',
                    },
                }),
            ];
            const props = createMockProps({ value: agents });
            render(<AgentTransactionAccordion {...props} />);
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        it('should render "Add an Agent" button when showAddBtn is true', () => {
            const props = createMockProps();
            render(<AgentTransactionAccordion {...props} />);
            expect(screen.getByText('+ Add an Agent')).toBeInTheDocument();
        });

        it('should not render "Add an Agent" button when showAddBtn is false', () => {
            const props = createMockProps({ options: { showAddBtn: false } });
            render(<AgentTransactionAccordion {...props} />);
            expect(
                screen.queryByText('+ Add an Agent')
            ).not.toBeInTheDocument();
        });

        it('should not render "Add an Agent" button in readonly mode', () => {
            const props = createMockProps({ readonly: true });
            render(<AgentTransactionAccordion {...props} />);
            expect(
                screen.queryByText('+ Add an Agent')
            ).not.toBeInTheDocument();
        });

        it('should hide accordion when hideAccordion is true', () => {
            const agent = createMockAgent();
            const props = createMockProps({
                value: [agent],
                options: { hideAccordion: true },
            });
            render(<AgentTransactionAccordion {...props} />);
            expect(screen.queryByText('John doe')).not.toBeInTheDocument();
        });
    });

    describe('Title Formatting', () => {
        it('should display agent name when firstName and lastName are present', () => {
            const agent = createMockAgent({
                party: {
                    ...createMockAgent().party,
                    firstName: 'John',
                    lastName: 'Doe',
                },
            });
            const props = createMockProps({ value: [agent] });
            render(<AgentTransactionAccordion {...props} />);
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        it('should display external ID when name is missing', () => {
            const agent = createMockAgent({
                party: {
                    ...createMockAgent().party,
                    firstName: '',
                    lastName: '',
                    agentExternalId: 'EXT789',
                },
            });
            const props = createMockProps({ value: [agent] });
            render(<AgentTransactionAccordion {...props} />);
            expect(screen.getByText('Ext. ID: EXT789')).toBeInTheDocument();
        });

        it('should handle whitespace in names', () => {
            const agent = createMockAgent({
                party: {
                    ...createMockAgent().party,
                    firstName: '  John  ',
                    lastName: '  Doe  ',
                },
            });
            const props = createMockProps({ value: [agent] });
            render(<AgentTransactionAccordion {...props} />);
            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        it('should display external ID when tabTitle is not "Agent Details"', () => {
            const agent = createMockAgent();
            const props = createMockProps({
                value: [agent],
                options: { tabTitle: 'Other Title' },
            });
            render(<AgentTransactionAccordion {...props} />);
            expect(screen.getByText('Ext. ID: EXT123')).toBeInTheDocument();
        });
    });

    describe('Accordion Toggle', () => {
        it('should open first accordion by default', () => {
            const agent = createMockAgent();
            const props = createMockProps({ value: [agent] });
            render(<AgentTransactionAccordion {...props} />);
            expect(screen.getByTestId('object-field')).toBeInTheDocument();
        });

        it('should collapse accordion when clicked', () => {
            const agent = createMockAgent();
            const props = createMockProps({ value: [agent] });
            render(<AgentTransactionAccordion {...props} />);
            const toggleButton = screen.getByRole('button', {
                name: /John Doe/i,
            });
            // First accordion is open by default, so first click collapses it
            fireEvent.click(toggleButton);
            expect(
                screen.queryByTestId('object-field')
            ).not.toBeInTheDocument();
        });

        it('should expand accordion when clicked again', () => {
            const agent = createMockAgent();
            const props = createMockProps({ value: [agent] });
            render(<AgentTransactionAccordion {...props} />);
            const toggleButton = screen.getByRole('button', {
                name: /John Doe/i,
            });
            // First click - collapse
            fireEvent.click(toggleButton);
            expect(
                screen.queryByTestId('object-field')
            ).not.toBeInTheDocument();
            // Second click - expand
            fireEvent.click(toggleButton);
            expect(screen.getByTestId('object-field')).toBeInTheDocument();
        });
    });

    describe('Add Agent Functionality', () => {
        it('should add new agent when "Add an Agent" button is clicked', () => {
            const props = createMockProps();
            render(<AgentTransactionAccordion {...props} />);
            const addButton = screen.getByText('+ Add an Agent');
            fireEvent.click(addButton);
            expect(mockOnChange).toHaveBeenCalledWith([
                expect.objectContaining({
                    action: Action.ADD,
                    partyRole: '',
                    party: expect.objectContaining({
                        partyType: PartyType.INDIVIDUAL,
                        agentExternalId: '',
                        partyPercentage: '',
                    }),
                }),
            ]);
        });

        it('should mark existing agents for deletion when adding new agent (WELB carrier)', () => {
            const existingAgent = createMockAgent();
            const props = createMockProps({
                value: [existingAgent],
                formContext: { customData: { carrier: 'WELB' } },
            });
            render(<AgentTransactionAccordion {...props} />);
            const addButton = screen.getByText('+ Add an Agent');
            fireEvent.click(addButton);
            expect(mockOnChange).toHaveBeenCalledWith([
                expect.objectContaining({
                    action: Action.DELETE,
                    party: expect.objectContaining({
                        endDate: dayjs.utc().format('YYYY-MM-DD'),
                    }),
                }),
                expect.objectContaining({ action: Action.ADD }),
            ]);
        });

        it('should only mark PRIMARYSERVICINGAGENT for deletion when adding new agent (FNWL carrier)', () => {
            const servicingAgent = createMockAgent({
                partyRole: 'PRIMARYSERVICINGAGENT',
            });
            const writingAgent = createMockAgent({
                partyRole: 'PRIMARYWRITINGAGENT',
            });
            const props = createMockProps({
                value: [servicingAgent, writingAgent],
                formContext: { customData: { carrier: 'FNWL' } },
            });
            render(<AgentTransactionAccordion {...props} />);
            const addButton = screen.getByText('+ Add an Agent');
            fireEvent.click(addButton);
            const calls = mockOnChange.mock.calls[0][0];
            const deletedAgent = calls.find(
                (a: any) => a.action === Action.DELETE
            );
            const noneAgent = calls.find((a: any) => a.action === Action.NONE);
            expect(deletedAgent.partyRole).toBe('PRIMARYSERVICINGAGENT');
            expect(noneAgent.partyRole).toBe('PRIMARYWRITINGAGENT');
        });

        it('should not mark agents with ADD action for deletion', () => {
            const newAgent = createMockAgent({ action: Action.ADD });
            const existingAgent = createMockAgent();
            const props = createMockProps({
                value: [existingAgent, newAgent],
                formContext: { customData: { carrier: 'WELB' } },
            });
            render(<AgentTransactionAccordion {...props} />);
            const addButton = screen.getByText('+ Add an Agent');
            fireEvent.click(addButton);
            const calls = mockOnChange.mock.calls[0][0];
            const addAgents = calls.filter((a: any) => a.action === Action.ADD);
            expect(addAgents).toHaveLength(2);
        });
    });

    describe('Remove Agent Functionality', () => {
        it('should show remove button for agents with ADD action', () => {
            const newAgent = createMockAgent({ action: Action.ADD });
            const props = createMockProps({ value: [newAgent] });
            render(<AgentTransactionAccordion {...props} />);
            const removeButtons = screen
                .getAllByRole('button')
                .filter((btn) =>
                    btn.querySelector('svg path[d*="M6 18L18 6M6 6l12 12"]')
                );
            expect(removeButtons.length).toBeGreaterThan(0);
        });

        it('should remove agent when remove button is clicked', () => {
            const newAgent = createMockAgent({ action: Action.ADD });
            const props = createMockProps({ value: [newAgent] });
            render(<AgentTransactionAccordion {...props} />);
            const removeButtons = screen
                .getAllByRole('button')
                .filter((btn) =>
                    btn.querySelector('svg path[d*="M6 18L18 6M6 6l12 12"]')
                );
            fireEvent.click(removeButtons[0]);
            expect(mockOnChange).toHaveBeenCalledWith([]);
        });

        it('should not show remove button in readonly mode', () => {
            const newAgent = createMockAgent({ action: Action.ADD });
            const props = createMockProps({
                value: [newAgent],
                readonly: true,
            });
            render(<AgentTransactionAccordion {...props} />);
            const removeButtons = screen
                .queryAllByRole('button')
                .filter((btn) =>
                    btn.querySelector('svg path[d*="M6 18L18 6M6 6l12 12"]')
                );
            expect(removeButtons).toHaveLength(0);
        });
    });

    describe('Delete Checkbox Functionality', () => {
        it('should show delete checkbox for existing agents when showDeleteBtn is true', () => {
            const existingAgent = createMockAgent();
            const props = createMockProps({ value: [existingAgent] });
            render(<AgentTransactionAccordion {...props} />);
            expect(screen.getByTestId('checkbox-remove-0')).toBeInTheDocument();
        });

        it('should not show delete checkbox when showDeleteBtn is false', () => {
            const existingAgent = createMockAgent();
            const props = createMockProps({
                value: [existingAgent],
                options: { showDeleteBtn: false },
            });
            render(<AgentTransactionAccordion {...props} />);
            expect(
                screen.queryByTestId('checkbox-remove-0')
            ).not.toBeInTheDocument();
        });

        it('should mark agent for deletion when checkbox is checked', () => {
            const existingAgent = createMockAgent();
            const props = createMockProps({ value: [existingAgent] });
            render(<AgentTransactionAccordion {...props} />);
            const checkbox = screen.getByTestId('checkbox-input-remove-0');
            fireEvent.click(checkbox);
            expect(mockOnChange).toHaveBeenCalledWith([
                expect.objectContaining({
                    action: Action.DELETE,
                    party: expect.objectContaining({
                        endDate: dayjs.utc().format('YYYY-MM-DD'),
                    }),
                }),
            ]);
        });

        it('should unmark agent for deletion when checkbox is unchecked', () => {
            const deletedAgent = createMockAgent({
                action: Action.DELETE,
                party: { ...createMockAgent().party, endDate: '2024-01-15' },
            });
            const props = createMockProps({ value: [deletedAgent] });
            render(<AgentTransactionAccordion {...props} />);
            const checkbox = screen.getByTestId('checkbox-input-remove-0');
            fireEvent.click(checkbox);
            // When unchecking, it tries to restore original endDate, but since we don't have original data, endDate stays as is
            expect(mockOnChange).toHaveBeenCalledWith([
                expect.objectContaining({ action: Action.NONE }),
            ]);
        });
    });

    describe('Agent Item Change', () => {
        it('should update agent when ObjectField changes', async () => {
            const agent = createMockAgent();
            const props = createMockProps({ value: [agent] });
            render(<AgentTransactionAccordion {...props} />);
            const input = screen.getByTestId('object-field-input');
            fireEvent.change(input, { target: { value: '50' } });
            await waitFor(() => {
                expect(mockOnChange).toHaveBeenCalledWith([
                    expect.objectContaining({
                        party: expect.objectContaining({
                            partyPercentage: '50',
                        }),
                    }),
                ]);
            });
        });

        it('should keep ADD action when changing agent with ADD action', async () => {
            const newAgent = createMockAgent({ action: Action.ADD });
            const props = createMockProps({ value: [newAgent] });
            render(<AgentTransactionAccordion {...props} />);
            const input = screen.getByTestId('object-field-input');
            fireEvent.change(input, { target: { value: '75' } });
            await waitFor(() => {
                const calls =
                    mockOnChange.mock.calls[
                        mockOnChange.mock.calls.length - 1
                    ][0];
                expect(calls[0].action).toBe(Action.ADD);
            });
        });
    });

    describe('UI Schema Generation', () => {
        it('should return readonly uiSchema for existing agents', () => {
            const existingAgent = createMockAgent();
            const props = createMockProps({ value: [existingAgent] });
            render(<AgentTransactionAccordion {...props} />);
            expect(mockObjectField).toHaveBeenCalledWith(
                expect.objectContaining({
                    uiSchema: expect.objectContaining({
                        party: expect.objectContaining({
                            'ui:readonly': true,
                            partyPercentage: expect.objectContaining({
                                'ui:readonly': false,
                            }),
                        }),
                        partyRole: expect.objectContaining({
                            'ui:readonly': true,
                        }),
                    }),
                }),
                expect.anything()
            );
        });

        it('should set partyPercentage as readonly when component is readonly', () => {
            const existingAgent = createMockAgent();
            const props = createMockProps({
                value: [existingAgent],
                readonly: true,
            });
            render(<AgentTransactionAccordion {...props} />);
            expect(mockObjectField).toHaveBeenCalledWith(
                expect.objectContaining({
                    uiSchema: expect.objectContaining({
                        party: expect.objectContaining({
                            partyPercentage: expect.objectContaining({
                                'ui:readonly': true,
                            }),
                        }),
                    }),
                }),
                expect.anything()
            );
        });
    });

    describe('Visual States', () => {
        it('should apply gray background to agents marked for deletion', () => {
            const deletedAgent = createMockAgent({ action: Action.DELETE });
            const props = createMockProps({ value: [deletedAgent] });
            const { container } = render(
                <AgentTransactionAccordion {...props} />
            );
            const accordion = container.querySelector('.bg-gray-50');
            expect(accordion).toBeInTheDocument();
        });

        it('should disable ObjectField for agents marked for deletion', () => {
            const deletedAgent = createMockAgent({ action: Action.DELETE });
            const props = createMockProps({ value: [deletedAgent] });
            render(<AgentTransactionAccordion {...props} />);
            expect(mockObjectField).toHaveBeenCalledWith(
                expect.objectContaining({ disabled: true }),
                expect.anything()
            );
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty value array', () => {
            const props = createMockProps({ value: [] });
            render(<AgentTransactionAccordion {...props} />);
            expect(screen.getByText('+ Add an Agent')).toBeInTheDocument();
        });

        it('should handle agents without firstName', () => {
            const agent = createMockAgent({
                party: {
                    ...createMockAgent().party,
                    firstName: '',
                    lastName: 'Doe',
                },
            });
            const props = createMockProps({ value: [agent] });
            render(<AgentTransactionAccordion {...props} />);
            expect(screen.getByText('Doe')).toBeInTheDocument();
        });

        it('should handle agents without lastName', () => {
            const agent = createMockAgent({
                party: {
                    ...createMockAgent().party,
                    firstName: 'John',
                    lastName: '',
                },
            });
            const props = createMockProps({ value: [agent] });
            render(<AgentTransactionAccordion {...props} />);
            expect(screen.getByText('John')).toBeInTheDocument();
        });

        it('should handle undefined carrier in formContext', () => {
            const existingAgent = createMockAgent();
            const props = createMockProps({
                value: [existingAgent],
                formContext: { customData: { carrier: undefined } },
            });
            render(<AgentTransactionAccordion {...props} />);
            const addButton = screen.getByText('+ Add an Agent');
            fireEvent.click(addButton);
            expect(mockOnChange).toHaveBeenCalled();
        });
    });
});
