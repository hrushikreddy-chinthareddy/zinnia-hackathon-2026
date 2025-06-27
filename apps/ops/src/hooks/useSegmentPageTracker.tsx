import { useEffect, useState } from 'react';

import { segmentAnalyticsIdentifyUserAndPage } from '@deps/helpers/analytics/segment-analytics';
import { UserProfile } from '@deps/models/user-profile';
import {
    SegmentPageName,
    SegmentPageProps,
} from '@deps/types/segment-analytics';

export const useSegmentPageTracker = (
    user: UserProfile,
    pageName: SegmentPageName,
    pageProps?: SegmentPageProps
) => {
    const [segmentAnalyticsCalled, setSegmentAnalyticsCalled] = useState(false);

    useEffect(() => {
        if (segmentAnalyticsCalled) {
            return;
        }

        segmentAnalyticsIdentifyUserAndPage(user, pageName, pageProps || {});
        setSegmentAnalyticsCalled(true);
        // Using segmentAnalyticsCalled to prevent it but make sure theres not a better way
        // Error handling to ensure a page doesnt have components using more than one of these hooks
    }, [pageName, pageProps, segmentAnalyticsCalled, user]);
};
