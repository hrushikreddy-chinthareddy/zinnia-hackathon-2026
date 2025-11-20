import { LineOfBusiness } from '@zinnia/api-types/types/sor';

export type NotificationCenterNotification = {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  stepsToAcknowledge?: string[];
  caseGroup: string;
};

export type NotificationCenterProps = {
  policyNumber: string;
  planCode: string;
  lineOfBusiness: LineOfBusiness;
};
