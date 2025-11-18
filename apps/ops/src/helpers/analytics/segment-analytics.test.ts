import { cleanup } from '@testing-library/react';

import { SegmentTrackedEventName } from '@deps/types/segment-analytics';

import {
    buttonClickedTrackEvent,
    filterAppliedTrackEvent,
    segmentAnalyticsIdentifyUserAndPage,
    segmentAnalyticsTrackEvent,
} from './segment-analytics';

// NOTE: Access internal helpers for targeted tests via import alias if exported.
// If not exported in future refactors, these tests can validate via window.analytics spies instead.

describe('analytics/segment-analytics', () => {
    const user = {
        partyId: 'party-123',
        email: 'user@example.com',
        name: 'Test User',
        sid: 'session-abc',
    } as any;

    let warnSpy: jest.SpyInstance;

    beforeEach(() => {
        warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        (window as any).analytics = undefined;
    });

    afterEach(() => {
        warnSpy.mockRestore();
        // Ensure we cleanup any testing-library hooks if added later
        cleanup();
    });

    describe('segmentAnalyticsIdentifyUserAndPage', () => {
        it('should warn and return when window.analytics is not loaded', () => {
            segmentAnalyticsIdentifyUserAndPage(
                user,
                'Dashboard' as any,
                {
                    appVersion: '1.0.0',
                } as any
            );

            expect(warnSpy).toHaveBeenCalledWith(
                'Segment Analytics.js not loaded'
            );
        });

        it('should identify user and call page with merged props when analytics is present', () => {
            const identify = jest.fn();
            const page = jest.fn();
            (window as any).analytics = { identify, page };

            const pageProps = { appVersion: '1.0.0', featureFlag: 'A' } as any;
            segmentAnalyticsIdentifyUserAndPage(
                user,
                'Dashboard' as any,
                pageProps
            );

            expect(identify).toHaveBeenCalledWith('party-123', {
                email: 'user@example.com',
                name: 'Test User',
                session_id: 'session-abc',
            });
            expect(page).toHaveBeenCalledWith('Dashboard', {
                session_id: 'session-abc',
                userPartyId: 'party-123',
                appVersion: '1.0.0',
                featureFlag: 'A',
            });
        });
    });

    describe('segmentAnalyticsIdentify (via analytics identify)', () => {
        it('should warn when identify method is missing', () => {
            (window as any).analytics = {};
            segmentAnalyticsIdentifyUserAndPage(user, 'Any' as any, {} as any);

            expect(warnSpy).toHaveBeenCalledWith(
                'window.analytics.identify() not found'
            );
        });

        it('should warn when user is undefined', () => {
            const identify = jest.fn();
            const page = jest.fn();
            (window as any).analytics = { identify, page };

            segmentAnalyticsIdentifyUserAndPage(
                undefined as any,
                'Any' as any,
                {} as any
            );

            expect(warnSpy).toHaveBeenCalledWith(
                'user for window.analytics.identify() undefined'
            );
            expect(identify).not.toHaveBeenCalled();
        });
    });

    describe('segmentAnalyticsPage (via identifyUserAndPage)', () => {
        it('should warn when page method is missing', () => {
            (window as any).analytics = { identify: jest.fn() };

            segmentAnalyticsIdentifyUserAndPage(
                user,
                'Details' as any,
                {
                    foo: 'bar',
                } as any
            );

            expect(warnSpy).toHaveBeenCalledWith(
                'window.analytics.page() not found'
            );
        });

        it('should call analytics.page with defaults and extra props', () => {
            const identify = jest.fn();
            const page = jest.fn();
            (window as any).analytics = { identify, page };

            segmentAnalyticsIdentifyUserAndPage(
                user,
                'Details' as any,
                {
                    foo: 'bar',
                } as any
            );

            expect(page).toHaveBeenCalledWith('Details', {
                session_id: 'session-abc',
                userPartyId: 'party-123',
                foo: 'bar',
            });
        });
    });

    describe('segmentAnalyticsTrackEvent', () => {
        it('should warn when track method is missing', () => {
            (window as any).analytics = {};

            segmentAnalyticsTrackEvent('CustomEvent', { a: 1 });

            expect(warnSpy).toHaveBeenCalledWith(
                'window.analytics.track() not found'
            );
        });

        it('should call analytics.track with event name and props', () => {
            const track = jest.fn();
            (window as any).analytics = { track };

            segmentAnalyticsTrackEvent('CustomEvent', { a: 1, b: 'x' });

            expect(track).toHaveBeenCalledWith('CustomEvent', { a: 1, b: 'x' });
        });
    });

    describe('wrapper events', () => {
        it('buttonClickedTrackEvent should emit with correct SegmentTrackedEventName', () => {
            const track = jest.fn();
            (window as any).analytics = { track };

            buttonClickedTrackEvent({
                buttonName: 'Save',
                context: 'Header',
            } as any);

            expect(track).toHaveBeenCalledWith(
                SegmentTrackedEventName.ButtonClicked,
                { buttonName: 'Save', context: 'Header' }
            );
        });

        it('filterAppliedTrackEvent should emit with correct SegmentTrackedEventName', () => {
            const track = jest.fn();
            (window as any).analytics = { track };

            filterAppliedTrackEvent({
                filterName: 'status',
                filterValue: 'open',
            } as any);

            expect(track).toHaveBeenCalledWith(
                SegmentTrackedEventName.FilterApplied,
                { filterName: 'status', filterValue: 'open' }
            );
        });
    });
});
