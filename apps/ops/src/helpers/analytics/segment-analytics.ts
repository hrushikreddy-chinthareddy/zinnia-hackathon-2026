import { UserProfile } from "@deps/models/user-profile";
import { SegmentPageName, SegmentProps } from "@deps/types/segment-analytics";

const segmentAnalyticsIdentifyUserAndPage = (
    user: UserProfile | undefined,
    pageName: SegmentPageName,
    pageProps: SegmentProps
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

const segmentAnalyticsPage = (pageName: SegmentPageName, pageProps?: SegmentProps) => {
    if (!window.analytics.page) {
        console.warn('window.analytics.page() not found');

        return;
    }
    window.analytics.page(pageName, { ...pageProps });
}

const segmentAnalyticsTrackEvent = (eventName: string, eventProps?: SegmentProps) => {
    if (!window.analytics.track) {
        console.warn('window.analytics.track() not found');

        return;
    }

    window.analytics.track(eventName, { ...eventProps });
}


export {
    segmentAnalyticsIdentifyUserAndPage,
    segmentAnalyticsTrackEvent,    
};

