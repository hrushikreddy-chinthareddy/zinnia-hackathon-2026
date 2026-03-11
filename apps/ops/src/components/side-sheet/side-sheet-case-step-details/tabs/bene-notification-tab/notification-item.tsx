import {
    Accordion as AccordionRoot,
    AccordionContent,
    AccordionHeader,
    AccordionItem,
    AccordionTrigger,
} from '@radix-ui/react-accordion';
import { Icon, IconType, BadgeVariant } from '@zinnia/bloom/components';
import { TFunction, useTranslation } from 'next-i18next';
import { useState } from 'react';

import Content, { ContentVariant } from '@deps/components/content/content';
import { PiiWrapper } from '@deps/components/pii/PiiWrapper';
import { DocumentTypeView } from '@deps/components/side-sheet/documents/DocumentTypeView';
import {
    DeliveryMethods,
    NotificationStatus,
    INotification,
    FollowupId,
    LetterPartyRoles,
    FollowUpLetter,
    FollowUpStatusReason,
} from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab/bene-notification-tab.types';
import { StatusBadge } from '@deps/components/status-badge/status-badge';
import Title, { TitleVariant } from '@deps/components/title/title';
import DocumentCard from '@deps/components/workflows/document/document-card';
import { lowerCaseJson } from '@deps/containers/death-claim-container/update-notification-method/update-notification-method-helper';
import { FormattedAddress } from '@deps/containers/people-data-cards/address-card/address-card.helpers';
import {
    formatFaxNumber,
    standardMonthDayYear,
    toTitleCase,
} from '@deps/helpers/string.helpers';
import { ReactComponent as ChevronDown } from '@deps/styles/elements/icons/arrow/chevron-down.svg';
import { ReactComponent as Edit } from '@deps/styles/elements/icons/color/edit.svg';
import { ReactComponent as Send } from '@deps/styles/elements/icons/color/send.svg';
import { ReactComponent as ArrowRightLarge } from '@deps/styles/elements/icons/icons_outlined/arrow-right-large.svg';
import { ReactComponent as AT } from '@deps/styles/elements/icons/icons_outlined/at.svg';

import {
    getAttemptCount,
    getSendNotifications,
} from './bene-notification-tab.helpers';

interface NotificationItemProps {
    carrier: string;
    notification: INotification;
    index: number;
    notifications: INotification[];
}

export const VerticalBorderLine = () => {
    return (
        <div className="absolute left-[10px] top-[25px] h-full border-l-2 border-[#EDEDED] content-['']"></div>
    );
};

export const getPreferredDeliveryIcon = (deliveryMethod: DeliveryMethods) => {
    const iconStyle = 'p-1 bg-gray-100 text-[#676767] rounded-sm';
    switch (deliveryMethod) {
        case DeliveryMethods.Mail:
            return (
                <Icon
                    type={IconType.MAIL}
                    width={30}
                    height={30}
                    className={iconStyle}
                />
            );
        case DeliveryMethods.Email:
            return <AT width={30} height={30} className={iconStyle} />;
        case DeliveryMethods.Faxnumber:
            return (
                <Icon
                    type={IconType.PRINTER}
                    width={30}
                    height={30}
                    className={iconStyle}
                />
            );
        default:
            return null;
    }
};

function DeliveryMethodDetails({
    notification,
}: {
    notification: INotification;
}) {
    const displayNotification = (notification: INotification) => {
        switch (notification.deliveryMethod) {
            case DeliveryMethods.Mail:
                if (!notification?.address) return null;
                return <FormattedAddress address={notification?.address} />;
            case DeliveryMethods.Email:
                return <PiiWrapper>{notification?.email}</PiiWrapper>;
            case DeliveryMethods.Faxnumber:
                return (
                    <PiiWrapper>
                        {formatFaxNumber(notification.faxNumber)}
                    </PiiWrapper>
                );
            default:
                return null;
        }
    };
    return displayNotification(notification);
}

function isChangeInDeliveryMethodDetails({
    notification,
    nextResetNotification,
}: {
    notification: INotification;
    nextResetNotification: INotification;
}) {
    const compareNotification = (notification: INotification) => {
        let isDifferent;
        switch (notification.deliveryMethod) {
            case DeliveryMethods.Mail:
                isDifferent =
                    lowerCaseJson(notification?.address ?? {}) !==
                    lowerCaseJson(nextResetNotification?.address ?? {});
                break;
            case DeliveryMethods.Email:
                isDifferent =
                    (notification?.email ?? '').toLowerCase() !==
                    (nextResetNotification?.email ?? '').toLowerCase();
                break;
            case DeliveryMethods.Faxnumber:
                isDifferent =
                    (notification?.faxNumber ?? '') !==
                    (nextResetNotification?.faxNumber ?? '');
                break;
        }
        return isDifferent;
    };
    return compareNotification(notification);
}

interface SentNotificationStatusProps {
    notification: INotification;
    attemptCount: number;
    carrier: string;
    t: TFunction;
}

const SentNotificationStatus = ({
    notification,
    attemptCount,
    carrier,
    t,
}: SentNotificationStatusProps) => {
    const { sendDateTime, deliveryMethod, followupLetters } = notification;
    const beneFollowUpLetter = followupLetters?.find(
        (letter: FollowUpLetter) => letter.letterParty === LetterPartyRoles.BENE
    );

    const dateText = sendDateTime ? standardMonthDayYear(sendDateTime) : '';
    const notificationText = t('caseOverview.notifications.sendNotification', {
        followup: attemptCount,
    });
    const [isOpen, setIsOpen] = useState(false);
    const handleStateChange = (state: boolean) => {
        setIsOpen(state);
    };

    const renderBenePacketDetails = (beneFollowUpLetter: FollowUpLetter) => {
        const { documentId, documentDisplayName, fileType } =
            beneFollowUpLetter;
        return (
            <>
                <Content
                    variant={ContentVariant.BodySmBold}
                    details={t('caseOverview.notifications.packets') as string}
                />
                <DocumentCard
                    key={'documentId'}
                    cardClass="mt-2 mb-4"
                    document={{
                        documentId: documentId ?? '',
                        displayName:
                            documentDisplayName &&
                            `${documentDisplayName}_${attemptCount}`,
                        docTypeView: DocumentTypeView.Correspondence,
                        carrier: carrier,
                    }}
                    isViewButtonHidden={fileType?.toLowerCase() === 'eml'}
                />
            </>
        );
    };

    return (
        <div className="flex flex-row gap-2 relative">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                <Send width={20} height={20} />
            </div>
            <AccordionRoot type="single" collapsible className="w-full">
                <AccordionItem
                    value={`item-${attemptCount}`}
                    className="border border-gray-200 rounded px-3 py-2"
                >
                    <AccordionHeader
                        className="flex items-center justify-between"
                        onClick={() => handleStateChange(!isOpen)}
                    >
                        <div>
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
                        <div className="flex items-center gap-2">
                            {getPreferredDeliveryIcon(deliveryMethod)}
                            <AccordionTrigger
                                data-testid="accordion-trigger"
                                className="flex items-center"
                            >
                                <ChevronDown
                                    className={`chevron-down rotate-270 transition-transform duration-300 lg:mt-0 ${
                                        isOpen ? 'rotate-0' : ''
                                    }`}
                                    width={16}
                                    height={16}
                                />
                            </AccordionTrigger>
                        </div>
                    </AccordionHeader>
                    <AccordionContent className="pt-4">
                        {beneFollowUpLetter?.documentId &&
                            renderBenePacketDetails(beneFollowUpLetter)}
                        <Content
                            variant={ContentVariant.BodySmBold}
                            details={
                                t('caseOverview.notifications.sendTo') as string
                            }
                        />
                        <div className="flex flex-row gap-4 mt-4">
                            {getPreferredDeliveryIcon(deliveryMethod)}
                            <div className="flex w-full flex-col gap-1 mb-1">
                                <Content
                                    variant={ContentVariant.BodyBold}
                                    details={
                                        t(
                                            `caseOverview.notifications.types.${deliveryMethod.toLowerCase()}`
                                        ) as string
                                    }
                                />
                                <DeliveryMethodDetails
                                    notification={notification}
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </AccordionRoot>
            <VerticalBorderLine />
        </div>
    );
};

const getReceiveNotificationStatusText = (
    notification: INotification,
    t: TFunction
) => {
    const contentText = t('caseOverview.notifications.completedNotification', {
        date: notification?.receiveDateTime
            ? standardMonthDayYear(notification.receiveDateTime)
            : '',
    });

    return (
        <div
            className="flex w-full flex-col p-5 rounded bg-white border-1 border-gray-200 gap-2 order-2"
            key={`receive-notification-${notification.followupId}`}
        >
            <StatusBadge
                className="self-start"
                label={t('caseOverview.notifications.contactEstablished')}
                variant={BadgeVariant.SUCCESS}
            />
            <Title
                className="my-2 flex items-center gap-2"
                variant={TitleVariant.SubTitle}
            >
                {contentText}
            </Title>
        </div>
    );
};

const getResendNotificationStatusText = (
    notification: INotification,
    t: TFunction
) => {
    const contentText = t('caseOverview.notifications.resendNotification', {
        action: toTitleCase(NotificationStatus.Resend),
        date: standardMonthDayYear(notification.statusDateTime),
    });

    return (
        <div
            className="flex flex-row gap-2 relative"
            key={`resend-notification-${notification.followupId}`}
        >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                <Edit width={20} height={20} />
            </div>
            <div className="flex w-full flex-col gap-1">
                <Content
                    variant={ContentVariant.BodySm}
                    details={contentText}
                />
                <div className="flex gap-2 items-center mt-1">
                    <div className="bg-green-100 text-green-700 font-semibold p-1 break-all rounded-xs">
                        <DeliveryMethodDetails notification={notification} />
                    </div>
                </div>
            </div>
            <VerticalBorderLine />
        </div>
    );
};

const getResetNotificationStatusText = (
    notification: INotification,
    nextResetNotification: INotification | null,
    t: TFunction
) => {
    // To check notification difference
    const isDifferent =
        nextResetNotification &&
        isChangeInDeliveryMethodDetails({
            notification,
            nextResetNotification,
        });

    const contentText = nextResetNotification
        ? notification.deliveryMethod.toLowerCase() ===
          nextResetNotification.deliveryMethod.toLowerCase()
            ? t('caseOverview.notifications.resetNotificationUpdate', {
                  method: t(
                      `caseOverview.notifications.update.${notification.deliveryMethod.toLowerCase()}`
                  ),
                  date: standardMonthDayYear(notification.statusDateTime),
              })
            : t('caseOverview.notifications.resetNotification', {
                  old: t(
                      `caseOverview.notifications.types.${notification.deliveryMethod.toLowerCase()}`
                  ).toLowerCase(),
                  new: t(
                      `caseOverview.notifications.types.${nextResetNotification.deliveryMethod.toLowerCase()}`
                  ).toLowerCase(),
                  date: standardMonthDayYear(notification.statusDateTime),
              })
        : t('caseOverview.notifications.resetNotificationUpdate', {
              method: t(
                  `caseOverview.notifications.update.${notification.deliveryMethod.toLowerCase()}`
              ),
              date: standardMonthDayYear(notification.statusDateTime),
          });

    return (
        <div
            className="flex flex-row gap-2 relative"
            key={`reset-notification-${notification.followupId}`}
        >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                <Edit width={20} height={20} />
            </div>
            <div className="flex w-full flex-col gap-1">
                <Content
                    variant={ContentVariant.BodySm}
                    details={contentText}
                />
                {nextResetNotification && (
                    <div className="flex gap-2 items-center mt-1 overflow-hidden">
                        {notification.deliveryMethod.toLowerCase() ===
                            nextResetNotification.deliveryMethod.toLowerCase() &&
                            isDifferent && (
                                <>
                                    <div className="bg-red-100 text-red-700 line-through p-1 break-all rounded-sm">
                                        <DeliveryMethodDetails
                                            notification={notification}
                                        />
                                    </div>
                                    <ArrowRightLarge width={20} height={20} />
                                </>
                            )}
                        <div className="bg-green-100 font-semibold text-green-700 p-1 break-all rounded-sm">
                            <DeliveryMethodDetails
                                notification={nextResetNotification}
                            />
                        </div>
                    </div>
                )}
            </div>
            <VerticalBorderLine />
        </div>
    );
};

const getNextResetNotification = (
    notifications: INotification[],
    currentIndex: number
): INotification | null => {
    for (let i = currentIndex + 1; i < notifications.length; i++) {
        if (notifications[i].dueToReset === true) {
            return notifications[i];
        }
    }
    return null;
};

const getResetNotificationRestartedStatusText = (
    notification: INotification,
    nextResetNotification: INotification | null,
    t: TFunction
) => {
    const contentText = t('caseOverview.notifications.notificationRestarted', {
        date: standardMonthDayYear(notification.statusDateTime),
    });
    return (
        <div
            className="flex flex-row gap-2 relative"
            key={`contact-established-notification-${notification.followupId}`}
        >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                <Edit width={20} height={20} />
            </div>
            <div className="flex w-full flex-col gap-1">
                <Content
                    variant={ContentVariant.BodySm}
                    details={contentText}
                />
                <div className="flex gap-2 items-center mt-1">
                    <div className="bg-green-100 text-green-700 font-semibold p-1 break-all rounded-xs">
                        <DeliveryMethodDetails notification={notification} />
                    </div>
                </div>
            </div>
            <VerticalBorderLine />
        </div>
    );
};

export const NotificationItem = ({
    notification,
    carrier,
    index,
    notifications,
}: NotificationItemProps) => {
    const { t } = useTranslation();
    const attemptCount = getAttemptCount(notifications, index);
    const flowstart = t('caseOverview.notifications.startNotification');
    const sentNotifications = getSendNotifications(notifications);
    const nextResetNotification =
        notification.followupStatus === NotificationStatus.Reset
            ? getNextResetNotification(notifications, index)
            : null;

    return (
        <>
            {index === 0 && sentNotifications.length > 0 && (
                <div className="flex flex-row gap-2 order-1 relative">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                        <Icon type={IconType.CLOCK} width={20} height={20} />
                    </div>
                    <div className="flex w-full flex-col gap-1">
                        <Content
                            variant={ContentVariant.BodyBold}
                            details={flowstart}
                        />
                    </div>
                    <VerticalBorderLine />
                </div>
            )}
            {notification.followupStatus === NotificationStatus.Receive &&
                getReceiveNotificationStatusText(notification, t)}
            {notification.send === true &&
                notification.followupId !== FollowupId.fifth && (
                    <SentNotificationStatus
                        notification={notification}
                        attemptCount={attemptCount}
                        carrier={carrier}
                        t={t}
                    />
                )}
            {notification.followupStatus === NotificationStatus.Resend &&
                getResendNotificationStatusText(notification, t)}
            {notification.followupStatus === NotificationStatus.Reset &&
                notification?.followupStatusReason !==
                    FollowUpStatusReason.CONTACT_WAS_ESTABLISHED &&
                getResetNotificationStatusText(
                    notification,
                    nextResetNotification,
                    t
                )}
            {notification.followupStatus === NotificationStatus.Reset &&
                notification?.followupStatusReason ===
                    FollowUpStatusReason.CONTACT_WAS_ESTABLISHED &&
                getResetNotificationRestartedStatusText(
                    notification,
                    nextResetNotification,
                    t
                )}
        </>
    );
};
