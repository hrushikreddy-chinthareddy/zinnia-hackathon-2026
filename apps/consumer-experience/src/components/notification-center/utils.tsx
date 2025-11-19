import { CaseStatus, CaseSummary, StageStatus } from '@/types/case';

import { NotificationCenterNotification } from './types';

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

const shownStatuses: Set<string | undefined> = new Set([
  CaseStatus.COMPLETED,
  CaseStatus.CANCELED,
  CaseStatus.EXCEPTION,
]);

export const parseNotifications = (
  caseItem: CaseSummary
): NotificationCenterNotification | null => {
  if (!caseItem.id) return null;
  if (!shownStatuses.has(caseItem.caseStatus)) return null;
  const id = caseItem.id;
  const dateString = caseItem.updatedAt || caseItem.createdAt;
  if (!dateString) return null;
  const date = new Date(dateString);
  let stepsToAcknowledge;

  const completed =
    caseItem.caseStatus === CaseStatus.COMPLETED ||
    caseItem.caseStatus === CaseStatus.CANCELED;

  if (caseItem.caseStatus === CaseStatus.EXCEPTION) {
    stepsToAcknowledge = [];
    // current list of steps to acknowledge
    // why the case is CURRENTLY in NIGO
    stepsToAcknowledge = caseItem.stages?.reduce((acc, stage) => {
      if (stage.stageStatus === StageStatus.EXCEPTION) {
        // @ts-expect-error api spec wrong
        acc.push(stage.id);
      }
      return acc;
    }, []);
  }

  if (!caseItem.process) return null;
  const title = caseItem.processSubType || caseItem.process;

  return {
    id,
    date,
    completed,
    title,
    stepsToAcknowledge,
  };
};

export const sortNotificationsByDate = (
  a: NotificationCenterNotification,
  b: NotificationCenterNotification
) => {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
};
