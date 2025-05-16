import { CaseInstanceSummary } from '@zinnia/api-types/types/case';
import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';

import { default as Styles } from '@/components/notification-center/NotificationCenter.module.css';
import { NotificationCenterSidesheet } from '@/components/notification-center/side-sheet/NotificatonCenterSidesheet';
import { CaseAcknowledgmentItem } from '@/services/terms-and-conditions';

import { NotificationCenterItemLoadingState } from '../loading-state/NotificationCenterLoadingState';

const today = dayjs();

export type NotificationCenterNotification = {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  stepsToAcknowledge?: string[];
};

export type NotificationCenterProps = {
  initialNotifications?: Array<CaseInstanceSummary> | null;
  initialAcknowledgedNotifications?: Array<CaseAcknowledgmentItem>;
  policyNumber: string;
  planCode: string;
};

export const NotificationCenterItem = ({
  isClient,
  loading,
  needsAcknowledgement,
  onAcknowledge,
  notification,
  sidesheetLinkText,
}: {
  isClient: boolean;
  loading: boolean;
  needsAcknowledgement: boolean;
  onAcknowledge: (id: string, stepsToAcknowledge: string[]) => void;
  notification: NotificationCenterNotification;
  sidesheetLinkText: string;
}) => {
  const notificationDate = dayjs(notification.date);
  const dateIsToday = notificationDate.isSame(today, 'day');
  let dateText;
  if (dateIsToday) {
    dateText = 'Today';
  } else {
    const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'short' });
    dateText = formatter.format(notification.date);
  }

  if (loading || !isClient) return NotificationCenterItemLoadingState;

  const fieldData = {
    'Case ID': notification.id,
    'Completion Date': notificationDate.format('MM/DD/YYYY'),
    Transaction: notification.title,
  };

  return (
    <NotificationCenterSidesheet
      caseId={notification.id}
      title={notification.title}
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
        className={clsx(
          Styles.item,
          needsAcknowledgement && Styles.needsAcknowledgement
        )}
      >
        <h3 className={clsx(Styles.title, 'typography-labels-label-sm')}>
          {needsAcknowledgement && <div className={Styles.pip}></div>}
          {notification.title}
        </h3>
        <div className={clsx(Styles.date, 'typography-content-caption')}>
          <Icon small type={IconType.CALENDAR} />
          {dateText}
        </div>

        <span className={clsx(Styles.link, 'typography-nav-links-sm')}>
          {sidesheetLinkText}
        </span>
      </button>
    </NotificationCenterSidesheet>
  );
};
