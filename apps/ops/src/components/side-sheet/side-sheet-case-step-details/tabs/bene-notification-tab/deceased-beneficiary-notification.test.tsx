import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom';
import {
    DeliveryMethods,
    INotification,
    NotificationStatus,
} from './bene-notification-tab.types';
import { DeceasedBeneficiaryNotification } from './decesed-beneficiary-notification';

jest.mock('next-i18next', () => ({
    useTranslation: () => ({ t: (s: string) => s }),
}));

describe('DeceasedBeneficiaryNotification', () => {
    const baseNotification: INotification = {
        followupScheduleId: 1,
        followupId: 4,
        followupAttemptId: 1,
        notificationName: 'Fourth Request',
        scheduleDateTime: '2025-06-19T11:06:24.361Z',
        deliveryMethod: DeliveryMethods.Faxnumber,
        address: {
            addressId: '743665752',
            addressType: 'DEFAULT',
            addressLine1: '437 N HIGHLAND AVE',
            city: 'LOS ANGELES',
            state: 'CA',
            zipCode: '90036',
            country: 'USA',
        },
        faxNumber: '7853681743',
        followupStatus: NotificationStatus.Exception,
        send: false,
        receive: false,
        statusDateTime: '2025-06-19T11:31:43.903Z',
        dueToResend: false,
        dueToReset: false,
    };

    it('renders status badge and title with translated text', () => {
        render(
            <DeceasedBeneficiaryNotification notification={baseNotification} />
        );
        expect(
            screen.getByTestId('beneficiary-deceased-status-badge')
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                'caseOverview.notifications.beneficiaryDeceasedNotification'
            )
        ).toBeInTheDocument();
    });

    it('#renders without date if statusDateTime is missing', () => {
        render(
            <DeceasedBeneficiaryNotification
                notification={{
                    ...baseNotification,
                    statusDateTime: undefined,
                }}
            />
        );
        expect(
            screen.getByText(
                'caseOverview.notifications.beneficiaryDeceasedNotification'
            )
        ).toBeInTheDocument();
    });
});
