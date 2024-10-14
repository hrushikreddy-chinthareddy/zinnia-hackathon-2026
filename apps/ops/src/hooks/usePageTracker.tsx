import { useEffect, useState } from "react";

import segmentAnalyticsIdentifyAndPage from "@deps/helpers/analytics/segment-analytics";
import { UserProfile } from "@deps/models/user-profile";
import { SegmentPageProps } from "@deps/types/segment-alanytics";

const usePageTracker = (user: UserProfile, page: string, props: SegmentPageProps) => {
    const [segmentAnalyticsCalled, setSegmentAnalyticsCalled] = useState(false);
    
    useEffect(() => {
        if (segmentAnalyticsCalled) {
            return
        }
        
        segmentAnalyticsIdentifyAndPage(user, page, props);
        setSegmentAnalyticsCalled(true);

    }, [page, props, segmentAnalyticsCalled, user]);
};

export default usePageTracker;
