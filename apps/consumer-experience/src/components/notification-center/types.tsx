import { CaseInstanceSummary } from '@xd/api-types/dist/generated-types/case';

import { CaseAcknowledgmentItem } from '@/services/terms-and-conditions';

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
