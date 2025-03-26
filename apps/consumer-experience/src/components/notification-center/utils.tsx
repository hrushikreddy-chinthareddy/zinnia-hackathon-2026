import { CaseInstanceSummary } from '@zinnia/api-types/types/case';

import { NotificationCenterNotification } from './NotificationCenter';

export const transformNotifications = (
  acc: {
    completedNotifications: NotificationCenterNotification[];
    actionNeededNotifications: NotificationCenterNotification[];
  },
  notification: NotificationCenterNotification
) => {
  if (notification.completed) {
    acc.completedNotifications.push(notification);
  } else {
    acc.actionNeededNotifications.push(notification);
  }
  return acc;
};

export const acknowledgeNotifications = (
  oldNotifications: string[] | undefined,
  id: string
) => {
  const newId = id.toString();
  const newNotifications = oldNotifications ?? [];
  if (!newNotifications.length || !newNotifications.includes(newId)) {
    newNotifications.unshift(newId);
  }
  return newNotifications;
};

export const parseNotifications = (
  caseItem: CaseInstanceSummary
): NotificationCenterNotification | null => {
  if (!caseItem.id) return null;
  const id = caseItem.id;
  const dateString = caseItem.updatedAt || caseItem.createdAt;
  if (!dateString) return null;
  const date = new Date(dateString);

  const completed =
    caseItem.caseStatus === 'COMPLETED' || caseItem.caseStatus === 'CANCELED';

  if (!caseItem.process) return null;
  // @ts-expect-error api spec wrong, this field exists
  const title = caseItem.processSubType || caseItem.process;

  return {
    id,
    date,
    completed,
    title,
  };
};

export const sortNotificationsByDate = (
  a: NotificationCenterNotification,
  b: NotificationCenterNotification
) => {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
};
