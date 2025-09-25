import { render, screen, fireEvent } from '@testing-library/react';

import {
    DeliveryMethods,
    LetterPartyRoles,
    NotificationStatus,
} from './bene-notification-tab.types';
import { NotificationItem } from './notification-item';

jest.mock('@deps/components/workflows/document/document-card', () => () => (
    <div>Document Card</div>
));

describe('##NotificationItem', () => {
    describe('##For LetterParty as "BENE"', () => {
        it('#should render Bene Packet Details when beneFollowUpLetter.documentId exists', () => {
            const beneNotifcationItem = {
                notificationName: 'Test Notification',
                followupScheduleId: 2342342342,
                followupId: 1,
                followupAttemptId: 1,
                followupLetters: [
                    {
                        letterParty: LetterPartyRoles.BENE,
                        documentId: '123123',
                        documentDisplayName: 'Beneficiary Letter',
                    },
                ],
                deliveryMethod: DeliveryMethods.Mail,
                followupStatus: NotificationStatus.Send,
                send: true,
            };

            render(
                <NotificationItem
                    notification={beneNotifcationItem}
                    carrier="FLIC"
                    index={0}
                    notifications={[beneNotifcationItem]}
                />
            );

            expect(
                screen.getByText('caseOverview.notifications.sendNotification')
            ).toBeInTheDocument();

            const accordionTrigger = screen.getByTestId('accordion-trigger');
            expect(accordionTrigger).toBeInTheDocument();

            fireEvent.click(accordionTrigger);
            expect(
                screen.getByText('caseOverview.notifications.packets')
            ).toBeInTheDocument();
            expect(screen.getByText('Document Card')).toBeInTheDocument();
        });

        it('#should not render Bene Packet Details when beneFollowUpLetter.documentId is missing', () => {
            const beneNotifcationItem = {
                notificationName: 'Test Notification',
                followupScheduleId: 2342342342,
                followupId: 1,
                followupAttemptId: 1,
                followupLetters: [
                    {
                        letterParty: LetterPartyRoles.BENE,
                    },
                ],
                deliveryMethod: DeliveryMethods.Mail,
                followupStatus: NotificationStatus.Send,
                send: true,
            };

            render(
                <NotificationItem
                    notification={beneNotifcationItem}
                    carrier="FLIC"
                    index={0}
                    notifications={[beneNotifcationItem]}
                />
            );

            expect(
                screen.getByText('caseOverview.notifications.sendNotification')
            ).toBeInTheDocument();

            const accordionTrigger = screen.getByTestId('accordion-trigger');
            expect(accordionTrigger).toBeInTheDocument();
            fireEvent.click(accordionTrigger);

            expect(
                screen.queryByText('caseOverview.notifications.packets')
            ).not.toBeInTheDocument();
            expect(screen.queryByText('Document Card')).not.toBeInTheDocument();
        });
    });
});
