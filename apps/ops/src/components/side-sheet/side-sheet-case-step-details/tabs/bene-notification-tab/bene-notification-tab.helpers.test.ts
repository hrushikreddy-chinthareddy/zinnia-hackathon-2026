import {
    getSendNotifications,
    getNextScheduledNotifications,
    getFilteredTransactions,
} from './bene-notification-tab.helpers';
import {
    INotification,
    NotificationStatus,
    NotificationsTransactionData,
} from './bene-notification-tab.types';

describe('##bene-notification-tab.helpers', () => {
    describe('#getSendNotifications', () => {
        it('#should return notifications with send=true', () => {
            const notifications: INotification[] = [
                { send: true } as INotification,
                { send: false } as INotification,
                { send: true } as INotification,
            ];
            const result = getSendNotifications(notifications);
            expect(result).toHaveLength(2);
            expect(result.every((n) => n.send)).toBe(true);
        });

        it('#should return empty array if no notifications to send', () => {
            const notifications: INotification[] = [
                { send: false } as INotification,
            ];
            expect(getSendNotifications(notifications)).toEqual([]);
        });
    });

    describe('#getNextScheduledNotifications', () => {
        it('#should return the next scheduled notification', () => {
            const notifications: INotification[] = [
                {
                    send: false,
                    followupId: 1,
                    followupStatus: NotificationStatus.Scheduled,
                } as INotification,
                {
                    send: false,
                    followupId: 5,
                    followupStatus: NotificationStatus.Scheduled,
                } as INotification,
                {
                    send: false,
                    followupId: 2,
                    followupStatus: NotificationStatus.Reset,
                } as INotification,
            ];
            const result = getNextScheduledNotifications(notifications);
            expect(result).toEqual(
                expect.objectContaining({
                    send: false,
                    followupId: 1,
                    followupStatus: NotificationStatus.Scheduled,
                })
            );
        });

        it('#should return null if no matching notification found', () => {
            const notifications: INotification[] = [
                {
                    send: true,
                    followupId: 1,
                    followupStatus: NotificationStatus.Scheduled,
                } as INotification,
                {
                    send: true,
                    followupId: 2,
                    followupStatus: NotificationStatus.Scheduled,
                } as INotification,
                {
                    send: true,
                    followupId: 3,
                    followupStatus: NotificationStatus.Canceled,
                } as INotification,
            ];

            expect(getNextScheduledNotifications(notifications)).toBeNull();
        });
    });

    describe('#getFilteredTransactions', () => {
        it('#should filter out canceled transactions and sort by date', () => {
            const transactions: INotification[] = [
                {
                    followupStatus: NotificationStatus.Canceled,
                    sendDateTime: '2024-01-01T10:00:00Z',
                } as INotification,
                {
                    followupStatus: NotificationStatus.Scheduled,
                    sendDateTime: '2024-01-02T10:00:00Z',
                } as INotification,
                {
                    followupStatus: NotificationStatus.Scheduled,
                    sendDateTime: '2024-01-01T09:00:00Z',
                } as INotification,
            ];
            const data: NotificationsTransactionData = {
                entity: { followupDetails: transactions },
            } as NotificationsTransactionData;
            const result = getFilteredTransactions(data);
            expect(result.transactions).toHaveLength(2);
            expect(result.transactions[0].sendDateTime).toBe(
                '2024-01-01T09:00:00Z'
            );
            expect(result.transactions[1].sendDateTime).toBe(
                '2024-01-02T10:00:00Z'
            );
        });

        it('#should set received to true if any transaction is received', () => {
            const transactions: INotification[] = [
                { followupStatus: NotificationStatus.Receive } as INotification,
                {
                    followupStatus: NotificationStatus.Scheduled,
                } as INotification,
            ];
            const data: NotificationsTransactionData = {
                entity: { followupDetails: transactions },
            } as NotificationsTransactionData;
            const result = getFilteredTransactions(data);
            expect(result.received).toBe(true);
        });

        it('#should set hasExceptionOrNigo to true if any transaction is exception or NIGO', () => {
            const transactions: INotification[] = [
                {
                    followupStatus: NotificationStatus.Exception,
                } as INotification,
                { followupStatus: NotificationStatus.NIGO } as INotification,
                {
                    followupStatus: NotificationStatus.Scheduled,
                } as INotification,
            ];
            const data: NotificationsTransactionData = {
                entity: { followupDetails: transactions },
            } as NotificationsTransactionData;
            const result = getFilteredTransactions(data);
            expect(result.hasExceptionOrNigo).toBe(true);
        });

        it('#should handle null data gracefully', () => {
            const result = getFilteredTransactions(null);
            expect(result.transactions).toEqual([]);
            expect(result.received).toBe(false);
            expect(result.hasExceptionOrNigo).toBe(false);
        });
    });
});
