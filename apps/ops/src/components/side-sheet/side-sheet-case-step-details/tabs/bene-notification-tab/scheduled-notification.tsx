import { Button, BadgeVariant } from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';

import {
    DeliveryMethods,
    INotification,
} from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab/bene-notification-tab.types';
import { StatusBadge } from '@deps/components/status-badge/status-badge';
import Title, { TitleVariant } from '@deps/components/title/title';
import Typography, {
    TypographyVariant,
} from '@deps/components/typography/typography';
import { standardMonthDayYear } from '@deps/helpers/string.helpers';

import { getPreferredDeliveryIcon } from './notification-item';

interface ScheduledNOtificationProps {
    notification: INotification;
    shouldHideButton: boolean;
    policyNumber: string;
    carrier: string;
    identifier: string;
}
export const ScheduledNotification = ({
    notification,
    shouldHideButton,
    policyNumber,
    carrier,
    identifier,
}: ScheduledNOtificationProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const contentText = t('caseOverview.notifications.scheduledNotification', {
        followup: notification.followupId,
        date: notification?.scheduleDateTime
            ? standardMonthDayYear(notification.scheduleDateTime)
            : '',
    });

    return (
        <div className="flex w-full flex-col p-5 rounded bg-white border-1 border-gray-200 gap-2 order-2">
            <StatusBadge
                className="self-start"
                label={t('caseOverview.notifications.contactNotEstablished')}
                variant={BadgeVariant.WARNING}
            />
            <Title
                className="my-2 flex items-center gap-2"
                variant={TitleVariant.SubTitle}
            >
                {contentText}
            </Title>
            {!shouldHideButton && (
                <>
                    <Typography variant={TypographyVariant.Label}>
                        {t('caseOverview.notifications.contactMethod')}
                    </Typography>
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            {notification.email &&
                                getPreferredDeliveryIcon(DeliveryMethods.Email)}
                            {notification.address &&
                                getPreferredDeliveryIcon(DeliveryMethods.Mail)}
                            {notification.faxNumber &&
                                getPreferredDeliveryIcon(
                                    DeliveryMethods.Faxnumber
                                )}
                        </div>
                        <Button
                            size="small"
                            mode="secondary"
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
                </>
            )}
        </div>
    );
};
