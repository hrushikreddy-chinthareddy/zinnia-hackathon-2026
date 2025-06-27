import { Button, Label, Loader } from '@zinnia/bloom/components';
import { useRouter } from 'next/router';
import { useTranslation, TFunction } from 'next-i18next';
import { useEffect, useState } from 'react';

import { TransformedStep } from '@deps/components/case-sub-page/case-tabs/progress/progress-tab-helpers';
import Content, { ContentVariant } from '@deps/components/content/content';
import {
    DeliveryMethods,
    NotificationStatus,
    INotification,
} from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab.types';
import { FormattedAddress } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import { isNullEmptyOrUndefined } from '@deps/helpers/string.helpers';
import { getTransactionsByRecordId } from '@deps/queries/api/transactions';
import { ReactComponent as NotStartedIcon } from '@deps/styles/elements/icons/alert/not-started.svg';
import { ReactComponent as CircleInfoIcon } from '@deps/styles/elements/icons/circles/circle-info.svg';
import { ReactComponent as CompletedIcon } from '@deps/styles/elements/icons/icons_outlined/check-circle.svg';
import { ReactComponent as EditAlt } from '@deps/styles/elements/icons/icons_outlined/edit-alt.svg';

import { formatTimestamp } from '../../../../../../../packages/utils/src/dates';

export const getNotificationStatusText = (
    notification: INotification,
    t: TFunction
): {
    notificationIcon: React.ReactNode;
    notificationText: string;
    dateText: string;
} => {
    const { send, receive, sendDateTime, scheduleDateTime, deliveryMethod } =
        notification;
    let dateText = '';
    let timestamp: string | undefined;
    const translatedMethod = t(
        `caseOverview.notifications.types.${deliveryMethod.toLowerCase()}`
    );

    if (send === false && receive === false) {
        timestamp = scheduleDateTime;
        dateText = timestamp
            ? t('caseOverview.notifications.scheduledStatusTooltipWithDate', {
                  date: formatTimestamp(timestamp),
              })
            : '';
        return {
            notificationText: t(
                'caseOverview.notifications.scheduledNotification',
                {
                    method: translatedMethod,
                    followup: notification.followupId,
                }
            ),
            notificationIcon: (
                <NotStartedIcon
                    className="text-gray-300"
                    width={16}
                    height={16}
                />
            ),
            dateText,
        };
    } else if (send === true && receive === false) {
        timestamp = sendDateTime;
        dateText = timestamp
            ? t('caseOverview.notifications.completedStatusTooltipWithDate', {
                  date: formatTimestamp(timestamp),
              })
            : '';
        return {
            notificationText: t('caseOverview.notifications.sendNotification', {
                method: translatedMethod,
                followup: notification.followupId,
            }),
            notificationIcon: (
                <CompletedIcon
                    className="text-semantic-success"
                    width={16}
                    height={16}
                />
            ),
            dateText,
        };
    } else if (send === true && receive === true) {
        timestamp = sendDateTime;
        dateText = timestamp
            ? t('caseOverview.notifications.completedStatusTooltipWithDate', {
                  date: formatTimestamp(timestamp),
              })
            : '';
        return {
            notificationText: t('caseOverview.notifications.sendNotification', {
                method: translatedMethod,
                followup: notification.followupId,
            }),
            notificationIcon: (
                <CompletedIcon
                    className="text-semantic-success"
                    width={16}
                    height={16}
                />
            ),
            dateText,
        };
    } else {
        return {
            notificationText: '',
            notificationIcon: '',
            dateText: '',
        };
    }
};

export const getReceiveNotificationStatusText = (
    notification: INotification,
    t: TFunction
): {
    notificationIcon: React.ReactNode;
    notificationText: string;
    contentText: string;
} => {
    const contentText = isNullEmptyOrUndefined(notification?.receiveDateTime)
        ? t('caseOverview.notifications.notStarted')
        : t('caseOverview.notifications.completedStatusTooltipWithDate', {
              date: notification?.receiveDateTime
                  ? formatTimestamp(notification?.receiveDateTime)
                  : '',
          });

    return {
        notificationText: t(
            'caseOverview.notifications.receiveBeneficiaryConfirmation'
        ),
        notificationIcon: isNullEmptyOrUndefined(
            notification?.receiveDateTime
        ) ? (
            <NotStartedIcon className="text-gray-300" width={16} height={16} />
        ) : (
            <CompletedIcon
                className="text-semantic-success"
                width={16}
                height={16}
            />
        ),
        contentText: contentText,
    };
};

export function SidesheetNotification({
    notification,
}: {
    notification: INotification;
}) {
    const { t } = useTranslation();
    const displayNotification = (notification: any) => {
        switch (notification.deliveryMethod) {
            case DeliveryMethods.Mail:
                return (
                    <div>
                        <Label>
                            {t('caseOverview.notifications.types.mail')}
                        </Label>
                        <FormattedAddress address={notification?.address} />
                    </div>
                );
            case DeliveryMethods.Email:
                return (
                    <div>
                        <Label>
                            {t('caseOverview.notifications.types.email')}
                        </Label>
                        <p className="typography-content-body-sm">
                            {notification?.email}
                        </p>
                    </div>
                );
            case DeliveryMethods.Faxnumber:
                return (
                    <div>
                        <Label>
                            {t('caseOverview.notifications.types.faxnumber')}
                        </Label>
                        <p className="typography-content-body-sm">
                            {notification?.faxNumber?.substring(0, 3)}-
                            {notification?.faxNumber?.substring(3, 8)}
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return displayNotification(notification);
}

export function BeneSideSheetStep({ step }: { step: TransformedStep }) {
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [identifier, setIdentifier] = useState('');
    const [policyNumber, setPolicyNumber] = useState('');
    const [hasReceivedNotification, setHasReceivedNotification] =
        useState(false);
    const [hasException, setHasException] = useState(false);
    const [carrier, setCarrier] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchTransactions = async (identifier: string) => {
            const transactionResponse = await getTransactionsByRecordId(
                identifier
            );
            let transactions: INotification[] =
                transactionResponse?.entity?.followupDetails || [];
            transactions = transactions.filter(
                (transaction) =>
                    transaction.followupStatus !== NotificationStatus.Canceled
            );
            if (transactions.length > 0) {
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
                        transaction.followupStatus ===
                        NotificationStatus.Receive
                );
                setHasReceivedNotification(received);

                const hasExceptionOrNigo = transactions.some(
                    (transaction) =>
                        transaction.followupStatus ===
                            NotificationStatus.Exception ||
                        transaction.followupStatus === NotificationStatus.NIGO
                );
                setHasException(hasExceptionOrNigo);
            }

            setLoading(false);
            setNotifications(transactions);

            if (
                transactionResponse?.identifiers &&
                transactionResponse?.identifiers?.length > 0
            ) {
                const policyIdentifier = transactionResponse?.identifiers.find(
                    (item: { identifier: string }) =>
                        item.identifier === 'policyNumber'
                );
                if (policyIdentifier) {
                    setPolicyNumber(policyIdentifier.value);
                }
            }
            if (transactionResponse?.carrier) {
                setCarrier(transactionResponse.carrier);
            }
        };
        const identifier = step.stepRaw.instanceInfo?.identifier;

        if (identifier) {
            fetchTransactions(identifier);
            setIdentifier(identifier);
        }
    }, [step]);

    const findNextResetNotification = (
        currentIndex: number
    ): INotification | null => {
        for (let i = currentIndex + 1; i < notifications.length; i++) {
            if (notifications[i].dueToReset === true) {
                return notifications[i];
            }
        }
        return null;
    };

    const shouldHideButton = hasException || hasReceivedNotification;
    return (
        <div>
            {loading ? (
                <div className="flex justify-center items-center mt-24">
                    <Loader />
                </div>
            ) : (
                <div>
                    {notifications?.map((notification, index) => {
                        const { notificationIcon, notificationText, dateText } =
                            getNotificationStatusText(notification, t);
                        const flowstart = t(
                            'caseOverview.notifications.startNotification'
                        );
                        const resendText = t(
                            'caseOverview.notifications.resendNotification',
                            {
                                action: NotificationStatus.Resend.toLowerCase(),
                            }
                        );
                        const updateDate = notification?.statusDateTime
                            ? t(
                                  'caseOverview.notifications.updatedStatusTooltipWithDate',
                                  {
                                      date: formatTimestamp(
                                          notification.statusDateTime
                                      ),
                                  }
                              )
                            : '';
                        const resetText = t(
                            'caseOverview.notifications.resetNotification',
                            {
                                action: NotificationStatus.Reset.toLowerCase(),
                            }
                        );
                        const {
                            notificationIcon: receiveNotificationIcon,
                            notificationText: receiveNotificationText,
                            contentText: receiveNotificationContextText,
                        } = getReceiveNotificationStatusText(notification, t);

                        const nextResetNotification =
                            notification.followupStatus ===
                            NotificationStatus.Reset
                                ? findNextResetNotification(index)
                                : null;
                        return (
                            <div key={`notification-wrapper-${index}`}>
                                {index === 0 && (
                                    <div
                                        className="flex flex-row gap-2 mb-4"
                                        key={`notification-${index}${index}`}
                                    >
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                                            <CircleInfoIcon
                                                className="text-semantic-info"
                                                width={16}
                                                height={16}
                                            />
                                        </div>
                                        <div className="flex w-full flex-col gap-1">
                                            <Content
                                                variant={ContentVariant.BodySm}
                                                details={flowstart}
                                            />
                                            <SidesheetNotification
                                                notification={notification}
                                            />
                                            <Content
                                                className="text-gray-600"
                                                variant={ContentVariant.BodySm}
                                                details={dateText}
                                            />
                                        </div>
                                    </div>
                                )}

                                {notification.followupId !== 5 && (
                                    <div
                                        className="flex flex-row gap-2 mb-4"
                                        key={`receive-notification-${index}`}
                                    >
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                                            {notificationIcon}
                                        </div>
                                        <div className="flex w-full flex-col gap-1">
                                            <Content
                                                variant={ContentVariant.BodySm}
                                                details={notificationText}
                                            />
                                            <Content
                                                className="text-gray-600"
                                                variant={ContentVariant.BodySm}
                                                details={dateText}
                                            />
                                        </div>
                                    </div>
                                )}

                                {notification.followupStatus ===
                                    NotificationStatus.Resend && (
                                    <div
                                        className="flex flex-row gap-2 mb-4"
                                        key={`receive-notification-${index}${index}`}
                                    >
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                                            <EditAlt
                                                className="text-blue"
                                                width={16}
                                                height={16}
                                            />
                                        </div>
                                        <div className="flex w-full flex-col gap-1">
                                            <Content
                                                variant={ContentVariant.BodySm}
                                                details={resendText}
                                            />
                                            <Content
                                                className="text-gray-600"
                                                variant={ContentVariant.BodySm}
                                                details={dateText}
                                            />
                                        </div>
                                    </div>
                                )}

                                {notification.followupStatus ===
                                    NotificationStatus.Reset && (
                                    <div
                                        className="flex flex-row gap-2 mb-4"
                                        key={`receive-notification-${index}${index}`}
                                    >
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                                            <EditAlt
                                                className="text-blue"
                                                width={16}
                                                height={16}
                                            />
                                        </div>
                                        <div className="flex w-full flex-col gap-1">
                                            <Content
                                                variant={ContentVariant.BodySm}
                                                details={resetText}
                                            />
                                            {nextResetNotification && (
                                                <SidesheetNotification
                                                    notification={
                                                        nextResetNotification
                                                    }
                                                />
                                            )}
                                            <Content
                                                className="text-gray-600"
                                                variant={ContentVariant.BodySm}
                                                details={updateDate}
                                            />
                                        </div>
                                    </div>
                                )}

                                {index === notifications.length - 1 && (
                                    <div
                                        className="flex flex-row gap-2 mb-4"
                                        key={`receive-notification-${index}${index}`}
                                    >
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                                            {receiveNotificationIcon}
                                        </div>
                                        <div className="flex w-full flex-col gap-1">
                                            <Content
                                                variant={ContentVariant.BodySm}
                                                details={
                                                    receiveNotificationText
                                                }
                                            />
                                            <Content
                                                className="text-gray-600"
                                                variant={ContentVariant.BodySm}
                                                details={
                                                    receiveNotificationContextText
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {!shouldHideButton && (
                        <div className="mt-4">
                            <Button
                                size="small"
                                onClick={() =>
                                    router.push(
                                        `/claims/update-notification-method?policyNumber=${policyNumber}&carrier=${carrier}&recordId=${identifier}`
                                    )
                                }
                            >
                                {t(
                                    'updateNotificationMethodForBeneficiary.updateNotificationMethodStep.title'
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
