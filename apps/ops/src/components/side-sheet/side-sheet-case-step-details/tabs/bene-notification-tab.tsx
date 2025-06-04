import { AddressBase } from '@zinnia/api-types/types/sor';
import { Label, Loader } from '@zinnia/bloom/components';
import { useTranslation, TFunction } from 'next-i18next';
import { useEffect, useState } from 'react';

import {TransformedStep } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-helpers';

import { formatTimestamp } from '../../../../../../../packages/utils/src/dates';

import Content, { ContentVariant } from '@deps/components/content/content';
import { FormattedAddress } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { getTransactionsByRecordId } from '@deps/queries/api/transactions';
import { ReactComponent as NotStartedIcon } from '@deps/styles/elements/icons/alert/not-started.svg';
import { ReactComponent as CompletedIcon } from '@deps/styles/elements/icons/icons_outlined/check-circle.svg';

export enum DeliveryMethods {
    Email = 'EMAIL',
    Fax = 'FAX',
    Mail = 'MAIL',
}

export enum NotificationStatus {
    Send = 'SEND',
    Receive = 'RECEIVE',
    Overdue = 'OVERDUE',
}

export interface INotification {
    notificationName: string;
    deliveryMethod: DeliveryMethods;
    address?: AddressBase;
    email?: string;
    faxNumber?: string;
    status: NotificationStatus;
    sendDateTime: string;
    overdueDateTime: string | null;
    receiveDateTime: string | null;
}

export type NotificationsTransactionIdentifier = {
    identifier: string;
    value: string;
};

export type NotificationEntity = {
    followupDetails: INotification[];
};

export type NotificationsTransactionData = {
    recordId: string;
    correlationId: string;
    transactionType: string;
    carrier: string;
    source: string;
    entityType: string;
    entityId: string;
    entity: NotificationEntity;
    expireTs: string;
    createdTs: string;
    updatedTs: string;
    createdBy: string;
    updatedBy: string;
    identifiers?: NotificationsTransactionIdentifier[];
};

export const getNotificationStatusText = (
    status: NotificationStatus,
    t: TFunction
): { notificationIcon: React.ReactNode; notificationText: string } => {
    switch (status) {
        case NotificationStatus.Send:
        case NotificationStatus.Overdue:
        case NotificationStatus.Receive:
            return {
                notificationText: t('caseOverview.notifications.sendNotification'),
                notificationIcon: <CompletedIcon className="text-semantic-success" width={16} height={16} />,
            };
        default:
            return {
                notificationText: '',
                notificationIcon: null,
            };
    }
};

export const getReceiveNotificationStatusText = (
    notification: INotification,
    t: TFunction
): { notificationIcon: React.ReactNode; notificationText: string; contentText: string } => {
    const contentText = isNullEmptyOrUndefined(notification?.receiveDateTime)
        ? t('caseOverview.notifications.notStarted')
        : t('caseOverview.notifications.completedStatusTooltipWithDate', {
              date: notification?.receiveDateTime ? formatTimestamp(notification?.receiveDateTime) : '',
          });

    return {
        notificationText: t('caseOverview.notifications.receiveBeneficiaryConfirmation'),
        notificationIcon: isNullEmptyOrUndefined(notification?.receiveDateTime) ? (
            <NotStartedIcon className="text-gray-300" width={16} height={16} />
        ) : (
            <CompletedIcon className="text-semantic-success" width={16} height={16} />
        ),
        contentText: contentText,
    };
};

export function SidesheetNotification({ notification }: { notification: INotification }) {
    const { t } = useTranslation();
    const text = notification?.sendDateTime
        ? t('caseOverview.notifications.completedStatusTooltipWithDate', { date: formatTimestamp(notification?.sendDateTime) })
        : '';

    const displayNotification = (notification: any) => {
        switch (notification.deliveryMethod) {
            case DeliveryMethods.Mail:
                return (
                    <div>
                        <Label>{t('caseOverview.notifications.types.mail')}</Label>
                        <FormattedAddress address={notification?.address} />
                        <Content className="text-gray-600" variant={ContentVariant.BodySm} details={text} />
                    </div>
                );
            case DeliveryMethods.Email:
                return (
                    <div>
                        <Label>{t('caseOverview.notifications.types.email')}</Label>
                        <p className="typography-content-body-sm">{notification?.email}</p>
                        <Content className="text-gray-600" variant={ContentVariant.BodySm} details={text} />
                    </div>
                );
            case DeliveryMethods.Fax:
                return (
                    <div>
                        <Label>{t('caseOverview.notifications.types.fax')}</Label>
                        <p className="typography-content-body-sm">
                            {notification?.faxNumber?.substring(0, 3)}-{notification?.faxNumber?.substring(3, 8)}
                        </p>
                        <Content className="text-gray-600" variant={ContentVariant.BodySm} details={text} />
                    </div>
                );
            default:
                return '';
        }
    };

    return displayNotification(notification);
}

export function BeneSideSheetStep({ step }: { step: TransformedStep }) {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async (identifier: string) => {
            const transactionResponse = await getTransactionsByRecordId(identifier);
            const transactions: INotification[] = transactionResponse?.entity?.followupDetails || [];
            if (transactions.length > 0) {
                transactions.sort((transaction1, transaction2) => {
                    const date1 = new Date(transaction1.sendDateTime);
                    const date2 = new Date(transaction2.sendDateTime);

                    if (date1 < date2) {
                        return -1;
                    } else if (date1 == date2) {
                        return 0;
                    } else {
                        return 1;
                    }
                });
                transactions.reverse();
            }
            setLoading(false);
            setNotifications(transactions);
        };
        const identifier = step.stepRaw.instanceInfo?.identifier;
        if (identifier) {
            fetchTransactions(identifier);
        }
    }, [step]);

    return (
        <div>
            {loading ? (
                <div className="flex justify-center items-center mt-24">
                    <Loader />
                </div>
            ) : (
                notifications?.map((notification, index) => {
                    const { notificationIcon, notificationText } = getNotificationStatusText(notification?.status, t);
                    const {
                        notificationIcon: receiveNotificationIcon,
                        notificationText: receiveNotificationText,
                        contentText: receiveNotificationContextText,
                    } = notification?.status === NotificationStatus.Receive ? getReceiveNotificationStatusText(notification, t) : {};

                    return (
                        <>
                            {notification?.status === NotificationStatus.Receive && (
                                <div className="flex flex-row gap-2 mb-2" key={`notification-${index}`}>
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center">{receiveNotificationIcon}</div>
                                    <div className="flex w-full flex-col gap-1">
                                        <Content variant={ContentVariant.BodySm} details={receiveNotificationText} />
                                        <div>
                                            <Content
                                                className="text-gray-600"
                                                variant={ContentVariant.BodySm}
                                                details={receiveNotificationContextText}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-row gap-2 mb-2" key={`receive-notification-${index}`}>
                                <div className="flex h-6 w-6 shrink-0 items-center justify-center">{notificationIcon}</div>
                                <div className="flex w-full flex-col gap-1">
                                    <Content variant={ContentVariant.BodySm} details={notificationText} />
                                    <SidesheetNotification notification={notification} />
                                </div>
                            </div>
                        </>
                    );
                })
            )}
        </div>
    );
}
