import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getLinkedCases } from '@deps/queries/api/v1/linked-cases';

import LinkedCases from './linked-cases';
import { CaseStatus, LinkType } from './utils';

jest.mock('@deps/queries/api/v1/linked-cases');

const changeSideSheetContent = jest.fn();
const handleOpen = jest.fn();

jest.mock('@deps/contexts/SideSheetContext', () => ({
    useSideSheetContextLegacy: () => ({
        changeSideSheetContent,
        handleOpen,
    }),
}));

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children }: any) => children,
}));

const mockedGetLinkedCases = getLinkedCases as jest.Mock;

/* ---------------------- */
/* React Query Test Setup */
/* ---------------------- */

const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

const renderComponent = (ui: React.ReactElement) => {
    const queryClient = createTestQueryClient();

    return render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
};

/* ---------------------- */
/* Test Data Builder */
/* ---------------------- */

const buildCase = (status: CaseStatus) => ({
    linkType: LinkType.Related,
    linkReason: 'Test reason',
    caseDetails: { process: 'Loan' },
    associatedCaseDetails: {
        id: '123',
        process: 'Loan',
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
});

/* ---------------------- */
/* Tests */
/* ---------------------- */

describe('LinkedCases', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders info banner for in-progress cases', async () => {
        mockedGetLinkedCases.mockResolvedValue({
            linkedCases: [buildCase(CaseStatus.InProgress)],
        });

        renderComponent(<LinkedCases caseId="123" />);

        const banner = await screen.findByTestId('banner-alert');

        expect(banner).toBeInTheDocument();
        expect(banner).toHaveTextContent('Loan');
    });

    it('renders success banner for completed cases', async () => {
        mockedGetLinkedCases.mockResolvedValue({
            linkedCases: [buildCase(CaseStatus.Completed)],
        });

        renderComponent(<LinkedCases caseId="123" />);

        expect(
            await screen.findByText('allFields.requestForProcessCompleted')
        ).toBeInTheDocument();
    });

    it('renders view details button for multiple cases', async () => {
        mockedGetLinkedCases.mockResolvedValue({
            linkedCases: [
                buildCase(CaseStatus.InProgress),
                buildCase(CaseStatus.InProgress),
            ],
        });

        renderComponent(<LinkedCases caseId="123" />);

        const button = await screen.findByRole('button', {
            name: 'allFields.viewDetails',
        });

        expect(button).toBeInTheDocument();
    });

    it('opens side sheet when view details clicked', async () => {
        mockedGetLinkedCases.mockResolvedValue({
            linkedCases: [
                buildCase(CaseStatus.InProgress),
                buildCase(CaseStatus.InProgress),
            ],
        });

        renderComponent(<LinkedCases caseId="123" />);

        const button = await screen.findByRole('button', {
            name: 'allFields.viewDetails',
        });

        await userEvent.click(button);

        expect(changeSideSheetContent).toHaveBeenCalled();
        expect(handleOpen).toHaveBeenCalledWith(true);
    });

    it('renders error toast when API fails', async () => {
        mockedGetLinkedCases.mockRejectedValue(new Error());

        renderComponent(<LinkedCases caseId="123" />);

        expect(
            await screen.findByText('allFields.unableToFetchRelatedCase')
        ).toBeInTheDocument();
    });
});
