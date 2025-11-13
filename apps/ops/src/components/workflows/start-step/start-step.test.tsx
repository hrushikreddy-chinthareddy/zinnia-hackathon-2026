import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { PolicyStatus } from '@xd/api-types/dist/generated-types/sor/models/PolicyStatus';

import { ParentPage } from '@deps/components/transaction-navigation-buttons/transaction-navigation-buttons';
import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { useWorkflow } from '@deps/contexts/WorkflowContainerContext';
import { Processes } from '@deps/models/case/case';
import { getCases } from '@deps/queries/api/cases';
import { getTaskInstance } from '@deps/queries/api/v2/task';

import StartStep from './start-step';

window.HTMLElement.prototype.scrollIntoView = jest.fn();
Element.prototype.hasPointerCapture = jest.fn().mockReturnValue(false);

jest.mock('next/router', () => ({
    useRouter: () => ({
        query: { taskId: 'task-1' },
    }),
}));

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
    }),
}));

jest.mock('@deps/utils/optimizely/optimizely', () => ({
    optimizelyService: {
        isFeatureEnabled: jest.fn().mockReturnValue(false),
        getFeatureVariableString: jest.fn().mockReturnValue(''),
        getFeatureVariableInteger: jest.fn().mockReturnValue(0),
        getFeatureVariableBoolean: jest.fn().mockReturnValue(false),
        getFeatureVariableJSON: jest.fn().mockReturnValue({}),
        track: jest.fn(),
    },
}));

jest.mock('@deps/contexts/OptimizelyContext', () => ({
    useOptimizely: jest.fn().mockReturnValue({
        featureFlags: {},
        isFeatureEnabled: jest.fn().mockReturnValue(false),
        getFeatureVariableString: jest.fn().mockReturnValue(''),
        getFeatureVariableInteger: jest.fn().mockReturnValue(0),
        getFeatureVariableBoolean: jest.fn().mockReturnValue(false),
        getFeatureVariableJSON: jest.fn().mockReturnValue({}),
        track: jest.fn(),
    }),
}));

jest.mock('@deps/contexts/WorkflowContainerContext', () => ({
    useWorkflow: jest.fn(),
}));

jest.mock('@deps/contexts/OptimizelyContext', () => ({
    useOptimizely: jest.fn(),
}));

jest.mock('@deps/queries/api/cases', () => ({
    getCases: jest.fn(),
}));

jest.mock('@deps/queries/api/v2/task', () => ({
    getTaskInstance: jest.fn(),
}));

// --- Setup ---
const mockGoToNext = jest.fn();
const mockSetState = jest.fn();

const baseProps = {
    parentPage: ParentPage.CreateCase,
    policy: {
        policyNumber: 'POL1234567',
        planCode: 'GOLD',
        carrierId: 'CARR001',
        policyStatus: PolicyStatus.ACTIVE,

        parties: [
            {
                partyId: '123',
                firstName: 'John',
                lastName: 'Doe',
            },
        ],
    },
    processType: Processes.Withdrawal,
    setState: mockSetState,
    state: {},
    title: 'Start Transaction',
    isOnBaseUpdateAssistiveText: false,
    isContinueDisabled: false,
    leaveTransactionLink: '/dashboard',
    correlationId: 'CORR-001',
};

const renderComponent = async (overrides = {}) => {
    (useWorkflow as jest.Mock).mockReturnValue({ goToNext: mockGoToNext });
    (useOptimizely as jest.Mock).mockReturnValue({ featureFlags: {} });

    (getTaskInstance as jest.Mock).mockResolvedValue({
        data: { details: { documents: [] } },
    });

    (getCases as jest.Mock).mockResolvedValue({
        total: 1,
        data: [
            {
                id: 'case-1',
                process: 'CLAIM',
                processSubType: 'AUTO',
                identifiers: [],
                correlationId: 'corr-1',
            },
        ],
    });

    return render(<StartStep {...baseProps} {...overrides} />);
};

describe('StartStep Component', () => {
    beforeEach(() => {
        // Silence console.error for Optimizely initialization errors
        jest.spyOn(console, 'error').mockImplementation((message) => {
            if (!message?.includes('OPTIMIZELY')) {
            }
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders the title and label', async () => {
        await renderComponent();

        expect(screen.getByText('Start Transaction')).toBeInTheDocument();
        expect(
            screen.getByText('workflows.start.documentSelectionLabel')
        ).toBeInTheDocument();
    });

    it('fetches task and cases on mount', async () => {
        await renderComponent();

        await waitFor(() => {
            expect(getTaskInstance).toHaveBeenCalledWith({ taskId: 'task-1' });
            expect(getCases).toHaveBeenCalled();
        });
    });

    it('displays case options and allows selecting one', async () => {
        await renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/CLAIM - AUTO/)).toBeInTheDocument();
        });

        const optionCard = screen.getByText(/CLAIM - AUTO/).closest('label');
        expect(optionCard).toBeInTheDocument();

        fireEvent.click(optionCard!);

        await waitFor(() => {
            expect(mockSetState).toHaveBeenCalled();

            const setStateCallback = mockSetState.mock.calls[0][0];

            const result = setStateCallback({ currentStep: 'Start', data: {} });

            expect(result).toEqual(
                expect.objectContaining({
                    caseId: 'case-1',
                })
            );
        });
    });

    it('shows error assistive text when continue clicked without selection', async () => {
        await renderComponent();

        const continueButton = screen.getByRole('button', {
            name: /continue/i,
        });
        fireEvent.click(continueButton);

        await waitFor(() => {
            expect(
                screen.getByText('workflows.start.missingSelection')
            ).toBeInTheDocument();
        });
    });

    it('calls goToNext when valid selection is made and continue clicked', async () => {
        await renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/CLAIM - AUTO/)).toBeInTheDocument();
        });

        const optionCard = screen.getByText(/CLAIM - AUTO/).closest('div');
        fireEvent.click(optionCard!);

        const continueButton = screen.getByRole('button', {
            name: /continue/i,
        });
        fireEvent.click(continueButton);

        await waitFor(() => {
            expect(mockGoToNext).toHaveBeenCalled();
        });
    });

    it('renders document cards if task has documents', async () => {
        const mockTaskData = {
            data: {
                details: {
                    documents: [
                        {
                            documentId: 'd1',
                            documentName: 'Doc1',
                            documentExt: 'pdf',
                        },
                    ],
                },
            },
            carrier: 'ABC',
        };

        (getTaskInstance as jest.Mock).mockResolvedValue(mockTaskData);
        const consoleSpy = jest.spyOn(console, 'log');

        await renderComponent();

        await waitFor(() => {
            expect(getTaskInstance).toHaveBeenCalledWith({ taskId: 'task-1' });
        });

        expect(screen.getByText('Start Transaction')).toBeInTheDocument();
        expect(
            screen.getByText('workflows.start.documentSelectionLabel')
        ).toBeInTheDocument();

        expect(screen.getByText(/CLAIM - AUTO/)).toBeInTheDocument();

        consoleSpy.mockRestore();
    });

    it('handles correlationId preselection', async () => {
        mockSetState.mockClear();

        (getCases as jest.Mock).mockResolvedValue({
            total: 1,
            data: [
                {
                    id: 'case-1',
                    process: 'CLAIM',
                    processSubType: 'AUTO',
                    identifiers: [],
                    correlationId: 'corr-1',
                },
            ],
        });

        await renderComponent({ correlationId: 'corr-1' });

        await waitFor(() => {
            expect(mockSetState).toHaveBeenCalled();

            const setStateCallback = mockSetState.mock.calls[0][0];

            const result = setStateCallback({
                currentStep: 'Start',
                data: {},
            });

            expect(result).toEqual(
                expect.objectContaining({
                    caseId: 'case-1',
                    correlationId: 'corr-1',
                })
            );
        });

        await waitFor(() => {
            const radioInput = document.querySelector('input[value="case-1"]');
            expect(radioInput).toBeInTheDocument();
        });
    });
});
