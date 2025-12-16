import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as nextRouter from 'next/router';

import { PolicyRole, RoleLabel } from '@deps/constants/policy';
import { Statuses } from '@deps/models/case/case';
import { TransactionResponseStatus } from '@deps/queries/api/bpm';
import { submitRoleChange } from '@deps/queries/api/role-change';
import { StatusCode } from '@deps/queries/api-utils/baseAPIClient';

import ConfirmStep from './confirm-step';

const mockSubmitRoleChange = submitRoleChange as jest.Mock;

// Mocks
const pushMock = jest.fn();
jest.spyOn(nextRouter, 'useRouter').mockImplementation(() => ({
    push: pushMock,
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    basePath: '',
    back: jest.fn(),
    beforePopState: jest.fn(),
    prefetch: jest.fn().mockResolvedValue(undefined),
    reload: jest.fn(),
    replace: jest.fn(),
    isFallback: false,
    isReady: true,
    isLocaleDomain: false,
    isPreview: false,
    forward: jest.fn(),
    events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
    },
}));

jest.mock('next-i18next', () => ({
    useTranslation: () => ({
        t: (k: string, opts?: any) =>
            opts && opts.roleLabel ? `${k}-${opts.roleLabel}` : k,
        i18n: { language: 'en' },
    }),
}));
jest.mock('@deps/contexts/RoleChangeContext', () => ({
    useRoleChange: () => ({
        roleData: {
            validationResponse: { status: TransactionResponseStatus.Success },
            caseId: null,
        },
        existingRoleData: [{ party: { partyId: 'party123' } }],
        removedTpdIndex: null,
        addRole: false,
    }),
}));
jest.mock('@deps/queries/api/role-change', () => ({
    submitRoleChange: jest.fn(),
    deleteTPDRole: jest.fn(),
}));
jest.mock('../../role-change-helper', () => ({
    buildRoleChangeRequestBody: jest.fn(() => ({})),
    buildDeleteTPDRequestBody: jest.fn(() => ({})),
}));

jest.mock('@deps/contexts/PermissionsContext', () => ({
    usePermissionsContext: () => ({
        sessionId: 'test-session-id',
        partyId: 'test-user-id',
    }),
}));

jest.mock('@deps/helpers/analytics/segment-analytics', () => ({
    segmentAnalyticsTrackEvent: jest.fn(),
}));

jest.mock('@deps/helpers/analytics/submit-transaction-event', () => ({
    buildNonFinancialTransactionsSubmittedEvent: jest.fn(() => ({})),
}));

const mockPolicy = {
    product: { planCode: 'PLAN1' },
    policyNumber: 'PN123',
};

describe('ConfirmStep', () => {
    beforeAll(() => {
        const mockAnalytics = {
            page: jest.fn(),
            track: jest.fn(),
        };
        (window as any).analytics = mockAnalytics;
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows loader on initial render', async () => {
        render(
            <ConfirmStep
                policy={mockPolicy as any}
                role={PolicyRole.OWNER}
                leaveTransactionLink="/leave"
                roleLabel={RoleLabel.OWNER}
            />
        );
        await waitFor(() => {
            expect(screen.getByTestId('test-loader')).toBeInTheDocument();
        });
    });

    it('shows error card if submission fails', async () => {
        mockSubmitRoleChange.mockResolvedValueOnce({
            status: StatusCode.BadRequest,
        });
        render(
            <ConfirmStep
                policy={mockPolicy as any}
                role={PolicyRole.OWNER}
                leaveTransactionLink="/leave"
                roleLabel={RoleLabel.OWNER}
            />
        );
        await waitFor(() => {
            expect(screen.getByText('updateRole-Owner')).toBeInTheDocument();
        });
    });

    it('shows NIGO message if caseStatus is Exception', async () => {
        mockSubmitRoleChange.mockResolvedValueOnce({
            status: StatusCode.Accepted,
            data: { caseStatus: Statuses.Exception, caseId: 'CASE123' },
        });
        render(
            <ConfirmStep
                policy={mockPolicy as any}
                role={PolicyRole.OWNER}
                leaveTransactionLink="/leave"
                roleLabel={RoleLabel.OWNER}
            />
        );
        await waitFor(() => {
            expect(screen.getByText('nigo')).toBeInTheDocument();
        });
    });

    it('shows success message and goToCase CTA if case is accepted', async () => {
        mockSubmitRoleChange.mockResolvedValueOnce({
            status: StatusCode.Accepted,
            data: { caseStatus: Statuses.Completed, caseId: 'CASE123' },
        });
        render(
            <ConfirmStep
                policy={mockPolicy as any}
                role={PolicyRole.OWNER}
                leaveTransactionLink="/leave"
                roleLabel={RoleLabel.OWNER}
            />
        );
        await waitFor(() => {
            expect(screen.getByText('goToCase')).toBeInTheDocument();
        });
    });

    it('navigates to leaveTransactionLink on close', async () => {
        mockSubmitRoleChange.mockResolvedValueOnce({
            status: StatusCode.Accepted,
            data: { caseStatus: Statuses.Completed, caseId: 'CASE123' },
        });
        render(
            <ConfirmStep
                policy={mockPolicy as any}
                role={PolicyRole.OWNER}
                leaveTransactionLink="/leave"
                roleLabel={RoleLabel.OWNER}
            />
        );
        await waitFor(() => {
            expect(screen.getByText('goToCase')).toBeInTheDocument();
        });
        const closeBtn = screen.getByLabelText('close');
        expect(closeBtn).toBeInTheDocument();
        expect(closeBtn).not.toBeDisabled();
        fireEvent.click(closeBtn);
        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('/leave');
        });
    });
});
