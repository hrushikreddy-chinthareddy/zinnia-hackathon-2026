import { renderHook } from '@testing-library/react';

import { segmentAnalyticsIdentifyUserAndPage } from '@deps/helpers/analytics/segment-analytics';
import { UserProfile } from '@deps/models/user-profile';
import {
    SegmentPageName,
    SegmentPageProps,
} from '@deps/types/segment-analytics';

import { useSegmentPageTracker } from './useSegmentPageTracker';

jest.mock('@deps/helpers/analytics/segment-analytics', () => ({
    segmentAnalyticsIdentifyUserAndPage: jest.fn(),
}));

describe('useSegmentPageTracker', () => {
    const stableUser: UserProfile = {
        nickname: 'testuser',
        name: 'Test User',
        picture: 'https://example.com/picture.jpg',
        updated_at: new Date().toISOString(),
        email: 'test@example.com',
        email_verified: true,
        sid: 'session-id-123',
        sub: 'auth0|abcdef',
        partyId: 'party-xyz',
        user_metadata: {
            communication_mode: 'email',
        },
        app_metadata: {
            company: 'TestCorp',
        },
    };

    const stablePageProps: SegmentPageProps = {
        productType: 'termInsurance',
        journeyMode: 'digital',
    };

    const stablePageName = SegmentPageName.CaseDetails;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls segmentAnalyticsIdentifyUserAndPage once with correct arguments', () => {
        renderHook(() =>
            useSegmentPageTracker(stableUser, stablePageName, stablePageProps)
        );

        expect(segmentAnalyticsIdentifyUserAndPage).toHaveBeenCalledTimes(1);
        expect(segmentAnalyticsIdentifyUserAndPage).toHaveBeenCalledWith(
            stableUser,
            stablePageName,
            stablePageProps
        );
    });

    it('does not call the function again on re-render', () => {
        const { rerender } = renderHook(
            ({ user, pageName, pageProps }) =>
                useSegmentPageTracker(user, pageName, pageProps),
            {
                initialProps: {
                    user: stableUser,
                    pageName: stablePageName,
                    pageProps: stablePageProps,
                },
            }
        );

        rerender({
            user: stableUser,
            pageName: stablePageName,
            pageProps: stablePageProps,
        });

        expect(segmentAnalyticsIdentifyUserAndPage).toHaveBeenCalledTimes(1);
    });
});
