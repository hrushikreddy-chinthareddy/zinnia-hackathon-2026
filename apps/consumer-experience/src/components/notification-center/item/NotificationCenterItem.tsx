import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';

import { default as Styles } from '@/components/notification-center/NotificationCenter.module.css';
import { NotificationCenterSidesheet } from '@/components/notification-center/side-sheet/NotificatonCenterSidesheet';
import { CaseAcknowledgmentItem } from '@/services/terms-and-conditions';
import { formatDateWithUserTimezone } from '@/utils/dates';
import { CaseInstanceSummary } from '@zinnia/api-types/types/case';

import { NotificationCenterItemLoadingState } from '../loading-state/NotificationCenterLoadingState';

export type NotificationCenterNotification = {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  stepsToAcknowledge?: string[];
  caseGroup: string;
};

export type NotificationCenterProps = {
  initialNotifications?: Array<CaseInstanceSummary> | null;
  initialAcknowledgedNotifications?: Array<CaseAcknowledgmentItem>;
  policyNumber: string;
  planCode: string;
};

export const NotificationCenterItem = ({
  loading,
  needsAcknowledgement,
  onAcknowledge,
  notification,
  sidesheetLinkText,
}: {
  loading: boolean;
  needsAcknowledgement: boolean;
  onAcknowledge: (id: string, stepsToAcknowledge: string[]) => void;
  notification: NotificationCenterNotification;
  sidesheetLinkText: string;
}) => {
  const notificationDate = dayjs(notification.date);
  const dateText = formatDateWithUserTimezone(notification.date);

  if (loading) return NotificationCenterItemLoadingState;

  const fieldData = {
    'Case ID': notification.id,
    Submitted: formatDateWithUserTimezone(notification.date),
  };

  const description = notification.completed
    ? `Processing Complete`
    : 'There was an error processing this transaction.';

  const caseGroupIconMap: Record<string, IconType> = {
    Correspondence: IconType.MAIL,
    Claims: IconType.TRANSACTION,
    Financial: IconType.TRANSACTION,
    'Non-Financial': IconType.CIRCLE_INFO,
  };

  const iconForGroup =
    caseGroupIconMap[notification?.caseGroup] ?? IconType.CIRCLE_INFO;

  return (
    <NotificationCenterSidesheet
      caseId={notification.id}
      title={notification.title}
      isCompleted={notification.completed}
      fields={Object.entries(fieldData).map(([key, value]) => ({
        label: key,
        value,
      }))}
    >
      <button
        onClick={() => {
          if (needsAcknowledgement && notification.stepsToAcknowledge?.length) {
            onAcknowledge(notification.id, notification.stepsToAcknowledge);
          }
        }}
        className={clsx(Styles.item, Styles.needsAcknowledgement)}
      >
        <div className={Styles.notificationContentWrapper}>
          <div className={Styles.notificationHeaderSection}>
            <div
              className={clsx(
                Styles.pip,
                'mt-sm',
                !needsAcknowledgement && Styles.hidden
              )}
            ></div>
            <div>
              <Icon height={24} width={24} type={iconForGroup} />
            </div>
            <div className={Styles.notificationTextGroup}>
              <h3 className="typography-labels-label-lg">
                {notification.title}
              </h3>
              <p className={!notification.completed ? Styles.description : ''}>
                {description}
              </p>
              <div className={clsx(Styles.date, 'typography-content-caption')}>
                <p>{dateText}</p>
              </div>
            </div>
          </div>
          <div className={Styles.notificationLinkSection}>
            <span className={clsx(Styles.link, 'typography-nav-links-sm')}>
              {sidesheetLinkText}
            </span>
          </div>
        </div>
      </button>
    </NotificationCenterSidesheet>
  );
};
