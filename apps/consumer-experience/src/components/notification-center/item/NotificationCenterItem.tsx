import { CaseInstanceSummary } from '@zinnia/api-types/types/case';
import { Icon, IconType } from '@zinnia/bloom/components';
import clsx from 'clsx';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { default as Styles } from '@/components/notification-center/NotificationCenter.module.css';
import { NotificationCenterSidesheet } from '@/components/notification-center/side-sheet/NotificatonCenterSidesheet';
import { CaseAcknowledgmentItem } from '@/services/terms-and-conditions';
import { DEFAULT_DATE_FORMAT } from '@/utils/dates';

import { NotificationCenterItemLoadingState } from '../loading-state/NotificationCenterLoadingState';

dayjs.extend(utc);
dayjs.extend(timezone);
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
  const dateText = `${notificationDate.tz('America/Chicago').format(`${DEFAULT_DATE_FORMAT} [at] H:MM a`)} CST`;

  if (loading || !isClient) return NotificationCenterItemLoadingState;

  const fieldData = {
    'Case ID': notification.id,
    'Completion Date': notificationDate.format('MM/DD/YYYY'),
    Transaction: notification.title,
  };

  const description = notification.completed
    ? `Your ${notification.title} was processed successfully.`
    : 'There was an error processing this transaction.';

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
        className={clsx(Styles.item, Styles.needsAcknowledgement)}
      >
        <div className={Styles.notificationContentWrapper}>
          <div className={Styles.notificationHeaderSection}>
            <div
              className={clsx(
                Styles.pip,
                !needsAcknowledgement && Styles.hidden
              )}
            ></div>
            <Icon height={24} width={24} type={IconType.CASH} />
            <div className={Styles.notificationTextGroup}>
              <h3 className="typography-labels-label-lg">
                {notification.title}
              </h3>
              <p
                className={clsx(
                  !notification.completed ? Styles.description : '',
                  'text-sm text-left'
                )}
              >
                {description}
              </p>
              <div
                className={clsx(
                  Styles.date,
                  'typography-content-caption text-left'
                )}
              >
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
