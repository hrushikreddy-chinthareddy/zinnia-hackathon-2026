import * as ReactQuery from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
jest.mock('@deps/utils/optimizely/flags', () => ({
    FEATURE_FLAGS: {
        OWNER_CHANGE_TRANSACTION: 'OWNER_CHANGE_TRANSACTION',
        JOINT_OWNER_CHANGE_TRANSACTION: 'JOINT_OWNER_CHANGE_TRANSACTION',
        PAYOR_CHANGE_TRANSACTION: 'PAYOR_CHANGE_TRANSACTION',
        THIRD_PARTY_DESIGNEE_TRANSACTION: 'THIRD_PARTY_DESIGNEE_TRANSACTION',
    },
}));

import { segmentAnalyticsTrackEvent } from '@deps/helpers/analytics/segment-analytics';

import ManagePeople from './manage-people';
// Mocks
const useQuery = ReactQuery.useQuery as jest.Mock;
jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
}));
jest.mock('next-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@deps/contexts/OptimizelyContext', () => ({
    useOptimizely: () => ({
        featureFlags: {
            OWNER_CHANGE_TRANSACTION: true,
            JOINT_OWNER_CHANGE_TRANSACTION: true,
            PAYOR_CHANGE_TRANSACTION: true,
            THIRD_PARTY_DESIGNEE_TRANSACTION: true,
        },
    }),
}));
jest.mock('@deps/contexts/PermissionsContext', () => ({
    usePermissionsContext: () => ({ sessionId: 'sess', partyId: 'user123' }),
}));
jest.mock('@deps/helpers/analytics/segment-analytics', () => ({
    segmentAnalyticsTrackEvent: jest.fn(),
}));
jest.mock('@deps/components/menu-contextual/menu-contextual', () => {
    const React = require('react');
    return {
        __esModule: true,
        default: function MockMenuContextual({
            trigger,
            children,
        }: {
            trigger: React.ReactNode;
            children: React.ReactNode;
        }) {
            const [open, setOpen] = React.useState(false);
            return (
                <div data-testid="menu-contextual">
                    <span onClick={() => setOpen(true)}>{trigger}</span>
                    {open && children}
                </div>
            );
        },
    };
});
jest.mock(
    '@deps/components/menu-contextual/menu-contextual-item/menu-contextual-item',
    () => {
        return {
            __esModule: true,
            default: function MockMenuContextualItem(props: {
                content: string;
                disabled?: boolean;
                onClick?: () => void;
            }) {
                return (
                    <button
                        aria-label={props.content}
                        disabled={props.disabled}
                        onClick={props.onClick}
                    >
                        {props.content}
                    </button>
                );
            },
        };
    }
);
describe('ManagePeople', () => {
    const basePolicy = { planCode: 'PLN', policyNumber: '123' };
    beforeEach(() => {
        jest.clearAllMocks();
        useQuery.mockImplementation(({ queryKey }: any) => {
            const key = queryKey[0];
            if (key === 'checkManageOwnerEligibilityQuery')
                return { data: { isEligibleManageOwner: true } };
            if (key === 'checkManageJointOwnerEligibilityQuery')
                return { data: { isEligibleManageJointOwner: false } };
            if (key === 'checkManagePayorEligibilityQuery')
                return { data: { isEligibleManagePayor: false } };
            if (key === 'checkManageThirdPartyDesigneeEligibilityQuery')
                return { data: { isEligibleManageThirdPartyDesignee: false } };
            return { data: {} };
        });
    });
    it('renders all menu items and disables ineligible ones', async () => {
        render(<ManagePeople policy={basePolicy as any} />);
        fireEvent.click(screen.getByTestId('manage-people'));
        const ownerItem = await screen.findByLabelText(
            'site.navLinks.owner.text'
        );
        const jointOwnerItem = await screen.findByLabelText(
            'site.navLinks.jointOwner.text'
        );
        expect(ownerItem).toBeInTheDocument();
        expect(jointOwnerItem).toBeInTheDocument();
        expect(ownerItem).not.toBeDisabled();
        expect(jointOwnerItem).toBeDisabled();
    });
    it('tracks click event when enabled item is clicked', async () => {
        render(<ManagePeople policy={basePolicy as any} />);
        fireEvent.click(screen.getByTestId('manage-people'));
        const ownerItem = await screen.findByLabelText(
            'site.navLinks.owner.text'
        );
        fireEvent.click(ownerItem);
        expect(segmentAnalyticsTrackEvent).toHaveBeenCalledWith(
            'Dropdown Clicked',
            expect.objectContaining({
                contractNumber: '123',
                linkName: 'site.navLinks.owner.text',
                session_id: 'sess',
                userId: 'user123',
            })
        );
    });
    it('does not track click event when disabled item is clicked', async () => {
        render(<ManagePeople policy={basePolicy as any} />);
        fireEvent.click(screen.getByTestId('manage-people'));
        const jointOwnerItem = await screen.findByLabelText(
            'site.navLinks.jointOwner.text'
        );
        fireEvent.click(jointOwnerItem);
        expect(segmentAnalyticsTrackEvent).not.toHaveBeenCalled();
    });
});
