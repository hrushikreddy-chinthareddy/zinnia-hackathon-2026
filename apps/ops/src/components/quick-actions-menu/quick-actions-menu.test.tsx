import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import QuickActionsMenu from '@deps/components/quick-actions-menu/quick-actions-menu';
import { NOOP } from '@deps/types/constants';

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        push: NOOP,
    })),
}));

describe('QuickActionsMenu Component', () => {
    it('displays trigger with expected label', () => {
        render(<QuickActionsMenu planCode="SBFIXUL1" policyNumber="12345" />);

        expect(screen.getByText('label')).toBeInTheDocument();
    });

    it('opens and closes MenuContextual component', async () => {
        const user = userEvent.setup();
        render(<QuickActionsMenu planCode="SBFIXUL1" policyNumber="12345" />);

        user.click(screen.getByText('label'));
        expect(await screen.findByText('transactions.startAWithdrawal')).toBeInTheDocument();

        user.click(screen.getByText('label'));
        await waitFor(() => {
            expect(screen.queryByText('transactions.startAWithdrawal')).not.toBeInTheDocument();
        });
    });

    it('items contains link to the correct URL', async () => {
        const user = userEvent.setup();
        render(
            <QuickActionsMenu
                planCode="SBFIXUL1"
                policyNumber="12345"
                eligibilityCheck={{ eligibleWithdrawal: true, eligiblePremium: true, eligibleAutopay: true }}
            />
        );

        user.click(screen.getByText('label'));
        const startAWithdrawal = await screen.findByText('transactions.startAWithdrawal');

        expect(startAWithdrawal.closest('a')).toHaveAttribute('href', '/policies/SBFIXUL1/12345/policy/withdrawals/new-withdrawal/');
    });
});
