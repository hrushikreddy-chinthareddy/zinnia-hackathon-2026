import {
    INotification,
    NotificationStatus,
    NotificationsTransactionData,
} from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab/bene-notification-tab.types';

export const getSendNotifications = (notifications: INotification[]) => {
    return (
        notifications.filter((notification) => notification.send === true) || []
    );
};

export const getNextScheduledNotifications = (
    notifications: INotification[]
): INotification | null => {
    return (
        notifications.find(
            (notification) =>
                notification.send === false &&
                notification.followupStatus !== NotificationStatus.Reset &&
                notification.followupStatus !== NotificationStatus.Resend
        ) || null
    );
};

export const getFilteredTransactions = (
    data: NotificationsTransactionData | null
) => {
    let transactions: INotification[] = data?.entity?.followupDetails || [];
    transactions = transactions.filter(
        (transaction) =>
            transaction.followupStatus !== NotificationStatus.Canceled
    );
    transactions.sort((transaction1, transaction2) => {
        const date1 = new Date(
            transaction1.sendDateTime ||
                transaction1.scheduleDateTime ||
                transaction1.statusDateTime ||
                0
        );
        const date2 = new Date(
            transaction2.sendDateTime ||
                transaction2.scheduleDateTime ||
                transaction2.statusDateTime ||
                0
        );
        return date1.getTime() - date2.getTime();
    });

    const received = transactions.some(
        (transaction) =>
            transaction.followupStatus === NotificationStatus.Receive
    );

    const hasExceptionOrNigo = transactions.some(
        (transaction) =>
            transaction.followupStatus === NotificationStatus.Exception ||
            transaction.followupStatus === NotificationStatus.NIGO
    );
    return {
        transactions,
        received,
        hasExceptionOrNigo,
    };
};

export const getAttemptCount = (
    notifications: INotification[],
    currentIndex: number
): number => {
    let count = 0;
    for (let i = 0; i <= currentIndex; i++) {
        const n = notifications[i];
        if (!n) continue;
        if (n.send) {
            count++;
        } else if (i === currentIndex && !n.send && !n.receive) {
            count++;
        } else {
        }
    }
    return count;
};
