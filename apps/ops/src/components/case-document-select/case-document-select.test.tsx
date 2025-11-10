import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { v4 as uuidV4 } from 'uuid';

import { useOptimizely } from '@deps/contexts/OptimizelyContext';
import { getCaseIdentifierValue } from '@deps/helpers/case-management';
import { CaseIdentifier, Processes } from '@deps/models/case/case';
import { getCases } from '@deps/queries/api/cases';

import CaseDocumentSelect from './case-document-select';

// ---- Mock setup ----
jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('@deps/contexts/OptimizelyContext', () => ({
    useOptimizely: jest.fn(),
}));

jest.mock('@deps/queries/api/cases', () => ({
    getCases: jest.fn(),
}));

jest.mock('@deps/helpers/case-management', () => ({
    getCaseIdentifierValue: jest.fn(),
}));

jest.mock('uuid', () => ({
    v4: jest.fn(),
}));

// ---- Helpers ----
const mockSetCaseDocumentOptions = jest.fn();
const mockSetBody = jest.fn();
const mockSetCurrentErrors = jest.fn();

const baseProps = {
    caseId: '123',
    policyNumber: 'POL1234',
    processType: Processes.AddressChange,
    setBody: console.log,
    setCaseDocumentOptions: console.log,
    setCurrentErrors: console.log,
    setViewState: console.log,
    correlationId: 'abc-xyz',
    caseDocumentOptions: [],
};

describe('CaseDocumentSelect Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useOptimizely as jest.Mock).mockReturnValue({ featureFlags: {} });
        (getCaseIdentifierValue as jest.Mock).mockReturnValue('DOC123');
        (uuidV4 as jest.Mock).mockReturnValue('uuid-1234');
    });

    it('renders label and required indicator when required', async () => {
        render(
            <CaseDocumentSelect
                {...baseProps}
                required
                caseDocumentOptions={[{ caseId: 'c1', value: 'c1' }]}
            />
        );

        expect(
            screen.getByText('transactions.caseDocumentSelect.label')
        ).toBeInTheDocument();
        expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('does not call getCases when caseDocumentOptions already exist', async () => {
        jest.clearAllMocks();

        (getCases as jest.Mock).mockResolvedValue({
            total: 0,
            data: [],
        });

        const props = {
            ...baseProps,
            setCaseDocumentOptions: jest.fn(),
            setViewState: jest.fn(),
            setCurrentErrors: jest.fn(),
            setBody: jest.fn(),
            caseDocumentOptions: [{ caseId: 'c1', value: 'c1' }],
        };

        render(<CaseDocumentSelect {...props} />);

        await waitFor(() => {
            expect(getCases).not.toHaveBeenCalled();
        });
    });

    it('calls getCases when caseDocumentOptions are empty', async () => {
        jest.clearAllMocks();

        (getCases as jest.Mock).mockResolvedValue({
            total: 1,
            data: [
                {
                    id: 'case-1',
                    process: 'CLAIM',
                    processSubType: 'AUTO',
                    identifiers: [
                        {
                            identifier: CaseIdentifier.DocumentNumber,
                            value: 'DOC123',
                        },
                    ],
                    correlationId: 'corr-1',
                },
            ],
        });

        render(
            <CaseDocumentSelect
                {...baseProps}
                caseDocumentOptions={[]} // triggers call
            />
        );

        await waitFor(() => {
            expect(getCases).toHaveBeenCalledWith(
                expect.objectContaining({
                    policyNumber: 'POL1234',
                    process: [Processes.AddressChange],
                }),
                expect.anything()
            );
        });
    });

    it('sets selected caseId automatically when correlationId matches', async () => {
        (getCases as jest.Mock).mockResolvedValue({
            total: 1,
            data: [
                {
                    id: 'case-123',
                    process: 'POLICY',
                    processSubType: 'UPDATE',
                    identifiers: [],
                    correlationId: 'corr-match',
                },
            ],
        });

        const testProps = {
            ...baseProps,
            setBody: mockSetBody, // Use the mock function instead of console.log
            setCaseDocumentOptions: mockSetCaseDocumentOptions, // Use the mock function instead of console.log
        };

        render(
            <CaseDocumentSelect {...testProps} correlationId="corr-match" />
        );

        await waitFor(
            () => {
                expect(mockSetBody).toHaveBeenCalledWith(expect.any(Function));
                expect(mockSetCaseDocumentOptions).toHaveBeenCalled();
            },
            { timeout: 3000 }
        );
    });

    it('renders no-document assistive text when PROCESS_WITHOUT_CASE_DOCUMENT is selected', async () => {
        render(
            <CaseDocumentSelect
                {...baseProps}
                caseId=""
                currentErrors={undefined}
                caseDocumentOptions={[
                    { caseId: '', value: '', documentNumber: 'No Doc' },
                ]}
            />
        );

        expect(
            screen.getByText(
                'transactions.caseDocumentSelect.noDocumentAssistiveText'
            )
        ).toBeInTheDocument();
    });

    it('renders error assistive text when currentErrors.caseId exists', async () => {
        render(
            <CaseDocumentSelect
                {...baseProps}
                caseId="invalid"
                currentErrors={{ caseId: 'Error Message' }}
                caseDocumentOptions={[{ caseId: '1', value: '1' }]}
            />
        );

        expect(screen.getByText('Error Message')).toBeInTheDocument();
    });

    it('renders info assistive text when caseId is selected', async () => {
        render(
            <CaseDocumentSelect
                {...baseProps}
                caseId="selected-case"
                caseDocumentOptions={[
                    { caseId: 'selected-case', value: 'selected-case' },
                ]}
            />
        );

        expect(
            screen.getByText(
                'transactions.caseDocumentSelect.caseSelectionAssistiveText'
            )
        ).toBeInTheDocument();
    });

    it('updates setBody and clears error on card selection', async () => {
        render(
            <CaseDocumentSelect
                {...baseProps}
                caseId=""
                setCurrentErrors={mockSetCurrentErrors}
                setBody={mockSetBody}
                caseDocumentOptions={[{ caseId: 'case-1', value: 'case-1' }]}
            />
        );

        const label = screen.getByText('case-1').closest('label');

        expect(label).not.toBeNull();

        fireEvent.click(label!);

        await waitFor(() => {
            expect(mockSetCurrentErrors).toHaveBeenCalled();
            expect(mockSetBody).toHaveBeenCalledWith(expect.any(Function));
        });
    });

    it('applies disabled styles when body correlationId matches prop correlationId', async () => {
        render(
            <CaseDocumentSelect
                {...baseProps}
                correlationId="abc"
                body={{ correlationId: 'abc', effectiveDate: '' }} // This is needed to trigger the opacity class
                caseDocumentOptions={[
                    { caseId: 'case-1', value: 'case-1', correlationId: 'abc' },
                ]}
            />
        );

        await waitFor(() => {
            expect(screen.getByText('case-1')).toBeInTheDocument();
        });

        // Find the container div that holds all cards
        const containerDiv = screen
            .getByText('case-1')
            .closest('div.flex.flex-col.gap-2');
        expect(containerDiv).toBeInTheDocument();
        expect(containerDiv).toHaveClass('opacity-50');
        expect(containerDiv).toHaveClass('pointer-events-none');
    });
});
