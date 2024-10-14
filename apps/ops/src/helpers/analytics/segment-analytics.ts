import { UserProfile } from "@deps/models/user-profile";
import { SegmentPageProps } from "@deps/types/segment-alanytics";

const segmentAnalyticsIdentifyAndPage = (
    user: UserProfile | undefined,
    pageName: string,
    pageProps: SegmentPageProps
) => {
    if (!window || !window.analytics) {
        console.warn('Segment Analytics.js not loaded');

        return;
    }

    segmentAnalyticsIdentify(user);
    segmentAnalyticsPage(pageName, { userPartyId: user?.partyId as string, ...pageProps });
}

const segmentAnalyticsIdentify = (user: UserProfile | undefined) => {
    if (!window.analytics.identify) {
        console.warn('window.analytics.identify() not found');

        return;
    }

    if (!user) {
        console.warn('user for window.analytics.identify() undefined');

        return;
    }

    window.analytics.identify(`${user.partyId}`, {
        name: `${user.name}`,
        email: `${user.email}`
    });
}

const segmentAnalyticsPage = (pageName: string, pageProps: SegmentPageProps) => {
    if (!window.analytics.page) {
        console.warn('window.analytics.page() not found');

        return;
    }
    window.analytics.page(pageName, { ...pageProps });
}

export default segmentAnalyticsIdentifyAndPage;
