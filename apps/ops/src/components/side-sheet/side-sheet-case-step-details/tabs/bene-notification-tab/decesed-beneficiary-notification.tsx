import { BadgeVariant } from '@zinnia/bloom/components';
import { useTranslation } from 'next-i18next';

import { INotification } from '@deps/components/side-sheet/side-sheet-case-step-details/tabs/bene-notification-tab/bene-notification-tab.types';
import { StatusBadge } from '@deps/components/status-badge/status-badge';
import Title, { TitleVariant } from '@deps/components/title/title';
import { standardMonthDayYear } from '@deps/helpers/string.helpers';

interface DeceasedBeneficiaryNotificationProps {
    notification: INotification;
}

export const DeceasedBeneficiaryNotification = ({
    notification,
}: DeceasedBeneficiaryNotificationProps) => {
    const { t } = useTranslation();
    const contentText = t(
        'caseOverview.notifications.beneficiaryDeceasedNotification',
        {
            date: notification.statusDateTime
                ? standardMonthDayYear(notification.statusDateTime)
                : '',
        }
    );

    return (
        <div className="flex w-full flex-col p-5 rounded bg-white border-1 border-gray-200 gap-2 order-2">
            <StatusBadge
                className="self-start"
                label={t('caseOverview.notifications.beneficiaryDeceased')}
                variant={BadgeVariant.WARNING}
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
