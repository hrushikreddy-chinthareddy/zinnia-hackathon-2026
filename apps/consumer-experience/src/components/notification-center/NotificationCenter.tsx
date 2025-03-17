import {
  AssistiveText,
  AssistiveTextVariant,
  Icon,
  IconType,
} from '@zinnia/bloom/components';
import clsx from 'clsx';

import { default as Styles } from './NotificationCenter.module.css';

export type Notification = {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  link?: {
    url: string;
    label: string;
  };
  priority: boolean;
  onClick: (id: string) => void;
};
type NotificationCenterProps = {
  notifications: Array<Notification>;
};

export const NotificationCenter = ({
  notifications,
}: NotificationCenterProps) => {
  const completedNotifications = notifications
    .filter(notification => notification.completed)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const incompletedNotifications = notifications
    .filter(notification => !notification.completed)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .sort((a, b) => Number(b.priority) - Number(a.priority));

  return (
    <div className={Styles.container}>
      {incompletedNotifications.length > 0 && (
        <section className={clsx(Styles.list, Styles.incomplete)}>
          <h2>
            <AssistiveText
              className={Styles.heading}
              text="Action Needed"
              variant={AssistiveTextVariant.Error}
            />
          </h2>
          <ul>
            {incompletedNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </ul>
        </section>
      )}
      {completedNotifications.length > 0 && (
        <section className={clsx(Styles.list, Styles.complete)}>
          <h2>
            <AssistiveText
              className={Styles.heading}
              text="Completed"
              variant={AssistiveTextVariant.Success}
            />
          </h2>
          <ul>
            {completedNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </ul>
        </section>
      )}
      <section className={Styles.end}>
        <Icon width={32} height={32} type={IconType.FLAG_GOALS} />
        <h2 className="typography-labels-label-lg">
          That's all Your Notifications from the last 30 days
        </h2>
      </section>
    </div>
  );
};

const NotificationItem = ({ notification }: { notification: Notification }) => {
  const dateIsToday = notification.date.getDate() === new Date().getDate();
  let dateText;
  if (dateIsToday) {
    dateText = 'Today';
  } else {
    const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'short' });
    dateText = formatter.format(notification.date);
  }
  return (
    <button
      onClick={() => notification.onClick(notification.id)}
      className={clsx(Styles.item, notification.priority && Styles.priority)}
    >
      <h3 className={clsx(Styles.title, 'typography-labels-label-sm')}>
        {notification.priority && <div className={Styles.pip}></div>}
        {notification.title}
      </h3>
      <p className={clsx(Styles.date, 'typography-content-caption')}>
        <Icon small type={IconType.CALENDAR} />
        {dateText}
      </p>
      {notification.link && (
        <span className={clsx(Styles.link, 'typography-nav-links-sm')}>
          {notification.link.label}
        </span>
      )}
    </button>
  );
};
