import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';

import {
    DeliveryMethods,
    INotification,
    NotificationStatus,
} from './bene-notification-tab.types';
import { ScheduledNotification } from './scheduled-notification';

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));
jest.mock('next-i18next', () => ({
    useTranslation: () => ({ t: (s: string) => s }),
}));
jest.mock('./notification-item', () => ({
    getPreferredDeliveryIcon: (method: string) => (
        <span data-testid={`icon-${method}`}>{method}</span>
    ),
}));

const baseNotification: INotification = {
    followupScheduleId: 2,
    followupId: 1,
    followupAttemptId: 1,
    notificationName: 'Test Notification',
    scheduleDateTime: '2025-07-23T13:04:29.535Z',
    deliveryMethod: DeliveryMethods.Mail,
    followupStatus: NotificationStatus.Generating,
    send: false,
    receive: false,
    statusDateTime: '2025-07-23T13:04:31.584Z',
    dueToResend: false,
    dueToReset: true,
};

describe('##ScheduledNotification', () => {
    const push = jest.fn();
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ push });
        push.mockClear();
    });

    it('#renders status badge and title', () => {
        render(
            <ScheduledNotification
                notification={baseNotification}
                shouldHideButton={false}
                policyNumber="551006123"
                carrier="FLIC"
                identifier="2a66c678-f166-4a1d-a3f3-c97d92f9b444"
            />
        );
        expect(
            screen.getByTestId('constact-not-established-status-badge')
        ).toBeInTheDocument();
        expect(
            screen.getByText('caseOverview.notifications.scheduledNotification')
        ).toBeInTheDocument();
    });

    it('#shows contact method icons if present', () => {
        render(
            <ScheduledNotification
                notification={{
                    ...baseNotification,
                    address: {
                        addressId: '743684471',
                        addressType: 'RESIDENCE',
                        addressLine1: 'FRESNO 2',
                        addressLine2: '5396 N REESE AVE',
                        city: 'FRESNO',
                        state: 'CA',
                        zipCode: '93722',
                        country: 'USA',
                        correspondenceOnly: false,
                    },
                    faxNumber: '7853681743',
                }}
                shouldHideButton={false}
                policyNumber="551006123"
                carrier="FLIC"
                identifier="2a66c678-f166-4a1d-a3f3-c97d92f9b444"
            />
        );
        expect(screen.getByTestId('icon-MAIL')).toBeInTheDocument();
        expect(screen.getByTestId('icon-FAXNUMBER')).toBeInTheDocument();
    });

    it('#renders and triggers button click', () => {
        render(
            <ScheduledNotification
                notification={baseNotification}
                shouldHideButton={false}
                policyNumber="551006123"
                carrier="FLIC"
                identifier="2a66c678-f166-4a1d-a3f3-c97d92f9b444"
            />
        );
        const btn = screen.getByRole('button');
        fireEvent.click(btn);
        expect(push).toHaveBeenCalledWith(
            '/claims/update-notification-method?policyNumber=551006123&carrier=FLIC&recordId=2a66c678-f166-4a1d-a3f3-c97d92f9b444'
        );
    });

    it('#hides button and contact method UI if shouldHideButton is true', () => {
        render(
            <ScheduledNotification
                notification={baseNotification}
                shouldHideButton={true}
                policyNumber="551006123"
                carrier="FLIC"
                identifier="2a66c678-f166-4a1d-a3f3-c97d92f9b444"
            />
        );
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
        expect(
            screen.queryByText('caseOverview.notifications.contactMethod')
        ).not.toBeInTheDocument();
    });
});
