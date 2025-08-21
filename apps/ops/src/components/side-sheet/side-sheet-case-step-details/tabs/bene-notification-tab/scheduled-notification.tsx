import { Button } from '@zinnia/bloom/components';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';

import BadgeWithTooltip from '@deps/components/badge/badge-with-tooltip/badge-with-tooltip';
import { BadgeVariant } from '@deps/components/badge/badge.helpers';
import { PopoverPlacement } from '@deps/components/popover/popover';
import {
    DeliveryMethods,
    FollowupId,
    INotification,
} from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab/bene-notification-tab.types';
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
    attemptCount: number;
}
export const ScheduledNotification = ({
    notification,
    shouldHideButton,
    policyNumber,
    carrier,
    identifier,
    attemptCount,
}: ScheduledNOtificationProps) => {
    const { t } = useTranslation();
    const router = useRouter();
    const contentText = t('caseOverview.notifications.scheduledNotification', {
        followup: attemptCount,
        date: notification?.scheduleDateTime
            ? standardMonthDayYear(notification.scheduleDateTime)
            : '',
    });
    const tooltip =
        notification.followupId === FollowupId.fifth
            ? t('caseOverview.notifications.finalTooltip')
            : t('caseOverview.notifications.scheduledTooltip', {
                  followup: FollowupId.fifth - notification.followupId,
              });

    return (
        <div className="flex w-full flex-col p-5 rounded bg-white border-1 border-gray-200 gap-2 order-2">
            <BadgeWithTooltip
                label={t('caseOverview.notifications.contactNotEstablished')}
                tooltip={tooltip}
                tooltipPlacement={PopoverPlacement.TopRight}
                variant={BadgeVariant.Warning}
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
                            data-testid="update-contact-method-btn"
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
