import { CaseAcknowledgmentItem } from '@/services/terms-and-conditions';
import { CaseSummary } from '@/types/case';

export type NotificationCenterNotification = {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  stepsToAcknowledge?: string[];
};

export type NotificationCenterProps = {
  initialNotifications?: Array<CaseSummary> | null;
  initialAcknowledgedNotifications?: Array<CaseAcknowledgmentItem>;
  policyNumber: string;
  planCode: string;
};
