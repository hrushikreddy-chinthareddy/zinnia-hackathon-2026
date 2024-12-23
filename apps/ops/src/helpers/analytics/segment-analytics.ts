import { UserProfile } from '@deps/models/user-profile';
import { SegmentPageName, SegmentPageProps } from '@deps/types/segment-analytics';

const segmentAnalyticsIdentifyUserAndPage = (user: UserProfile | undefined, pageName: SegmentPageName, pageProps: SegmentPageProps) => {
    if (!window?.analytics) {
        console.warn('Segment Analytics.js not loaded');

        return;
    }

    segmentAnalyticsIdentify(user);
    segmentAnalyticsPage(pageName, user, { ...pageProps });
};

const segmentAnalyticsIdentify = (user: UserProfile | undefined) => {
    if (!window?.analytics?.identify) {
        console.warn('window.analytics.identify() not found');

        return;
    }

    if (!user) {
        console.warn('user for window.analytics.identify() undefined');

        return;
    }

    window.analytics.identify(`${user.partyId}`, {
        email: `${user.email}`,
        name: `${user.name}`,
        session_id: `${user.sid}`,
    });
};

const segmentAnalyticsPage = (pageName: SegmentPageName, user: UserProfile | undefined, pageProps?: SegmentPageProps) => {
    if (!window?.analytics?.page) {
        console.warn('window.analytics.page() not found');

        return;
    }
    window.analytics.page(pageName, { session_id: user?.sid, userPartyId: user?.partyId, ...pageProps });
};

function segmentAnalyticsTrackEvent<T>(eventName: string, eventProps?: T) {
    if (!window?.analytics?.track) {
        console.warn('window.analytics.track() not found');

        return;
    }

    window.analytics.track(eventName, { ...eventProps });
}

export { segmentAnalyticsIdentifyUserAndPage, segmentAnalyticsTrackEvent };
